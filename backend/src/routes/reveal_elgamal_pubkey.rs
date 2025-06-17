use crate::{
    errors::AppError,
    models::{RevealElGamalPubkeyRequest, RevealElGamalPubkeyResponse},
};
use axum::extract::Json;
use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine as _};
use solana_sdk::signature::Signature;
use spl_token_2022::solana_zk_sdk::encryption::elgamal::ElGamalKeypair;

/// Handler for revealing ElGamal public key from signature
pub async fn reveal_elgamal_pubkey(
    Json(request): Json<RevealElGamalPubkeyRequest>,
) -> Result<Json<RevealElGamalPubkeyResponse>, AppError> {
    println!("🚀 Starting reveal_elgamal_pubkey handler");
    println!(
        "📝 Request data: elgamal_signature={}",
        request.elgamal_signature
    );

    // Decode the base64 encoded ElGamal signature
    println!(
        "🔐 Decoding base64 ElGamal signature: {}",
        request.elgamal_signature
    );
    let decoded_signature = BASE64_STANDARD
        .decode(&request.elgamal_signature)
        .map_err(|e| {
            println!("⛔️ Failed to decode base64 signature: {}", e);
            AppError::Base64Error(e)
        })?;
    println!(
        "✅ Base64 decoding successful, got {} bytes",
        decoded_signature.len()
    );

    // Create signature from the decoded bytes
    println!("🔑 Creating Signature from decoded bytes");
    let signature = Signature::try_from(decoded_signature.as_slice()).map_err(|e| {
        println!("⛔️ Failed to create signature from bytes: {}", e);
        AppError::SerializationError
    })?;
    println!("✅ Signature created successfully");

    // Generate ElGamal keypair from the signature
    println!("🔐 Generating ElGamal keypair from signature");
    let elgamal_keypair = ElGamalKeypair::new_from_signature(&signature).map_err(|e| {
        println!("⛔️ Failed to generate ElGamal keypair: {}", e);
        AppError::DecryptionError
    })?;
    println!("✅ ElGamal keypair generated successfully");

    // Extract the public key from the keypair
    println!("🔓 Extracting public key from keypair");
    let public_key = elgamal_keypair.pubkey();
    let pubkey_string = format!("{}", public_key);
    println!("✅ Public key extracted: {}", pubkey_string);

    let decoded_pubkey = BASE64_STANDARD.decode(&pubkey_string).map_err(|e| {
        println!("⛔️ Failed to decode base64 signature: {}", e);
        AppError::Base64Error(e)
    })?;

    println!("🎉 reveal_elgamal_pubkey completed successfully");
    Ok(Json(RevealElGamalPubkeyResponse {
        pubkey: pubkey_string,
        message: "ElGamal public key revealed successfully".to_string(),
    }))
}
