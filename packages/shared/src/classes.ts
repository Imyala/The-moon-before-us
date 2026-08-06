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
  weaponItemId: string; // kit A, equipped by default
  altWeaponItemId: string; // kit B, granted in starting inventory so players can swap immediately
}

export const CLASSES: Record<PlayerClassId, ClassDef> = {
  duskblade: {
    id: "duskblade",
    name: "Duskblade",
    tagline: "Burst melee striker feeding on the dark",
    description:
      "The Duskblade fights fast and close, cutting into the space between heartbeats. Umbra builds through the fight itself, fueling harder and harder strikes the longer a battle runs.",
    resource: "umbra",
    resourceName: "Umbra",
    resourceRegenPerSec: 4,
    baseStats: { power: 13, vitality: 11, haste: 0, critChance: 0.1, critDamage: 1.6 },
    color: "#8a3f6b",
    weaponItemId: "weapon_duskblade_daggers",
    altWeaponItemId: "weapon_duskblade_glaive"
  },
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
    weaponItemId: "weapon_warden_blade",
    altWeaponItemId: "weapon_warden_greataxe"
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
    weaponItemId: "weapon_ranger_bow",
    altWeaponItemId: "weapon_ranger_pistols"
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
    weaponItemId: "weapon_mystic_focus",
    altWeaponItemId: "weapon_mystic_scythe"
  }
};

export function listClasses(): ClassDef[] {
  return Object.values(CLASSES);
}
