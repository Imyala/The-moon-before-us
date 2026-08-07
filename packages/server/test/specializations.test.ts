import { test } from "node:test";
import assert from "node:assert/strict";
import { Room } from "../src/room.js";
import { makePlayer } from "./helpers.js";

function makeRoom() {
  return new Room({ isSolo: true, onEmpty: () => {}, persist: () => {} });
}

function makeEnemy(room: Room, hp: number) {
  const id = [...(room as any).enemies.keys()][0];
  const e = (room as any).enemies.get(id);
  e.hp = hp;
  e.maxHp = hp;
  e.zoneId = "threadhold";
  e.position = { x: 0, y: 0, z: 0 };
  e.deadAt = null;
  return e;
}

test("Warden Sentinel: builds Ward stacks from taking hits, reduces damage, and Ironclad Stand spends them on a shield", () => {
  const room = makeRoom();
  const warden = makePlayer({ id: "sentinel", classId: "warden", weaponItemId: "weapon_warden_blade", specializationId: "warden_sentinel" });
  room.players.set(warden.id, warden);
  const now = 1000;

  (room as any).damagePlayer(warden, 40, now);
  assert.equal(warden.specStacks, 1, "a hit builds a Ward stack");
  (room as any).damagePlayer(warden, 40, now + 100);
  assert.equal(warden.specStacks, 2, "a second hit builds a second stack");

  warden.character.hp = 100;
  warden.specStacks = 5;
  warden.specStacksUntil = now + 10000;
  (room as any).damagePlayer(warden, 100, now + 200);
  const taken = 100 - warden.character.hp;
  assert.ok(taken >= 84 && taken <= 86, `5 Ward stacks reduce a 100-damage hit to ~85 (got ${taken})`);

  warden.specStacks = 3;
  warden.specStacksUntil = now + 10000;
  warden.shield = 0;
  (room as any).tryUseAbility(warden, "warden_ironcladstand", undefined, undefined, now + 300);
  assert.equal(warden.shield, 20 + 15 * 3, "Ironclad Stand shields for 20+15*stacks");
  assert.equal(warden.specStacks, 0, "Ironclad Stand consumes all Ward stacks");

  room.shutdown();
});

test("Ranger Windwalker: builds Windrush stacks from weapon hits, shortens cooldowns, and Tempest Volley spends them on bonus damage", () => {
  const room = makeRoom();
  const ranger = makePlayer({ id: "windwalker", classId: "ranger", weaponItemId: "weapon_ranger_bow", specializationId: "ranger_windwalker" });
  room.players.set(ranger.id, ranger);
  const enemy = makeEnemy(room, 500);
  const now = 1000;

  (room as any).tryUseAbility(ranger, "ranger_quickshot", undefined, enemy.id, now);
  assert.equal(ranger.specStacks, 1, "a weapon-ability hit builds a Windrush stack");

  ranger.specStacks = 5;
  ranger.specStacksUntil = now + 10000;
  ranger.cooldowns.clear();
  (room as any).tryUseAbility(ranger, "ranger_quickshot", undefined, enemy.id, now + 50);
  const cdApplied = ranger.cooldowns.get("ranger_quickshot") - (now + 50);
  assert.ok(cdApplied < 700, `5 Windrush stacks measurably shorten the cooldown (got ${cdApplied}ms of 700ms base)`);

  ranger.cooldowns.clear();
  ranger.specStacks = 4;
  ranger.specStacksUntil = now + 10000;
  const enemy2 = makeEnemy(room, 1000);
  const before = enemy2.hp;
  (room as any).tryUseAbility(ranger, "ranger_tempestvolley", undefined, enemy2.id, now + 100);
  assert.ok(before - enemy2.hp > 0, "Tempest Volley deals real damage");
  assert.equal(ranger.specStacks, 0, "Tempest Volley consumes all Windrush stacks");

  room.shutdown();
});

test("Mystic Wardweaver: builds Aegis stacks from casting heals, reduces own damage taken, and Aegis Pulse shields nearby allies too", () => {
  const room = makeRoom();
  const mystic = makePlayer({ id: "wardweaver", classId: "mystic", weaponItemId: "weapon_mystic_focus", specializationId: "mystic_wardweaver" });
  room.players.set(mystic.id, mystic);
  const now = 1000;

  (room as any).tryUseAbility(mystic, "mystic_healingtide", undefined, undefined, now);
  (room as any).tickPlayer(mystic, 0.066, now + 500); // resolve the cast
  assert.equal(mystic.specStacks, 1, "casting a heal builds an Aegis stack");

  mystic.specStacks = 5;
  mystic.specStacksUntil = now + 10000;
  mystic.character.hp = 100;
  (room as any).damagePlayer(mystic, 100, now + 1000);
  const taken = 100 - mystic.character.hp;
  assert.ok(taken >= 89 && taken <= 91, `5 Aegis stacks reduce a 100-damage hit to ~90 (got ${taken})`);

  const ally = makePlayer({ id: "ally", classId: "warden", position: { x: 1, y: 0, z: 0 } });
  room.players.set(ally.id, ally);
  mystic.character.hp = 100;
  mystic.specStacks = 4;
  mystic.specStacksUntil = now + 10000;
  mystic.cooldowns.clear();
  (room as any).tryUseAbility(mystic, "mystic_aegispulse", undefined, undefined, now + 1500);
  (room as any).tickPlayer(mystic, 0.066, now + 1900); // resolve the 300ms cast
  assert.ok(mystic.shield >= 15 + 10 * 4, `Aegis Pulse shields the caster (got ${mystic.shield})`);
  assert.ok(ally.shield >= 15 + 10 * 4, `Aegis Pulse also shields a nearby ally (got ${ally.shield})`);

  room.shutdown();
});

test("Duskblade Ashwalker: builds Ashfeed stacks from weapon hits, drives the generic lifesteal check, and Cinder Reap spends them on a self-heal", () => {
  const room = makeRoom();
  const dusk = makePlayer({ id: "ashwalker", classId: "duskblade", weaponItemId: "weapon_duskblade_daggers", specializationId: "duskblade_ashwalker" });
  room.players.set(dusk.id, dusk);
  const enemy = makeEnemy(room, 500);
  const now = 1000;

  (room as any).tryUseAbility(dusk, "duskblade_twinstrike", undefined, enemy.id, now);
  assert.equal(dusk.specStacks, 1, "a weapon-ability hit builds an Ashfeed stack");
  assert.ok(Math.abs(dusk.lifestealPct - dusk.specStacks * 0.02) < 1e-9, "the stack sets lifestealPct to stacks*2%, read by the existing generic lifesteal check");

  dusk.character.hp = 10;
  dusk.specStacks = 5;
  dusk.specStacksUntil = now + 10000;
  const enemy2 = makeEnemy(room, 1000);
  dusk.cooldowns.clear();
  const hpBefore = dusk.character.hp;
  (room as any).tryUseAbility(dusk, "duskblade_cinderreap", undefined, enemy2.id, now + 100);
  const healed = dusk.character.hp - hpBefore;
  assert.ok(healed >= 15 * 5 - 1, `Cinder Reap heals ~15*stacks or more with lifesteal on top (got ${healed})`);
  assert.equal(dusk.specStacks, 0, "Cinder Reap consumes all Ashfeed stacks");

  room.shutdown();
});
