import { test } from "node:test";
import assert from "node:assert/strict";
import { Room } from "../src/room.js";
import { WORLD_EVENT_ZONE_IDS, WORLD_EVENT_COOLDOWN_MS } from "../src/world.js";
import { makePlayer } from "./helpers.js";

function makeRoomWithPlayer() {
  const room = new Room({ isSolo: true, onEmpty: () => {}, persist: () => {} });
  const player = makePlayer({ id: "watcher" });
  room.players.set(player.id, player);
  return { room, player };
}

test("startWorldEvent spawns exactly one flagged enemy in an eligible zone and announces it", () => {
  const { room, player } = makeRoomWithPlayer();
  let now = Date.now();

  (room as any).tickWorldEvent(now);
  assert.equal([...(room as any).enemies.values()].filter((e: any) => e.isWorldEvent).length, 0, "no spawn before the initial delay elapses");

  (room as any).startWorldEvent(now);
  const spawned = [...(room as any).enemies.values()].filter((e: any) => e.isWorldEvent);
  assert.equal(spawned.length, 1, "exactly one world-event enemy exists");
  assert.ok(WORLD_EVENT_ZONE_IDS.includes(spawned[0].zoneId), "the spawn lands in an eligible standard zone");
  assert.ok(player.ws.sent.some((m: any) => m.t === "chat" && m.from === "World" && m.message.includes("sighted")), "players are told a world event started");

  room.shutdown();
});

test("killing a world-event enemy removes it immediately instead of letting it respawn", () => {
  const { room, player } = makeRoomWithPlayer();
  let now = Date.now();
  (room as any).startWorldEvent(now);
  player.ws.sent.length = 0;

  const enemy = [...(room as any).enemies.values()].find((e: any) => e.isWorldEvent);
  (room as any).killEnemy(enemy, now);

  assert.ok(![...(room as any).enemies.values()].some((e: any) => e.isWorldEvent), "the slain world-event enemy is gone, not left to respawn");
  assert.ok(player.ws.sent.some((m: any) => m.t === "chat" && m.from === "World" && m.message.includes("slain")), "players are told it was slain");

  room.shutdown();
});

test("the cooldown gate blocks a new spawn until it elapses", () => {
  const { room, player } = makeRoomWithPlayer();
  let now = Date.now();
  (room as any).startWorldEvent(now);
  const enemy = [...(room as any).enemies.values()].find((e: any) => e.isWorldEvent);
  (room as any).killEnemy(enemy, now);

  (room as any).tickWorldEvent(now + 1000);
  assert.ok(![...(room as any).enemies.values()].some((e: any) => e.isWorldEvent), "no new spawn before the cooldown elapses");

  (room as any).tickWorldEvent(now + WORLD_EVENT_COOLDOWN_MS + 1000);
  assert.ok([...(room as any).enemies.values()].some((e: any) => e.isWorldEvent), "a new spawn appears once the cooldown elapses");

  room.shutdown();
});

test("an unclaimed spawn past its duration fades instead of lingering forever", () => {
  const { room, player } = makeRoomWithPlayer();
  let now = Date.now();
  (room as any).startWorldEvent(now);
  player.ws.sent.length = 0;

  (room as any).tickWorldEvent(now + 10 * 60 * 1000); // well past WORLD_EVENT_DURATION_MS
  assert.ok(![...(room as any).enemies.values()].some((e: any) => e.isWorldEvent), "the unclaimed spawn despawns");
  assert.ok(player.ws.sent.some((m: any) => m.t === "chat" && m.from === "World" && m.message.includes("faded")), "players are told it faded, unclaimed");

  room.shutdown();
});

test("an ordinary enemy's death is unaffected — it still respawns on its own timer", () => {
  const { room } = makeRoomWithPlayer();
  const now = Date.now();
  const ordinary = [...(room as any).enemies.values()].find((e: any) => !e.isWorldEvent);
  (room as any).killEnemy(ordinary, now);

  assert.ok((room as any).enemies.has(ordinary.id), "an ordinary enemy is not removed from the room on death");
  assert.notEqual(ordinary.respawnAt, null, "an ordinary enemy still gets a normal respawn timer");

  room.shutdown();
});
