import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

describe("Faucet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const faucet = await ethers.deployContract("Faucet");

    const [owner] = await ethers.getSigners();

    console.log("Signer 1 address: ", owner.address);
    let withdrawAmount = ethers.parseUnits("1", "ether");
    return { faucet, owner, withdrawAmount };
  }

  it("should deploy and set the owner correctly", async function () {
    const { faucet, owner } = await networkHelpers.loadFixture(
      deployContractAndSetVariables,
    );

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it("should not allow withdrawals above .1 ETH at a time", async function () {
    const { faucet, withdrawAmount } = await networkHelpers.loadFixture(
      deployContractAndSetVariables,
    );

    await expect(faucet.withdraw(withdrawAmount)).to.be.revert(ethers);
  });
});
