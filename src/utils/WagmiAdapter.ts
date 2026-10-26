import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia, type AppKitNetwork } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_PROJECT_ID || ''

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia]

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
})

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'My Awesome DApp',
    description: 'A demo DApp using Reown AppKit',
    url: 'https://myapp.com',
    icons: [],
  },
  features: {
    email: false,
    socials: false,
    onramp: false,
    swaps: false,
    analytics: false,
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#8b5cf6',
    '--w3m-color-mix': '#1f2937',
    '--w3m-font-family': 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    '--w3m-border-radius-master': '12px',
  },
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
