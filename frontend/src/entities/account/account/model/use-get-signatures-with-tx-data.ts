import { useConnection } from '@solana/wallet-adapter-react'
import { ConfirmedSignatureInfo, Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'

export const queryKey = (endpoint: string, address: PublicKey) => [
  'get-signaures-with-tx',
  { endpoint, address },
]

async function enrichSignatureInfoWithTransactionData(
  connection: Connection,
  info: ConfirmedSignatureInfo
): Promise<ConfirmedSignatureInfo> {
  console.log('TTT', info)

  return info
}

function maybeExtractTransferData() {}

export const useGetSignaturesWithTxData = ({ address }: { address: PublicKey }) => {
  const { connection } = useConnection()

  return useQuery({
    queryKey: queryKey(connection.rpcEndpoint, address),
    queryFn: async () => {
      const result = await connection.getSignaturesForAddress(address)

      const signatures = result.map((signatureInfo) => signatureInfo.signature)

      const txs = await connection.getTransactions(signatures, {
        maxSupportedTransactionVersion: 0,
      })

      console.log({ txs })

      const list: ConfirmedSignatureInfo[] = []
      // result.forEach(async (signatureData) => {
      //   list.push(predicate ? await predicate(connection, signatureData) : signatureData)
      // })

      return result
    },
  })
}
