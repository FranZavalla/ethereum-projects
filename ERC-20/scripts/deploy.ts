import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const [deployer] = await ethers.getSigners();

  console.log(deployer.address);

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Account balance:", ethers.formatEther(balance));

  const Sodita = await ethers.getContractFactory("Sodita");
  const sod = await Sodita.deploy();
  await sod.waitForDeployment();
  console.log("Token address:", await sod.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
