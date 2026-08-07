import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { AUCTION_LISTING_FEE, AUCTION_MAX_LISTINGS_PER_PLAYER } from "@moon/shared";
import { Room } from "../src/room.js";
import { insertAuction, loadCharacter, saveCharacter } from "../src/db.js";
import { registerPresence } from "../src/presence.js";
import { makePlayer } from "./helpers.js";

/**
 * The auction house (see docs/GDD.md's "Auction house" section) is global and cross-room, unlike
 * vendors or trading — a listing must outlive the seller's session and be visible to buyers in
 * any other room. These tests exercise the real Room message handlers plus the presence/db layer
 * underneath, including the two different gold-crediting paths (seller online vs. offline) that
 * exist specifically to avoid a stale-autosave race (see presence.ts).
 */

function makeRoom() {
  return new Room({ isSolo: true, onEmpty: () => {}, persist: () => {} });
}

test("listing an item charges the fee, escrows the item, and shows up on the board", () => {
  const room = makeRoom();
  const seller = makePlayer({ gold: 50, inventory: [{ itemId: "mat_iron_ore", quantity: 5, rarity: "common" }] });
  room.players.set(seller.id, seller);

  (room as any).tryListAuction(seller, "mat_iron_ore", "common", 3, 20);

  assert.equal(seller.character.gold, 50 - AUCTION_LISTING_FEE, "the listing fee is charged");
  assert.equal(seller.character.inventory[0].quantity, 2, "the listed quantity is removed from inventory");

  (room as any).sendAuctionListings(seller);
  const msg = seller.ws.sent.findLast((m: any) => m.t === "auctionListings");
  const mine = msg.listings.filter((l: any) => l.itemId === "mat_iron_ore" && l.price === 20);
  assert.equal(mine.length, 1, "exactly the one just-listed stack shows up");
  assert.equal(mine[0].isMine, true, "the seller sees their own listing flagged");

  room.shutdown();
});

test("listing fails cleanly without enough gold for the fee, or without enough of the item", () => {
  const room = makeRoom();
  const poor = makePlayer({ gold: 0, inventory: [{ itemId: "mat_iron_ore", quantity: 5, rarity: "common" }] });
  room.players.set(poor.id, poor);
  (room as any).tryListAuction(poor, "mat_iron_ore", "common", 1, 10);
  assert.equal(poor.character.inventory[0].quantity, 5, "nothing is removed when the fee can't be paid");
  assert.ok(poor.ws.sent.some((m: any) => m.t === "error"));

  const shortStock = makePlayer({ gold: 50, inventory: [{ itemId: "mat_iron_ore", quantity: 2, rarity: "common" }] });
  room.players.set(shortStock.id, shortStock);
  (room as any).tryListAuction(shortStock, "mat_iron_ore", "common", 5, 10);
  assert.equal(shortStock.character.gold, 50, "nothing is charged when the player doesn't hold enough");
  assert.equal(shortStock.character.inventory[0].quantity, 2);

  room.shutdown();
});

test("cancelling your own listing returns the item without refunding the fee; cancelling someone else's is refused", () => {
  const room = makeRoom();
  const seller = makePlayer({ gold: 50, inventory: [{ itemId: "mat_wood", quantity: 4, rarity: "common" }] });
  room.players.set(seller.id, seller);
  (room as any).tryListAuction(seller, "mat_wood", "common", 4, 15);
  const listMsg = seller.ws.sent.findLast((m: any) => m.t === "auctionListings");
  const listingId = listMsg.listings.find((l: any) => l.itemId === "mat_wood" && l.price === 15).id;

  const stranger = makePlayer({ gold: 100 });
  room.players.set(stranger.id, stranger);
  (room as any).tryCancelAuction(stranger, listingId);
  assert.ok(stranger.ws.sent.some((m: any) => m.t === "error" && m.message.includes("not your listing")));

  (room as any).tryCancelAuction(seller, listingId);
  assert.equal(seller.character.inventory.find((s: any) => s.itemId === "mat_wood")?.quantity, 4, "the item is fully returned");
  assert.equal(seller.character.gold, 50 - AUCTION_LISTING_FEE, "the listing fee stays spent");

  room.shutdown();
});

