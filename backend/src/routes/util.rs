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
