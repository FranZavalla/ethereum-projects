const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert } = require("chai");

describe("Game3", function () {
  async function deployContractAndSetVariables() {
    const Game = await ethers.getContractFactory("Game3");
    const game = await Game.deploy();

    // Hardhat will create 10 accounts for you by default
    // you can get one of this accounts with ethers.provider.getSigner
    // and passing in the zero-based indexed of the signer you want:
    const signer0 = ethers.provider.getSigner(0);
    const signer1 = ethers.provider.getSigner(1);
    const signer2 = ethers.provider.getSigner(2);

    // you can get that signer's address via .getAddress()
    // this variable is NOT used for Contract 3, just here as an example
    // const address = await signer.getAddress();

    return { game, signer0, signer1, signer2 };
  }

  it("should be a winner", async function () {
    const { game, signer0, signer1, signer2 } = await loadFixture(
      deployContractAndSetVariables,
    );

    // to call a contract as a signer you can use contract.connect
    await game.connect(signer0).buy({ value: "1" });
    await game.connect(signer1).buy({ value: "2" });
    await game.connect(signer2).buy({ value: "3" });

    // TODO: win expects three arguments
    await game.win(
      signer1.getAddress(),
      signer2.getAddress(),
      signer0.getAddress(),
    );

    // leave this assertion as-is
    assert(await game.isWon(), "You did not win the game");
  });
});
