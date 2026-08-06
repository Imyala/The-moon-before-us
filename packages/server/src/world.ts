import { clampToZone, getZone, type Vec3 } from "@moon/shared";

export { clampToZone, getZone };
export const PLAYER_SPEED = 5.2;
export const DODGE_SPEED = 15;
export const DODGE_DURATION_MS = 260;
export const DODGE_COOLDOWN_MS = 1000;
export const TRAVEL_COOLDOWN_MS = 1200;

export interface EnemySpawnPoint {
  defId: string;
  pos: Vec3;
  patrolRadius: number;
}

export interface NodeSpawnPoint {
  defId: string;
  pos: Vec3;
}

// Per-zone spawn layouts. Every room instance (solo or party) gets its own live copy of every
// zone below, so friends dropping in see the places they know regardless of which zone they
// each happen to be standing in.
export const ZONE_ENEMY_SPAWNS: Record<string, EnemySpawnPoint[]> = {
  glade: [
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
  ],
  // A barren stretch of ruins beyond the glade's southern gate: stone guardians and husks
  // among the dead ground, with the wolves and stalkers thinning out toward its ashen center.
  ashen_reach: [
    { defId: "stone_sentinel", pos: { x: 12, y: 0, z: 20 }, patrolRadius: 4 },
    { defId: "stone_sentinel", pos: { x: -16, y: 0, z: 10 }, patrolRadius: 4 },
    { defId: "stone_sentinel", pos: { x: 4, y: 0, z: -14 }, patrolRadius: 4 },
    { defId: "husk", pos: { x: -8, y: 0, z: 24 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: 20, y: 0, z: 4 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: -22, y: 0, z: -8 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: 8, y: 0, z: -26 }, patrolRadius: 5 },
    { defId: "moonlit_wolf", pos: { x: -30, y: 0, z: 16 }, patrolRadius: 6 },
    { defId: "moonlit_wolf", pos: { x: 28, y: 0, z: -18 }, patrolRadius: 6 },
    { defId: "bramble_stalker", pos: { x: -4, y: 0, z: 4 }, patrolRadius: 5 },
    { defId: "bramble_stalker", pos: { x: 18, y: 0, z: 30 }, patrolRadius: 5 }
  ]
};

export const ZONE_NODE_SPAWNS: Record<string, NodeSpawnPoint[]> = {
  glade: [
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
  ],
  // No timber in a wasteland: ore and crystal dominate, with herbs only where the ground
  // hasn't fully died.
  ashen_reach: [
    { defId: "node_ore_vein", pos: { x: 16, y: 0, z: -6 } },
    { defId: "node_ore_vein", pos: { x: -18, y: 0, z: 18 } },
    { defId: "node_ore_vein", pos: { x: -6, y: 0, z: -22 } },
    { defId: "node_ore_vein", pos: { x: 26, y: 0, z: 14 } },
    { defId: "node_crystal", pos: { x: 0, y: 0, z: 10 } },
    { defId: "node_crystal", pos: { x: -24, y: 0, z: -10 } },
    { defId: "node_crystal", pos: { x: 20, y: 0, z: 28 } },
    { defId: "node_herb_patch", pos: { x: -10, y: 0, z: 30 } },
    { defId: "node_herb_patch", pos: { x: 12, y: 0, z: -30 } }
  ]
};

export function allZoneIds(): string[] {
  return Object.keys(ZONE_ENEMY_SPAWNS);
}
