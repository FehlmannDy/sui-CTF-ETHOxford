import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { sleep, writeToFile } from "./helpers.js";

const main = async () => {
  console.log("Generating KeyPair...");
  await sleep(1000);

  const keypair = new Ed25519Keypair();

  const publicAddress = keypair.getPublicKey().toSuiAddress();
  const privateKey = keypair.getSecretKey();

  const keyPairConfig = {
    publicAddress,
    privateKey,
  };

  await writeToFile("keypair.json", JSON.stringify(keyPairConfig, null, 2));

  console.log("\nKeyPair written to file successfully @ keypair.json");
  console.log(
    `\nView your Sui account at https://suiscan.xyz/testnet/account/${publicAddress}`
  );
  console.log("\nNext, please request tokens from alternative faucets:");
  console.log("- https://faucet.n1stake.com/");
  console.log("- https://faucet.sui.io/");
};

main();
