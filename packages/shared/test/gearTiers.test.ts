import { test } from "node:test";
import assert from "node:assert/strict";
import { RARITY_MULTIPLIER, type ItemRarity } from "../src/types.js";
import { ITEMS, getItem, sellValue } from "../src/items.js";
import { getEnemy } from "../src/enemies.js";

/**
 * The legendary gear tier (see docs/DESIGN_EXPANSION.md's "Expanded Gear Tiers" and
 * docs/GDD.md's "Gear tiers" section) — the first shipped piece of that much larger combat and
 * progression expansion. Covers the new rarity multiplier's place in the existing ladder, the
 * four legendary weapons themselves, and the Unburied Queen's loot table carrying them.
 */

const RARITY_ORDER: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

test("RARITY_MULTIPLIER increases monotonically across all five tiers, legendary highest", () => {
  for (let i = 1; i < RARITY_ORDER.length; i++) {
    assert.ok(
      RARITY_MULTIPLIER[RARITY_ORDER[i]] > RARITY_MULTIPLIER[RARITY_ORDER[i - 1]],
      `${RARITY_ORDER[i]} should multiply more than ${RARITY_ORDER[i - 1]}`
    );
  }
  assert.equal(RARITY_MULTIPLIER.legendary, 3.2);
});

test("every legendary item is a weapon, one per class, each on that class's second weapon kit", () => {
  const legendaries = ITEMS.filter((i) => i.rarity === "legendary");
  assert.equal(legendaries.length, 4, "exactly one legendary per existing class");

  const classIds = legendaries.map((i) => i.classId);
  assert.deepEqual(new Set(classIds).size, 4, "no two legendaries share a class");
  for (const item of legendaries) {
    assert.equal(item.kind, "weapon");
    assert.equal(item.slot, "weapon");
    assert.ok(item.weaponType, "a legendary weapon must specify a weaponType to be equippable");
    assert.ok(item.statBonus && Object.keys(item.statBonus).length > 0, `${item.id} should carry a real stat bonus`);
  }
});

test("a legendary item sells for more than the same-kind epic it supersedes, at their own fixed rarities", () => {
  const legendaryReaver = getItem("weapon_gravequeens_reaver")!;
  const epicTideblade = getItem("weapon_selenian_tideblade")!;
  assert.ok(
    sellValue(legendaryReaver, "legendary") > sellValue(epicTideblade, "epic"),
    "the legendary tier multiplier should make even a same-kind item sell for more"
  );
});

test("the Unburied Queen — the toughest existing boss — is the only source of legendary drops, at a rare chance", () => {
  const queen = getEnemy("unburied_queen")!;
  const legendaryDrops = queen.loot.filter((entry) => getItem(entry.itemId)?.rarity === "legendary");
  assert.equal(legendaryDrops.length, 4, "all four legendary weapons drop from the Unburied Queen");
  for (const drop of legendaryDrops) {
    assert.ok(drop.chance > 0 && drop.chance <= 0.05, "legendary drops should be rarer than the 5%-chance epics elsewhere");
  }

  const otherBosses = ["vault_warden", "sleeping_selenian"];
  for (const bossId of otherBosses) {
    const boss = getEnemy(bossId)!;
    assert.ok(
      boss.loot.every((entry) => getItem(entry.itemId)?.rarity !== "legendary"),
      `${bossId} shouldn't drop anything legendary yet`
    );
  }
});
