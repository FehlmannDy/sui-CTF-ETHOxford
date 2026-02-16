import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import keyPairJson from "../keypair.json" with { type: "json" };
import { Transaction } from '@mysten/sui/transactions';
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

const CTF_PACKAGE_ID = "0x96662054f048469d560c7d5d74b79a44c12f79a8e017e45b1ad85857c6891fdf";


(async () => {
console.log("--- Récupération du Flag (Moving Window) ---");

  const now = new Date();
  const timeInHour = (now.getMinutes() * 60) + now.getSeconds();
  
  // Créneaux : 0-5min OU 30-35min
  const isOpen = (timeInHour >= 0 && timeInHour < 300) || (timeInHour >= 1800 && timeInHour < 2100);

  if (!isOpen) {
    console.log(`⚠️  Fermé ! (Seconde: ${timeInHour}). Attendez xx:00 ou xx:30.`);
    return;
  }

  try {
    const tx = new Transaction();

    // 1. On capture le résultat (l'objet Flag) dans une variable
    const flag = tx.moveCall({
      target: `${CTF_PACKAGE_ID}::moving_window::extract_flag`,
      arguments: [
        tx.object('0x6')
      ],
    });

    // 2. CORRECTION : On transfère l'objet reçu à nous-même (sender)
    // Sans ça, l'erreur UnusedValueWithoutDrop se déclenche
    tx.transferObjects([flag], tx.pure.address(keypair.toSuiAddress()));

    console.log("Envoi de la transaction...");

    // @ts-ignore
    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    }) as any;

    console.log("✅ Transaction envoyée ! Digest:", result.digest);
    console.log(`https://suiscan.xyz/testnet/tx/${result.digest}`);

    if (result.objectChanges) {
       const created = result.objectChanges.filter((o: any) => o.type === 'created');
       console.log("🏆 Objets créés (FLAG) :", created);
    }

  } catch (e) {
    console.error("❌ Erreur:", e);
  }
})();