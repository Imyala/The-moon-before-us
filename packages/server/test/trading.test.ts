import { test } from "node:test";
import assert from "node:assert/strict";
import { Room } from "../src/room.js";
import { makePlayer } from "./helpers.js";

function setup() {
  const room = new Room({ isSolo: true, onEmpty: () => {}, persist: () => {} });
  const alice = makePlayer({
    id: "alice",
    position: { x: 0, y: 0, z: 0 },
    inventory: [
      { itemId: "mat_iron_ore", quantity: 5, rarity: "common" },
      { itemId: "weapon_silver_blade", quantity: 1, rarity: "rare" }
    ]
  });
  const bob = makePlayer({ id: "bob", position: { x: 2, y: 0, z: 0 }, inventory: [{ itemId: "mat_herb", quantity: 3, rarity: "common" }] });
  room.players.set(alice.id, alice);
  room.players.set(bob.id, bob);
  return { room, alice, bob };
}

test("proposing a trade out of range is refused", () => {
  const { room, alice } = setup();
  const far = makePlayer({ id: "far", position: { x: 500, y: 0, z: 0 } });
  room.players.set(far.id, far);
  (room as any).proposeTrade(alice, far.id);
  assert.ok(alice.ws.sent.some((m: any) => m.t === "error"), "an out-of-range proposal is refused");
  room.shutdown();
});

test("proposing sends a request to the target only, and a second proposal is refused while pending", () => {
  const { room, alice, bob } = setup();
  (room as any).proposeTrade(alice, bob.id);
  const req = bob.ws.sent.find((m: any) => m.t === "tradeRequest");
  assert.ok(req && req.fromPlayerId === "alice", "the target receives a tradeRequest naming the proposer");
  assert.ok(!alice.ws.sent.some((m: any) => m.t === "tradeRequest"), "the proposer does not get their own tradeRequest");

  const carol = makePlayer({ id: "carol", position: { x: 1, y: 0, z: 0 } });
  room.players.set(carol.id, carol);
  alice.ws.sent.length = 0;
  (room as any).proposeTrade(alice, carol.id);
  assert.ok(alice.ws.sent.some((m: any) => m.t === "error"), "a second trade can't be proposed while one is pending");
  room.shutdown();
});

test("declining closes the trade for both sides without opening a window", () => {
  const { room, alice, bob } = setup();
  (room as any).proposeTrade(alice, bob.id);
  const tradeId = bob.ws.sent.find((m: any) => m.t === "tradeRequest").tradeId;
  (room as any).respondTrade(bob, tradeId, false);
  assert.ok(bob.ws.sent.some((m: any) => m.t === "tradeClosed" && m.reason === "declined"));
  assert.ok(alice.ws.sent.some((m: any) => m.t === "tradeClosed" && m.reason === "declined"));
  room.shutdown();
});

test("a full accept -> offer -> confirm -> execute cycle transfers exact items and rarities", () => {
  const { room, alice, bob } = setup();
  (room as any).proposeTrade(alice, bob.id);
  const tradeId = bob.ws.sent.find((m: any) => m.t === "tradeRequest").tradeId;
  (room as any).respondTrade(bob, tradeId, true);

  (room as any).setTradeOffer(alice, tradeId, "mat_iron_ore", "common", 3);
  (room as any).setTradeOffer(alice, tradeId, "weapon_silver_blade", "epic", 1); // wrong rarity, owns none -> no-op
  (room as any).setTradeOffer(alice, tradeId, "weapon_silver_blade", "rare", 99); // clamps to the 1 actually owned
  (room as any).setTradeOffer(bob, tradeId, "mat_herb", "common", 3);

  const aliceState = alice.ws.sent.filter((m: any) => m.t === "tradeState").at(-1);
  assert.ok(aliceState.selfOffer.some((e: any) => e.itemId === "mat_iron_ore" && e.quantity === 3));
  assert.ok(aliceState.selfOffer.some((e: any) => e.itemId === "weapon_silver_blade" && e.rarity === "rare" && e.quantity === 1));
  assert.ok(!aliceState.selfOffer.some((e: any) => e.rarity === "epic"), "offering a rarity not owned adds nothing");

  (room as any).confirmTradeSide(alice, tradeId);
  const bobStateAfterAliceConfirm = bob.ws.sent.filter((m: any) => m.t === "tradeState").at(-1);
  assert.equal(bobStateAfterAliceConfirm.otherConfirmed, true);
  assert.equal(bobStateAfterAliceConfirm.selfConfirmed, false);
  assert.ok(alice.character.inventory.some((s: any) => s.itemId === "mat_iron_ore"), "nothing transfers until both sides confirm");

  // Bob editing his offer after Alice confirmed un-confirms her again.
  (room as any).setTradeOffer(bob, tradeId, "mat_herb", "common", 2);
  const aliceStateAfterEdit = alice.ws.sent.filter((m: any) => m.t === "tradeState").at(-1);
  assert.equal(aliceStateAfterEdit.selfConfirmed, false, "editing an offer un-confirms a side that had already agreed");

  (room as any).confirmTradeSide(alice, tradeId);
  (room as any).confirmTradeSide(bob, tradeId);

  assert.ok(alice.character.inventory.some((s: any) => s.itemId === "mat_iron_ore" && s.quantity === 2), "Alice kept what she didn't offer");
  assert.ok(!alice.character.inventory.some((s: any) => s.itemId === "weapon_silver_blade"), "Alice's sword left her inventory");
  assert.ok(bob.character.inventory.some((s: any) => s.itemId === "mat_iron_ore" && s.quantity === 3), "Bob received the ore");
  assert.ok(bob.character.inventory.some((s: any) => s.itemId === "weapon_silver_blade" && s.rarity === "rare"), "Bob received the sword with rarity intact");
  assert.ok(alice.character.inventory.some((s: any) => s.itemId === "mat_herb" && s.quantity === 2), "Alice received Bob's final (edited) offer, not the original");
  assert.ok(bob.character.inventory.some((s: any) => s.itemId === "mat_herb" && s.quantity === 1), "Bob kept the herb he didn't offer");
  assert.ok(alice.ws.sent.some((m: any) => m.t === "tradeClosed" && m.reason === "completed"));
  assert.ok(!(room as any).trades.has(tradeId), "the completed trade session is cleaned up");

  room.shutdown();
});

test("a trade is auto-cancelled if a participant disconnects mid-negotiation", () => {
  const { room, alice, bob } = setup();
  (room as any).proposeTrade(alice, bob.id);
  const tradeId = bob.ws.sent.find((m: any) => m.t === "tradeRequest").tradeId;
  (room as any).respondTrade(bob, tradeId, true);
  alice.ws.sent.length = 0;

  room.removePlayer(bob.id);
  assert.ok(alice.ws.sent.some((m: any) => m.t === "tradeClosed" && m.reason === "cancelled"), "the remaining player is told the trade was cancelled");
  assert.ok(!(room as any).tradeIdByPlayer.has(alice.id), "the remaining player is freed to start a new trade");

  room.shutdown();
});
