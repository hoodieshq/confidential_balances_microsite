import { ComponentProps, FC, useCallback, useLayoutEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Address, Button } from '@solana-foundation/ms-tools-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUp,
  ArrowUpFromLine,
  Loader,
  Lock,
  Send,
  Unlock,
} from 'lucide-react'
import { useConfidentialVisibility } from '@/entities/account/account/model/use-confidential-visibility'
import { useDecryptConfidentialBalance } from '@/entities/account/account/model/use-decrypt-confidential-balance'
import { useGetTokenAccounts } from '@/entities/account/account/model/use-get-token-accounts'
import { ModalDeposit } from '@/features/deposit-tokens'
import { ModalTransfer } from '@/features/transfer-tokens'
import { ModalWithdraw } from '@/features/withdraw-tokens'
import { DataTable } from '@/shared/ui/data-table'
import { useToast } from '@/shared/ui/toast'

type DataTableAction = NonNullable<ComponentProps<typeof DataTable>['actions']>[0]

export function ConfidentialBalances({ account }: { account: PublicKey }) {
  const { connected, publicKey } = useWallet()

  return (
    <>
      {!connected || !publicKey ? (
        <DisconnectedWalletConfidentialBalances />
      ) : (
        <ConnectedWalletConfidentialBalances address={publicKey} account={account} />
      )}
    </>
  )
}

const DisconnectedWalletConfidentialBalances: FC = () => (
  <DataTable
    title="Confidential Balances"
    labels={{ empty: 'To see confidential balances connect your wallet!' }}
  />
)

function ConnectedWalletConfidentialBalances({
  address,
  account,
}: Required<{ address: PublicKey; account: PublicKey }>) {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedTokenAccount, setSelectedTokenAccount] = useState<PublicKey | null>(null)
  const toast = useToast()

  const { isVisible, showBalance, hideBalance } = useConfidentialVisibility(address)
  const {
    error: decryptError,
    decryptBalance,
    isDecrypting,
    confidentialBalance,
  } = useDecryptConfidentialBalance()

  const onDecryptBalance = async () => {
    const result = await decryptBalance(account)
    if (result) {
      showBalance()
    }
  }

  const onHideBalance = useCallback(() => {
    hideBalance()
  }, [hideBalance])

  const openDepositModal = useCallback((tokenAccount?: PublicKey) => {
    // if (tokenAccount) setSelectedTokenAccount(tokenAccount)
    // else if (query.data?.[0]?.pubkey) setSelectedTokenAccount(query.data[0].pubkey)
    setShowDepositModal(true)
  }, [])

  const openWithdrawModal = useCallback((tokenAccount?: PublicKey) => {
    // if (tokenAccount) setSelectedTokenAccount(tokenAccount)
    // else if (query.data?.[0]?.pubkey) setSelectedTokenAccount(query.data[0].pubkey)
    setShowWithdrawModal(true)
  }, [])

  const openTransferModal = useCallback((tokenAccount?: PublicKey) => {
    // if (tokenAccount) setSelectedTokenAccount(tokenAccount)
    // else if (query.data?.[0]?.pubkey) setSelectedTokenAccount(query.data[0].pubkey)
    setShowTransferModal(true)
  }, [])

  const actions = useMemo<DataTableAction[]>(() => {
    const list = [
      {
        action: 'deposit',
        title: 'Deposit',
        icon: <ArrowDown />,
        onClick: () => openDepositModal(address),
      },
      {
        action: 'withdraw',
        title: 'Withdraw',
        icon: <ArrowUp />,
        onClick: () => openWithdrawModal(address),
      },
      {
        action: 'transfer',
        title: 'Transfer',
        icon: <Send />,
        onClick: () => openTransferModal(address),
      },
    ]

    // push extra action to allow hiding of balance
    if (confidentialBalance && isVisible) {
      list.push({
        action: 'hideBalance',
        title: 'Hide balance',
        icon: <Lock />,
        onClick: () => onHideBalance(),
      })
    }

    return list
  }, [
    address,
    confidentialBalance,
    isVisible,
    onHideBalance,
    openDepositModal,
    openTransferModal,
    openWithdrawModal,
  ])

  // handle decrypting error
  useLayoutEffect(() => {
    if (decryptError) {
      toast.error(decryptError)
    }
  }, [decryptError, toast])

  return (
    <>
      {/* Modals */}
      {selectedTokenAccount && (
        <>
          <ModalDeposit
            show={showDepositModal}
            hide={() => setShowDepositModal(false)}
            tokenAccountPubkey={selectedTokenAccount}
          />
          <ModalWithdraw
            show={showWithdrawModal}
            hide={() => setShowWithdrawModal(false)}
            tokenAccountPubkey={selectedTokenAccount}
          />
          <ModalTransfer
            show={showTransferModal}
            hide={() => setShowTransferModal(false)}
            tokenAccountPubkey={selectedTokenAccount}
          />
        </>
      )}

      <DataTable
        title="Confidential Balances"
        emptyComp={
          <div className="flex justify-between">
            Balance is encrypted. Decrypt with wallet to see the balance.
            <Button disabled={isDecrypting} size="sm" variant="outline" onClick={onDecryptBalance}>
              {isDecrypting ? <Loader /> : <Unlock />} Decrypt available balance
            </Button>
          </div>
        }
        actions={actions}
        rows={
          confidentialBalance && isVisible
            ? [[<div key="confidential-balance">{confidentialBalance} Token</div>]]
            : undefined
        }
      />
    </>
  )
}
