import { useCallback } from "react";
import "./App.css";
import { CreateEscrowForm } from "./components/CreateEscrowForm.tsx";
import { EscrowPanel } from "./components/EscrowPanel.tsx";
import { WalletBar } from "./components/WalletBar.tsx";
import { useDeployEscrow } from "./hooks/useDeployEscrow.ts";
import { useEscrow } from "./hooks/useEscrow.ts";
import { useWallet } from "./hooks/useWallet.ts";

function App() {
  const wallet = useWallet();
  const escrow = useEscrow(wallet.address);
  console.log(wallet);

  // A freshly deployed escrow is loaded into the panel straight away.
  const { setAddress } = escrow;
  const handleDeployed = useCallback(
    (address: string) => {
      setAddress(address);
    },
    [setAddress],
  );

  const deployer = useDeployEscrow(handleDeployed);

  return (
    <main className="page">
      <header className="header">
        <h1>Escrow</h1>
        <p className="subtitle">
          Interact with <code>contracts/Escrow.sol</code> through MetaMask.
          Point the wallet at a local node on <code>localhost:8545</code>.
        </p>
      </header>

      <WalletBar wallet={wallet} />
      <EscrowPanel escrow={escrow} account={wallet.address} />
      <CreateEscrowForm deployer={deployer} account={wallet.address} />
    </main>
  );
}

export default App;
