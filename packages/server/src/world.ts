import { clampToZone, getZone, type Vec3 } from "@moon/shared";

export { clampToZone, getZone };
export const PLAYER_SPEED = 5.2;
export const DODGE_SPEED = 15;
export const DODGE_DURATION_MS = 260;
export const DODGE_COOLDOWN_MS = 1000;
export const TRAVEL_COOLDOWN_MS = 1200;

export const COMPANION_SPEED = 5.6;
export const COMPANION_FOLLOW_DISTANCE = 3;
export const COMPANION_AGGRO_RADIUS = 10;
export const COMPANION_ATTACK_RANGE = 3;
export const COMPANION_ATTACK_COOLDOWN_MS = 1400;
export const COMPANION_BASE_DAMAGE = 14;
export const COMPANION_MAX_HP = 100;
export const COMPANION_REVIVE_MS = 25000;

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
  threadhold: [
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
  // A barren stretch of ruins beyond Threadhold's southern gate: stone guardians and husks
  // among the dead ground, with the wolves and stalkers thinning out toward its ashen center.
  ashmire: [
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
  ],
  // Fjords and tidal caves: drowned husks and kelp-tangled stalkers along the shore, tide-worn
  // stone sentinels further inland.
  sunken_llyr: [
    { defId: "husk", pos: { x: 10, y: 0, z: -6 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: -14, y: 0, z: 8 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: 6, y: 0, z: 22 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: -20, y: 0, z: -18 }, patrolRadius: 5 },
    { defId: "stone_sentinel", pos: { x: 22, y: 0, z: -10 }, patrolRadius: 4 },
    { defId: "stone_sentinel", pos: { x: -8, y: 0, z: -28 }, patrolRadius: 4 },
    { defId: "bramble_stalker", pos: { x: 18, y: 0, z: 14 }, patrolRadius: 5 },
    { defId: "bramble_stalker", pos: { x: -24, y: 0, z: 20 }, patrolRadius: 5 },
    { defId: "bramble_stalker", pos: { x: 2, y: 0, z: -34 }, patrolRadius: 5 },
    { defId: "moonlit_wolf", pos: { x: -30, y: 0, z: -4 }, patrolRadius: 6 },
    { defId: "moonlit_wolf", pos: { x: 28, y: 0, z: 18 }, patrolRadius: 6 }
  ],
  // Haunted highlands under an eternal twilight: wraiths drift among the stone circles, husks
  // restless in the barrows.
  mourncrown: [
    { defId: "wane_wraith", pos: { x: 0, y: 0, z: -8 }, patrolRadius: 4 },
    { defId: "wane_wraith", pos: { x: -22, y: 0, z: -22 }, patrolRadius: 4 },
    { defId: "husk", pos: { x: 14, y: 0, z: -6 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: -10, y: 0, z: 16 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: 22, y: 0, z: 20 }, patrolRadius: 5 },
    { defId: "stone_sentinel", pos: { x: -30, y: 0, z: 8 }, patrolRadius: 4 },
    { defId: "stone_sentinel", pos: { x: 8, y: 0, z: -30 }, patrolRadius: 4 },
    { defId: "stone_sentinel", pos: { x: 30, y: 0, z: -12 }, patrolRadius: 4 },
    { defId: "bramble_stalker", pos: { x: -16, y: 0, z: -12 }, patrolRadius: 5 },
    { defId: "bramble_stalker", pos: { x: 4, y: 0, z: 24 }, patrolRadius: 5 }
  ],
  // Sky-cities and archives: Order guardian constructs far outnumber the roaming husks of
  // failed experiments — the quietest, most closely watched of the zones.
  spirechain: [
    { defId: "stone_sentinel", pos: { x: 10, y: 0, z: -8 }, patrolRadius: 3 },
    { defId: "stone_sentinel", pos: { x: -12, y: 0, z: 4 }, patrolRadius: 3 },
    { defId: "stone_sentinel", pos: { x: 6, y: 0, z: 18 }, patrolRadius: 3 },
    { defId: "stone_sentinel", pos: { x: -18, y: 0, z: -14 }, patrolRadius: 3 },
    { defId: "husk", pos: { x: 18, y: 0, z: 10 }, patrolRadius: 4 },
    { defId: "husk", pos: { x: -6, y: 0, z: -22 }, patrolRadius: 4 },
    { defId: "husk", pos: { x: 22, y: 0, z: -6 }, patrolRadius: 4 }
  ],
  // Fractured badlands at the world's rim: reality tears here, and the toughest, densest mix
  // of every species in Aethon has drifted toward it.
  frayedge: [
    { defId: "wane_wraith", pos: { x: 10, y: 0, z: -10 }, patrolRadius: 4 },
    { defId: "wane_wraith", pos: { x: -30, y: 0, z: -20 }, patrolRadius: 4 },
    { defId: "stone_sentinel", pos: { x: 26, y: 0, z: 10 }, patrolRadius: 4 },
    { defId: "stone_sentinel", pos: { x: -10, y: 0, z: 24 }, patrolRadius: 4 },
    { defId: "stone_sentinel", pos: { x: 0, y: 0, z: -36 }, patrolRadius: 4 },
    { defId: "husk", pos: { x: -22, y: 0, z: 4 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: 18, y: 0, z: -24 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: -6, y: 0, z: -14 }, patrolRadius: 5 },
    { defId: "husk", pos: { x: 34, y: 0, z: -8 }, patrolRadius: 5 },
    { defId: "bramble_stalker", pos: { x: 8, y: 0, z: 14 }, patrolRadius: 5 },
    { defId: "bramble_stalker", pos: { x: -34, y: 0, z: 12 }, patrolRadius: 5 },
    { defId: "bramble_stalker", pos: { x: 14, y: 0, z: -40 }, patrolRadius: 5 },
    { defId: "moonlit_wolf", pos: { x: -16, y: 0, z: -34 }, patrolRadius: 6 },
    { defId: "moonlit_wolf", pos: { x: 32, y: 0, z: 24 }, patrolRadius: 6 }
  ],
  // The Moonthread itself: small, dense, and deliberately sparse compared to the six built
  // zones — this is a late-game destination built for a handful of hard fights and the finale
  // conversations, not another wide spawn field.
  moonthread: [
    { defId: "selenian_remnant", pos: { x: 14, y: 0, z: -6 }, patrolRadius: 5 },
    { defId: "selenian_remnant", pos: { x: -16, y: 0, z: -10 }, patrolRadius: 5 },
    { defId: "wane_wraith", pos: { x: 0, y: 0, z: -22 }, patrolRadius: 5 }
  ],
  // The Hollow Vault (see docs/GDD.md's "Dungeons" section): entering at the south end (z=30),
  // a gauntlet of Order constructs and Hollowed thins out toward the boss chamber at the north
  // end, where the Vault Warden itself stands alone.
  hollow_vault: [
    { defId: "stone_sentinel", pos: { x: 6, y: 0, z: 20 }, patrolRadius: 3 },
    { defId: "stone_sentinel", pos: { x: -6, y: 0, z: 14 }, patrolRadius: 3 },
    { defId: "husk", pos: { x: 8, y: 0, z: 8 }, patrolRadius: 4 },
    { defId: "husk", pos: { x: -8, y: 0, z: 4 }, patrolRadius: 4 },
    { defId: "stone_sentinel", pos: { x: 0, y: 0, z: -4 }, patrolRadius: 3 },
    { defId: "husk", pos: { x: 5, y: 0, z: -10 }, patrolRadius: 4 },
    { defId: "vault_warden", pos: { x: 0, y: 0, z: -20 }, patrolRadius: 2 }
  ]
};

