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

/// Handler for depositing to a Confidential Balances account
pub async fn deposit_cb(
    Json(request): Json<DepositCbRequest>,
) -> Result<Json<TransactionResponse>, AppError> {
    println!("🚀 Starting deposit_cb handler");

    // Deserialize the account data
    println!("📦 Decoding token account data from request");
    let token_account_info = {
        // Decode token account data from request instead of fetching it
        let token_account_data = BASE64_STANDARD.decode(&request.token_account_data)?;
        StateWithExtensionsOwned::<spl_token_2022::state::Account>::unpack(token_account_data)?
    };

    // Parse the amount to deposit
    println!("💰 Parsing amount: {}", request.lamport_amount);
    let deposit_amount = match request.lamport_amount.parse::<u64>() {
        Ok(value) => {
            println!("✅ Amount parsed successfully: {} lamports", value);
            value
        }
        Err(e) => {
            println!("⛔️ Failed to parse amount: {}", e);
            return Err(AppError::InvalidAmount);
        }
    };

    let mint = token_account_info.base.mint;
    let token_account_authority = token_account_info.base.owner;

    let depositor_token_account = get_associated_token_address_with_program_id(
        &token_account_authority, // Token account owner
        &mint,                    // Mint
        &spl_token_2022::id(),
    );

    let deposit_instruction = deposit(
        &spl_token_2022::id(),
        &depositor_token_account,    // Token account
        &mint,                       // Mint
        deposit_amount,              // Amount to deposit
        request.mint_decimals,       // Mint decimals
        &token_account_authority,    // Token account owner
        &[&token_account_authority], // Signers
    )?;
    println!("✅ Deposit instruction created successfully");

    // Parse the provided blockhash from the request
    let client_blockhash = parse_latest_blockhash(&request.latest_blockhash)?;

    // Create a V0 message with the provided blockhash
    let v0_message = v0::Message::try_compile(
        &token_account_authority,
        &[deposit_instruction],
        &[],
        client_blockhash,
    )
    .map_err(|_| AppError::SerializationError)?;

    // Get the number of required signatures before moving v0_message
    let num_required_signatures = v0_message.header.num_required_signatures as usize;

    // Create a versioned message
    let versioned_message = VersionedMessage::V0(v0_message);

    // Create a versioned transaction with placeholder signatures for required signers
    let mut signatures = Vec::with_capacity(num_required_signatures);

    // Add empty signatures as placeholders (will be replaced by the wallet)
    for _ in 0..num_required_signatures {
        signatures.push(solana_sdk::signature::Signature::default());
    }

    let versioned_transaction = VersionedTransaction {
        signatures,
        message: versioned_message,
    };

    // Serialize the transaction to base64
    let serialized_transaction = match bincode::serialize(&versioned_transaction) {
        Ok(bytes) => BASE64_STANDARD.encode(bytes),
        Err(_) => return Err(AppError::SerializationError),
    };

    println!("✅ Transaction created successfully");

    Ok(Json(TransactionResponse {
        transaction: serialized_transaction,
        message: "Deposit CB transaction created successfully".to_string(),
    }))
}
