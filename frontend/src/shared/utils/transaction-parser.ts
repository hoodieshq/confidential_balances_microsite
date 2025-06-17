import { array, number, object, optional, string, type, union, Infer } from 'superstruct'
import { ConfirmedSignatureInfo, ParsedInstruction, PartiallyDecodedInstruction } from '@solana/web3.js'

// Superstruct schema for transaction instruction data
const InstructionSchema = object({
  programId: string(),
  accounts: array(string()),
  data: string(),
})

// Schema for parsed instruction (when available)
const ParsedInstructionSchema = object({
  programId: string(),
  parsed: optional(
    object({
      type: string(),
      info: optional(object()),
    })
  ),
})

// Combined instruction schema
const TransactionInstructionSchema = union([InstructionSchema, ParsedInstructionSchema])

// Schema for transaction metadata
const TransactionMetadataSchema = object({
  slot: number(),
  transaction: object({
    message: object({
      instructions: array(TransactionInstructionSchema),
    }),
  }),
})

export type TransactionMetadata = Infer<typeof TransactionMetadataSchema>
export type TransactionInstruction = Infer<typeof TransactionInstructionSchema>

// Known program IDs for confidential transfers (Token 2022 program)
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'

/**
 * Checks if an instruction contains ConfidentialTransferInstruction::Transfer
 */
export function isConfidentialTransferInstruction(
  instruction: ParsedInstruction | PartiallyDecodedInstruction | any
): boolean {
  // Check if it's the Token 2022 program
  if (instruction.programId.toString() !== TOKEN_2022_PROGRAM_ID) {
    return false
  }

  // For parsed instructions, check the type
  if ('parsed' in instruction && instruction.parsed?.type) {
    return instruction.parsed.type.includes('confidentialTransfer') ||
           instruction.parsed.type.includes('ConfidentialTransfer')
  }

  // For partially decoded instructions, we need to examine the instruction data
  if ('data' in instruction) {
    // The instruction data format for Token 2022 confidential transfer
    // We look for specific instruction discriminators
    try {
      const data = Buffer.from(instruction.data, 'base64')

      // ConfidentialTransfer instruction discriminators
      // These are the first bytes of the instruction data that identify the instruction type
      const confidentialTransferDiscriminators = [
        // Add specific discriminator values here based on the Token 2022 program
        // For example: [1, 2, 3] for transfer, [4, 5, 6] for deposit, etc.
        // These would need to be determined from the actual program implementation
      ]

      // Check if the instruction data starts with any known confidential transfer discriminator
      if (data.length >= 1) {
        const discriminator = data[0]
        // This is a placeholder - you'd need the actual discriminator values
        // from the Token 2022 confidential transfer program
        return discriminator >= 10 && discriminator <= 20 // Example range
      }
    } catch (error) {
      console.warn('Failed to parse instruction data:', error)
      return false
    }
  }

  return false
}

/**
 * Filters transactions to find those containing ConfidentialTransferInstruction::Transfer
 */
export function filterConfidentialTransferTransactions(
  transactions: (any | null)[]
): any[] {
  return transactions
    .filter((tx) => tx !== null)
    .filter((tx) => {
      try {
        // Validate transaction structure with superstruct
        const validatedTx = TransactionMetadataSchema.mask(tx)

        // Check if any instruction is a confidential transfer
        return validatedTx.transaction.message.instructions.some((instruction: any) =>
          isConfidentialTransferInstruction(instruction)
        )
      } catch (error) {
        console.warn('Failed to validate transaction structure:', error)
        return false
      }
    })
}

/**
 * Extracts confidential transfer metadata from a transaction
 */
export function extractConfidentialTransferMetadata(transaction: any): {
  hasConfidentialTransfer: boolean
  transferInstructions: TransactionInstruction[]
  metadata: {
    slot?: number
    blockTime?: number
    fee?: number
  }
} {
  try {
    const validatedTx = TransactionMetadataSchema.mask(transaction)

    const transferInstructions = validatedTx.transaction.message.instructions.filter(
      (instruction: any) => isConfidentialTransferInstruction(instruction)
    )

    return {
      hasConfidentialTransfer: transferInstructions.length > 0,
      transferInstructions,
      metadata: {
        slot: validatedTx.slot,
        blockTime: transaction.blockTime,
        fee: transaction.meta?.fee,
      },
    }
  } catch (error) {
    console.warn('Failed to extract confidential transfer metadata:', error)
    return {
      hasConfidentialTransfer: false,
      transferInstructions: [],
      metadata: {},
    }
  }
}

/**
 * Enhanced signature info with confidential transfer data
 */
export interface EnrichedSignatureInfo extends ConfirmedSignatureInfo {
  hasConfidentialTransfer?: boolean
  confidentialTransferMetadata?: ReturnType<typeof extractConfidentialTransferMetadata>
}
