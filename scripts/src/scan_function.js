import { SuiGrpcClient } from '@mysten/sui/grpc';

const CTF_PKG_ID = "0x96662054f048469d560c7d5d74b79a44c12f79a8e017e45b1ad85857c6891fdf";

const client = new SuiGrpcClient({
    network: 'testnet',
    baseUrl: 'https://fullnode.testnet.sui.io:443',
});

async function main() {
    console.log("🕵️‍♂️  Recherche du Staking Pool en cours...");

    try {
        // 1. On cherche la transaction de naissance du CTF
        const pkgInfo = await client.getObject({
            id: CTF_PKG_ID,
            options: { showPreviousTransaction: true }
        });
        
        const txDigest = pkgInfo.data?.previousTransaction;
        if (!txDigest) {
             console.log("❌ Transaction introuvable.");
             return;
        }

        console.log(`✅ Transaction trouvée : ${txDigest}`);
        console.log("🔍 Analyse des objets créés...");

        // 2. On regarde ce qui a été créé dedans
        const txInfo = await client.getTransactionBlock({
            digest: txDigest,
            options: { showObjectChanges: true }
        });

        if (!txInfo.objectChanges) {
            console.log("❌ Aucun objet créé trouvé.");
            return;
        }

        // 3. On cherche un objet qui vient du module "staking"
        const stakingPool = txInfo.objectChanges.find(obj => 
            obj.type === 'created' && 
            obj.objectType.includes('staking')
        );

        if (stakingPool) {
            console.log("\n🎉 PISCINE TROUVÉE !");
            console.log("=========================================");
            console.log("👉 ID DU STAKING POOL : " + stakingPool.objectId);
            console.log("=========================================");
            console.log("Copiez cet ID pour la dernière étape !");
        } else {
            console.log("❌ Pas trouvé. Voici tout ce qui a été créé :");
            console.log(txInfo.objectChanges);
        }
    } catch (e) {
        console.error("Erreur:", e);
    }
}

main();