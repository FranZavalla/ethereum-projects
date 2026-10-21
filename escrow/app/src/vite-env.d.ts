interface ImportMetaEnv {
  /** Address of a deployed Escrow contract, used to prefill the frontend. */
  readonly VITE_ESCROW_ADDRESS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
