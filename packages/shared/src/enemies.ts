import type { EnemyDef, ResourceNodeDef } from "./types.js";

export const ENEMIES: EnemyDef[] = [
  {
    id: "moonlit_wolf",
    name: "Moonlit Wolf",
    tier: "minion",
    maxHp: 45,
    power: 6,
    moveSpeed: 4.2,
    aggroRadius: 9,
    attackRange: 2,
    attackDamage: 7,
    attackCooldownMs: 1400,
    attackTelegraphMs: 350,
    xpReward: 14,
    loot: [
      { itemId: "mat_wood", chance: 0.25, minQty: 1, maxQty: 2 },
      { itemId: "mat_herb", chance: 0.2, minQty: 1, maxQty: 1 }
    ],
    scale: 0.9,
    color: "#8892a6"
  },
  {
    id: "husk",
    name: "Husk",
    tier: "minion",
    maxHp: 80,
    power: 8,
    moveSpeed: 2.3,
    aggroRadius: 7,
    attackRange: 2.2,
    attackDamage: 13,
    attackCooldownMs: 2000,
    attackTelegraphMs: 650,
    xpReward: 20,
    loot: [
      { itemId: "mat_iron_ore", chance: 0.3, minQty: 1, maxQty: 2 },
      { itemId: "mat_essence", chance: 0.15, minQty: 1, maxQty: 1 }
    ],
    scale: 1.15,
    color: "#6a5a4e"
  },
  {
    id: "bramble_stalker",
    name: "Bramble Stalker",
    tier: "minion",
    maxHp: 55,
    power: 7,
    moveSpeed: 3.0,
    aggroRadius: 11,
    attackRange: 9,
    attackDamage: 9,
    attackCooldownMs: 1800,
    attackTelegraphMs: 500,
    xpReward: 18,
    loot: [
      { itemId: "mat_herb", chance: 0.3, minQty: 1, maxQty: 2 },
      { itemId: "mat_essence", chance: 0.2, minQty: 1, maxQty: 1 }
    ],
    scale: 1.0,
    color: "#4f7a3d"
  },
  {
    id: "stone_sentinel",
    name: "Stone Sentinel",
    tier: "elite",
    maxHp: 260,
    power: 14,
    moveSpeed: 1.9,
    aggroRadius: 10,
    attackRange: 3.5,
    attackDamage: 22,
    attackCooldownMs: 2600,
    attackTelegraphMs: 900,
    xpReward: 90,
    loot: [
      { itemId: "mat_silver_ore", chance: 0.5, minQty: 1, maxQty: 3 },
      { itemId: "mat_moonpetal", chance: 0.35, minQty: 1, maxQty: 2 },
      { itemId: "trinket_lucky_charm", chance: 0.08, minQty: 1, maxQty: 1 }
    ],
    scale: 1.8,
    color: "#7d7d85"
  },
  {
    id: "wane_wraith",
    name: "Wane Wraith",
    tier: "boss",
    maxHp: 620,
    power: 20,
    moveSpeed: 2.6,
    aggroRadius: 14,
    attackRange: 8,
    attackDamage: 26,
    attackCooldownMs: 2200,
    attackTelegraphMs: 750,
    xpReward: 260,
    loot: [
      { itemId: "mat_starlight_essence", chance: 0.6, minQty: 1, maxQty: 3 },
      { itemId: "mat_silver_ore", chance: 0.5, minQty: 2, maxQty: 4 },
      { itemId: "weapon_starlight_bow", chance: 0.05, minQty: 1, maxQty: 1 },
      { itemId: "weapon_silver_blade", chance: 0.05, minQty: 1, maxQty: 1 },
      { itemId: "weapon_starlight_focus", chance: 0.05, minQty: 1, maxQty: 1 },
      { itemId: "weapon_duskfall_daggers", chance: 0.05, minQty: 1, maxQty: 1 }
    ],
    scale: 2.3,
    color: "#3d3557"
  },
  // The Moonthread's own guardians: what's left of the tether's oldest defenses, tougher than
  // anything in the six built zones — a deliberately small, dense endgame encounter rather than
  // another wide spawn field.
  {
    id: "selenian_remnant",
    name: "Selenian Remnant",
    tier: "boss",
    maxHp: 900,
    power: 26,
    moveSpeed: 2.8,
    aggroRadius: 16,
    attackRange: 9,
    attackDamage: 32,
    attackCooldownMs: 2000,
    attackTelegraphMs: 700,
    xpReward: 340,
    loot: [
      { itemId: "mat_starlight_essence", chance: 0.7, minQty: 2, maxQty: 4 },
      { itemId: "mat_moonpetal", chance: 0.5, minQty: 2, maxQty: 3 },
      { itemId: "trinket_lucky_charm", chance: 0.12, minQty: 1, maxQty: 1 }
    ],
    scale: 2.0,
    color: "#c9d6ff"
  },
  // A persistent world event (see docs/GDD.md's "Persistent world events" section): Room spawns
  // exactly one of these at a time, roaming widely across a randomly chosen standard zone —
  // tougher than any elite and most bosses, worth a party crossing zones to hunt down before it
  // moves on.
  {
    id: "wandering_moonstag",
    name: "The Wandering Moonstag",
    tier: "rare",
    maxHp: 850,
    power: 22,
    moveSpeed: 3.4,
    aggroRadius: 13,
    attackRange: 3.2,
    attackDamage: 24,
    attackCooldownMs: 2100,
    attackTelegraphMs: 650,
    xpReward: 300,
    loot: [
      { itemId: "mat_starlight_essence", chance: 0.85, minQty: 2, maxQty: 4 },
      { itemId: "mat_moonpetal", chance: 0.6, minQty: 2, maxQty: 3 },
      { itemId: "trinket_moon_pendant", chance: 0.2, minQty: 1, maxQty: 1 },
      { itemId: "trinket_lucky_charm", chance: 0.15, minQty: 1, maxQty: 1 }
    ],
    scale: 2.2,
    color: "#bfe6ff"
  },
  // The Hollow Vault's boss (see docs/GDD.md's "Dungeons" section): a corrupted Order construct
  // guarding what the Vault sealed away. A real lockout, not just a hard fight — respawnMs is
  // 10 minutes instead of the standard 20 seconds, so a party can't trivially re-farm it.
  {
    id: "vault_warden",
    name: "The Vault Warden",
    tier: "boss",
    maxHp: 1400,
    power: 30,
    moveSpeed: 2.4,
    aggroRadius: 18,
    attackRange: 4,
    attackDamage: 38,
    attackCooldownMs: 2400,
    attackTelegraphMs: 800,
    xpReward: 450,
    respawnMs: 600000,
    loot: [
      { itemId: "armor_vault_plate", chance: 0.35, minQty: 1, maxQty: 1 },
      { itemId: "trinket_hollow_seal", chance: 0.35, minQty: 1, maxQty: 1 },
      { itemId: "mat_starlight_essence", chance: 0.8, minQty: 3, maxQty: 5 },
      { itemId: "mat_silver_ore", chance: 0.6, minQty: 3, maxQty: 6 }
    ],
    scale: 2.6,
    color: "#5c6b3a"
  },
  // The Drowned City's boss (see docs/GDD.md's "Dungeons" section): the second dungeon, gated
  // higher than the Hollow Vault. A Selenian who sank with the city rather than one of the
  // Order's own constructs — tougher than the Vault Warden, with the same real lockout.
  {
    id: "sleeping_selenian",
    name: "The Sleeping Selenian",
    tier: "boss",
    maxHp: 1700,
    power: 34,
    moveSpeed: 2.3,
    aggroRadius: 18,
    attackRange: 5,
    attackDamage: 42,
    attackCooldownMs: 2300,
    attackTelegraphMs: 850,
    xpReward: 560,
    respawnMs: 600000,
    loot: [
      { itemId: "armor_tideglass_ward", chance: 0.35, minQty: 1, maxQty: 1 },
      { itemId: "trinket_selenian_signet", chance: 0.35, minQty: 1, maxQty: 1 },
      { itemId: "weapon_selenian_tideblade", chance: 0.05, minQty: 1, maxQty: 1 },
      { itemId: "weapon_depthsong_bow", chance: 0.05, minQty: 1, maxQty: 1 },
      { itemId: "weapon_drowned_conduit", chance: 0.05, minQty: 1, maxQty: 1 },
      { itemId: "weapon_abyssal_fangs", chance: 0.05, minQty: 1, maxQty: 1 },
      { itemId: "mat_starlight_essence", chance: 0.85, minQty: 3, maxQty: 6 },
      { itemId: "mat_silver_ore", chance: 0.6, minQty: 3, maxQty: 6 }
    ],
    scale: 2.7,
    color: "#3a7a82"
  }
];

