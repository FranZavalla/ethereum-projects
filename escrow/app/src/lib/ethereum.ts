import { BrowserProvider, formatEther, type Eip1193Provider } from 'ethers'

/** Chain MetaMask should be pointed at when developing against `hardhat node`. */
export const LOCAL_CHAIN = {
  chainId: 31337,
  chainIdHex: '0x7a69',
  chainName: 'Hardhat Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['http://127.0.0.1:8545'],
} as const

/** The `window.ethereum` object injected by MetaMask, including its event API. */
export type InjectedProvider = Eip1193Provider & {
  on?(event: string, handler: (payload: unknown) => void): void
  removeListener?(event: string, handler: (payload: unknown) => void): void
}

/** Error code MetaMask uses when the user rejects a request. */
export const USER_REJECTED = 4001
/** Error code MetaMask uses when it does not know the requested chain. */
export const UNKNOWN_CHAIN = 4902

export function getInjectedProvider(): InjectedProvider | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as { ethereum?: InjectedProvider }).ethereum ?? null
}

export function isWalletAvailable(): boolean {
  return getInjectedProvider() !== null
}

export function getBrowserProvider(): BrowserProvider {
  const injected = getInjectedProvider()
  if (injected === null) {
    throw new Error('MetaMask is not installed in this browser')
  }
  // The "any" network keeps ethers from caching a network the wallet reports,
  // which matters when the user switches chains mid-session.
  return new BrowserProvider(injected, 'any')
}

/** Reads an error code, looking through the nesting ethers wraps RPC errors in. */
export function getErrorCode(error: unknown): unknown {
  if (typeof error !== 'object' || error === null) return undefined
  const candidate = error as { code?: unknown; info?: { error?: { code?: unknown } } }
  return candidate.code ?? candidate.info?.error?.code
}

/** True when the user dismissed the MetaMask prompt. */
export function isUserRejection(error: unknown): boolean {
  const code = getErrorCode(error)
  return code === USER_REJECTED || code === '4001' || code === 'ACTION_REJECTED'
}

/**
 * Asks MetaMask to switch to the local Hardhat chain, adding it to the wallet
 * first if the user has never connected to it before.
 */
export async function switchToLocalChain(): Promise<void> {
  const injected = getInjectedProvider()
  if (injected === null) throw new Error('MetaMask is not installed in this browser')

  try {
    await injected.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: LOCAL_CHAIN.chainIdHex }],
    })
  } catch (error) {
    if (getErrorCode(error) !== UNKNOWN_CHAIN) throw error

    await injected.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: LOCAL_CHAIN.chainIdHex,
          chainName: LOCAL_CHAIN.chainName,
          nativeCurrency: LOCAL_CHAIN.nativeCurrency,
          rpcUrls: LOCAL_CHAIN.rpcUrls,
        },
      ],
    })
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= 2 + chars * 2) return address
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}

/** Formats a wei amount as a readable ETH string. */
export function formatEth(wei: bigint, maximumFractionDigits = 4): string {
  return Number(formatEther(wei)).toLocaleString(undefined, { maximumFractionDigits })
}

/** Pulls a human-readable message out of the shapes ethers and MetaMask throw. */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error

  if (error instanceof Error) {
    if (isUserRejection(error)) return 'Request rejected in MetaMask'

    const detail = error as Error & {
      shortMessage?: string
      reason?: string
      info?: { error?: { message?: string } }
    }
    return detail.shortMessage ?? detail.reason ?? detail.info?.error?.message ?? detail.message
  }

  return 'Something went wrong'
}
