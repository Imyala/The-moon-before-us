import { test } from "node:test";
import assert from "node:assert/strict";
import { Room } from "../src/room.js";
import { makePlayer } from "./helpers.js";

/**
 * Vendors & currency (see docs/GDD.md's "Vendors & currency" section): the first piece of a
 * shared economy beyond direct player-to-player trading. Covers buying off a vendor's own curated
 * catalog, selling anything at its formulaic value, proximity gating, and the per-kill gold bounty
 * that actually funds it.
 */

function makeRoomWithPlayer(opts: Parameters<typeof makePlayer>[0] = {}) {
  const room = new Room({ isSolo: true, onEmpty: () => {}, persist: () => {} });
  const player = makePlayer({ zoneId: "threadhold", position: { x: 6, y: 0, z: 10 }, ...opts });
  room.players.set(player.id, player);
  return { room, player };
}

test("buying an item on a vendor's catalog spends gold and grants the item", () => {
  const { room, player } = makeRoomWithPlayer({ gold: 100 });
  (room as any).tryBuyItem(player, "wares_keeper_tomlin", "potion_minor_health", 2);

  assert.equal(player.character.gold, 100 - 8 * 2, "gold is spent at the listed price");
  const stack = player.character.inventory.find((s: any) => s.itemId === "potion_minor_health");
  assert.equal(stack?.quantity, 2, "the bought quantity lands in inventory");

  room.shutdown();
});

test("buying fails cleanly when the player can't afford it, and nothing is spent or granted", () => {
  const { room, player } = makeRoomWithPlayer({ gold: 5 });
  (room as any).tryBuyItem(player, "wares_keeper_tomlin", "potion_minor_health", 1);

  assert.equal(player.character.gold, 5, "gold is untouched");
  assert.equal(player.character.inventory.length, 0, "nothing was granted");
  assert.ok(player.ws.sent.some((m: any) => m.t === "error" && m.message.includes("gold")), "the player is told why");

  room.shutdown();
});

test("buying an item outside a vendor's catalog is refused", () => {
  const { room, player } = makeRoomWithPlayer({ gold: 1000 });
  // Tomlin (Threadhold) doesn't stock Starlight Essence — that's Denna's (Spirechain).
  (room as any).tryBuyItem(player, "wares_keeper_tomlin", "mat_starlight_essence", 1);

  assert.equal(player.character.gold, 1000, "gold is untouched");
  assert.equal(player.character.inventory.length, 0, "nothing was granted");

  room.shutdown();
});

test("buying while out of range does nothing at all", () => {
  const { room, player } = makeRoomWithPlayer({ gold: 100, position: { x: 40, y: 0, z: 40 } });
  (room as any).tryBuyItem(player, "wares_keeper_tomlin", "potion_minor_health", 1);

  assert.equal(player.character.gold, 100, "far from the vendor, nothing happens");
  assert.equal(player.character.inventory.length, 0);

  room.shutdown();
});

test("selling an inventory stack credits gold at its rarity-scaled value and removes it", () => {
  const { room, player } = makeRoomWithPlayer({
    gold: 0,
    inventory: [{ itemId: "weapon_silver_blade", quantity: 1, rarity: "rare" }]
  });
  (room as any).trySellItem(player, "wares_keeper_tomlin", "weapon_silver_blade", "rare", 1);

  // sellValue: weapon base 12 * RARITY_MULTIPLIER.rare (1.8) = 21.6 -> rounds to 22.
  assert.equal(player.character.gold, 22, "gold is credited at the item's rarity-scaled sell value");
  assert.equal(player.character.inventory.length, 0, "the sold stack is gone");

  room.shutdown();
});

test("selling more than you hold is refused, and any vendor (not just its own stock) will buy", () => {
  const { room, player } = makeRoomWithPlayer({
    gold: 0,
    inventory: [{ itemId: "mat_iron_ore", quantity: 2, rarity: "common" }]
  });
  (room as any).trySellItem(player, "wares_keeper_tomlin", "mat_iron_ore", "common", 5);
  assert.equal(player.character.gold, 0, "an oversized sell is refused cleanly");
  assert.equal(player.character.inventory[0].quantity, 2, "the stack is untouched");

  // Tomlin doesn't sell Iron Ore (that's Hesk's, in Ashmire) but will still buy it from a player.
  (room as any).trySellItem(player, "wares_keeper_tomlin", "mat_iron_ore", "common", 2);
  assert.ok(player.character.gold > 0, "selling succeeds even for an item this vendor doesn't stock");
  assert.equal(player.character.inventory.length, 0);

  room.shutdown();
});

test("equipped gear can't be accidentally sold — only the inventory stack is touched", () => {
  const { room, player } = makeRoomWithPlayer({ gold: 0 });
  const equippedRarity = player.character.equipment.weapon.rarity;
  const equippedItemId = player.character.equipment.weapon.itemId;
  (room as any).trySellItem(player, "wares_keeper_tomlin", equippedItemId, equippedRarity, 1);

  assert.equal(player.character.gold, 0, "nothing was sold — the weapon is equipped, not in inventory");
  assert.ok(player.character.equipment.weapon, "the equipped weapon is untouched");

  room.shutdown();
});

test("killing an enemy grants a gold bounty scaled off its xpReward, alongside XP", () => {
  const { room, player } = makeRoomWithPlayer({ zoneId: "threadhold", gold: 0 });
  const now = Date.now();
  const enemy = [...(room as any).enemies.values()].find((e: any) => e.zoneId === "threadhold" && e.defId === "moonlit_wolf");
  assert.ok(enemy, "Threadhold has moonlit wolves");

  (room as any).damageEnemy(enemy, 99999, player, now);

  // moonlit_wolf xpReward is 14; GOLD_PER_XP is 1/8 -> round(14/8) = 2.
  assert.equal(player.character.gold, 2, "the kill pays a gold bounty derived from xpReward");
  assert.ok(player.ws.sent.some((m: any) => m.t === "characterUpdate" && m.character.gold === 2), "the client is told about the new gold total");

  room.shutdown();
});
