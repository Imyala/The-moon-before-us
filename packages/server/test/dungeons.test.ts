import { test } from "node:test";
import assert from "node:assert/strict";
import { Room } from "../src/room.js";
import { makePlayer } from "./helpers.js";

/**
 * Covers both dungeons (see docs/GDD.md's "Dungeons" section): the level-gated entrance denial/
 * admission every dungeon travel point relies on, and the long boss-respawn lockout that makes a
 * dungeon boss a real lockout instead of a re-farmable hard fight.
 */

function makeRoom() {
  return new Room({ isSolo: true, onEmpty: () => {}, persist: () => {} });
}

test("the Hollow Vault's entrance denies below level 6 and admits at level 6", () => {
  const room = makeRoom();
  const now = Date.now();

  const tooLow = makePlayer({ id: "low", zoneId: "ashmire", level: 5, position: { x: -30, y: 0, z: -26 } });
  room.players.set(tooLow.id, tooLow);
  (room as any).tryTravel(tooLow, now);
  assert.equal(tooLow.character.zoneId, "ashmire", "below the level gate, travel is denied");
  assert.ok(tooLow.ws.sent.some((m: any) => m.t === "error" && m.message.includes("requires level 6")), "the player is told why");

  const highEnough = makePlayer({ id: "high", zoneId: "ashmire", level: 6, position: { x: -30, y: 0, z: -26 } });
  room.players.set(highEnough.id, highEnough);
  (room as any).tryTravel(highEnough, now);
  assert.equal(highEnough.character.zoneId, "hollow_vault", "at the level gate, travel succeeds");

  room.shutdown();
});

test("the Drowned City's entrance denies below level 12 and admits at level 12", () => {
  const room = makeRoom();
  const now = Date.now();

  const tooLow = makePlayer({ id: "low", zoneId: "sunken_llyr", level: 11, position: { x: -34, y: 0, z: 34 } });
  room.players.set(tooLow.id, tooLow);
  (room as any).tryTravel(tooLow, now);
  assert.equal(tooLow.character.zoneId, "sunken_llyr", "below the level gate, travel is denied");
  assert.ok(tooLow.ws.sent.some((m: any) => m.t === "error" && m.message.includes("requires level 12")), "the player is told why");

  const highEnough = makePlayer({ id: "high", zoneId: "sunken_llyr", level: 12, position: { x: -34, y: 0, z: 34 } });
  room.players.set(highEnough.id, highEnough);
  (room as any).tryTravel(highEnough, now);
  assert.equal(highEnough.character.zoneId, "drowned_city", "at the level gate, travel succeeds");

  room.shutdown();
});

test("the Sundered Cairn's entrance denies below level 16 and admits at level 16", () => {
  const room = makeRoom();
  const now = Date.now();

  const tooLow = makePlayer({ id: "low", zoneId: "mourncrown", level: 15, position: { x: -40, y: 0, z: 20 } });
  room.players.set(tooLow.id, tooLow);
  (room as any).tryTravel(tooLow, now);
  assert.equal(tooLow.character.zoneId, "mourncrown", "below the level gate, travel is denied");
  assert.ok(tooLow.ws.sent.some((m: any) => m.t === "error" && m.message.includes("requires level 16")), "the player is told why");

  const highEnough = makePlayer({ id: "high", zoneId: "mourncrown", level: 16, position: { x: -40, y: 0, z: 20 } });
  room.players.set(highEnough.id, highEnough);
  (room as any).tryTravel(highEnough, now);
  assert.equal(highEnough.character.zoneId, "sundered_cairn", "at the level gate, travel succeeds");

  room.shutdown();
});

test("killing the Vault Warden sets a 10-minute respawn lockout, not the standard 20-second timer", () => {
  const room = makeRoom();
  const now = Date.now();
  const attacker = makePlayer({ id: "attacker", zoneId: "hollow_vault" });
  room.players.set(attacker.id, attacker);

  const boss = [...(room as any).enemies.values()].find((e: any) => e.defId === "vault_warden");
  assert.ok(boss, "the Vault Warden is seeded into the Hollow Vault");
  (room as any).damageEnemy(boss, 99999, attacker, now);

  assert.ok(boss.respawnAt! >= now + 599000 && boss.respawnAt! <= now + 601000, "respawn is locked out for ~10 minutes");

  // 23 seconds later — well past the normal 20-second window every other enemy uses — it's still dead.
  (room as any).tickEnemy(boss, 0.016, now + 23000);
  assert.equal(boss.state, "dead", "the boss has not respawned within the normal window");

  room.shutdown();
});

test("killing the Sleeping Selenian sets the same 10-minute respawn lockout", () => {
  const room = makeRoom();
  const now = Date.now();
  const attacker = makePlayer({ id: "attacker", zoneId: "drowned_city" });
  room.players.set(attacker.id, attacker);

  const boss = [...(room as any).enemies.values()].find((e: any) => e.defId === "sleeping_selenian");
  assert.ok(boss, "the Sleeping Selenian is seeded into the Drowned City");
  (room as any).damageEnemy(boss, 99999, attacker, now);

  assert.ok(boss.respawnAt! >= now + 599000 && boss.respawnAt! <= now + 601000, "respawn is locked out for ~10 minutes");

  (room as any).tickEnemy(boss, 0.016, now + 23000);
  assert.equal(boss.state, "dead", "the boss has not respawned within the normal window");

  room.shutdown();
});

test("killing the Unburied Queen sets the same 10-minute respawn lockout", () => {
  const room = makeRoom();
  const now = Date.now();
  const attacker = makePlayer({ id: "attacker", zoneId: "sundered_cairn" });
  room.players.set(attacker.id, attacker);

  const boss = [...(room as any).enemies.values()].find((e: any) => e.defId === "unburied_queen");
  assert.ok(boss, "the Unburied Queen is seeded into the Sundered Cairn");
  (room as any).damageEnemy(boss, 99999, attacker, now);

  assert.ok(boss.respawnAt! >= now + 599000 && boss.respawnAt! <= now + 601000, "respawn is locked out for ~10 minutes");

  (room as any).tickEnemy(boss, 0.016, now + 23000);
  assert.equal(boss.state, "dead", "the boss has not respawned within the normal window");

  room.shutdown();
});

test("an ordinary dungeon trash mob still respawns on the standard 20-second timer", () => {
  const room = makeRoom();
  const now = Date.now();
  const attacker = makePlayer({ id: "attacker", zoneId: "drowned_city" });
  room.players.set(attacker.id, attacker);

  const trash = [...(room as any).enemies.values()].find((e: any) => e.zoneId === "drowned_city" && e.defId === "husk");
  assert.ok(trash, "the Drowned City has ordinary trash mobs");
  (room as any).damageEnemy(trash, 99999, attacker, now);

  assert.ok(trash.respawnAt! >= now + 19000 && trash.respawnAt! <= now + 21000, "an ordinary mob keeps the standard ~20s respawn");

  room.shutdown();
});
