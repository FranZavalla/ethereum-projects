const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert } = require("chai");

describe("Game5", function () {
  async function deployContractAndSetVariables() {
    const Game = await ethers.getContractFactory("Game5");
    const game = await Game.deploy();

    return { game };
  }
  it("should be a winner", async function () {
    const { game } = await loadFixture(deployContractAndSetVariables);

    // good luck
    // The threshold starts with 0x00, so we need an account whose address is
    // numerically smaller than it. Freshly created wallets are uniformly
    // distributed, so keep going until we find one that starts with 0x00.
    const threshold = ethers.BigNumber.from(
      "0x00FfFFfFFFfFFFFFfFfFfffFFFfffFfFffFfFFFf",
    );
    let winner;
    do {
      winner = ethers.Wallet.createRandom().connect(ethers.provider);
    } while (!ethers.BigNumber.from(winner.address).lt(threshold));

    // fund the new account so it can pay for gas
    const [funder] = await ethers.getSigners();
    await funder.sendTransaction({
      to: winner.address,
      value: ethers.utils.parseEther("1"),
    });

    // call win() as the low address
    await game.connect(winner).win();

    // leave this assertion as-is
    assert(await game.isWon(), "You did not win the game");
  });
});
