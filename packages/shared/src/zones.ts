import type { Vec3 } from "./vec.js";

// A travel point is a standing portal: walking within `radius` of `pos` moves the player to
// `toPos` in `toZoneId`. No confirmation, no loading screen — like a WoW zone line.
export interface TravelPoint {
  id: string;
  pos: Vec3;
  radius: number;
  toZoneId: string;
  toPos: Vec3;
  label: string;
  /**
   * The endgame Moonthread is a late-game destination, not another travel-point-away zone: this
   * gates a travel point behind an NPC memory tag (e.g. having resolved The Cartographer's
   * "trust_them" choice) rather than making it always-open. See Room.tryTravel.
   */
  requiresTag?: { npcId: string; tag: string; deniedMessage: string };
  /** A dungeon's entrance: below this character level, Room.tryTravel denies travel with a message instead. */
  requiresLevel?: number;
}

export type ZoneTheme = "verdant" | "ashen" | "coastal" | "highland" | "arcane" | "fractured" | "lunar" | "hollow" | "drowned";

export interface ZoneDef {
  id: string;
  name: string;
  radius: number;
  spawnPoint: Vec3;
  theme: ZoneTheme;
  groundColor: string;
  groundHighlight: string;
  fogColor: string;
  backgroundColor: string;
  travelPoints: TravelPoint[];
  /** An instanced challenge zone (see docs/GDD.md's "Dungeons" section) — same solo/party instancing every zone already gets, just gated and boss-capped rather than open exploration. */
  isDungeon?: boolean;
}

export const START_ZONE_ID = "threadhold";

