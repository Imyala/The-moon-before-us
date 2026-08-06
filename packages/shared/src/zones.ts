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
}

export type ZoneTheme = "verdant" | "ashen";

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
