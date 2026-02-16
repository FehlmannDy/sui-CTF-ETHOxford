// detective_v2.js
const CTF_ID = "0x96662054f048469d560c7d5d74b79a44c12f79a8e017e45b1ad85857c6891fdf";

// Liste de serveurs de secours (RPC)
const RPC_LIST = [
    'https://fullnode.testnet.sui.io:443',
    'https://rpc.testnet.sui.io:443',
    'https://sui-testnet-endpoint.blockvision.org/sui/rpc',
];

async function tryFetch(rpcUrl) {
    console.log(`📡 Tentative de connexion sur : ${rpcUrl}...`);
    const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0', id: 1,
            method: 'sui_getNormalizedMoveModulesByPackage',
            params: [CTF_ID]
        })
    });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return await response.json();
}

async function main() {
    console.log("🕵️‍♂️  Recherche ROBUSTE des IDs...");
    let data = null;

    // 1. On essaie les serveurs un par un
    for (const url of RPC_LIST) {
        try {
            data = await tryFetch(url);
            console.log("✅ Connexion réussie !");
            break; // Si ça marche, on sort de la boucle
        } catch (e) {
            console.log(`❌ Echec sur ${url} (${e.message || 'Timeout'}). On essaie le suivant...`);
        }
    }

    if (!data) {
        console.error("☠️  Impossible de contacter le réseau. Vérifiez votre internet.");
        return;
    }

    try {
        // 2. On extrait l'adresse USDC
        const usdcAddress = data.result.merchant.exposedFunctions.buy_flag.parameters[0].Struct.typeArguments[0].Struct.address;

        console.log("\n🎯 BINGO ! ADRESSE USDC :");
        console.log(`👉 ${usdcAddress}`);
        
        console.log("\n---------------------------------------------------");
        console.log("🏦 ETAPE CRUCIALE : LE TREASURY CAP");
        console.log("---------------------------------------------------");
        console.log("Copiez le lien ci-dessous dans votre navigateur :");
        console.log(`🔗 https://suiscan.xyz/testnet/object/${usdcAddress}/tx-blocks?tab=live-objects`);
        console.log("\n1. Dans la liste, trouvez la ligne écrite 'TreasuryCap'.");
        console.log("2. Copiez l'ID de cet objet.");

    } catch (error) {
        console.error("Erreur de lecture des données:", error.message);
    }
}

main();