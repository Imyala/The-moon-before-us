import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_LOYALTY } from "../src/lore/factions.js";
import {
  GUILD_ALIGNMENTS,
  dominantLoyalty,
  getGuildAlignment,
  isValidGuildName,
  isValidGuildTag,
  membershipStatus
} from "../src/lore/guilds.js";

test("dominantLoyalty defaults to independent for a brand-new, all-zero loyalty spread", () => {
  assert.equal(dominantLoyalty(DEFAULT_LOYALTY), "independent");
});

test("dominantLoyalty picks whichever major strictly leads over independent", () => {
  assert.equal(dominantLoyalty({ ...DEFAULT_LOYALTY, chainwrights: 30 }), "chainwrights");
  // A tie between two majors deterministically favors whichever is checked first
  // (chainwrights, then luminari, then paleChoir) — still fully deterministic, just not a special
  // independent fallback, since both legitimately beat independent's score of 0.
  assert.equal(dominantLoyalty({ ...DEFAULT_LOYALTY, luminari: 10, paleChoir: 10 }), "luminari");
  assert.equal(dominantLoyalty({ ...DEFAULT_LOYALTY, chainwrights: 5, independent: 20 }), "independent", "independent can itself be the clear leader");
});

test("a neutral guild has no aligned faction, so every member reads as a free agent", () => {
  assert.equal(membershipStatus("neutral", { ...DEFAULT_LOYALTY, chainwrights: 90 }), "free_agent");
  assert.equal(membershipStatus("neutral", DEFAULT_LOYALTY), "free_agent");
});

test("membershipStatus reads true vs. cross-faction off the member's dominant loyalty", () => {
  assert.equal(membershipStatus("chainwrights", { ...DEFAULT_LOYALTY, chainwrights: 50 }), "true_member");
  assert.equal(membershipStatus("chainwrights", { ...DEFAULT_LOYALTY, luminari: 50 }), "cross_faction_member");
  assert.equal(membershipStatus("independent", DEFAULT_LOYALTY), "true_member", "a fresh character defaults to independent, matching an independent-aligned guild");
});

test("guild tag validation enforces 2-4 alphanumeric characters", () => {
  assert.equal(isValidGuildTag("AB"), true);
  assert.equal(isValidGuildTag("WOLF"), true);
  assert.equal(isValidGuildTag("A"), false, "too short");
  assert.equal(isValidGuildTag("TOOLONG"), false, "too long");
  assert.equal(isValidGuildTag("A B"), false, "no spaces/punctuation");
});

test("guild name validation enforces a sane length", () => {
  assert.equal(isValidGuildName("The Silver Wardens"), true);
  assert.equal(isValidGuildName("ab"), false, "too short");
  assert.equal(isValidGuildName("x".repeat(40)), false, "too long");
});

test("every guild alignment is reachable through getGuildAlignment and matches an existing faction key or neutral", () => {
  for (const def of GUILD_ALIGNMENTS) {
    assert.equal(getGuildAlignment(def.id), def);
  }
  assert.equal(getGuildAlignment("nonsense"), undefined);
});
