import { test } from "node:test";
import assert from "node:assert/strict";
import { Room } from "../src/room.js";
import { makePlayer } from "./helpers.js";

/**
 * Universal romance (see docs/DESIGN_EXPANSION.md's "Universal Romance System" and
 * lore/romance.ts) at the Room level: proximity gating for flirting/gifting/repair, and — the
 * real integration point — that resolving an NPC's existing signature choice (no new dialogue
 * content) correctly drives romance state through Room.handleDialogueChoice's romance sync hook.
 */

const MIRA_POS = { x: 4, y: 0, z: 38 };
const KAEL_POS = { x: 4, y: 0, z: 46 };
const BRAN_POS = { x: 8, y: 0, z: 8 };

function makeRoom() {
  return new Room({ isSolo: true, onEmpty: () => {}, persist: () => {} });
}

test("flirting requires standing near the NPC", () => {
  const room = makeRoom();
  const far = makePlayer({ zoneId: "mourncrown", position: { x: 200, y: 0, z: 200 } });
  room.players.set(far.id, far);
  (room as any).tryFlirt(far, "mira_hollowbell", "vulnerable");
  assert.equal(far.character.romance["mira_hollowbell"], undefined, "nothing happens from out of range");

  const near = makePlayer({ zoneId: "mourncrown", position: MIRA_POS });
  room.players.set(near.id, near);
  (room as any).tryFlirt(near, "mira_hollowbell", "vulnerable");
  assert.ok(near.character.romance["mira_hollowbell"], "flirting in range creates a romance entry");
  assert.ok(near.ws.sent.some((m: any) => m.t === "npcDialogue" && m.npcId === "mira_hollowbell"), "a reaction line comes back as an npcDialogue message");

  room.shutdown();
});

test("giving a gift consumes the item from inventory and is refused for an item you don't have", () => {
  const room = makeRoom();
  const player = makePlayer({
    zoneId: "mourncrown",
    position: MIRA_POS,
    inventory: [{ itemId: "trinket_moon_pendant", quantity: 1, rarity: "rare" }]
  });
  room.players.set(player.id, player);

  (room as any).tryGiveGift(player, "mira_hollowbell", 0);
  assert.equal(player.character.inventory.length, 0, "the gifted stack is consumed");
  assert.ok(player.character.romance["mira_hollowbell"].score > 0, "the liked gift raised romance score");

  const before = player.character.romance["mira_hollowbell"];
  (room as any).tryGiveGift(player, "mira_hollowbell", 0); // inventory is now empty
  assert.equal(player.character.romance["mira_hollowbell"], before, "an empty/invalid slot changes nothing");

  room.shutdown();
});

test("resolving Bran Fieldhand's recruit choice raises romance via the same tag his companion recruitment already writes", () => {
  const room = makeRoom();
  const player = makePlayer({ zoneId: "threadhold", position: BRAN_POS });
  room.players.set(player.id, player);

  assert.equal(player.character.romance["bran_fieldhand"], undefined, "no romance entry exists before any interaction");
  (room as any).handleDialogueChoice(player, "bran_fieldhand", "recruit_bran");

  const romance = player.character.romance["bran_fieldhand"];
  assert.ok(romance, "resolving his signature choice creates a romance entry");
  assert.ok(romance.score > 0, "recruiting him is his own attraction trigger — romance score rises without ever flirting");
  assert.ok(player.character.companionIds.includes("bran_fieldhand"), "sanity: the existing recruit mechanic still works unchanged");

  room.shutdown();
});

test("resolving Warden Kael's sanctuary-betrayed choice locks romance to Betrayed, permanently", () => {
  const room = makeRoom();
  const player = makePlayer({ zoneId: "frayedge", position: KAEL_POS });
  room.players.set(player.id, player);

  // Build some goodwill first so the betrayal is a real reversal, not just a fresh negative.
  (room as any).tryFlirt(player, "warden_kael", "protective");
  assert.ok(player.character.romance["warden_kael"].score > 0);

  (room as any).handleDialogueChoice(player, "warden_kael", "betray_sanctuary");
  assert.equal(player.character.romance["warden_kael"].status, "betrayed");

  // Betrayed is sticky: even a liked flirt long after is refused outright, not just less effective.
  player.ws.sent.length = 0;
  (room as any).tryFlirt(player, "warden_kael", "protective");
  assert.equal(player.character.romance["warden_kael"].status, "betrayed", "status doesn't recover on its own");
  const line = player.ws.sent.find((m: any) => m.t === "npcDialogue")?.line;
  assert.ok(line?.includes("nothing more to do with you"), "the refusal reads as a refusal, not a normal reaction");

  room.shutdown();
});

test("re-resolving an already-answered signature choice doesn't re-trigger the romance sync", () => {
  const room = makeRoom();
  const player = makePlayer({ zoneId: "threadhold", position: BRAN_POS });
  room.players.set(player.id, player);

  (room as any).handleDialogueChoice(player, "bran_fieldhand", "recruit_bran");
  const first = player.character.romance["bran_fieldhand"];
  (room as any).handleDialogueChoice(player, "bran_fieldhand", "recruit_bran"); // already answered, per the existing resolvedTag guard
  const second = player.character.romance["bran_fieldhand"];
  assert.equal(second, first, "the signature choice is already resolved, so nothing re-fires");

  room.shutdown();
});
