'use client'

import { FC, useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { OperationLogDrawer as OperationLogDrawerBase } from '@/shared/ui/operation-log-drawer'
import { operationLogOpenAtom } from '../model/operation-log-open'

const items: {
  title: string
  content: string
  variant: 'success' | 'error' | 'muted'
}[] = [
  {
    title: 'Welcome to Solana Confidential Balances operation log!',
    content: `Here, you'll find a transparent record of all your recent activity.\nEvery operation you approve will be logged here for your reference.`,
    variant: 'muted',
  },
  {
    title: 'Deposit Operation - COMPLETE',
    content: `Txn1 [SUCCESS]\n  ConfidentialTransferInstruction::Deposit\n    Note: Deposited 12 tokens`,
    variant: 'success',
  },
  {
    title: 'Deposit Operation - COMPLETE',
    content: `Txn1 [SUCCESS]\n  ConfidentialTransferInstruction::Deposit\n    Note: Deposited 12 tokens`,
    variant: 'success',
  },
  {
    title: 'Deposit Operation - COMPLETE',
    content: `Txn1 [SUCCESS]\n  ConfidentialTransferInstruction::Deposit\n    Note: Deposited 12 tokens`,
    variant: 'success',
  },
  {
    title: 'Deposit Operation - COMPLETE',
    content: `Txn1 [SUCCESS]\n  ConfidentialTransferInstruction::Deposit\n    Note: Deposited 12 tokens`,
    variant: 'success',
  },
  {
    title: 'Deposit Operation - COMPLETE',
    content: `Txn1 [SUCCESS]\n  ConfidentialTransferInstruction::Deposit\n    Note: Deposited 12 tokens`,
    variant: 'success',
  },
  {
    title: 'Deposit Operation - COMPLETE',
    content: `Txn1 [SUCCESS]\n  ConfidentialTransferInstruction::Deposit\n    Note: Deposited 12 tokens`,
    variant: 'error',
  },
]

export const OperationLogDrawer: FC = () => {
  const [operationLogOpen, setOperationLogOpen] = useAtom(operationLogOpenAtom)

  return (
    <OperationLogDrawerBase
      open={operationLogOpen}
      items={items}
      onClose={() => setOperationLogOpen(false)}
    />
  )
}
