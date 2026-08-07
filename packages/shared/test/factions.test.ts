import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_LOYALTY, FACTIONS, factionAccentColor } from "../src/lore/factions.js";

/**
 * factionAccentColor (see docs/DESIGN_EXPANSION.md's "Visual Identity & World Feel" bible, §6.5
 * "Faction UI Variants") — the first shipped piece of that visual-design document: a single
 * accent color reflecting where a character's loyalties currently lean, reusing the exact same
 * FactionDef.color values the Fate/relationship UI already draws from.
 */

test("a fresh, unaligned character gets the neutral independent accent, not any faction's color", () => {
  assert.equal(factionAccentColor(DEFAULT_LOYALTY), "#9aa3c9");
});

test("a character whose loyalty clearly leans toward a major faction gets that faction's own color", () => {
  assert.equal(factionAccentColor({ ...DEFAULT_LOYALTY, chainwrights: 60 }), FACTIONS.chainwrights.color);
  assert.equal(factionAccentColor({ ...DEFAULT_LOYALTY, luminari: 45 }), FACTIONS.luminari.color);
  assert.equal(factionAccentColor({ ...DEFAULT_LOYALTY, paleChoir: 30 }), FACTIONS.paleChoir.color);
});

test("an independent-leaning character still gets the neutral accent even with nonzero scores", () => {
  assert.equal(factionAccentColor({ ...DEFAULT_LOYALTY, chainwrights: 5, independent: 20 }), "#9aa3c9");
});
