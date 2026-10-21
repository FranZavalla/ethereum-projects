# ethereum-projects

## Repository layout

```
ethereum-projects/
├── Contract-Puzzles/    # 5 Solidity "escape room" puzzles + tests
├── ERC-20/              # ERC-20 token (Sodita/SOD) + deploy & airdrop scripts
├── faucet/              # Payable Faucet contract + Hardhat tests
├── hardhat-tutorial/    # Minimal Hardhat 3 project: tests, coverage, deploy
└── escrow/              # Escrow contract + React/MetaMask frontend
```

---

## 1. Contract-Puzzles

Five tiny "Game" contracts. Each one has a storage variable:

```solidity
bool public isWon;
```

**Your goal:** make `isWon` become `true` **by only editing the test file** — you
must not modify the smart contract, and you must keep the existing `isWon`
assertion. It's an exercise in reading Solidity and reasoning about how state
changes.

| File                      | Contract | Idea to figure out                                         |
| ------------------------- | -------- | ---------------------------------------------------------- |
| `contracts/Contract1.sol` | `Game1`  | Call `unlock()` before `win()`.                            |
| `contracts/Contract2.sol` | `Game2`  | Turn on three specific switches (`20`, `47`, `212`).       |
| `contracts/Contract3.sol` | `Game3`  | Arrange three addresses with balances in the right order.  |
| `contracts/Contract4.sol` | `Game4`  | Work out the nested `mapping[address][address]` direction. |
| `contracts/Contract5.sol` | `Game5`  | Find an address that sorts below the threshold.            |

Each puzzle has a matching test in `test/` (`game1Test.js` … `game5Test.js`).

### Commands

```bash
cd Contract-Puzzles
npm install

# Run every puzzle's tests
npx hardhat test

# Run a single puzzle (recommended while working)
npx hardhat test test/game1Test.js
```

> Uses Hardhat 2 with Ethers v5 and Waffle/Chai. Tip: you can add
> `console.log` from Hardhat to debug your contracts while solving a puzzle.

---

## 2. ERC-20

A complete ERC-20 token project using **Hardhat 3 + TypeScript + OpenZeppelin +
Ethers v6**. It contains:

- `contracts/Sodita.sol` — an ERC-20 named **Sodita (SOD)** with a 100-token
  initial supply, plus an `airdrop(recipients, percentage)` function that sends
  a percentage of the caller's balance to a list of addresses.
- `scripts/deploy.ts` — deploys the token and prints the deployer address,
  balance, and the new token address.
- `scripts/airdrop.ts` — sends tokens to a configured list of recipients.

### Configuration (`.env`)

Create a `.env` file in `ERC-20/` with:

```
ALCHEMY_SEPOLIA_URL=...
MY_PRIVATE_KEY=...
ETHERSCAN_KEY=...
```

The Sepolia network is only enabled once `ALCHEMY_SEPOLIA_URL` and
`MY_PRIVATE_KEY` are set, so `compile` and `test` work locally before you fill
in your keys. `ETHERSCAN_KEY` is used for contract verification.

### Commands

```bash
cd ERC-20
npm install

npm run compile          # hardhat compile
npm test                 # hardhat test

# Deploy to Sepolia
npm run deploy:sepolia   # hardhat run scripts/deploy.ts --network sepolia

# Run the airdrop (edit TOKEN_ADDRESS / RECIPIENTS / PERCENTAGE in the script first)
npm run airdrop          # hardhat run scripts/airdrop.ts --network sepolia
```

Before running `scripts/airdrop.ts`, open it and set `TOKEN_ADDRESS`,
`RECIPIENTS`, and `PERCENTAGE` (1–100) at the top of the file.

---

## 3. hardhat-tutorial

A minimal **Hardhat 3** project that shows the modern workflow: TypeScript,
**Viem** (instead of Ethers), **Solidity tests** via `forge-std`, coverage, and
**Ignition** deployments.

- `contracts/Counter.sol` — a `Counter` with `inc()` and `incBy(uint)`.
- `contracts/Counter.t.sol` — Solidity tests (including a fuzz test).
- `test/Counter.ts` — a TypeScript test using Viem.
- `ignition/modules/Counter.ts` — the deployment module (deploys and calls
  `incBy(5)`).

### Configuration

Sepolia and Etherscan credentials are read from the Hardhat keystore. Set them
with the provided scripts (values are stored securely, not in a `.env`):

```bash
npm run keystore:sepolia-url
npm run keystore:priv-key
npm run keystore:etherscan-api-key
```

### Commands

```bash
cd hardhat-tutorial
npm install

npm run build                 # compile contracts

# Tests
npm test                      # run all tests
npm run test:solidity         # Solidity tests only
npm run test:nodejs           # TypeScript/Node tests only

# Coverage
npm run test:coverage
npm run test:solidity:coverage
npm run test:nodejs:coverage

# Local development
npm run localnet              # start a local Hardhat node

# Deploy with Ignition
npm run deploy:localhost      # deploy to the local node
npm run deploy:sepolia        # deploy to Sepolia
npm run deploy:verify         # deploy to Sepolia and verify on Etherscan
```

