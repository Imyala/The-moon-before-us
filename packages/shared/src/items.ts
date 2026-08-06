import type { ItemDef } from "./types.js";

export const ITEMS: ItemDef[] = [
  // ---- class weapons (starting gear, kit A) ----
  {
    id: "weapon_warden_blade",
    name: "Wayfarer's Blade",
    kind: "weapon",
    slot: "weapon",
    classId: "warden",
    weaponType: "warden_sword_board",
    rarity: "common",
    icon: "sword",
    description: "A dependable sword and board. Steel Strike, Shield Bash, Shield Wall.",
    statBonus: { power: 4 }
  },
  {
    id: "weapon_ranger_bow",
    name: "Wayfarer's Bow",
    kind: "weapon",
    slot: "weapon",
    classId: "ranger",
    weaponType: "ranger_bow",
    rarity: "common",
    icon: "bow",
    description: "A well-worn hunting bow. Quickshot, Piercing Volley, Barrage.",
    statBonus: { power: 4 }
  },
  {
    id: "weapon_mystic_focus",
    name: "Wayfarer's Focus",
    kind: "weapon",
    slot: "weapon",
    classId: "mystic",
    weaponType: "mystic_focus",
    rarity: "common",
    icon: "orb",
    description: "A moonstone focus, humming with Aether. Moonbolt, Lunar Nova, Arcane Surge.",
    statBonus: { power: 4 }
  },

  // ---- class weapons (starting gear, kit B) ----
  {
    id: "weapon_warden_greataxe",
    name: "Wayfarer's Greataxe",
    kind: "weapon",
    slot: "weapon",
    classId: "warden",
    weaponType: "warden_greataxe",
    rarity: "common",
    icon: "sword",
    description: "A brutal two-handed axe. Cleave, Rending Swing, Whirlwind.",
    statBonus: { power: 5 }
  },
  {
    id: "weapon_ranger_pistols",
    name: "Wayfarer's Pistols",
    kind: "weapon",
    slot: "weapon",
    classId: "ranger",
    weaponType: "ranger_pistols",
    rarity: "common",
    icon: "bow",
    description: "A brace of close-range pistols. Twin Shot, Scatter Blast, Evasive Shot.",
    statBonus: { power: 4, critChance: 0.02 }
  },
  {
    id: "weapon_mystic_scythe",
    name: "Wayfarer's Scythe",
    kind: "weapon",
    slot: "weapon",
    classId: "mystic",
    weaponType: "mystic_scythe",
    rarity: "common",
    icon: "orb",
    description: "A melee scythe wreathed in dark Aether. Reap, Dark Harvest, Gravity Well.",
    statBonus: { power: 5 }
  },

  // ---- crafted weapons (sword & board / bow / focus line) ----
  {
    id: "weapon_iron_sword",
    name: "Iron Sword",
    kind: "weapon",
    slot: "weapon",
    classId: "warden",
    weaponType: "warden_sword_board",
    rarity: "uncommon",
    icon: "sword",
    description: "Forged from smelted iron ore.",
    statBonus: { power: 9, vitality: 2 }
  },
  {
    id: "weapon_hunting_bow",
    name: "Hunting Longbow",
    kind: "weapon",
    slot: "weapon",
    classId: "ranger",
    weaponType: "ranger_bow",
    rarity: "uncommon",
    icon: "bow",
    description: "A longbow strung with braided sinew.",
    statBonus: { power: 9, critChance: 0.02 }
  },
  {
    id: "weapon_moon_focus",
    name: "Moonlit Focus",
    kind: "weapon",
    slot: "weapon",
    classId: "mystic",
    weaponType: "mystic_focus",
    rarity: "uncommon",
    icon: "orb",
    description: "A focus infused with captured moonlight.",
    statBonus: { power: 10 }
  },
  {
    id: "weapon_silver_blade",
    name: "Silvered Greatblade",
    kind: "weapon",
    slot: "weapon",
    classId: "warden",
    weaponType: "warden_sword_board",
    rarity: "rare",
    icon: "sword",
    description: "Silver-edged steel, cold to the touch.",
    statBonus: { power: 16, vitality: 4 }
  },
  {
    id: "weapon_starlight_bow",
    name: "Starlight Recurve",
    kind: "weapon",
    slot: "weapon",
    classId: "ranger",
    weaponType: "ranger_bow",
    rarity: "rare",
    icon: "bow",
    description: "Fletched with feathers that never quite touch the ground.",
    statBonus: { power: 17, critChance: 0.04 }
  },
  {
    id: "weapon_starlight_focus",
    name: "Starlight Conduit",
    kind: "weapon",
    slot: "weapon",
    classId: "mystic",
    weaponType: "mystic_focus",
    rarity: "rare",
    icon: "orb",
    description: "A conduit that channels the deep well of the night sky.",
    statBonus: { power: 18 }
  },

  // ---- armor (single "armor" slot for simplicity) ----
  {
    id: "armor_travelers_garb",
    name: "Traveler's Garb",
    kind: "armor",
    slot: "armor",
    rarity: "common",
    icon: "armor",
    description: "Simple, sturdy clothing.",
    statBonus: { vitality: 3 }
  },
  {
    id: "armor_ironhide_vest",
    name: "Ironhide Vest",
    kind: "armor",
    slot: "armor",
    rarity: "uncommon",
    icon: "armor",
    description: "Boiled leather reinforced with iron studs.",
    statBonus: { vitality: 7, power: 2 }
  },
  {
    id: "armor_moonweave_robe",
    name: "Moonweave Robe",
    kind: "armor",
    slot: "armor",
    rarity: "rare",
    icon: "armor",
    description: "Woven from thread spun under a full moon.",
    statBonus: { vitality: 10, power: 6, haste: 0.03 }
  },
  {
    id: "armor_smiths_bulwark_plate",
    name: "Smith's Bulwark Plate",
    kind: "armor",
    slot: "armor",
    rarity: "rare",
    icon: "armor",
    description: "Hand-forged plate only a Smith knows how to temper correctly.",
    statBonus: { vitality: 14, power: 3 }
  },

  // ---- trinkets ----
  {
    id: "trinket_lucky_charm",
    name: "Lucky Charm",
    kind: "trinket",
    slot: "trinket",
    rarity: "uncommon",
    icon: "charm",
    description: "Faintly warm to the touch. Sharpens your reflexes.",
    statBonus: { critChance: 0.04 }
  },
  {
    id: "trinket_moon_pendant",
    name: "Moon Pendant",
    kind: "trinket",
    slot: "trinket",
    rarity: "rare",
    icon: "charm",
    description: "A pendant that pulses in time with the tides.",
    statBonus: { power: 5, haste: 0.05 }
  },
  {
    id: "trinket_wildheart_charm",
    name: "Wildheart Charm",
    kind: "trinket",
    slot: "trinket",
    rarity: "rare",
    icon: "charm",
    description: "Woven from glade-grown vines by a Naturalist's hand.",
    statBonus: { critChance: 0.04, haste: 0.04 }
  },

  // ---- materials ----
  { id: "mat_iron_ore", name: "Iron Ore", kind: "material", rarity: "common", icon: "ore", description: "Raw iron ore.", stackable: true },
  { id: "mat_wood", name: "Timber", kind: "material", rarity: "common", icon: "wood", description: "Cut timber.", stackable: true },
  { id: "mat_herb", name: "Silverleaf Herb", kind: "material", rarity: "common", icon: "herb", description: "A common healing herb.", stackable: true },
  { id: "mat_essence", name: "Wisp Essence", kind: "material", rarity: "common", icon: "essence", description: "Condensed magical residue.", stackable: true },
  { id: "mat_silver_ore", name: "Silver Ore", kind: "material", rarity: "uncommon", icon: "ore", description: "Ore veined with silver.", stackable: true },
  { id: "mat_moonpetal", name: "Moonpetal", kind: "material", rarity: "uncommon", icon: "herb", description: "A petal that glows faintly at night.", stackable: true },
  { id: "mat_starlight_essence", name: "Starlight Essence", kind: "material", rarity: "rare", icon: "essence", description: "Essence distilled from starlight itself.", stackable: true },

  // ---- consumables ----
  {
    id: "potion_minor_health",
    name: "Minor Health Draught",
    kind: "consumable",
    rarity: "common",
    icon: "potion_red",
    description: "Restores a modest amount of health.",
    useEffect: { heal: 40 },
    stackable: true
  },
  {
    id: "potion_minor_resource",
    name: "Minor Clarity Draught",
    kind: "consumable",
    rarity: "common",
    icon: "potion_blue",
    description: "Restores a modest amount of your resource.",
    useEffect: { restore: 35 },
    stackable: true
  },
  {
    id: "potion_greater_health",
    name: "Greater Health Draught",
    kind: "consumable",
    rarity: "uncommon",
    icon: "potion_red",
    description: "Restores a large amount of health.",
    useEffect: { heal: 90 },
    stackable: true
  },
  {
    id: "potion_elixir_full_moon",
    name: "Elixir of the Full Moon",
    kind: "consumable",
    rarity: "rare",
    icon: "potion_blue",
    description: "An Alchemist's masterwork brew, restoring both health and resource at once.",
    useEffect: { heal: 70, restore: 50 },
    stackable: true
  }
];

export function getItem(id: string): ItemDef | undefined {
  return ITEMS.find((i) => i.id === id);
}
