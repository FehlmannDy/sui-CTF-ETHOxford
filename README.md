# Sui CTF

Welcome to the Sui Capture the Flag challenge! This CTF is designed to test and improve your understanding of Sui Move smart contracts, the Sui object model, and Programmable Transaction Blocks (PTBs).

## Table of Contents
- [Sui CTF](#sui-ctf)
- [Table of Contents](#table-of-contents)
- [Environment Setup](#environment-setup)
- [Challenges](#challenges)

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

Check back soon for exciting challenges!

---

**Note**: This CTF is for educational purposes only. The keypair generated is for testnet use only and should never be used on mainnet or with real assets.
