/// Module: toolbox_crack
module toolbox_crack::toolbox_crack;

use sui::coin::Coin;
use sui::random::Random;
use sui::tx_context::TxContext;
use usdc::usdc::USDC;
use ctf::lootboxes;
use sui::transfer;

public entry fun open_extract_lootbox(
    payment: Coin<USDC>,
    randi: &Random,
    ctx: &mut TxContext,
) {
    let lootbox_open = lootboxes::open_lootbox(payment, randi, ctx);
    let flag = lootboxes::extract_flag(lootbox_open);
    transfer::public_transfer(flag, ctx.sender());
}

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

