import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import keyPairJson from "../keypair.json" with { type: "json" };

// --- CONFIGURATION ---
const CTF_ID = "0x96662054f048469d560c7d5d74b79a44c12f79a8e017e45b1ad85857c6891fdf";
const USDC_TYPE = "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC";
const PRICE = 5849000; 
// ---------------------

const { secretKey } = decodeSuiPrivateKey(keyPairJson.privateKey);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);

const suiClient = new SuiGrpcClient({
    network: 'testnet',
    baseUrl: 'https://fullnode.testnet.sui.io:443',
});

// Petite fonction helper pour trouver les coins sans passer par le client cassé
async function findCoinWithFetch(address: string) {
    console.log("🕵️‍♂️  Recherche des USDC via RPC direct...");
    const response = await fetch('https://fullnode.testnet.sui.io:443', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0', id: 1,
            method: 'suix_getCoins', // On utilise la méthode officielle RPC
            params: [address, USDC_TYPE]
        })
    });
    const data = await response.json();
    return data.result?.data || [];
}

(async () => {
  console.log("--- 🛒 Achat du Flag (Mode Hybride & Automatique) ---");
  const myAddress = keypair.toSuiAddress();
  console.log(`Wallet: ${myAddress}`);

  try {
    // 1. On trouve la pièce manuellement (via fetch)
    const coins = await findCoinWithFetch(myAddress);
    
    if (coins.length === 0) {
        throw new Error("❌ Aucun USDC trouvé sur ce wallet.");
    }

    // 2. On sélectionne la bonne pièce
    const paymentCoin = coins.find((c: any) => parseInt(c.balance) >= PRICE);

    if (!paymentCoin) {
        console.log("Vos pièces:", coins);
        throw new Error(`❌ Vous avez des USDC, mais il faut fusionner (Merge) vos pièces pour avoir ${PRICE} d'un coup.`);
    }

    const coinID = paymentCoin.coinObjectId;
    console.log(`✅ Pièce trouvée : ${coinID} (Solde: ${paymentCoin.balance})`);

    // 3. On prépare la transaction (avec le client Grpc)
    const tx = new Transaction();

    console.log("✂️  Découpage du montant exact...");
    const [exactPayment] = tx.splitCoins(tx.object(coinID), [tx.pure.u64(PRICE)]);

    console.log("💸 Achat du Flag...");
    const flag = tx.moveCall({
      target: `${CTF_ID}::merchant::buy_flag`,
      arguments: [ exactPayment ],
    });

    console.log("📦 Récupération...");
    tx.transferObjects([flag], tx.pure.address(myAddress));
    
    // 4. Signature et Envoi
    // @ts-ignore
    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx
      //options: { showEffects: true, showObjectChanges: true },
    }) as any;

    console.log("✅ TERMINÉ ! Digest:", result.digest);
    if (result.objectChanges) {
       const created = result.objectChanges.filter((o: any) => o.type === 'created');
       console.log("🏆 FLAG OBTENU :", created);
    }

  } catch (e) { 
    console.error("❌ Erreur:", e); 
  }
})();