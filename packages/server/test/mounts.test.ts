import { test } from "node:test";
import assert from "node:assert/strict";
import { Room } from "../src/room.js";
import { makePlayer } from "./helpers.js";

function makeRoom() {
  return new Room({ isSolo: true, onEmpty: () => {}, persist: () => {} });
}

test("toggling mount speeds up movement measurably", () => {
  const room = makeRoom();
  const mounted = makePlayer({ id: "mounted" });
  mounted.moveIntent = { x: 1, y: 0, z: 0 };
  room.players.set(mounted.id, mounted);
  (room as any).toggleMount(mounted);
  assert.equal(mounted.mounted, true, "toggleMount mounts an idle, alive player");

  const now = 1000;
  (room as any).tickPlayer(mounted, 0.066, now);
  const mountedDist = Math.abs(mounted.position.x);

  const unmounted = makePlayer({ id: "unmounted" });
  unmounted.moveIntent = { x: 1, y: 0, z: 0 };
  room.players.set(unmounted.id, unmounted);
  (room as any).tickPlayer(unmounted, 0.066, now);

  assert.ok(mountedDist > Math.abs(unmounted.position.x), "a mounted player covers more distance per tick than an unmounted one");
  room.shutdown();
});

test("taking damage, using an ability, and starting to gather each force a dismount", () => {
  const room = makeRoom();
  const player = makePlayer({ id: "p1" });
  room.players.set(player.id, player);

  player.mounted = true;
  (room as any).damagePlayer(player, 20, 1000);
  assert.equal(player.mounted, false, "taking real damage dismounts");

  player.mounted = true;
  player.character.hp = 100;
  (room as any).tryUseAbility(player, "warden_strike", undefined, undefined, 1100);
  assert.equal(player.mounted, false, "using an ability dismounts");

  const nodeId = [...(room as any).nodes.keys()].find((id: string) => (room as any).nodes.get(id).zoneId === "threadhold");
  const node = (room as any).nodes.get(nodeId);
  player.mounted = true;
  player.position = { ...node.position };
  player.gathering = null;
  (room as any).tryGather(player, nodeId, 1200);
  assert.equal(player.mounted, false, "starting to gather dismounts");

  room.shutdown();
});

test("a dead, gathering, or casting player can't mount up, and toggling twice returns to unmounted", () => {
  const room = makeRoom();
  const player = makePlayer({ id: "p1" });
  room.players.set(player.id, player);

  player.character.hp = 0;
  (room as any).toggleMount(player);
  assert.equal(player.mounted, false, "a dead player can't mount up");

  player.character.hp = 100;
  player.gathering = { nodeId: "x", endAt: 9999 };
  (room as any).toggleMount(player);
  assert.equal(player.mounted, false, "a gathering player can't mount up");
  player.gathering = null;

  player.casting = { abilityId: "warden_strike", endAt: 9999 };
  (room as any).toggleMount(player);
  assert.equal(player.mounted, false, "a casting player can't mount up");
  player.casting = null;

  (room as any).toggleMount(player);
  assert.equal(player.mounted, true);
  (room as any).toggleMount(player);
  assert.equal(player.mounted, false, "toggling twice returns to unmounted");

  room.shutdown();
});

test("respawning clears mounted state", () => {
  const room = makeRoom();
  const player = makePlayer({ id: "p1" });
  room.players.set(player.id, player);

  player.mounted = true;
  player.character.hp = 0;
  player.state = "dead";
  (player as any)._respawnAt = 999;
  (room as any).tickPlayer(player, 0.066, 1000);
  assert.equal(player.mounted, false, "respawning clears mounted state");

  room.shutdown();
});