---

## 4. faucet

A minimal **Hardhat 3 + TypeScript + Ethers** project around a payable
`Faucet` contract.

- `contracts/Faucet.sol` — the faucet. `withdraw(amount)` lets anyone pull up to
  `0.1 ETH` per call, `withdrawAll()` lets the owner drain the contract and marks
  it inactive, and `onlyOwner` guards the owner-only path.
- `test/faucetTest.ts` — Mocha/Chai tests (owner is set correctly; withdrawals
  above `0.1 ETH` revert).
- `scripts/send-op-tx.ts` — a small example of sending a transaction on a
  simulated OP (Optimism) chain type.
- `ignition/modules/Counter.ts` — the default Ignition module scaffold.

The config defines simulated `hardhatMainnet` (L1) and `hardhatOp` (OP) networks
plus a `sepolia` network read from Configuration Variables.

### Commands

```bash
cd faucet
npm install

npm test                 # hardhat test (runs the Mocha tests)
```

If you want to deploy to Sepolia, set the config variables first and use
Ignition:

```bash
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia
```

---

## 5. escrow

A full dApp split into two parts: a Solidity contract and a React frontend.

### The contract (`escrow/`)

`contracts/Escrow.sol` is a classic escrow: a **depositor** funds it on
construction, an **arbiter** decides when to release, and the funds go to the
**beneficiary**:

- `constructor(arbiter, beneficiary)` is `payable` — the depositor is whoever
  deploys it, and the deposit is sent at deploy time (there is no separate
  deposit function).
- `approve()` can only be called by the arbiter and sends the whole balance to
  the beneficiary, then sets `isApproved`.

Built with **Hardhat 3 + Mocha + Ethers**. The config defines simulated
`hardhatMainnet` (L1) and `hardhatOp` (OP) networks plus `sepolia` from
Configuration Variables, and `default`/`production` Solidity profiles.

```bash
cd escrow
npm install

npm run compile          # hardhat compile
npm run localnet         # start a local node (http://127.0.0.1:8545, chain id 31337)
```

> Note: this project currently has no test files of its own; `localnet` and
> `compile` are the scripts it ships with.

### The frontend (`escrow/app/`)

A Vite + React + TypeScript app that talks to MetaMask via `window.ethereum`
(no private keys are handled in the app — the wallet signs everything). It can
read a deployed escrow, release funds as the arbiter, and deploy a new escrow.

Start the local chain first (from `escrow/` with `npm run localnet`), then:

```bash
cd escrow/app
npm install
npm run dev              # Vite dev server (runs sync:abi first)
```

| Script             | What it does                                                   |
| ------------------ | -------------------------------------------------------------- |
| `npm run dev`      | Vite dev server with HMR                                       |
| `npm run build`    | Type-check and build to `dist/`                                |
| `npm run preview`  | Serve the production build                                     |
| `npm run lint`     | oxlint                                                         |
| `npm run sync:abi` | Refresh `src/contracts/Escrow.json` from the compiled artifact |

`dev` and `build` run `sync:abi` first, so the app always uses the same ABI and
bytecode as the contract you last compiled in `escrow/`. Copy `.env.example` to
`.env` and set `VITE_ESCROW_ADDRESS=0x...` to prefill the contract address (or
paste/deploy one from the page). The app's hooks live in `src/hooks/` and its
components in `src/components/`.

---

## Prerequisites

- **Node.js 18+** (Node 20+ recommended) and npm.
- A wallet with a private key and some Sepolia ETH if you plan to deploy.
- An Alchemy (or other RPC provider) Sepolia URL.
- An Etherscan API key for verification.

## A note on secrets

`.env` files and private keys are git-ignored (see `.gitignore`). Never commit
real keys. Each project reads its own configuration:

- `Contract-Puzzles/` — no network config needed (local tests only).
- `ERC-20/` — `.env` with `ALCHEMY_SEPOLIA_URL`, `MY_PRIVATE_KEY`,
  `ETHERSCAN_KEY`.
- `faucet/` — Hardhat keystore (`SEPOLIA_RPC_URL`, `SEPOLIA_PRIVATE_KEY`).
- `hardhat-tutorial/` — Hardhat keystore (`SEPOLIA_RPC_URL`,
  `SEPOLIA_PRIVATE_KEY`, `ETHERSCAN_API_KEY`).
- `escrow/` — Hardhat keystore (`SEPOLIA_RPC_URL`, `SEPOLIA_PRIVATE_KEY`); the
  frontend in `escrow/app/` uses a `.env` with `VITE_ESCROW_ADDRESS` and keeps
  keys in MetaMask.
