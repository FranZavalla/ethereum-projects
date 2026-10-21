import { network } from "hardhat";

// ===== Configure your airdrop here =====
const TOKEN_ADDRESS = "0x5A5f9A9C4fa07a8b0b8d6b21F37A5A8A23726208";

// Addresses that will receive tokens.
const RECIPIENTS: string[] = [
  "0x6b6575A7a57411E4931d7aC4d6E8BB0e1CEbDB9b",
  "0x52f1984Cd3e46e1214dB222D3Ff63712E7aCEedD",
];

// Percentage of YOUR balance to distribute, from 1 to 100.
const PERCENTAGE = 20;
// ========================================

async function main() {
  const { ethers } = await network.create();
  const [owner] = await ethers.getSigners();

  const token = await ethers.getContractAt("Sodita", TOKEN_ADDRESS, owner);

  const balance = await token.balanceOf(owner.address);
  const amountToAirdrop = (balance * BigInt(PERCENTAGE)) / 100n;
  const amountPerRecipient = amountToAirdrop / BigInt(RECIPIENTS.length);

  console.log("Airdrop from account:", owner.address);
  console.log("Token:", TOKEN_ADDRESS);
  console.log(`Your balance: ${ethers.formatEther(balance)} SOD`);
  console.log(
    `Distributing ${PERCENTAGE}% = ${ethers.formatEther(amountToAirdrop)} SOD`,
  );
  console.log(
    `To ${RECIPIENTS.length} recipients = ${ethers.formatEther(
      amountPerRecipient,
    )} SOD each\n`,
  );

  if (amountPerRecipient === 0n) {
    console.log(
      "WARNING: each recipient would get 0 SOD. Increase the percentage or reduce the number of recipients.\n",
    );
  }

  console.log("Sending airdrop...");
  const tx = await token.airdrop(RECIPIENTS, BigInt(PERCENTAGE));
  await tx.wait();
  console.log("Done (tx " + tx.hash + ")");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
