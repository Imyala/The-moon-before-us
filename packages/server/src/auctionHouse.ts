import { AUCTION_LISTING_FEE, AUCTION_MAX_LISTINGS_PER_PLAYER, getItem, type CharacterState, type ItemRarity } from "@moon/shared";
import { randomUUID } from "node:crypto";
import { countAuctionsBySeller, deleteAuction, getAuction, insertAuction, type AuctionRow } from "./db.js";
import { addItem, removeItemsByIdAndRarity } from "./inventory.js";
import { creditGold } from "./presence.js";

export type AuctionResult = { ok: true } | { ok: false; reason: string };

/** Lists `quantity` of one inventory stack for `price` gold total, charging the flat listing fee
 *  up front. Like selling to a vendor, this only ever touches `inventory`, never `equipment`. */
export function listAuction(
  character: CharacterState,
  token: string,
  sellerName: string,
  itemId: string,
  rarity: ItemRarity,
  quantity: number,
  price: number
): AuctionResult {
  if (!Number.isInteger(quantity) || quantity <= 0) return { ok: false, reason: "Invalid quantity." };
  if (!Number.isInteger(price) || price <= 0) return { ok: false, reason: "Invalid price." };
  const def = getItem(itemId);
  if (!def) return { ok: false, reason: "Unknown item." };
  if (countAuctionsBySeller(token) >= AUCTION_MAX_LISTINGS_PER_PLAYER) {
    return { ok: false, reason: `You can only have ${AUCTION_MAX_LISTINGS_PER_PLAYER} listings live at once.` };
  }
  if (character.gold < AUCTION_LISTING_FEE) return { ok: false, reason: `Listing costs ${AUCTION_LISTING_FEE} gold.` };
  if (!removeItemsByIdAndRarity(character, itemId, rarity, quantity)) return { ok: false, reason: "You don't have that many." };

  character.gold -= AUCTION_LISTING_FEE;
  insertAuction({ id: randomUUID(), sellerToken: token, sellerName, itemId, rarity, quantity, price, listedAt: Date.now() });
  return { ok: true };
}

/** Pulls back your own listing — the item returns to inventory, the listing fee is not refunded. */
export function cancelAuction(character: CharacterState, token: string, listingId: string): AuctionResult {
  const row = getAuction(listingId);
  if (!row) return { ok: false, reason: "That listing is gone." };
  if (row.sellerToken !== token) return { ok: false, reason: "That's not your listing." };
  deleteAuction(listingId);
  addItem(character, row.itemId, row.quantity, row.rarity);
  return { ok: true };
}

/** Buys a listing outright at its listed price. Deletes the row before touching any state, so a
 *  second buyer racing for the same listing always finds it already gone (see db.ts's deleteAuction). */
export function buyAuction(character: CharacterState, token: string, listingId: string): AuctionResult {
  const row = getAuction(listingId);
  if (!row) return { ok: false, reason: "That listing is gone." };
  if (row.sellerToken === token) return { ok: false, reason: "You can't buy your own listing." };
  if (character.gold < row.price) return { ok: false, reason: "Not enough gold." };

  deleteAuction(listingId);
  character.gold -= row.price;
  addItem(character, row.itemId, row.quantity, row.rarity);
  creditGold(row.sellerToken, row.price);
  return { ok: true };
}

export function auctionRowsForRecipient(rows: AuctionRow[], recipientToken: string) {
  return rows.map((row) => ({
    id: row.id,
    sellerName: row.sellerName,
    itemId: row.itemId,
    rarity: row.rarity,
    quantity: row.quantity,
    price: row.price,
    listedAt: row.listedAt,
    isMine: row.sellerToken === recipientToken
  }));
}
