import { FC, useCallback, useState } from 'react'
import { Address } from '@solana-foundation/ms-tools-ui'
import { Button } from '@solana-foundation/ms-tools-ui/components/button'
import { Form, FormField } from '@solana-foundation/ms-tools-ui/components/form'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Keypair } from '@solana/web3.js'
import { Lock, Unlock, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Content } from '@/shared/ui/content'
import { FormItemInput, FormItemTextarea } from '@/shared/ui/form'

type FormValues = {
  transaction: string
}

type AuditTransactionProps = {
  tx?: string
}

export const AuditTransaction: FC<AuditTransactionProps> = ({ tx }) => {
  const [amount, setAmount] = useState<number>()
  const [auditorKey, setAuditorKey] = useState<string>()
  const { connected, publicKey } = useWallet()
  const { setVisible } = useWalletModal()

  const form = useForm<FormValues>({
    defaultValues: { transaction: tx ?? '' },
    mode: 'onChange',
  })

  const {
    formState: { isSubmitting },
  } = form

  const _handleSubmit = async (values: FormValues) => {
    console.log(values)
  }

  const handleConnectWallet = useCallback(() => {
    setVisible(true)
  }, [setVisible])

  const handleDecryptBalance = useCallback(() => {
    setAmount(1)
  }, [setAmount])

  const handleCreateAudKey = useCallback(() => {
    setAuditorKey(Keypair.generate().publicKey.toBase58())
  }, [])

  const isWalletConnected = connected && Boolean(publicKey)

  return (
    <Form {...form}>
      <Content>
        <p>Decrypt transfer amounts of transactions with the confidential transfer auditor key</p>

        <FormField
          control={form.control}
          name="transaction"
          rules={{
            required: 'Transaction hash is required',
          }}
          render={({ field }) => (
            <FormItemTextarea label="Transaction hash" disabled={isSubmitting} {...field} />
          )}
        />

        {!amount ? (
          <FormItemInput label="Amount" disabled={true} placeholder="$$$$$" icon={<Lock />} />
        ) : (
          <FormItemInput label="Amount" disabled={true} value={amount} icon={<Unlock />} />
        )}

        {!isWalletConnected ? (
          <Button onClick={handleConnectWallet}>
            <Wallet />
            Connect auditor wallet
          </Button>
        ) : (
          <Button onClick={handleDecryptBalance}>
            <Wallet />
            Decode transaction balance
          </Button>
        )}
        <div className="mt-5">
          {auditorKey ? (
            <div className="flex h-[26px] items-center">
              <Address address={auditorKey} />
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={handleCreateAudKey}>
              Generate auditor&lsquo;s key
            </Button>
          )}
        </div>
      </Content>
    </Form>
  )
}