export const RESOURCE_NODES: ResourceNodeDef[] = [
  {
    id: "node_ore_vein",
    type: "ore",
    name: "Ore Vein",
    gatherTimeMs: 2200,
    respawnMs: 30000,
    loot: [
      { itemId: "mat_iron_ore", chance: 1, minQty: 1, maxQty: 3 },
      { itemId: "mat_silver_ore", chance: 0.18, minQty: 1, maxQty: 1 }
    ],
    color: "#8b7d6b"
  },
  {
    id: "node_tree",
    type: "tree",
    name: "Timber Stand",
    gatherTimeMs: 1800,
    respawnMs: 24000,
    loot: [{ itemId: "mat_wood", chance: 1, minQty: 1, maxQty: 3 }],
    color: "#5b4632"
  },
  {
    id: "node_herb_patch",
    type: "herb",
    name: "Herb Patch",
    gatherTimeMs: 1500,
    respawnMs: 20000,
    loot: [
      { itemId: "mat_herb", chance: 1, minQty: 1, maxQty: 2 },
      { itemId: "mat_moonpetal", chance: 0.15, minQty: 1, maxQty: 1 }
    ],
    color: "#6fae52"
  },
  {
    id: "node_crystal",
    type: "crystal",
    name: "Wisp Crystal",
    gatherTimeMs: 2600,
    respawnMs: 34000,
    loot: [
      { itemId: "mat_essence", chance: 1, minQty: 1, maxQty: 2 },
      { itemId: "mat_starlight_essence", chance: 0.1, minQty: 1, maxQty: 1 }
    ],
    color: "#8fd6d8"
  }
];

export function getEnemy(id: string): EnemyDef | undefined {
  return ENEMIES.find((e) => e.id === id);
}

export function getResourceNode(id: string): ResourceNodeDef | undefined {
  return RESOURCE_NODES.find((n) => n.id === id);
}
