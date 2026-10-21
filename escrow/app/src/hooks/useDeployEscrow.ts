import { useCallback, useState } from 'react'
import { ContractFactory, isAddress, parseEther } from 'ethers'
import { ESCROW_ABI, ESCROW_BYTECODE } from './useEscrow.ts'
import { getBrowserProvider, getErrorMessage } from '../lib/ethereum.ts'

export interface EscrowDeployment {
  /** Address of the escrow just created, available once the tx is mined. */
  address?: string
  /** Hash of the deployment transaction while it is pending / after it lands. */
  txHash?: string
  busy: boolean
  error?: string
  deploy: (input: { arbiter: string; beneficiary: string; value: string }) => Promise<void>
}

/**
 * Deploys a new Escrow. The depositor is whoever calls this, which is why
 * creating the contract has to happen from the UI: `Escrow` has no deposit
 * function, the balance is funded by the constructor's `payable` value.
 */
export function useDeployEscrow(onDeployed: (address: string) => void): EscrowDeployment {
  const [address, setAddress] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  const deploy = useCallback(
    async (input: { arbiter: string; beneficiary: string; value: string }) => {
      setError(undefined)
      setTxHash(undefined)
      setAddress(undefined)

      if (!isAddress(input.arbiter) || !isAddress(input.beneficiary)) {
        setError('Arbiter and beneficiary must both be valid addresses')
        return
      }

      let value: bigint
      try {
        value = parseEther(input.value.trim())
      } catch {
        setError('Deposit must be a valid ETH amount, e.g. 1.5')
        return
      }

      if (value <= 0n) {
        setError('The escrow has to be funded with more than 0 ETH')
        return
      }

      setBusy(true)
      try {
        const signer = await getBrowserProvider().getSigner()
        const factory = new ContractFactory(ESCROW_ABI, ESCROW_BYTECODE, signer)
        const escrow = await factory.deploy(input.arbiter, input.beneficiary, { value })

        const deploymentTx = escrow.deploymentTransaction()
        if (deploymentTx !== null) setTxHash(deploymentTx.hash)

        await escrow.waitForDeployment()
        const deployed = await escrow.getAddress()
        setAddress(deployed)
        onDeployed(deployed)
      } catch (cause) {
        setError(getErrorMessage(cause))
      } finally {
        setBusy(false)
      }
    },
    [onDeployed],
  )

  return { address, txHash, busy, error, deploy }
}
