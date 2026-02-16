import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import keyPairJson from "../keypair.json" with { type: "json" };
import { Transaction } from '@mysten/sui/transactions';
import { sleep } from './helpers.ts';

const keypair = Ed25519Keypair.fromSecretKey(keyPairJson.privateKey);
const suiClient = new SuiGrpcClient({
	network: 'testnet',
	baseUrl: 'https://fullnode.testnet.sui.io:443',
});

const CTF_PACKAGE_ID = '0x96662054f048469d560c7d5d74b79a44c12f79a8e017e45b1ad85857c6891fdf';
const STAKING_POOL_ID = '0x9576f25dd7b1ce05d23e6a87eba55f5882a0192bcff75d51a29e775a0256d96a';
const STAKING_POOL_INITIAL_SHARED_VERSION = '755309374';
const CLOCK_ID = '0x6';
const STAKE_AMOUNT = '1000000000'; // 1 SUI in mist

(async () => {
	const mode = (process.argv[2] ?? 'stake').toLowerCase();
	const count = process.argv[3] ? Number(process.argv[3]) : 8;
	const owner = keypair.getPublicKey().toSuiAddress();

	if (mode === 'stake') {
		// `count` is TOTAL receipts to create (e.g. 170). We'll batch into multiple txs (max 20 each).
		if (!Number.isFinite(count) || count <= 0 || count > 5000) {
			throw new Error('Invalid count. Example: pnpm staking stake 170');
		}

		const MAX_PER_TX = 20;
		let remaining = Math.floor(count);
		let createdTotal = 0;

		while (remaining > 0) {
			const batch = Math.min(MAX_PER_TX, remaining);
			remaining -= batch;

			const tx = new Transaction();
			tx.setGasBudget('120000000');

			const pool = tx.sharedObjectRef({
				objectId: STAKING_POOL_ID,
				initialSharedVersion: STAKING_POOL_INITIAL_SHARED_VERSION,
				mutable: true,
			});

			const stakeCoins = tx.splitCoins(
				tx.gas,
				Array.from({ length: batch }, () => STAKE_AMOUNT),
			);

			const receipts = [];
			for (let i = 0; i < batch; i++) {
				receipts.push(
					tx.moveCall({
						target: `${CTF_PACKAGE_ID}::staking::stake`,
						arguments: [pool, stakeCoins[i], tx.object(CLOCK_ID)],
					}),
				);
			}

			tx.transferObjects(receipts, owner);

			const result = await suiClient.signAndExecuteTransaction({
				transaction: tx,
				signer: keypair,
				include: { effects: true },
			});

			if (result.$kind !== 'Transaction' || !result.Transaction.status.success) {
				console.error('Stake failed:', result);
				process.exitCode = 1;
				return;
			}

			createdTotal += batch;
			console.log('digest', result.Transaction.digest, `(batch ${batch}, total ${createdTotal}/${Math.floor(count)})`);
			if (remaining > 0) await sleep(1000);
		}

		console.log(`Created ${createdTotal} receipts. Now wait, then run: pnpm staking claim`);
		return;
	}

	if (mode === 'claim') {
		// Query all receipts owned by user
		const receipts = [];
		let cursor: string | null = null;
		while (true) {
			const page: Awaited<ReturnType<typeof suiClient.listOwnedObjects>> =
				await suiClient.listOwnedObjects({
					owner,
					type: `${CTF_PACKAGE_ID}::staking::StakeReceipt`,
					limit: 50,
					cursor,
				});
			receipts.push(...page.objects);
			if (!page.hasNextPage) break;
			cursor = page.cursor;
		}

		if (receipts.length < 2) {
			throw new Error(`Need at least 2 receipts. Found ${receipts.length}. Run: pnpm staking stake <count>`);
		}

		console.log(`Found ${receipts.length} receipts. Merging and claiming...`);

		// Build claim transaction
		const tx = new Transaction();
		tx.setGasBudget('200000000');

		const pool = tx.sharedObjectRef({
			objectId: STAKING_POOL_ID,
			initialSharedVersion: STAKING_POOL_INITIAL_SHARED_VERSION,
			mutable: true,
		});

		// Update all receipts to lock in elapsed hours
		const updated = receipts.map((r) =>
			tx.moveCall({
				target: `${CTF_PACKAGE_ID}::staking::update_receipt`,
				arguments: [tx.object(r.objectId), tx.object(CLOCK_ID)],
			}),
		);

		// Merge all receipts into one
		let merged = updated[0];
		for (let i = 1; i < updated.length; i++) {
			merged = tx.moveCall({
				target: `${CTF_PACKAGE_ID}::staking::merge_receipts`,
				arguments: [merged, updated[i], tx.object(CLOCK_ID)],
			});
		}

		// Claim flag (returns Flag + staked SUI)
		const [flag, stakedSui] = tx.moveCall({
			target: `${CTF_PACKAGE_ID}::staking::claim_flag`,
			arguments: [pool, merged, tx.object(CLOCK_ID)],
		});

		tx.transferObjects([flag, stakedSui], owner);

		try {
			const result = await suiClient.signAndExecuteTransaction({
				transaction: tx,
				signer: keypair,
				include: { effects: true },
			});

			if (result.$kind !== 'Transaction' || !result.Transaction.status.success) {
				console.error('Claim failed:', result);
				process.exitCode = 1;
				return;
			}

			console.log('SUCCESS! digest:', result.Transaction.digest);
			console.log('Flag claimed and SUI returned to your address');
		} catch (e) {
			console.error('Claim threw (likely not enough hours yet):', e);
			process.exitCode = 1;
		}
		return;
	}

	throw new Error(`Unknown mode "${mode}". Use: pnpm staking stake [count] | pnpm staking claim`);
})();