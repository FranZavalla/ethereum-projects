import { useCallback, useEffect, useState } from 'react'
import { getBrowserProvider, getErrorMessage, getInjectedProvider, isWalletAvailable } from '../lib/ethereum.ts'

export interface Wallet {
  /** Whether an EIP-1193 provider (MetaMask) is injected. */
  available: boolean
  /** The connected account, if any. */
  address?: string
  /** Chain id the wallet is currently on. */
  chainId?: number
  /** Balance of the connected account, in wei. */
  balance?: bigint
  connecting: boolean
  error?: string
  connect: () => Promise<void>
  /** Re-reads account, chain and balance from the wallet. */
  refresh: () => Promise<void>
  clearError: () => void
}

/**
 * Tracks the MetaMask connection: account, chain id and balance.
 *
 * Passing `{ prompt: true }` to `refresh` opens the MetaMask account picker
 * (`eth_requestAccounts`); without it the current accounts are read silently.
 */
export function useWallet(): Wallet {
  const [available] = useState(isWalletAvailable)
  const [address, setAddress] = useState<string>()
  const [chainId, setChainId] = useState<number>()
  const [balance, setBalance] = useState<bigint>()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string>()

  const sync = useCallback(async (prompt = false) => {
    if (getInjectedProvider() === null) return

    try {
      const provider = getBrowserProvider()
      const method = prompt ? 'eth_requestAccounts' : 'eth_accounts'
      const accounts = (await provider.send(method, [])) as string[]

      const [account] = accounts
      if (account === undefined) {
        setAddress(undefined)
        setChainId(undefined)
        setBalance(undefined)
        return
      }

      const network = await provider.getNetwork()
      setAddress(account)
      setChainId(Number(network.chainId))
      setBalance(await provider.getBalance(account))
    } catch (cause) {
      setError(getErrorMessage(cause))
    }
  }, [])

  const connect = useCallback(async () => {
    setError(undefined)
    setConnecting(true)
    try {
      await sync(true)
    } finally {
      setConnecting(false)
    }
  }, [sync])

  const refresh = useCallback(async () => {
    await sync(false)
  }, [sync])

  const clearError = useCallback(() => setError(undefined), [])

  // Pick up an already-authorised account on first render. Reading MetaMask is
  // external-system synchronisation, so an effect is the right place for it even
  // though it ends up setting state.
  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- reading accounts from MetaMask
    void sync(false)
  }, [sync])

  // Keep in step with changes made inside MetaMask itself.
  useEffect(() => {
    const injected = getInjectedProvider()
    if (injected?.on === undefined) return

    const handleChange = () => {
      void sync(false)
    }

    injected.on('accountsChanged', handleChange)
    injected.on('chainChanged', handleChange)
    return () => {
      injected.removeListener?.('accountsChanged', handleChange)
      injected.removeListener?.('chainChanged', handleChange)
    }
  }, [sync])

  return { available, address, chainId, balance, connecting, error, connect, refresh, clearError }
}
