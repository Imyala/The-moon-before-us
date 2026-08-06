import { WORLD_RADIUS, type Vec3 } from "@moon/shared";

export { WORLD_RADIUS };
export const PLAYER_SPAWN: Vec3 = { x: 0, y: 0, z: 6 };
export const PLAYER_SPEED = 5.2;
export const DODGE_SPEED = 15;
export const DODGE_DURATION_MS = 260;
export const DODGE_COOLDOWN_MS = 1000;

export interface EnemySpawnPoint {
  defId: string;
  pos: Vec3;
  patrolRadius: number;
}

export interface NodeSpawnPoint {
  defId: string;
  pos: Vec3;
}

// A single shared "glade" layout — every room instance (solo or party) gets its own
// live copy of this same world so friends dropping in see the place they know.
export const ENEMY_SPAWNS: EnemySpawnPoint[] = [
  { defId: "moonlit_wolf", pos: { x: 10, y: 0, z: -8 }, patrolRadius: 6 },
  { defId: "moonlit_wolf", pos: { x: 16, y: 0, z: -4 }, patrolRadius: 6 },
  { defId: "moonlit_wolf", pos: { x: -12, y: 0, z: -10 }, patrolRadius: 6 },
  { defId: "husk", pos: { x: -18, y: 0, z: 2 }, patrolRadius: 4 },
  { defId: "husk", pos: { x: -22, y: 0, z: 14 }, patrolRadius: 4 },
  { defId: "bramble_stalker", pos: { x: 20, y: 0, z: 16 }, patrolRadius: 5 },
  { defId: "bramble_stalker", pos: { x: 26, y: 0, z: 22 }, patrolRadius: 5 },
  { defId: "husk", pos: { x: 4, y: 0, z: -28 }, patrolRadius: 5 },
  { defId: "moonlit_wolf", pos: { x: -6, y: 0, z: -30 }, patrolRadius: 6 },
  { defId: "stone_sentinel", pos: { x: -34, y: 0, z: -20 }, patrolRadius: 3 },
  { defId: "bramble_stalker", pos: { x: 34, y: 0, z: -18 }, patrolRadius: 5 },
  { defId: "wane_wraith", pos: { x: 0, y: 0, z: -48 }, patrolRadius: 4 }
];

export const NODE_SPAWNS: NodeSpawnPoint[] = [
  { defId: "node_ore_vein", pos: { x: 8, y: 0, z: 10 } },
  { defId: "node_ore_vein", pos: { x: -10, y: 0, z: 16 } },
  { defId: "node_ore_vein", pos: { x: -28, y: 0, z: -4 } },
  { defId: "node_tree", pos: { x: 14, y: 0, z: 4 } },
  { defId: "node_tree", pos: { x: 18, y: 0, z: 10 } },
  { defId: "node_tree", pos: { x: -4, y: 0, z: 22 } },
  { defId: "node_tree", pos: { x: -16, y: 0, z: 26 } },
  { defId: "node_herb_patch", pos: { x: 6, y: 0, z: 18 } },
  { defId: "node_herb_patch", pos: { x: -20, y: 0, z: 22 } },
  { defId: "node_herb_patch", pos: { x: 24, y: 0, z: -2 } },
  { defId: "node_crystal", pos: { x: -32, y: 0, z: 10 } },
  { defId: "node_crystal", pos: { x: 30, y: 0, z: 30 } },
  { defId: "node_crystal", pos: { x: -2, y: 0, z: -18 } }
];

export function clampToWorld(pos: Vec3): Vec3 {
  const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
  if (dist <= WORLD_RADIUS) return pos;
  const scale = WORLD_RADIUS / dist;
  return { x: pos.x * scale, y: pos.y, z: pos.z * scale };
}
