import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getOrCreateCharacter } from "../src/character.js";
import { addItem, equipItem } from "../src/inventory.js";

/**
 * The legendary gear tier (see docs/DESIGN_EXPANSION.md's "Expanded Gear Tiers"), at the real
 * character/inventory layer — that equipping a legendary drop actually applies its 3.2x rarity
 * multiplier through the same `computeEffectiveStats` path every other rarity already uses.
 */

test("equipping a legendary weapon replaces the starter weapon's bonus with the legendary tier's, at 3.2x its base stats", () => {
  const character = getOrCreateCharacter(`test-token-${randomUUID()}`, "Reaverbound", "warden");
  const beforePower = character.stats.power;
  const beforeVitality = character.stats.vitality;

  // A loot-table grant, same as Room.killEnemy: no explicit rarity, so it defaults to the item
  // definition's own fixed rarity (legendary) — see inventory.ts's addItem.
  addItem(character, "weapon_gravequeens_reaver", 1);
  const index = character.inventory.findIndex((s) => s.itemId === "weapon_gravequeens_reaver");
  assert.ok(index >= 0);
  assert.equal(character.inventory[index].rarity, "legendary");

  const result = equipItem(character, index);
  assert.ok(result.ok);

  // Starter weapon_warden_blade is common (power +4, mult 1); the legendary reaver is
  // power +26, vitality +6 at the 3.2x legendary multiplier.
  assert.equal(character.stats.power, beforePower - 4 * 1 + 26 * 3.2);
  assert.equal(character.stats.vitality, beforeVitality + 6 * 3.2);

  // The displaced starter weapon comes back to inventory rather than vanishing.
  assert.ok(character.inventory.some((s) => s.itemId === "weapon_warden_blade"));
});

test("a legendary weapon is refused for the wrong class, same as any other class-restricted item", () => {
  const character = getOrCreateCharacter(`test-token-${randomUUID()}`, "WrongClass", "ranger");
  addItem(character, "weapon_gravequeens_reaver", 1); // a warden-only legendary
  const index = character.inventory.findIndex((s) => s.itemId === "weapon_gravequeens_reaver");
  const result = equipItem(character, index);
  assert.equal(result.ok, false);
});
