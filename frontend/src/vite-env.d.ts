
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_AVALANCHE_RPC_URL: string
  readonly VITE_AVALANCHE_CHAIN_ID: string
  readonly VITE_TREASURY_ADDRESS: string
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
