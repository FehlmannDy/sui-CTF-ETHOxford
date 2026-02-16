// check_mint.js
// Adresse du package Treasury (celui qui contient la fonction mint)
const TREASURY_PKG = "0x346e3233f61eb0055713417bfaddda7dc3bf26816faad1f7606994a368b92917";

async function main() {
    console.log("🕵️‍♂️  Analyse de la fonction 'mint'...");

    try {
        const response = await fetch('https://fullnode.testnet.sui.io:443', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: 1,
                method: 'sui_getNormalizedMoveModulesByPackage',
                params: [TREASURY_PKG]
            })
        });

        const data = await response.json();
        
        if (data.error) {
             throw new Error(JSON.stringify(data.error));
        }

        // On regarde les arguments de la fonction mint
        const mintFunc = data.result.treasury.exposedFunctions.mint;
        
        console.log("\n📋 SIGNATURE DE LA FONCTION MINT :");
        console.log("-----------------------------------");
        console.log(`Nombre d'arguments attendus : ${mintFunc.parameters.length}`);
        
        mintFunc.parameters.forEach((param, index) => {
            // On simplifie l'affichage pour la lisibilité
            let typeStr = JSON.stringify(param);
            if (typeStr.includes('Treasury')) typeStr = "TreasuryCap (La Banque)";
            if (typeStr === '"U64"') typeStr = "Montant (U64)";
            if (typeStr === '"Address"') typeStr = "Adresse du destinataire";
            if (typeStr.includes('TxContext')) typeStr = "TxContext (Automatique)";
            
            console.log(`Argument ${index}: ${typeStr}`);
        });
        console.log("-----------------------------------");

    } catch (e) {
        console.error("❌ Erreur:", e.message);
    }
}

main();