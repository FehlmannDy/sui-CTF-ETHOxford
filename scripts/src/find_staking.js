// find_pool_robust.js
const CTF_ID = "0x96662054f048469d560c7d5d74b79a44c12f79a8e017e45b1ad85857c6891fdf";

async function main() {
    console.log("🕵️‍♂️  Recherche du Staking Pool (Mode Robuste)...");

    try {
        // Etape 1 : Trouver la transaction de création
        const response1 = await fetch('https://fullnode.testnet.sui.io:443', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: 1,
                method: 'sui_getObject',
                params: [
                    CTF_ID,
                    { showPreviousTransaction: true }
                ]
            })
        });

        const data1 = await response1.json();
        const txDigest = data1.result?.data?.previousTransaction;

        if (!txDigest) throw new Error("Transaction de création introuvable");
        console.log(`✅ Transaction trouvée : ${txDigest}`);

        // Etape 2 : Lire la transaction pour trouver le Pool
        const response2 = await fetch('https://fullnode.testnet.sui.io:443', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: 1,
                method: 'sui_getTransactionBlock',
                params: [
                    txDigest,
                    { showObjectChanges: true }
                ]
            })
        });

        const data2 = await response2.json();
        const changes = data2.result?.objectChanges;

        if (!changes) throw new Error("Pas de changements d'objets trouvés");

        // Etape 3 : Filtrer
        const pool = changes.find(obj => 
            obj.type === 'created' && 
            obj.objectType.includes('staking::StakingPool')
        );

        if (pool) {
            console.log("\n🎉 POOL TROUVÉ !");
            console.log("==================================================");
            console.log("👉 ID DU POOL : " + pool.objectId);
            console.log("==================================================");
        } else {
            console.log("❌ Pas trouvé dans cette transaction.");
        }

    } catch (e) {
        console.error("Erreur:", e.message);
    }
}

main();