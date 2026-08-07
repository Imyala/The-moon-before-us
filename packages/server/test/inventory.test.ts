import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, countItemRarity, removeItemsByIdAndRarity } from "../src/inventory.js";
import { getOrCreateCharacter } from "../src/character.js";
import { randomUUID } from "node:crypto";

test("regression: two freshly created characters do not share the same starter-item objects", () => {
  // Real bug found while live-testing player trading: STARTER_ITEMS was spread into every new
  // character's inventory without cloning each stack, so every character's starting Minor Health
  // Draughts (etc.) were literally the same objects — mutating one silently corrupted the other's.
  const alice = getOrCreateCharacter(`test-token-${randomUUID()}`, "Alice", "warden");
  const bob = getOrCreateCharacter(`test-token-${randomUUID()}`, "Bob", "warden");

  const aliceDraughts = alice.inventory.find((s) => s.itemId === "potion_minor_health")!;
  const bobDraughts = bob.inventory.find((s) => s.itemId === "potion_minor_health")!;
  assert.notEqual(aliceDraughts, bobDraughts, "the two characters' starter stacks are distinct objects");

  aliceDraughts.quantity -= 3;
  assert.equal(bobDraughts.quantity, 3, "mutating Alice's starter stack must not affect Bob's");
});

test("countItemRarity and removeItemsByIdAndRarity are rarity-specific, unlike the plain itemId helpers", () => {
  const character: any = {
    inventory: [
      { itemId: "weapon_silver_blade", quantity: 1, rarity: "common" },
      { itemId: "weapon_silver_blade", quantity: 1, rarity: "rare" }
    ]
  };

  assert.equal(countItemRarity(character, "weapon_silver_blade", "rare"), 1);
  assert.equal(countItemRarity(character, "weapon_silver_blade", "epic"), 0, "a rarity the character doesn't hold counts as zero");

  const ok = removeItemsByIdAndRarity(character, "weapon_silver_blade", "rare", 1);
  assert.equal(ok, true);
  assert.equal(character.inventory.length, 1, "only the matching-rarity stack was removed");
  assert.equal(character.inventory[0].rarity, "common", "the common stack is untouched");

  const fail = removeItemsByIdAndRarity(character, "weapon_silver_blade", "rare", 1);
  assert.equal(fail, false, "removing a rarity no longer held fails cleanly rather than touching another rarity");
});

test("addItem merges stackable items by itemId+rarity and preserves distinct rarities as separate stacks", () => {
  const character: any = { inventory: [] };
  addItem(character, "mat_iron_ore", 3, "common");
  addItem(character, "mat_iron_ore", 2, "common");
  assert.equal(character.inventory.length, 1, "same itemId+rarity merges into one stack");
  assert.equal(character.inventory[0].quantity, 5);

  addItem(character, "mat_iron_ore", 1, "rare");
  assert.equal(character.inventory.length, 2, "a different rarity of the same item is a separate stack");
});
