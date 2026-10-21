import { useRef, type FormEvent } from 'react'
import type { Escrow } from '../hooks/useEscrow.ts'
import { formatEth, shortenAddress } from '../lib/ethereum.ts'

interface EscrowPanelProps {
  escrow: Escrow
  account?: string
}

function RoleRow({ label, value, account }: { label: string; value: string; account?: string }) {
  const isYou = account !== undefined && value.toLowerCase() === account.toLowerCase()

  return (
    <div className="role">
      <dt>{label}</dt>
      <dd>
        <span className="mono" title={value}>
          {shortenAddress(value)}
        </span>
        {isYou && <span className="tag">you</span>}
      </dd>
    </div>
  )
}

export function EscrowPanel({ escrow, account }: EscrowPanelProps) {
  const { state } = escrow
  const input = useRef<HTMLInputElement>(null)

  // Reading the box on submit rather than on every keystroke keeps us from
  // firing a request (and an "invalid address" error) per character typed.
  function handleLoad(event: FormEvent) {
    event.preventDefault()
    const next = input.current?.value.trim() ?? ''
    if (next === escrow.address) {
      void escrow.reload()
    } else {
      escrow.setAddress(next)
    }
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Escrow contract</h2>
        {state !== undefined && (
          <span className={state.isApproved ? 'badge badge-done' : 'badge badge-live'}>
            {state.isApproved ? 'Released' : 'Funds held'}
          </span>
        )}
      </div>

      <form className="field" onSubmit={handleLoad}>
        <label htmlFor="escrow-address">Deployed address</label>
        <div className="field-row">
          <input
            id="escrow-address"
            key={escrow.address}
            ref={input}
            type="text"
            spellCheck={false}
            placeholder="0x…"
            defaultValue={escrow.address}
          />
          <button type="submit" className="button button-ghost" disabled={escrow.loading}>
            {escrow.loading ? 'Loading…' : 'Load'}
          </button>
        </div>
      </form>

      {state === undefined ? (
        <p className="hint">
          Paste the address of an escrow you already deployed, or create one below.
        </p>
      ) : (
        <>
          <dl className="roles">
            <RoleRow label="Depositor" value={state.depositor} account={account} />
            <RoleRow label="Arbiter" value={state.arbiter} account={account} />
            <RoleRow label="Beneficiary" value={state.beneficiary} account={account} />
            <div className="role">
              <dt>Balance</dt>
              <dd className="mono">{formatEth(state.balance)} ETH</dd>
            </div>
          </dl>

          <div className="action">
            <button
              type="button"
              className="button"
              disabled={!escrow.canApprove || escrow.busy}
              onClick={() => void escrow.approve()}
            >
              {escrow.busy ? 'Releasing…' : `Release ${formatEth(state.balance)} ETH`}
            </button>
            <p className="hint">{describeApprove(escrow, account)}</p>
          </div>
        </>
      )}

      {escrow.error !== undefined && <p className="alert alert-error">{escrow.error}</p>}
      {escrow.txHash !== undefined && (
        <p className="alert alert-ok">
          Transaction sent: <span className="mono">{shortenAddress(escrow.txHash, 10)}</span>
        </p>
      )}
    </section>
  )
}

function describeApprove(escrow: Escrow, account?: string): string {
  const { state } = escrow
  if (state === undefined) return ''

  if (state.isApproved) {
    return 'The arbiter already approved this escrow, the funds have been released.'
  }
  if (account === undefined) {
    return 'Connect MetaMask to act on this escrow.'
  }
  if (state.arbiter.toLowerCase() !== account.toLowerCase()) {
    return `Only the arbiter (${shortenAddress(state.arbiter)}) can release these funds.`
  }
  return 'You are the arbiter. Approving sends the full balance to the beneficiary.'
}
