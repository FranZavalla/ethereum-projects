import { config as loadEnv } from "dotenv";
import { defineConfig } from "hardhat/config";
import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

loadEnv();

const { ALCHEMY_SEPOLIA_URL, MY_PRIVATE_KEY, ETHERSCAN_KEY } = process.env;

const networks: HardhatUserConfig["networks"] = {};

// Only enable Sepolia once the env vars are set, so that `compile`/`test`
// still work locally before you fill in your keys.
if (ALCHEMY_SEPOLIA_URL && MY_PRIVATE_KEY) {
  networks.sepolia = {
    type: "http",
    chainType: "l1",
    chainId: 11155111,
    url: ALCHEMY_SEPOLIA_URL,
    accounts: [MY_PRIVATE_KEY],
  };
}

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],

  solidity: {
    profiles: {
      default: {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },

  networks,

  verify: {
    etherscan: {
      apiKey: ETHERSCAN_KEY || "",
    },
  },
});
