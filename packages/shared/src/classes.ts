import type { PlayerClassId, ResourceType, StatBlock } from "./types.js";

export interface ClassDef {
  id: PlayerClassId;
  name: string;
  tagline: string;
  description: string;
  resource: ResourceType;
  resourceName: string;
  resourceRegenPerSec: number;
  baseStats: StatBlock;
  color: string; // primary avatar color
  weaponItemId: string;
}

export const CLASSES: Record<PlayerClassId, ClassDef> = {
  warden: {
    id: "warden",
    name: "Warden",
    tagline: "Unbreakable frontline bruiser",
    description:
      "The Warden wades into melee range and turns punishment into power. Resolve builds as you take and deal hits, fueling devastating follow-ups.",
    resource: "resolve",
    resourceName: "Resolve",
    resourceRegenPerSec: 2,
    baseStats: { power: 12, vitality: 16, haste: 0, critChance: 0.05, critDamage: 1.5 },
    color: "#c96a4e",
    weaponItemId: "weapon_warden_blade"
  },
  ranger: {
    id: "ranger",
    name: "Ranger",
    tagline: "Nimble ranged skirmisher",
    description:
      "The Ranger controls the battlefield from range, laying traps and marking targets before finishing them with precise shots.",
    resource: "focus",
    resourceName: "Focus",
    resourceRegenPerSec: 6,
    baseStats: { power: 13, vitality: 10, haste: 0, critChance: 0.12, critDamage: 1.6 },
    color: "#5ea86b",
    weaponItemId: "weapon_ranger_bow"
  },
  mystic: {
    id: "mystic",
    name: "Mystic",
    tagline: "Moonlit caster & healer",
    description:
      "The Mystic channels lunar Aether to blast foes and mend allies, equally at home nuking a pack or keeping a party alive.",
    resource: "aether",
    resourceName: "Aether",
    resourceRegenPerSec: 5,
    baseStats: { power: 15, vitality: 9, haste: 0, critChance: 0.08, critDamage: 1.5 },
    color: "#7b6ad0",
    weaponItemId: "weapon_mystic_focus"
  }
};

export function listClasses(): ClassDef[] {
  return Object.values(CLASSES);
}
