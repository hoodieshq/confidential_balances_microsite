import { FC, useCallback, useState } from 'react'
import { Address } from '@solana-foundation/ms-tools-ui/components/address'
import { Button } from '@solana-foundation/ms-tools-ui/components/button'
import { Form, FormField } from '@solana-foundation/ms-tools-ui/components/form'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Lock, Unlock, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Content } from '@/shared/ui/content'
import { FormItemInput, FormItemTextarea } from '@/shared/ui/form'
import { useCreateElGamalKey } from '../model/use-create-elgamal-key'
import { useDecryptAuditableTx } from '../model/use-decrypt-auditable-tx'

type FormValues = {
  transaction: string
}

type AuditTransactionProps = {
  tx?: string
}

export const AuditTransaction: FC<AuditTransactionProps> = ({ tx }) => {
  const [amount, setAmount] = useState<number>()
  const { connected, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const { generateElGamalKey, isGenerating, elGamalPubkey } = useCreateElGamalKey()

  const { error: auditError, auditTransaction, isAuditing, auditResult } = useDecryptAuditableTx()

  console.log({ auditError, auditResult, isAuditing })

  const form = useForm<FormValues>({
    defaultValues: { transaction: tx ?? '' },
    mode: 'onChange',
  })

  const {
    formState: { isSubmitting },
  } = form

  const handleConnectWallet = useCallback(() => {
    setVisible(true)
  }, [setVisible])

  const handleDecryptBalance = useCallback(() => {
    const values = form.getValues()

    setAmount(1)
    auditTransaction(values.transaction)
  }, [setAmount, form, auditTransaction])

  const handleCreateAudKey = useCallback(() => {
    generateElGamalKey()
  }, [generateElGamalKey])

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
        <div className="mt-5 overflow-hidden">
          {elGamalPubkey ? (
            <div className="flex h-[26px] items-center">
              <Address address={elGamalPubkey} truncateChars={32} />
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateAudKey}
              disabled={isGenerating}
            >
              Generate auditor&lsquo;s key
            </Button>
          )}
        </div>
      </Content>
    </Form>
  )
}
