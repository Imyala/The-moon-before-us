import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { CLASSES, getRace, RACES } from "@moon/shared";
import { computeEffectiveStats, getOrCreateCharacter, resolveRaceId } from "../src/character.js";
import { loadCharacter, saveCharacter } from "../src/db.js";

/**
 * Races (see docs/DESIGN_EXPANSION.md's "Races of Aethon, Selen, and the Void" and
 * docs/GDD.md's Design Expansion status table) — the first shipped piece of that expansion.
 * Covers the fallback for a missing/unrecognized raceId, that the racial passive actually lands
 * in computed stats, and that it round-trips through the database (including for characters
 * saved before races existed).
 */

test("resolveRaceId falls back to vaelari for missing or unrecognized input", () => {
  assert.equal(resolveRaceId(undefined), "vaelari");
  assert.equal(resolveRaceId(""), "vaelari");
  assert.equal(resolveRaceId("not_a_real_race"), "vaelari");
  assert.equal(resolveRaceId("khurruk"), "khurruk", "a real race id passes through unchanged");
});

test("a new character's stats include their racial passive from the very first snapshot", () => {
  const character = getOrCreateCharacter(`test-token-${randomUUID()}`, "Grondar", "warden", "khurruk");
  assert.equal(character.raceId, "khurruk");

  const khurruk = getRace("khurruk")!;
  const baseVitality = CLASSES.warden.baseStats.vitality;
  assert.equal(
    character.stats.vitality,
    baseVitality + (khurruk.passive.vitality ?? 0),
    "the racial passive is already reflected in character.stats at creation, on top of the class base"
  );
});

test("an unrecognized raceId at character creation falls back to vaelari rather than being rejected", () => {
  const character = getOrCreateCharacter(`test-token-${randomUUID()}`, "Nameless", "ranger", "not_a_real_race");
  assert.equal(character.raceId, "vaelari");
});

test("two identically classed and equipped characters differ in power by exactly their racial passives' difference", () => {
  const boundChar = getOrCreateCharacter(`test-token-${randomUUID()}`, "Ashka", "mystic", "the_bound");
  const vaelariChar = getOrCreateCharacter(`test-token-${randomUUID()}`, "Mira", "mystic", "vaelari");

  const theBound = getRace("the_bound")!;
  const vaelari = getRace("vaelari")!;
  const expectedDelta = (theBound.passive.power ?? 0) - (vaelari.passive.power ?? 0);

  assert.equal(
    Math.round((boundChar.stats.power - vaelariChar.stats.power) * 1000),
    Math.round(expectedDelta * 1000),
    "same class, same starting equipment — the only power difference is the racial passive"
  );

  // computeEffectiveStats is idempotent: recomputing from the already-stored character reproduces
  // the same stats rather than double-applying the passive.
  const recomputed = computeEffectiveStats(boundChar);
  assert.equal(recomputed.power, boundChar.stats.power, "recomputing doesn't drift or double-apply the racial passive");
});

test("raceId round-trips through the database, including for characters saved before races existed", () => {
  const token = `test-token-${randomUUID()}`;
  const character = getOrCreateCharacter(token, "Sela", "duskblade", "lyranni");
  const loaded = loadCharacter(token);
  assert.equal(loaded?.raceId, "lyranni", "raceId survives a save/load round trip");

  // Simulate a pre-race save by writing a row with no raceId at all.
  const legacyToken = `test-token-${randomUUID()}`;
  const legacyCharacter = { ...character, id: randomUUID() } as any;
  delete legacyCharacter.raceId;
  saveCharacter(legacyToken, legacyCharacter);
  const legacyLoaded = loadCharacter(legacyToken);
  assert.equal(legacyLoaded?.raceId, "vaelari", "a character saved without a raceId column value defaults to vaelari on load");
});

test("every defined race has a distinct id and a non-empty passive", () => {
  const ids = new Set(RACES.map((r) => r.id));
  assert.equal(ids.size, RACES.length, "no duplicate race ids");
  for (const race of RACES) {
    assert.ok(Object.keys(race.passive).length > 0, `${race.id} should have a non-empty passive`);
  }
});
