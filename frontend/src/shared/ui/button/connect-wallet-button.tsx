import { ComponentProps, FC } from 'react'
import * as Icons from 'lucide-react'
import { Button } from './button'

type ConnectWalletButtonProps = Pick<
  ComponentProps<typeof Button>,
  'loading' | 'disabled' | 'href' | 'onClick'
>

export const ConnectWalletButton: FC<ConnectWalletButtonProps> = ({
  loading,
  disabled,
  href,
  onClick,
}) => (
  <Button
    variant="primary"
    loading={loading}
    disabled={disabled}
    icon={Icons.Wallet}
    href={href}
    onClick={onClick}
  >
    Connect wallet
  </Button>
)
