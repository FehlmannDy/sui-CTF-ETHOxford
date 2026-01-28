# Sui CTF

Welcome to the Sui Capture the Flag challenge! This CTF is designed to test and improve your understanding of Sui Move smart contracts, the Sui object model, and Programmable Transaction Blocks (PTBs).

## Table of Contents
- [Sui CTF](#sui-ctf)
  - [Table of Contents](#table-of-contents)
  - [Environment Setup](#environment-setup)
    - [Prerequisites](#prerequisites)
    - [Setup Instructions](#setup-instructions)
    - [Funding Your Account](#funding-your-account)
  - [Challenges](#challenges)
    - [Structure](#structure)
    - [Adding Challenges](#adding-challenges)
  - [Moving Window Challenge](#moving-window-challenge)
    - [Instructions](#instructions)
  - [Merchant Challenge](#merchant-challenge)
    - [Instructions](#instructions-1)
  - [Lootboxes Challenge](#lootboxes-challenge)
    - [Instructions](#instructions-2)
    - [Hints](#hints)
  - [Staking Challenge](#staking-challenge)
    - [Instructions](#instructions-3)

## Environment Setup

Before you start tackling challenges, you need to set up your environment and create a keypair for interacting with the Sui blockchain.

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm package manager

### Setup Instructions

1. Navigate to the `scripts` directory:
```bash
cd scripts
```

2. Install dependencies:
```bash
pnpm install
```

3. Generate and fund a new keypair:
```bash
pnpm run init-keypair
```

This will generate a new Ed25519 keypair and save it to `keypair.json` in the scripts directory. **Make sure not to use this keypair in any production environments.**

### Funding Your Account

After generating your keypair, you'll need to request testnet tokens from one of these faucets:

- [n1stake faucet](https://faucet.n1stake.com)
- [Official Sui faucet](https://faucet.sui.io/)
- [Discord faucet](https://discord.gg/cKx75xrRMq)

You can view your account and balance on the Sui Explorer at:
```
https://suiscan.xyz/testnet/account/{your-address}
```

## Challenges

All challenges are Move modules within the single `ctf` package located in the `contracts/` directory. This architecture is required because the flag module uses `public(package)` visibility, meaning only modules in the same package can create flags.

### Structure

```
contracts/
├── Move.toml          # Package: ctf
└── sources/
    ├── flag.move      # Base flag module
    └── ...            # Challenge modules will be added here
```

### Adding Challenges

Each challenge will be a new Move module file in `contracts/sources/`. Challenge modules can:
- Import the flag module with `use ctf::flag;`
- Create flags when solved with `flag::new(b"challenge_name".to_string(), ctx)`
- Access other challenge modules in the same package

## Moving Window Challenge

Extract the flag during the moving window.

### Instructions

1. Examine the [`moving_window.move`](./contracts/sources/moving_window.move) contract carefully.
2. Determine when the window is open.
3. Implement your solution in [`scripts/src/moving_window.ts`](./scripts/src/moving_window.ts).
4. Run your script with `pnpm run moving-window` to extract the flag.

## Merchant Challenge

Buy a flag using USDC tokens.

### Instructions

1. Examine the [`merchant.move`](./contracts/sources/merchant.move) contract carefully.
2. Acquire USDC tokens on testnet.
3. Implement your solution in [`scripts/src/merchant.ts`](./scripts/src/merchant.ts).
4. Run your script with `pnpm run merchant` to extract the flag.

## Lootboxes Challenge

Open lootboxes until you get a flag.

### Instructions

1. Examine the [`lootboxes.move`](./contracts/sources/lootboxes.move) contract carefully.
2. Create new lootboxes until you get a flag.
3. Implement your solution in [`scripts/src/lootboxes.ts`](./scripts/src/lootboxes.ts).
4. Run your script with `pnpm run lootboxes` to extract the flag.

### Hints

1. Every lootbox has a 1 in 100 chance of containing a flag.
2. Use this [page](https://docs.sui.io/guides/developer/advanced/randomness-onchain#programmable-transaction-block-ptb-restrictions) to learn more about Sui's on-chain randomness. Especially if you are running into this error: `PostRandomCommandRestrictions`
3. A mistake has been made in the `lootboxes.move` contract regarding the use of the `Random` object.

## Staking Challenge

Stake SUI tokens to earn the right to claim a flag.

### Instructions

1. Examine the [`staking.move`](./contracts/sources/staking.move) contract carefully.
2. Understand the staking requirements: you must stake a minimum of 1 SUI for at least 1 week (168 hours).
3. Implement your solution in [`scripts/src/staking.ts`](./scripts/src/staking.ts).
4. Run your script with `pnpm run staking` to extract the flag.

---

**Note**: This CTF is for educational purposes only. The keypair generated is for testnet use only and should never be used on mainnet or with real assets.
