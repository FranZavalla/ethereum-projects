import { useState } from 'react'
import type { Wallet } from '../hooks/useWallet.ts'
import { formatEth, getErrorMessage, LOCAL_CHAIN, shortenAddress, switchToLocalChain } from '../lib/ethereum.ts'

export function WalletBar({ wallet }: { wallet: Wallet }) {
  const [switchError, setSwitchError] = useState<string>()

  const onWrongChain = wallet.chainId !== undefined && wallet.chainId !== LOCAL_CHAIN.chainId

  async function handleSwitchChain() {
    setSwitchError(undefined)
    try {
      await switchToLocalChain()
      await wallet.refresh()
    } catch (cause) {
      setSwitchError(getErrorMessage(cause))
    }
  }

  if (!wallet.available) {
    return (
      <section className="walletbar">
        <p className="walletbar-message">
          MetaMask was not detected.{' '}
          <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
            Install MetaMask
          </a>{' '}
          to interact with the escrow contract.
        </p>
      </section>
    )
  }

  return (
    <section className="walletbar">
      <div className="walletbar-row">
        {wallet.address === undefined ? (
          <button type="button" className="button" onClick={() => void wallet.connect()}>
            {wallet.connecting ? 'Connecting…' : 'Connect MetaMask'}
          </button>
        ) : (
          <>
            <span className="pill" title={wallet.address}>
              {shortenAddress(wallet.address, 6)}
            </span>
            <span className="pill">
              {wallet.balance === undefined ? '—' : `${formatEth(wallet.balance)} ETH`}
            </span>
            <span className={`pill ${onWrongChain ? 'pill-warn' : ''}`}>
              Chain {wallet.chainId ?? '—'}
            </span>
            {onWrongChain && (
              <button type="button" className="button button-ghost" onClick={() => void handleSwitchChain()}>
                Switch to {LOCAL_CHAIN.chainName}
              </button>
            )}
          </>
        )}
      </div>

      {(wallet.error ?? switchError) !== undefined && (
        <p className="alert alert-error">{wallet.error ?? switchError}</p>
      )}
    </section>
  )
}
