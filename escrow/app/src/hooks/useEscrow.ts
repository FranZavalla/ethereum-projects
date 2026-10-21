import { useCallback, useEffect, useState } from 'react'
import { Contract, isAddress, type TransactionResponse } from 'ethers'
import EscrowArtifact from '../contracts/Escrow.json'
import { getBrowserProvider, getErrorMessage } from '../lib/ethereum.ts'

export const ESCROW_ABI = EscrowArtifact.abi
export const ESCROW_BYTECODE = EscrowArtifact.bytecode

/** Roles and balance read back from a deployed Escrow contract. */
export interface EscrowState {
  depositor: string
  arbiter: string
  beneficiary: string
  isApproved: boolean
  /** Current balance held by the contract, in wei. */
  balance: bigint
}

export interface Escrow {
  address: string
  setAddress: (address: string) => void
  state?: EscrowState
  loading: boolean
  busy: boolean
  error?: string
  /** Hash of the in-flight or last `approve()` transaction. */
  txHash?: string
  /** True when the connected account is the arbiter and the funds are still held. */
  canApprove: boolean
  approve: () => Promise<void>
  reload: () => Promise<void>
}

function envAddress(): string {
  return (import.meta.env.VITE_ESCROW_ADDRESS ?? '').trim()
}

/**
 * Reads a deployed Escrow contract and exposes the arbiter-only `approve()`.
 *
 * The contract is addressed by whatever is in the address box, defaulting to
 * `VITE_ESCROW_ADDRESS` so a local deployment can be configured once.
 */
export function useEscrow(account?: string): Escrow {
  const [address, setAddressState] = useState(envAddress)
  const [state, setState] = useState<EscrowState>()
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [txHash, setTxHash] = useState<string>()

  /**
   * Reads the contract. `blockNumber` pins the read to a specific block, which
   * matters right after a transaction: ethers can still resolve "latest" to the
   * previous block for a moment, and a half-updated view (approved, but still
   * showing the old balance) is worse than a slightly slower one.
   */
  const load = useCallback(async (target: string, blockNumber?: number) => {
    if (!isAddress(target)) {
      setState(undefined)
      setError(target === '' ? undefined : 'That is not a valid contract address')
      return
    }

    setLoading(true)
    setError(undefined)
    try {
      const provider = getBrowserProvider()
      const overrides = blockNumber === undefined ? {} : { blockTag: blockNumber }
      const code = await provider.getCode(target, blockNumber)
      if (code === '0x') {
        setState(undefined)
        setError('No contract is deployed at that address on this chain')
        return
      }

      const escrow = new Contract(target, ESCROW_ABI, provider)
      const [depositor, arbiter, beneficiary, isApproved, balance] = await Promise.all([
        escrow.depositor(overrides) as Promise<string>,
        escrow.arbiter(overrides) as Promise<string>,
        escrow.beneficiary(overrides) as Promise<string>,
        escrow.isApproved(overrides) as Promise<boolean>,
        provider.getBalance(target, blockNumber),
      ])

      setState({ depositor, arbiter, beneficiary, isApproved, balance })
    } catch (cause) {
      setState(undefined)
      setError(getErrorMessage(cause))
    } finally {
      setLoading(false)
    }
  }, [])

  const setAddress = useCallback((next: string) => {
    const trimmed = next.trim()
    setAddressState(trimmed)
    if (trimmed === '') {
      setState(undefined)
      setError(undefined)
    }
  }, [])

  const reload = useCallback(async () => {
    await load(address)
  }, [address, load])

  // Re-read whenever the address changes or the wallet switches account/chain.
  // The chain is an external system we cannot subscribe to from React.
  useEffect(() => {
    if (address === '') return
    // eslint-disable-next-line react/set-state-in-effect -- re-reading chain state
    void load(address)
  }, [address, account, load])

  const approve = useCallback(async () => {
    setError(undefined)
    setTxHash(undefined)
    setBusy(true)
    try {
      const signer = await getBrowserProvider().getSigner()
      const escrow = new Contract(address, ESCROW_ABI, signer)
      const tx = (await escrow.approve()) as TransactionResponse

      setTxHash(tx.hash)
      const receipt = await tx.wait()
      await load(address, receipt?.blockNumber)
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setBusy(false)
    }
  }, [address, load])

  const canApprove =
    account !== undefined &&
    state !== undefined &&
    !state.isApproved &&
    state.arbiter.toLowerCase() === account.toLowerCase()

  return {
    address,
    setAddress,
    state,
    loading,
    busy,
    error,
    txHash,
    canApprove,
    approve,
    reload,
  }
}
