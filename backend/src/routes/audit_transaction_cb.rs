use crate::models::{AuditTransactionRequest, AuditTransactionResponse};
use bincode::Options;
use {
    crate::{
        errors::AppError,
        models::{
            ApplyCbRequest, CreateCbAtaRequest, DecryptCbRequest, DecryptCbResponse,
            DepositCbRequest, MultiTransactionResponse, TransactionResponse, TransferCbRequest,
            TransferCbSpaceResponse, WithdrawCbRequest, WithdrawCbSpaceResponse,
        },
    },
    axum::extract::Json,
    base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine as _},
    bincode, bs58,
    solana_sdk::{
        hash::Hash,
        message::{v0, VersionedMessage},
        pubkey::Pubkey,
        signature::{Keypair, NullSigner, Signature},
        signer::Signer,
        system_instruction,
        transaction::VersionedTransaction,
    },
    solana_zk_sdk::{
        encryption::auth_encryption::AeCiphertext,
        encryption::elgamal::ElGamalCiphertext,
        zk_elgamal_proof_program::{
            self,
            instruction::{close_context_state, ContextStateInfo},
        },
    },
    spl_associated_token_account::{
        get_associated_token_address_with_program_id, instruction::create_associated_token_account,
    },
    spl_token_2022::{
        error::TokenError,
        extension::{
            confidential_transfer::{
                account_info::{
                    ApplyPendingBalanceAccountInfo, TransferAccountInfo, WithdrawAccountInfo,
                },
                instruction::{
                    apply_pending_balance, configure_account, deposit, transfer, withdraw,
                    PubkeyValidityProofData, TransferInstructionData,
                },
                ConfidentialTransferAccount,
            },
            BaseStateWithExtensions, ExtensionType, StateWithExtensionsOwned,
        },
        instruction::{decode_instruction_data, reallocate, TokenInstruction},
        solana_zk_sdk::encryption::{auth_encryption::AeKey, elgamal::ElGamalKeypair},
    },
    spl_token_confidential_transfer_proof_extraction::instruction::{ProofData, ProofLocation},
    spl_token_confidential_transfer_proof_generation::{
        transfer::TransferProofData, withdraw::WithdrawProofData, TRANSFER_AMOUNT_LO_BITS,
    },
    std::str::FromStr,
};

// Helper function to parse a base64-encoded base58 address into a Pubkey
fn parse_base64_base58_pubkey(encoded_address: &str) -> Result<Pubkey, AppError> {
    println!(
        "🔍 Attempting to parse base64-base58 pubkey: {}",
        encoded_address
    );

    // First, try to decode from base64
    let decoded_base64 = BASE64_STANDARD.decode(encoded_address)?;
    println!(
        "✅ Base64 decoding successful, got {} bytes",
        decoded_base64.len()
    );

    // Then, decode the resulting string as base58
    let decoded_string = String::from_utf8(decoded_base64)?;
    println!("✅ UTF-8 decoding successful: {}", decoded_string);

    // Finally, decode the base58 string to bytes
    let bytes = bs58::decode(&decoded_string).into_vec()?;
    println!("✅ Base58 decoding successful, got {} bytes", bytes.len());

    if bytes.len() != 32 {
        println!(
            "⛔️ Invalid pubkey length: expected 32 bytes, got {}",
            bytes.len()
        );
        return Err(AppError::InvalidAddress);
    }

    // Convert to fixed-size array and create Pubkey
    let bytes_array: [u8; 32] = bytes.try_into().unwrap();
    let pubkey = Pubkey::new_from_array(bytes_array);
    println!("✅ Successfully created Pubkey: {}", pubkey.to_string());

    Ok(pubkey)
}

// Helper function to parse blockhash bypassed from client
fn parse_latest_blockhash(latest_blockhash: &String) -> Result<Hash, AppError> {
    // Parse the provided blockhash from the request
    println!("🔑 Parsing blockhash from request: {}", latest_blockhash);

    let client_blockhash = Hash::from_str(latest_blockhash).map_err(|e| {
        println!("⛔️ Failed to parse blockhash: {}", e);
        AppError::SerializationError
    })?;
    println!("✅ Successfully parsed blockhash: {}", client_blockhash);

    Ok(client_blockhash)
}

