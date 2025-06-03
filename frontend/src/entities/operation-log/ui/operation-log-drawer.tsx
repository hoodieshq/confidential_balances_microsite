'use client'

import { FC, useEffect, useState } from 'react'
import { Button } from '@hoodieshq/ms-tools-ui'
import { useAtom } from 'jotai'
import * as Icons from 'lucide-react'
import { Drawer } from 'vaul'
import { LogItem, LogItemResult } from '@/shared/ui/log'
import { cn } from '@/shared/utils'
import { operationLogOpenAtom } from '../model/operation-log-open'
import styles from './operation-log-drawer.module.css'

const snapPoints = ['393px', 1]

export const OperationLogDrawer: FC = () => {
  const [operationLogOpen, setOperationLogOpen] = useAtom(operationLogOpenAtom)
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0])

  useEffect(() => {
    if (operationLogOpen) {
      const timeout = setTimeout(() => {
        // Workaround for preventing pointer events disable on body when drawer is opened
        document.body.style.pointerEvents = ''
      }, 0)
      return () => clearTimeout(timeout)
    }
  }, [operationLogOpen])

  return (
    <Drawer.Root
      open={operationLogOpen}
      onClose={() => setOperationLogOpen(false)}
      modal={false}
      noBodyStyles={true}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Portal>
        <Drawer.Content
          data-slot="drawer-content"
          className="border-b-none fixed right-0 bottom-0 left-0 mx-[-1px] flex h-full max-h-[100%] flex-col border border-[var(--border)] bg-[var(--table-background)]"
        >
          <div className="relative flex flex-nowrap items-center gap-4 border-b px-6 py-3">
            <Drawer.Title className="flex-1 overflow-hidden leading-none font-medium tracking-[-0.01875rem] text-ellipsis whitespace-nowrap text-[var(--foreground)]">
              Operation Log
            </Drawer.Title>
            <div className="flex shrink-0 flex-nowrap items-center gap-6">
              <Button variant="outline" size="sm">
                <Icons.Eraser />
                Clear log
              </Button>
              <Drawer.Close asChild>
                <button className="shrink-0 cursor-pointer">
                  <Icons.X className="size-6 fill-[var(--foreground)]" />
                </button>
              </Drawer.Close>
            </div>
            <div className="absolute top-2 left-1/2 h-1 w-15 -translate-x-1/2 rounded-full bg-[var(--muted-foreground)]"></div>
          </div>

          <div
            className={cn(
              'flex-1 overflow-x-hidden overflow-y-auto p-0',
              snap === 1 ? 'max-h-[calc(100vh-50px)]' : 'max-h-[342px]',
              styles.content
            )}
          >
            <LogItem title="Welcome to Solana Confidential Balances operation log!" variant="muted">
              <LogItemResult variant="muted">
                Here, you&apos;ll find a transparent record of all your recent activity.
              </LogItemResult>
              <LogItemResult variant="muted">
                Every operation you approve will be logged here for your reference.
              </LogItemResult>
            </LogItem>

            <LogItem title="Deposit Operation - COMPLETE" variant="success">
              <LogItemResult variant="success">{`Txn1 [SUCCESS]`}</LogItemResult>
              <LogItemResult variant="success">{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
              <LogItemResult variant="success">{`    Note: Deposited 12 tokens`}</LogItemResult>
            </LogItem>

            <LogItem title="Deposit Operation - COMPLETE" variant="success">
              <LogItemResult variant="success">{`Txn1 [SUCCESS]`}</LogItemResult>
              <LogItemResult variant="success">{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
              <LogItemResult variant="success">{`    Note: Deposited 12 tokens`}</LogItemResult>
            </LogItem>
            <LogItem title="Deposit Operation - COMPLETE" variant="success">
              <LogItemResult variant="success">{`Txn1 [SUCCESS]`}</LogItemResult>
              <LogItemResult variant="success">{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
              <LogItemResult variant="success">{`    Note: Deposited 12 tokens`}</LogItemResult>
            </LogItem>
            <LogItem title="Deposit Operation - COMPLETE" variant="success">
              <LogItemResult variant="success">{`Txn1 [SUCCESS]`}</LogItemResult>
              <LogItemResult variant="success">{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
              <LogItemResult variant="success">{`    Note: Deposited 12 tokens`}</LogItemResult>
            </LogItem>
            <LogItem title="Deposit Operation - COMPLETE" variant="success">
              <LogItemResult variant="success">{`Txn1 [SUCCESS]`}</LogItemResult>
              <LogItemResult variant="success">{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
              <LogItemResult variant="success">{`    Note: Deposited 12 tokens`}</LogItemResult>
            </LogItem>

            <LogItem title="Deposit Operation - COMPLETE" variant="error">
              <LogItemResult variant="error">{`Txn1 [SUCCESS]`}</LogItemResult>
              <LogItemResult variant="error">{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
              <LogItemResult variant="error">{`    Note: Deposited 12 tokens`}</LogItemResult>
            </LogItem>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
