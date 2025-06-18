use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine as _};
use solana_sdk::pubkey::Pubkey;
use {crate::errors::AppError, solana_sdk::hash::Hash, std::str::FromStr};

// Helper function to parse blockhash bypassed from client
pub fn parse_latest_blockhash(latest_blockhash: &String) -> Result<Hash, AppError> {
    // Parse the provided blockhash from the request
    println!("🔑 Parsing blockhash from request: {}", latest_blockhash);

    let client_blockhash = Hash::from_str(latest_blockhash).map_err(|e| {
        println!("⛔️ Failed to parse blockhash: {}", e);
        AppError::SerializationError
    })?;
    println!("✅ Successfully parsed blockhash: {}", client_blockhash);

    Ok(client_blockhash)
}

// Helper function to parse a base64-encoded base58 address into a Pubkey
pub fn parse_base64_base58_pubkey(encoded_address: &str) -> Result<Pubkey, AppError> {
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
