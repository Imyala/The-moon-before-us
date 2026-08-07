import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyFlirt,
  applyGift,
  attemptRepair,
  FLIRT_COOLDOWN_MS,
  getRomanceDef,
  romanceFor,
  syncRomanceWithMemory,
  ROMANCES,
  type RomanceState
} from "../src/lore/romance.js";

const mira = getRomanceDef("mira_hollowbell")!;
const kael = getRomanceDef("warden_kael")!;
// Comfortably larger than FLIRT_COOLDOWN_MS so a "first flirt ever" at T0 never collides with the
// cooldown check against the default lastFlirtAt of 0 (real Date.now() values never do either).
const T0 = 10_000_000;

test("romanceFor returns a fresh indifferent default for an NPC with no prior interaction", () => {
  const state = romanceFor({}, "mira_hollowbell");
  assert.equal(state.status, "indifferent");
  assert.equal(state.score, 0);
  assert.deepEqual(state.metrics, { attraction: 0, respect: 0, vulnerability: 0, fear: 0, hope: 0 });
});

test("a liked flirt raises score and status; a disliked flirt does the opposite", () => {
  const base = romanceFor({}, "mira_hollowbell");
  const liked = applyFlirt(base, mira, "vulnerable", T0);
  assert.ok(liked.ok);
  assert.ok(liked.state.score > base.score, "a liked flirt type raises the romance score");
  assert.ok(liked.state.metrics.vulnerability > 0);

  const disliked = applyFlirt(base, mira, "dark", T0);
  assert.equal(disliked.ok, false);
  assert.ok(disliked.state.score < base.score, "a disliked flirt type lowers the romance score");
});

test("flirting too soon after the last flirt backfires regardless of flirt type", () => {
  const base = romanceFor({}, "mira_hollowbell");
  const first = applyFlirt(base, mira, "vulnerable", T0);
  assert.ok(first.ok);
  const tooSoon = applyFlirt(first.state, mira, "vulnerable", T0 + FLIRT_COOLDOWN_MS / 2);
  assert.equal(tooSoon.ok, false, "flirting again inside the cooldown window fails even with a liked flirt type");
  assert.ok(tooSoon.state.score < first.state.score);

  const afterCooldown = applyFlirt(first.state, mira, "vulnerable", T0 + FLIRT_COOLDOWN_MS + 1);
  assert.ok(afterCooldown.ok, "the same flirt type succeeds again once the cooldown has elapsed");
});

test("status advances through the score thresholds as romance score climbs", () => {
  let state: RomanceState = romanceFor({}, "mira_hollowbell");
  let now = T0;
  const statuses: string[] = [state.status];
  for (let i = 0; i < 12; i++) {
    now += FLIRT_COOLDOWN_MS + 1;
    const result = applyFlirt(state, mira, "vulnerable", now);
    state = result.state;
    statuses.push(state.status);
  }
  assert.ok(statuses.includes("curious") || statuses.includes("interested"), "status advances past indifferent as score rises");
  assert.equal(state.score, 100, "score is clamped at the upper bound");
});

test("giving a liked gift helps more than an unmatched one, and both remain gated once lost/betrayed", () => {
  const base = romanceFor({}, "mira_hollowbell");
  const likedGift = applyGift(base, mira, "trinket_moon_pendant");
  const randomGift = applyGift(base, mira, "mat_wood");
  assert.ok(likedGift.state.score > randomGift.state.score, "a matched gift lands better than a mismatched one");

  const betrayed: RomanceState = { ...base, status: "betrayed" };
  const refused = applyGift(betrayed, mira, "trinket_moon_pendant");
  assert.equal(refused.ok, false);
  assert.equal(refused.state.score, betrayed.score, "a betrayed NPC's romance state doesn't change from a gift attempt");
});

test("syncRomanceWithMemory applies a one-time attraction boost for an attractedByTags tag, exactly once", () => {
  const base = romanceFor({}, "mira_hollowbell");
  const once = syncRomanceWithMemory(base, mira, ["mira_village_choice", "mira_child_saved"]);
  assert.ok(once.score > base.score, "the attraction tag raises the score");
  assert.ok(once.appliedTags.includes("mira_child_saved"));

  const appliedAgain = syncRomanceWithMemory(once, mira, ["mira_village_choice", "mira_child_saved"]);
  assert.equal(appliedAgain.score, once.score, "re-scanning the same tags doesn't re-apply the bonus");
});

test("syncRomanceWithMemory forces Estranged for an estrangedByTags tag, capping the score", () => {
  const base = applyFlirt(romanceFor({}, "mira_hollowbell"), mira, "vulnerable", T0).state;
  const estranged = syncRomanceWithMemory(base, mira, ["mira_self_saved"]);
  assert.equal(estranged.status, "estranged");
  assert.ok(estranged.score <= 25);
});

test("syncRomanceWithMemory forces Betrayed for a betrayedByTags tag, and it's sticky against further positive deltas", () => {
  const base = romanceFor({}, "warden_kael");
  const betrayed = syncRomanceWithMemory(base, kael, ["kael_raid_choice", "kael_sanctuary_betrayed"]);
  assert.equal(betrayed.status, "betrayed");

  // A subsequent liked flirt still isn't enough to undo a sticky negative status.
  const stillBetrayed = applyFlirt(betrayed, kael, "protective", T0 + FLIRT_COOLDOWN_MS * 5);
  assert.equal(stillBetrayed.ok, false, "flirting with a Betrayed NPC is refused outright");
  assert.equal(stillBetrayed.state.status, "betrayed", "status stays Betrayed regardless of score");
});

test("attemptRepair only does anything while Estranged, and only succeeds once the score clears the Courtship threshold", () => {
  const notEstranged = romanceFor({}, "mira_hollowbell");
  const noop = attemptRepair(notEstranged, 50);
  assert.equal(noop.ok, false);
  assert.equal(noop.state.score, notEstranged.score);

  const estranged: RomanceState = { ...notEstranged, status: "estranged", score: 10 };
  const insufficient = attemptRepair(estranged, 5);
  assert.equal(insufficient.ok, false, "a small repair gain isn't enough to clear estrangement");
  assert.equal(insufficient.state.status, "estranged");

  const sufficient = attemptRepair(estranged, 40);
  assert.equal(sufficient.ok, true);
  assert.equal(sufficient.state.status, "courtship", "clearing the threshold returns to Courtship");
});

test("every defined romance has a distinct npcId and non-empty gift preferences", () => {
  const ids = new Set(ROMANCES.map((r) => r.npcId));
  assert.equal(ids.size, ROMANCES.length, "no duplicate romance npcIds");
  for (const def of ROMANCES) {
    assert.ok(def.likedItemIds.length > 0, `${def.npcId} should have at least one liked gift`);
  }
});
