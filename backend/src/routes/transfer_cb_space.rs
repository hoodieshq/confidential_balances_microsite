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

/// GET handler to provide space requirements for transfer-cb operation
pub async fn transfer_cb_space() -> Result<Json<TransferCbSpaceResponse>, AppError> {
    println!("📊 Processing transfer-cb-space request");

    let equality_proof_space = size_of::<zk_elgamal_proof_program::state::ProofContextState<
        solana_zk_sdk::zk_elgamal_proof_program::proof_data::ciphertext_commitment_equality::CiphertextCommitmentEqualityProofContext
    >>();

    let ciphertext_validity_proof_space = size_of::<zk_elgamal_proof_program::state::ProofContextState<
        solana_zk_sdk::zk_elgamal_proof_program::proof_data::batched_grouped_ciphertext_validity::BatchedGroupedCiphertext3HandlesValidityProofContext
    >>();

    let range_proof_space = size_of::<zk_elgamal_proof_program::state::ProofContextState<
        solana_zk_sdk::zk_elgamal_proof_program::proof_data::batched_range_proof::batched_range_proof_u128::BatchedRangeProofU128Data
    >>();

    Ok(Json(TransferCbSpaceResponse {
        equality_proof_space,
        ciphertext_validity_proof_space,
        range_proof_space,
        message: "Space requirements for transfer-cb proofs".to_string(),
    }))
}
