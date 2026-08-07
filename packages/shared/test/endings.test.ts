import { test } from "node:test";
import assert from "node:assert/strict";
import { secretEndingFor, MAJOR_ENDINGS, SECRET_ENDINGS } from "../src/lore/endings.js";
import { keyFateEpilogue } from "../src/lore/epilogue.js";
import type { LoyaltyScores } from "../src/lore/factions.js";

const exalted: LoyaltyScores = { chainwrights: 80, luminari: 80, paleChoir: 80, independent: 0 };
const hunted: LoyaltyScores = { chainwrights: -80, luminari: -80, paleChoir: -80, independent: 0 };
const ordinary: LoyaltyScores = { chainwrights: 0, luminari: 0, paleChoir: 0, independent: 0 };

test("secretEndingFor: The Threadkeeper's Peace requires balance + exalted with all three factions", () => {
  assert.equal(secretEndingFor("balance", exalted, "touched")?.id, "threadkeepers_peace");
  assert.equal(secretEndingFor("bind", exalted, "touched"), undefined, "exalted loyalty alone doesn't unlock it on the wrong thread");
  assert.equal(secretEndingFor("balance", ordinary, "touched"), undefined, "ordinary loyalty never unlocks a secret ending");
});

test("secretEndingFor: The Unmaking requires sever + hollowed + hunted by all three factions", () => {
  assert.equal(secretEndingFor("sever", hunted, "hollowed")?.id, "the_unmaking");
  assert.equal(secretEndingFor("sever", hunted, "touched"), undefined, "hunted loyalty alone doesn't unlock it without the Hollowed stage");
});

test("secret endings are excluded from the normal major-ending table, so trendingEnding can never preview them", () => {
  for (const secret of SECRET_ENDINGS) {
    assert.ok(!MAJOR_ENDINGS.some((e) => e.id === secret.id), `${secret.id} must not appear in MAJOR_ENDINGS`);
    assert.equal(secret.secret, true);
  }
});

test("keyFateEpilogue reads back only the tags actually present, worded correctly", () => {
  assert.deepEqual(keyFateEpilogue({}), [], "no lines for a character with no key-fate tags");

  const memory = {
    thane_corvin: { met: true, tags: ["corvin_hall_choice", "corvin_hall_defended"] },
    warden_kael: { met: true, tags: ["kael_raid_choice", "kael_sanctuary_evacuated"] }
  };
  const lines = keyFateEpilogue(memory);
  assert.equal(lines.length, 2);
  assert.ok(lines.some((l) => l.includes("Thane Corvin's hall stands empty")));
  assert.ok(lines.some((l) => l.includes("scattered through Frayedge's tunnels")));
});
