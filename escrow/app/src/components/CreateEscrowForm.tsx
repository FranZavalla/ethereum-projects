import { useState, type FormEvent } from 'react'
import type { EscrowDeployment } from '../hooks/useDeployEscrow.ts'
import { shortenAddress } from '../lib/ethereum.ts'

interface CreateEscrowFormProps {
  deployer: EscrowDeployment
  /** Prefills the arbiter and beneficiary with the connected account. */
  account?: string
}

export function CreateEscrowForm({ deployer, account }: CreateEscrowFormProps) {
  const [arbiter, setArbiter] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [value, setValue] = useState('1')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void deployer.deploy({ arbiter, beneficiary, value })
  }

  function useMyAccount() {
    if (account === undefined) return
    setArbiter(account)
    setBeneficiary(account)
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Create an escrow</h2>
      </div>
      <p className="hint">
        Deploying funds the contract, so you become the depositor. The arbiter is the only account
        able to release the balance, and it can only ever go to the beneficiary.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Arbiter</span>
          <input
            type="text"
            spellCheck={false}
            placeholder="0x…"
            value={arbiter}
            onChange={(event) => setArbiter(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Beneficiary</span>
          <input
            type="text"
            spellCheck={false}
            placeholder="0x…"
            value={beneficiary}
            onChange={(event) => setBeneficiary(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Deposit (ETH)</span>
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="button" disabled={deployer.busy}>
            {deployer.busy ? 'Deploying…' : 'Deploy escrow'}
          </button>
          <button
            type="button"
            className="button button-ghost"
            onClick={useMyAccount}
            disabled={account === undefined}
          >
            Use my account
          </button>
        </div>
      </form>

      {deployer.error !== undefined && <p className="alert alert-error">{deployer.error}</p>}
      {deployer.address !== undefined && (
        <p className="alert alert-ok">
          Escrow deployed at <span className="mono">{shortenAddress(deployer.address, 6)}</span>
          {deployer.txHash !== undefined && (
            <>
              {' '}
              (tx <span className="mono">{shortenAddress(deployer.txHash, 8)}</span>)
            </>
          )}
        </p>
      )}
      {deployer.address === undefined && deployer.txHash !== undefined && (
        <p className="alert alert-ok">
          Deploying, tx <span className="mono">{shortenAddress(deployer.txHash, 8)}</span>
        </p>
      )}
    </section>
  )
}
