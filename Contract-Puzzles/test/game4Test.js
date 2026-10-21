const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert } = require("chai");

describe("Game4", function () {
  async function deployContractAndSetVariables() {
    const Game = await ethers.getContractFactory("Game4");
    const game = await Game.deploy();
    const me = ethers.provider.getSigner(0);

    return { game, me };
  }
  it("should be a winner", async function () {
    const { game, me } = await loadFixture(deployContractAndSetVariables);

    console.log(await me.getAddress());
    await game.write(me.getAddress());

    await game.win(me.getAddress());

    // leave this assertion as-is
    assert(await game.isWon(), "You did not win the game");
  });
});