/// Handler for auditing Confidential Balance inside the Transfer
pub async fn audit_transaction_cb(
    Json(request): Json<AuditTransactionRequest>,
) -> Result<Json<AuditTransactionResponse>, AppError> {
    println!(
        "Starting audit_transaction handler for transaction: {}",
        request.transaction_signature
    );

    // Decode base64 transaction data
    let transaction_bytes = BASE64_STANDARD
        .decode(&request.transaction_data)
        .map_err(|e| {
            println!("⛔️ Failed to decode base64 transaction data: {:?}", e);
            AppError::Base64Error(e)
        })?;
    println!("Transaction decoded successfully!");

    // Decode ElGamal signature
    println!("Decoding ElGamal signature");
    let elgamal_signature_bytes =
        BASE64_STANDARD
            .decode(&request.elgamal_signature)
            .map_err(|_| {
                println!("Invalid auditor signature format");
                AppError::InvalidAuditorSignature
            })?;

    let auditor_elgamal_keypair = ElGamalKeypair::new_from_signature(
        &Signature::try_from(elgamal_signature_bytes.as_slice())
            .map_err(|_| AppError::InvalidAuditorSignature)?,
    )
    .map_err(|e| {
        println!("⛔️ Failed to create ElGamal keypair: {:?}", e);
        AppError::AuditorAccessDenied
    })?;

    println!("✅ Successfully created auditor's ElGamal keypair");

    // Extract confidential transfer data
    let (ct_lo, ct_hi, sender, recipient, mint) =
        extract_confidential_transfer(&transaction_bytes)?;

    let decrypted_lo = auditor_elgamal_keypair.secret().decrypt(&ct_lo);
    let decrypted_hi = auditor_elgamal_keypair.secret().decrypt(&ct_hi);

    let lo_value = match decrypted_lo.decode_u32() {
        Some(v) => v as u64,
        None => {
            println!("⚠️ Can't decode lo bits");
            return Err(AppError::AmountDecodeError);
        }
    };

    let hi_value = match decrypted_hi.decode_u32() {
        Some(v) => v as u64,
        None => {
            println!("⚠️ Can't decode hi bits");
            return Err(AppError::AmountDecodeError);
        }
    };

    let full_value = hi_value
        .checked_shl(TRANSFER_AMOUNT_LO_BITS as u32)
        .and_then(|hi_shifted| hi_shifted.checked_add(lo_value))
        .ok_or_else(|| {
            println!("⚠️ Full amount overflow");
            AppError::AmountDecodeError
        })?;

    println!("✅ Successfully extracted confidential transfer data");
    println!("📤 Sender: {}", sender);
    println!("📥 Recipient: {}", recipient);
    println!("🪙 Mint: {}", mint);
    println!("💰 Decrypted amount: {}", full_value);

    println!("✅ Successfully audited transaction");
    Ok(Json(AuditTransactionResponse {
        amount: full_value.to_string(),
        sender,
        receiver: recipient,
        message: "Transaction successfully audited".to_string(),
    }))
}

fn extract_confidential_transfer(
    transaction_data: &[u8],
) -> Result<(ElGamalCiphertext, ElGamalCiphertext, String, String, String), AppError> {
    // Deserialize transaction directly from bytes
    let versioned_transaction: VersionedTransaction = bincode::options()
        .with_fixint_encoding()
        .allow_trailing_bytes()
        .deserialize(transaction_data)
        .map_err(|e| {
            println!("⛔️ Failed to deserialize transaction: {:?}", e);
            AppError::SerializationError
        })?;

    // Get V0 message
    let message = match &versioned_transaction.message {
        VersionedMessage::V0(message) => message,
        _ => {
            println!("⚠️ Expected V0 message");
            return Err(AppError::SerializationError);
        }
    };

    // Find confidential transfer instruction by properly deserializing token instructions
    let (transfer_ix_index, transfer_ix) = message
        .instructions
        .iter()
        .enumerate()
        .find(|(_, ix)| {
            let program_id = &message.account_keys[ix.program_id_index as usize];

            // Check if instruction is for token-2022 program
            if program_id != &spl_token_2022::id() {
                return false;
            }

            // Try to deserialize the instruction data
            match TokenInstruction::unpack(&ix.data) {
                Ok(TokenInstruction::ConfidentialTransferExtension) => {
                    println!("🔍 Found ConfidentialTransferExtension instruction");
                    true
                }
                Ok(instruction) => {
                    println!("🔍 Found other token instruction: {:?}", instruction);
                    false
                }
                Err(e) => {
                    println!("⛔️ Failed to deserialize token instruction: {:?}", e);
                    false
                }
            }
        })
        .ok_or_else(|| {
            println!("⛔️ No confidential transfer instruction found");
            AppError::NoConfidentialTransferFound
        })?;

    println!(
        "✅ Found confidential transfer instruction at index {}",
        transfer_ix_index
    );

    // Extract accounts
    let sender = message.account_keys[transfer_ix.accounts[0] as usize].to_string();
    let recipient = message.account_keys[transfer_ix.accounts[1] as usize].to_string();
    let mint = message.account_keys[transfer_ix.accounts[2] as usize].to_string();

    let data = &transfer_ix.data;

    if data.len() < 129 {
        // Need at least 1 + 64 + 64 bytes for discriminator + 2 ciphertexts
        println!("⚠️ Instruction data too short for confidential transfer");
        return Err(AppError::InvalidInstructionData);
    }

    let input = &data[1..];
    let decoded_instruction: TransferInstructionData = *decode_instruction_data(&input)?;
    let ct_pod_lo = decoded_instruction.transfer_amount_auditor_ciphertext_lo;
    let ct_lo = ElGamalCiphertext::try_from(ct_pod_lo)?;
    let ct_pod_hi = decoded_instruction.transfer_amount_auditor_ciphertext_hi;
    let ct_hi = ElGamalCiphertext::try_from(ct_pod_hi)?;

    Ok((ct_lo, ct_hi, sender, recipient, mint))
}
