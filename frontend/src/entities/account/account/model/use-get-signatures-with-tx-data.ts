import { useConnection } from '@solana/wallet-adapter-react'
import { ConfirmedSignatureInfo, Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import {
  filterConfidentialTransferTransactions,
  extractConfidentialTransferMetadata,
  type EnrichedSignatureInfo,
} from '@/shared/utils'

export const queryKey = (endpoint: string, address: PublicKey) => [
  'get-signaures-with-tx',
  { endpoint, address },
]

async function enrichSignatureInfoWithTransactionData(
  connection: Connection,
  info: ConfirmedSignatureInfo
): Promise<EnrichedSignatureInfo> {
  try {
    // Get the full transaction data
    const transaction = await connection.getTransaction(info.signature!, {
      maxSupportedTransactionVersion: 0,
    })

    if (!transaction) {
      return { ...info, hasConfidentialTransfer: false }
    }

    // Extract confidential transfer metadata
    const confidentialTransferMetadata = extractConfidentialTransferMetadata(transaction)

    return {
      ...info,
      hasConfidentialTransfer: confidentialTransferMetadata.hasConfidentialTransfer,
      confidentialTransferMetadata,
    }
  } catch (error) {
    console.warn('Failed to enrich signature info:', error)
    return { ...info, hasConfidentialTransfer: false }
  }
}

export const useGetSignaturesWithTxData = ({
  address,
  filterConfidentialTransfersOnly = false
}: {
  address: PublicKey
  filterConfidentialTransfersOnly?: boolean
}) => {
  const { connection } = useConnection()

  return useQuery({
    queryKey: queryKey(connection.rpcEndpoint, address),
    queryFn: async (): Promise<EnrichedSignatureInfo[]> => {
      const result = await connection.getSignaturesForAddress(address)
      const signatures = result.map((signatureInfo) => signatureInfo.signature)

      // Get all transaction data in batch
      const txs = await connection.getTransactions(signatures, {
        maxSupportedTransactionVersion: 0,
      })

      console.log('Fetched transactions:', { txs })

      // Filter for confidential transfer transactions if requested
      let filteredTxs = txs
      if (filterConfidentialTransfersOnly) {
        filteredTxs = filterConfidentialTransferTransactions(txs)
        console.log('Filtered confidential transfer transactions:', { filteredTxs })
      }

      // Enrich signature info with transaction data
      const enrichedSignatures: EnrichedSignatureInfo[] = []

      for (let i = 0; i < result.length; i++) {
        const signatureInfo = result[i]
        const transaction = txs[i]

        if (transaction && (!filterConfidentialTransfersOnly || filteredTxs.includes(transaction))) {
          // Extract confidential transfer metadata
          const confidentialTransferMetadata = extractConfidentialTransferMetadata(transaction)

          enrichedSignatures.push({
            ...signatureInfo,
            hasConfidentialTransfer: confidentialTransferMetadata.hasConfidentialTransfer,
            confidentialTransferMetadata,
          })
        } else if (!filterConfidentialTransfersOnly) {
          // Include non-confidential transfer transactions when not filtering
          enrichedSignatures.push({
            ...signatureInfo,
            hasConfidentialTransfer: false,
          })
        }
      }

      console.log('Enriched signatures:', enrichedSignatures)
      return enrichedSignatures
    },
  })
}
