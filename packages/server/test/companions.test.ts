import { test } from "node:test";
import assert from "node:assert/strict";
import { Room } from "../src/room.js";
import { makePlayer, makeCompanion } from "./helpers.js";

function makeRoom() {
  return new Room({ isSolo: true, onEmpty: () => {}, persist: () => {} });
}

test("enemy AI picks the companion over the player on a tied distance", () => {
  const room = makeRoom();
  const enemy = [...(room as any).enemies.values()].find((e: any) => e.defId === "moonlit_wolf" && e.zoneId === "threadhold");
  assert.ok(enemy, "a seeded moonlit_wolf exists in threadhold");

  const player = makePlayer({ id: "p1", position: enemy.spawnPos });
  const companion = makeCompanion({ ownerId: "p1", position: enemy.spawnPos });
  room.players.set(player.id, player);
  (room as any).companions.set(companion.id, companion);
  enemy.targetId = null;
  enemy.hp = enemy.maxHp;
  enemy.telegraphEndAt = null;
  enemy.attackReadyAt = 0;

  let now = 1000;
  (room as any).tickEnemy(enemy, 0.066, now);
  assert.equal(enemy.targetId, companion.id, "tied distance resolves to the companion, not the player");

  for (let i = 0; i < 10; i++) {
    now += 100;
    (room as any).tickEnemy(enemy, 0.066, now);
  }
  assert.ok(companion.hp < 100, "the companion actually takes damage from independent targeting");
  assert.equal(player.character.hp, 100, "the player is untouched while the enemy is locked onto the companion");

  room.shutdown();
});

test("enemy AI falls back to the player when no companion is in range", () => {
  const room = makeRoom();
  const enemy = [...(room as any).enemies.values()].find((e: any) => e.defId === "moonlit_wolf" && e.zoneId === "threadhold");

  const player = makePlayer({ id: "p2", position: enemy.spawnPos });
  const companion = makeCompanion({ ownerId: "p2", position: { x: enemy.spawnPos.x + 500, y: 0, z: enemy.spawnPos.z } });
  room.players.set(player.id, player);
  (room as any).companions.set(companion.id, companion);
  enemy.targetId = null;
  enemy.hp = enemy.maxHp;

  let now = 1000;
  (room as any).tickEnemy(enemy, 0.066, now);
  assert.equal(enemy.targetId, player.id, "with no companion in range, the enemy still targets the player");

  for (let i = 0; i < 10; i++) {
    now += 100;
    (room as any).tickEnemy(enemy, 0.066, now);
  }
  assert.ok(player.character.hp < 100, "the player takes real damage in the no-companion-in-range case");

  room.shutdown();
});

test("a companion's own hit pulls enemy aggro onto itself, not always the owner", () => {
  const room = makeRoom();
  const enemy = [...(room as any).enemies.values()].find((e: any) => e.defId === "moonlit_wolf" && e.zoneId === "threadhold");

  const owner = makePlayer({ id: "p3", position: { x: enemy.spawnPos.x + 50, y: 0, z: enemy.spawnPos.z } });
  const companion = makeCompanion({ ownerId: "p3", position: enemy.spawnPos });
  room.players.set(owner.id, owner);
  (room as any).companions.set(companion.id, companion);
  enemy.targetId = null;
  enemy.hp = enemy.maxHp;

  (room as any).companionAttack(companion, enemy, owner, Date.now());
  assert.equal(enemy.targetId, companion.id, "the companion's own hit pulls aggro onto itself");

  room.shutdown();
});
