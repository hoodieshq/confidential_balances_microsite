'use client'

import { FC, useState } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@hoodieshq/ms-tools-ui'
import { useAtom } from 'jotai'
import * as Icons from 'lucide-react'
import { Description } from '@/shared/ui/dev-mode'
import { LogItem, LogItemResult } from '@/shared/ui/log'
import { operationLogOpenAtom } from '../mode/operation-log-open'

const snapPoints = ['620px', 1]

export const OperationLogDrawer: FC = () => {
  const [operationLogOpen, setOperationLogOpen] = useAtom(operationLogOpenAtom)
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0])

  return (
    <Drawer
      open={operationLogOpen}
      onClose={() => setOperationLogOpen(false)}
      direction="bottom"
      modal={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <DrawerContent className="fixed right-0 bottom-0 left-0 h-full max-h-[100%] flex-col !rounded-none">
        <DrawerHeader className="p-0">
          <div className="flex flex-row flex-nowrap border-b px-6 pb-3">
            <DrawerTitle className="flex-1 overflow-hidden font-medium tracking-[-0.01875rem] text-ellipsis whitespace-nowrap text-[var(--foreground)]">
              Operation log
            </DrawerTitle>
            <div className="shrink-0">
              <DrawerClose asChild>
                <button className="shrink-0 cursor-pointer">
                  <Icons.X className="size-6 fill-[var(--foreground)]" />
                </button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>
        <div className="flex-1 p-0">
          <Description />
          <LogItem title="Deposit Operation - COMPLETE" success={true}>
            <LogItemResult success={true}>{`Txn1 [SUCCESS]`}</LogItemResult>
            <LogItemResult
              success={true}
            >{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
            <LogItemResult success={true}>{`    Note: Deposited 12 tokens`}</LogItemResult>
          </LogItem>

          <LogItem title="Deposit Operation - COMPLETE" success={true}>
            <LogItemResult success={true}>{`Txn1 [SUCCESS]`}</LogItemResult>
            <LogItemResult
              success={true}
            >{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
            <LogItemResult success={true}>{`    Note: Deposited 12 tokens`}</LogItemResult>
          </LogItem>
          <LogItem title="Deposit Operation - COMPLETE" success={true}>
            <LogItemResult success={true}>{`Txn1 [SUCCESS]`}</LogItemResult>
            <LogItemResult
              success={true}
            >{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
            <LogItemResult success={true}>{`    Note: Deposited 12 tokens`}</LogItemResult>
          </LogItem>
          <LogItem title="Deposit Operation - COMPLETE" success={true}>
            <LogItemResult success={true}>{`Txn1 [SUCCESS]`}</LogItemResult>
            <LogItemResult
              success={true}
            >{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
            <LogItemResult success={true}>{`    Note: Deposited 12 tokens`}</LogItemResult>
          </LogItem>
          <LogItem title="Deposit Operation - COMPLETE" success={true}>
            <LogItemResult success={true}>{`Txn1 [SUCCESS]`}</LogItemResult>
            <LogItemResult
              success={true}
            >{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
            <LogItemResult success={true}>{`    Note: Deposited 12 tokens`}</LogItemResult>
          </LogItem>

          <LogItem title="Deposit Operation - COMPLETE" success={false}>
            <LogItemResult success={false}>{`Txn1 [SUCCESS]`}</LogItemResult>
            <LogItemResult
              success={true}
            >{`  ConfidentialTransferInstruction::Deposit`}</LogItemResult>
            <LogItemResult success={false}>{`    Note: Deposited 12 tokens`}</LogItemResult>
          </LogItem>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
