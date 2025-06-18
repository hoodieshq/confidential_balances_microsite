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

/// Handler for decrypting a Confidential Balance
pub async fn decrypt_cb(
    Json(request): Json<DecryptCbRequest>,
) -> Result<Json<DecryptCbResponse>, AppError> {
    println!("🔐 Starting decrypt_cb handler");

    // Create the AES key
    let aes_key = {
        let decoded_aes_signature = BASE64_STANDARD.decode(&request.aes_signature)?;

        let aes_signature = Signature::try_from(decoded_aes_signature.as_slice())
            .map_err(|_| AppError::SerializationError)?;

        AeKey::new_from_signature(&aes_signature).map_err(|_| AppError::SerializationError)?
    };
    println!("✅ AES key created successfully");

    // Get the token account info
    let token_account_info = {
        // Decode token account data from request instead of fetching it
        let token_account_data = BASE64_STANDARD.decode(&request.token_account_data)?;
        StateWithExtensionsOwned::<spl_token_2022::state::Account>::unpack(token_account_data)?
    };
    println!("🧳 Unpacked token account info");

    let confidential_transfer_account =
        token_account_info.get_extension::<ConfidentialTransferAccount>()?;
    println!("🔍 Fetched confidential transfer account extension");

    let available_balance = confidential_transfer_account.decryptable_available_balance;
    let available_balance =
        AeCiphertext::try_from(available_balance).map_err(|_| AppError::SerializationError)?;
    println!("🔄 Reformatted available balance");
    let decrypted_balance = aes_key
        .decrypt(&available_balance)
        .ok_or(AppError::SerializationError)?;

    println!("✅ Returning decrypted balance");
    Ok(Json(DecryptCbResponse {
        amount: decrypted_balance.to_string(),
        message: "Decryption successful".to_string(),
    }))
}