export const ZONE_NODE_SPAWNS: Record<string, NodeSpawnPoint[]> = {
  threadhold: [
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
  ashmire: [
    { defId: "node_ore_vein", pos: { x: 16, y: 0, z: -6 } },
    { defId: "node_ore_vein", pos: { x: -18, y: 0, z: 18 } },
    { defId: "node_ore_vein", pos: { x: -6, y: 0, z: -22 } },
    { defId: "node_ore_vein", pos: { x: 26, y: 0, z: 14 } },
    { defId: "node_crystal", pos: { x: 0, y: 0, z: 10 } },
    { defId: "node_crystal", pos: { x: -24, y: 0, z: -10 } },
    { defId: "node_crystal", pos: { x: 20, y: 0, z: 28 } },
    { defId: "node_herb_patch", pos: { x: -10, y: 0, z: 30 } },
    { defId: "node_herb_patch", pos: { x: 12, y: 0, z: -30 } }
  ],
  // Tide-washed crystal and shipwreck ore dominate; driftwood is the only timber the sea gives back.
  sunken_llyr: [
    { defId: "node_crystal", pos: { x: 14, y: 0, z: -4 } },
    { defId: "node_crystal", pos: { x: -18, y: 0, z: 12 } },
    { defId: "node_crystal", pos: { x: 4, y: 0, z: 28 } },
    { defId: "node_ore_vein", pos: { x: -8, y: 0, z: -22 } },
    { defId: "node_ore_vein", pos: { x: 24, y: 0, z: 8 } },
    { defId: "node_ore_vein", pos: { x: -26, y: 0, z: -6 } },
    { defId: "node_herb_patch", pos: { x: 6, y: 0, z: -32 } },
    { defId: "node_herb_patch", pos: { x: -12, y: 0, z: 24 } },
    { defId: "node_tree", pos: { x: 20, y: 0, z: 22 } }
  ],
  // Mourning-flowers and barrow ore among the stone circles; the highlands are too exposed for timber.
  mourncrown: [
    { defId: "node_herb_patch", pos: { x: 10, y: 0, z: 8 } },
    { defId: "node_herb_patch", pos: { x: -18, y: 0, z: -8 } },
    { defId: "node_herb_patch", pos: { x: 4, y: 0, z: -22 } },
    { defId: "node_ore_vein", pos: { x: -8, y: 0, z: 22 } },
    { defId: "node_ore_vein", pos: { x: 26, y: 0, z: -4 } },
    { defId: "node_ore_vein", pos: { x: -28, y: 0, z: -16 } },
    { defId: "node_crystal", pos: { x: 18, y: 0, z: 24 } },
    { defId: "node_crystal", pos: { x: -4, y: 0, z: -32 } }
  ],
  // Archive materials only: research-grade crystal and the metal fittings the Order's constructs are built from.
  spirechain: [
    { defId: "node_crystal", pos: { x: 8, y: 0, z: -12 } },
    { defId: "node_crystal", pos: { x: -14, y: 0, z: 6 } },
    { defId: "node_crystal", pos: { x: 4, y: 0, z: 20 } },
    { defId: "node_ore_vein", pos: { x: -6, y: 0, z: -20 } },
    { defId: "node_ore_vein", pos: { x: 18, y: 0, z: 4 } }
  ],
  // Shard-rich rim: crystal dominates, with what ore and herb can survive the fractures.
  frayedge: [
    { defId: "node_crystal", pos: { x: 12, y: 0, z: -8 } },
    { defId: "node_crystal", pos: { x: -20, y: 0, z: 10 } },
    { defId: "node_crystal", pos: { x: 6, y: 0, z: 26 } },
    { defId: "node_crystal", pos: { x: -8, y: 0, z: -30 } },
    { defId: "node_crystal", pos: { x: 28, y: 0, z: 16 } },
    { defId: "node_ore_vein", pos: { x: -30, y: 0, z: -10 } },
    { defId: "node_ore_vein", pos: { x: 18, y: 0, z: -22 } },
    { defId: "node_ore_vein", pos: { x: -4, y: 0, z: 34 } },
    { defId: "node_herb_patch", pos: { x: 22, y: 0, z: 4 } },
    { defId: "node_herb_patch", pos: { x: -14, y: 0, z: -18 } }
  ],
  // Fragments of Selen herself, closer to the source than anywhere else in Aethon.
  moonthread: [
    { defId: "node_crystal", pos: { x: 10, y: 0, z: 4 } },
    { defId: "node_crystal", pos: { x: -12, y: 0, z: 14 } }
  ],
  // Sealed Order stockpiles, cracked open by the Hollowed.
  hollow_vault: [
    { defId: "node_ore_vein", pos: { x: 10, y: 0, z: 16 } },
    { defId: "node_ore_vein", pos: { x: -10, y: 0, z: 10 } }
  ]
};

export function allZoneIds(): string[] {
  return Object.keys(ZONE_ENEMY_SPAWNS);
}