// Every room instance (solo or party) gets its own live copy of every zone below — the same
// places every friend knows, whichever zone they're currently standing in.
export const ZONES: Record<string, ZoneDef> = {
  threadhold: {
    id: "threadhold",
    name: "Threadhold",
    radius: 58,
    spawnPoint: { x: 0, y: 0, z: 6 },
    theme: "verdant",
    groundColor: "#2c4a3e",
    groundHighlight: "#3f6b52",
    fogColor: "#0c1220",
    backgroundColor: "#0c1220",
    travelPoints: [
      {
        id: "threadhold_to_ashmire",
        pos: { x: 0, y: 0, z: -55 },
        radius: 3,
        toZoneId: "ashmire",
        toPos: { x: 0, y: 0, z: 38 },
        label: "Ashmire"
      },
      {
        id: "threadhold_to_sunken_llyr",
        pos: { x: 55, y: 0, z: 0 },
        radius: 3,
        toZoneId: "sunken_llyr",
        toPos: { x: 0, y: 0, z: 40 },
        label: "Sunken Llyr"
      },
      {
        id: "threadhold_to_mourncrown",
        pos: { x: -55, y: 0, z: 0 },
        radius: 3,
        toZoneId: "mourncrown",
        toPos: { x: 0, y: 0, z: 42 },
        label: "Mourncrown"
      },
      {
        id: "threadhold_to_spirechain",
        pos: { x: 39, y: 0, z: 39 },
        radius: 3,
        toZoneId: "spirechain",
        toPos: { x: 0, y: 0, z: 34 },
        label: "Spirechain"
      },
      {
        id: "threadhold_to_frayedge",
        pos: { x: -39, y: 0, z: 39 },
        radius: 3,
        toZoneId: "frayedge",
        toPos: { x: 0, y: 0, z: 50 },
        label: "Frayedge"
      }
    ]
  },
  ashmire: {
    id: "ashmire",
    name: "Ashmire",
    radius: 46,
    spawnPoint: { x: 0, y: 0, z: 38 },
    theme: "ashen",
    groundColor: "#4a4038",
    groundHighlight: "#6b5c4a",
    fogColor: "#171310",
    backgroundColor: "#100d0a",
    travelPoints: [
      {
        id: "ashmire_to_threadhold",
        pos: { x: 0, y: 0, z: 42 },
        radius: 3,
        toZoneId: "threadhold",
        toPos: { x: 0, y: 0, z: -50 },
        label: "Threadhold"
      },
      // The Hollow Vault: a sealed Order stronghold, fallen to the Hollowed. Level-gated rather
      // than story-gated, since a dungeon is repeatable challenge content, not a narrative beat.
      {
        id: "ashmire_to_hollow_vault",
        pos: { x: -30, y: 0, z: -26 },
        radius: 3,
        toZoneId: "hollow_vault",
        toPos: { x: 0, y: 0, z: 26 },
        label: "The Hollow Vault",
        requiresLevel: 6
      }
    ]
  },
  hollow_vault: {
    id: "hollow_vault",
    name: "The Hollow Vault",
    radius: 34,
    spawnPoint: { x: 0, y: 0, z: 26 },
    theme: "hollow",
    groundColor: "#2a2418",
    groundHighlight: "#4a5c3a",
    fogColor: "#0d0f08",
    backgroundColor: "#080905",
    isDungeon: true,
    travelPoints: [
      // Set back from the spawn point on purpose: walking in from Ashmire and heading toward
      // the boss chamber (decreasing z) moves away from this immediately, rather than clipping
      // it and bouncing straight back out.
      {
        id: "hollow_vault_to_ashmire",
        pos: { x: 0, y: 0, z: 32 },
        radius: 3,
        toZoneId: "ashmire",
        toPos: { x: -26, y: 0, z: -22 },
        label: "Ashmire"
      }
    ]
  },
  sunken_llyr: {
    id: "sunken_llyr",
    name: "Sunken Llyr",
    radius: 50,
    spawnPoint: { x: 0, y: 0, z: 40 },
    theme: "coastal",
    groundColor: "#243a42",
    groundHighlight: "#3a6b6f",
    fogColor: "#0a1a1f",
    backgroundColor: "#081418",
    travelPoints: [
      {
        id: "sunken_llyr_to_threadhold",
        pos: { x: 0, y: 0, z: 44 },
        radius: 3,
        toZoneId: "threadhold",
        toPos: { x: 50, y: 0, z: 0 },
        label: "Threadhold"
      },
      // The Drowned City: the rising Selenian ruin Tidecaller Oren agonizes over (see npc.ts's
      // tidecaller_oren_choice) — a second dungeon, gated higher than the Hollow Vault since a
      // party reaching it has already cleared most of the standard zones.
      {
        id: "sunken_llyr_to_drowned_city",
        pos: { x: -34, y: 0, z: 34 },
        radius: 3,
        toZoneId: "drowned_city",
        toPos: { x: 0, y: 0, z: 24 },
        label: "The Drowned City",
        requiresLevel: 12
      }
    ]
  },
  drowned_city: {
    id: "drowned_city",
    name: "The Drowned City",
    radius: 32,
    spawnPoint: { x: 0, y: 0, z: 24 },
    theme: "drowned",
    groundColor: "#132c30",
    groundHighlight: "#1f4a4a",
    fogColor: "#050f12",
    backgroundColor: "#03080a",
    isDungeon: true,
    travelPoints: [
      // Set back from the spawn point on purpose, same as the Hollow Vault's exit — walking in
      // and heading toward the boss chamber (decreasing z) moves away from this immediately.
      {
        id: "drowned_city_to_sunken_llyr",
        pos: { x: 0, y: 0, z: 30 },
        radius: 3,
        toZoneId: "sunken_llyr",
        toPos: { x: -30, y: 0, z: 30 },
        label: "Sunken Llyr"
      }
    ]
  },
  mourncrown: {
    id: "mourncrown",
    name: "Mourncrown",
    radius: 52,
    spawnPoint: { x: 0, y: 0, z: 42 },
    theme: "highland",
    groundColor: "#3a3548",
    groundHighlight: "#585070",
    fogColor: "#100c1a",
    backgroundColor: "#0c0912",
    travelPoints: [
      {
        id: "mourncrown_to_threadhold",
        pos: { x: 0, y: 0, z: 46 },
        radius: 3,
        toZoneId: "threadhold",
        toPos: { x: -50, y: 0, z: 0 },
        label: "Threadhold"
      }
    ]
  },
  spirechain: {
    id: "spirechain",
    name: "Spirechain",
    radius: 42,
    spawnPoint: { x: 0, y: 0, z: 34 },
    theme: "arcane",
    groundColor: "#3d4658",
    groundHighlight: "#6c7fa0",
    fogColor: "#0d1220",
    backgroundColor: "#080b14",
    travelPoints: [
      {
        id: "spirechain_to_threadhold",
        pos: { x: 0, y: 0, z: 38 },
        radius: 3,
        toZoneId: "threadhold",
        toPos: { x: 35, y: 0, z: 35 },
        label: "Threadhold"
      }
    ]
  },
  frayedge: {
    id: "frayedge",
    name: "The Frayedge",
    radius: 60,
    spawnPoint: { x: 0, y: 0, z: 50 },
    theme: "fractured",
    groundColor: "#3a2438",
    groundHighlight: "#6b3f5c",
    fogColor: "#150a18",
    backgroundColor: "#0e0710",
    travelPoints: [
      {
        id: "frayedge_to_threadhold",
        pos: { x: 0, y: 0, z: 54 },
        radius: 3,
        toZoneId: "threadhold",
        toPos: { x: -35, y: 0, z: 35 },
        label: "Threadhold"
      },
      // Standing right where The Cartographer waits — the road to Selen only opens once you've
      // trusted them to lead you there (see npc.ts's cartographer_trust_choice).
      {
        id: "frayedge_to_moonthread",
        pos: { x: -4, y: 0, z: 44 },
        radius: 3,
        toZoneId: "moonthread",
        toPos: { x: 0, y: 0, z: 22 },
        label: "The Moonthread",
        requiresTag: {
          npcId: "the_cartographer",
          tag: "cartographer_trusted",
          deniedMessage: "The Cartographer hasn't shown you the way yet. Talk to them first."
        }
      }
    ]
  },
  // The endgame zone: the literal tether between Aethon and Selen, reachable only once The
  // Cartographer has agreed to guide you there. Small, quiet, and built for one last set of
  // conversations rather than another spawn-dense combat zone.
  moonthread: {
    id: "moonthread",
    name: "The Moonthread",
    radius: 32,
    spawnPoint: { x: 0, y: 0, z: 22 },
    theme: "lunar",
    groundColor: "#20233a",
    groundHighlight: "#4a4f82",
    fogColor: "#0a0a16",
    backgroundColor: "#05050c",
    travelPoints: [
      {
        id: "moonthread_to_frayedge",
        pos: { x: 0, y: 0, z: 26 },
        radius: 3,
        toZoneId: "frayedge",
        toPos: { x: -4, y: 0, z: 40 },
        label: "The Frayedge"
      }
    ]
  }
};

export function getZone(id: string): ZoneDef {
  return ZONES[id] ?? ZONES[START_ZONE_ID];
}

export function clampToZone(pos: Vec3, zoneId: string): Vec3 {
  const zone = getZone(zoneId);
  const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
  if (dist <= zone.radius) return pos;
  const scale = zone.radius / dist;
  return { x: pos.x * scale, y: pos.y, z: pos.z * scale };
}
