'use client'

// import wallet styles to not redeclare every style
import '@solana/wallet-adapter-react-ui/styles.css'

import { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { WalletError } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  AlphaWalletAdapter,
  AvanaWalletAdapter,
  BitgetWalletAdapter,
  BitpieWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  CoinhubWalletAdapter,
  FractalWalletAdapter,
  HuobiWalletAdapter,
  HyperPayWalletAdapter,
  KeystoneWalletAdapter,
  KrystalWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  NekoWalletAdapter,
  NightlyWalletAdapter,
  NufiWalletAdapter,
  OntoWalletAdapter,
  ParticleAdapter,
  PhantomWalletAdapter,
  SafePalWalletAdapter,
  SaifuWalletAdapter,
  SalmonWalletAdapter,
  SkyWalletAdapter,
  SolflareWalletAdapter,
  SolongWalletAdapter,
  SpotWalletAdapter,
  TokenaryWalletAdapter,
  TokenPocketWalletAdapter,
  TorusWalletAdapter,
  TrezorWalletAdapter,
  TrustWalletAdapter,
  UnsafeBurnerWalletAdapter,
  XDEFIWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { useCluster } from '@/shared/solana'

const wallets = [
  new AlphaWalletAdapter(),
  new AvanaWalletAdapter(),
  new BitgetWalletAdapter(),
  new BitpieWalletAdapter(),
  new CloverWalletAdapter(),
  new Coin98WalletAdapter(),
  new CoinbaseWalletAdapter(),
  new CoinhubWalletAdapter(),
  new FractalWalletAdapter(),
  new HuobiWalletAdapter(),
  new HyperPayWalletAdapter(),
  new KeystoneWalletAdapter(),
  new KrystalWalletAdapter(),
  new LedgerWalletAdapter(),
  new MathWalletAdapter(),
  new NekoWalletAdapter(),
  new NightlyWalletAdapter(),
  new NufiWalletAdapter(),
  new OntoWalletAdapter(),
  new ParticleAdapter(),
  new PhantomWalletAdapter(),
  new SafePalWalletAdapter(),
  new SaifuWalletAdapter(),
  new SalmonWalletAdapter(),
  new SkyWalletAdapter(),
  new SolflareWalletAdapter(),
  new SolongWalletAdapter(),
  new SpotWalletAdapter(),
  new TokenaryWalletAdapter(),
  new TokenPocketWalletAdapter(),
  new TorusWalletAdapter(),
  new TrezorWalletAdapter(),
  new TrustWalletAdapter(),
  new UnsafeBurnerWalletAdapter(),
  new XDEFIWalletAdapter(),
]

export const WalletButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  {
    ssr: false,
  }
)

export const SolanaProvider: FC<PropsWithChildren> = ({ children }) => {
  const { cluster } = useCluster()
  const endpoint = useMemo(() => cluster.endpoint, [cluster])
  const onError = useCallback((error: WalletError) => {
    console.error(error)
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
