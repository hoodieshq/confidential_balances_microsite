import { FC } from 'react'
import { Button } from '@hoodieshq/ms-tools-ui'
import { useAtom, useSetAtom } from 'jotai'
import * as Icons from 'lucide-react'
import { cn } from '@/shared/utils'
import { operationLogOpenAtom } from '../mode/operation-log-open'

export const OperationLogButton: FC = () => {
  const [operationLogOpen, setOperationLogOpen] = useAtom(operationLogOpenAtom)

  return (
    <Button
      className={cn('fixed right-4 bottom-4 z-50 transition-opacity duration-300', {
        'pointer-events-none opacity-0': operationLogOpen,
      })}
      variant="outline"
      onClick={() => setOperationLogOpen(true)}
    >
      <Icons.TerminalSquare />
      Open operation log
    </Button>
  )
}