test("buying a listing from an online seller credits their live character immediately", () => {
  const room = makeRoom();
  const seller = makePlayer({ gold: 50, inventory: [{ itemId: "weapon_silver_blade", quantity: 1, rarity: "rare" }] });
  room.players.set(seller.id, seller);
  registerPresence(seller.token, seller.character, () => {}, () => {}); // notify isn't asserted on here, just needs to be callable
  (room as any).tryListAuction(seller, "weapon_silver_blade", "rare", 1, 40);
  const listMsg = seller.ws.sent.findLast((m: any) => m.t === "auctionListings");
  const listingId = listMsg.listings.find((l: any) => l.itemId === "weapon_silver_blade" && l.price === 40).id;

  const buyer = makePlayer({ gold: 100 });
  room.players.set(buyer.id, buyer);
  (room as any).tryBuyAuction(buyer, listingId);

  assert.equal(buyer.character.gold, 60, "the buyer pays the listed price");
  assert.ok(buyer.character.inventory.some((s: any) => s.itemId === "weapon_silver_blade" && s.rarity === "rare"), "the buyer receives the item");
  assert.equal(seller.character.gold, 50 - AUCTION_LISTING_FEE + 40, "the online seller's live character is credited directly");

  room.shutdown();
});

test("buying a listing from an offline seller credits their saved row instead, never their (nonexistent) live session", () => {
  const room = makeRoom();
  const sellerToken = `offline-seller-${randomUUID()}`;
  // saveCharacter round-trips through the real characters table, unlike every other test's
  // in-memory-only fixture — it needs the NOT NULL columns makePlayer's minimal fixture skips.
  const offlineCharacter = {
    ...makePlayer({ gold: 5 }).character,
    xp: 0,
    skillPoints: 0,
    position: { x: 0, y: 0, z: 0 },
    gold: 5
  };
  saveCharacter(sellerToken, offlineCharacter);

  // The seller isn't connected to any room — simulate their listing existing on the board without
  // ever calling registerPresence for their token.
  insertAuction({
    id: randomUUID(),
    sellerToken,
    sellerName: "Ghost Seller",
    itemId: "mat_moonpetal",
    rarity: "common",
    quantity: 1,
    price: 12,
    listedAt: Date.now()
  });

  const buyer = makePlayer({ gold: 100 });
  room.players.set(buyer.id, buyer);
  const before = loadCharacter(sellerToken)!;
  const listingId = (() => {
    (room as any).sendAuctionListings(buyer);
    const msg = buyer.ws.sent.findLast((m: any) => m.t === "auctionListings");
    return msg.listings.find((l: any) => l.itemId === "mat_moonpetal").id;
  })();

  (room as any).tryBuyAuction(buyer, listingId);

  assert.equal(buyer.character.gold, 88, "the buyer still pays the listed price");
  const after = loadCharacter(sellerToken)!;
  assert.equal(after.gold, before.gold + 12, "the offline seller's saved row is credited directly");

  room.shutdown();
});

test("you can't buy your own listing", () => {
  const room = makeRoom();
  const seller = makePlayer({ gold: 50, inventory: [{ itemId: "mat_herb", quantity: 1, rarity: "common" }] });
  room.players.set(seller.id, seller);
  (room as any).tryListAuction(seller, "mat_herb", "common", 1, 5);
  const listMsg = seller.ws.sent.findLast((m: any) => m.t === "auctionListings");
  const listingId = listMsg.listings.find((l: any) => l.itemId === "mat_herb" && l.price === 5).id;

  (room as any).tryBuyAuction(seller, listingId);
  assert.ok(seller.ws.sent.some((m: any) => m.t === "error" && m.message.includes("own listing")));

  room.shutdown();
});

test("a seller is capped at AUCTION_MAX_LISTINGS_PER_PLAYER live listings", () => {
  const room = makeRoom();
  const inventory = Array.from({ length: AUCTION_MAX_LISTINGS_PER_PLAYER + 1 }, () => ({ itemId: "mat_wood", quantity: 1, rarity: "common" as const }));
  const seller = makePlayer({ gold: 1000, inventory });
  room.players.set(seller.id, seller);

  for (let i = 0; i < AUCTION_MAX_LISTINGS_PER_PLAYER; i++) {
    (room as any).tryListAuction(seller, "mat_wood", "common", 1, 5);
  }
  seller.ws.sent.length = 0;
  (room as any).tryListAuction(seller, "mat_wood", "common", 1, 5);
  assert.ok(seller.ws.sent.some((m: any) => m.t === "error" && m.message.includes(String(AUCTION_MAX_LISTINGS_PER_PLAYER))));

  room.shutdown();
});
