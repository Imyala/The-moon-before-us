import type { RecipeDef } from "./types.js";

export const RECIPES: RecipeDef[] = [
  {
    id: "recipe_health_potion",
    name: "Minor Health Draught",
    resultItemId: "potion_minor_health",
    resultQuantity: 2,
    requiredLevel: 1,
    inputs: [{ itemId: "mat_herb", quantity: 2 }],
    description: "Brew a pair of healing draughts from Silverleaf Herb."
  },
  {
    id: "recipe_resource_potion",
    name: "Minor Clarity Draught",
    resultItemId: "potion_minor_resource",
    resultQuantity: 2,
    requiredLevel: 1,
    inputs: [{ itemId: "mat_essence", quantity: 2 }],
    description: "Distill Wisp Essence into a resource-restoring draught."
  },
  {
    id: "recipe_iron_sword",
    name: "Iron Sword",
    resultItemId: "weapon_iron_sword",
    resultQuantity: 1,
    requiredLevel: 3,
    inputs: [
      { itemId: "mat_iron_ore", quantity: 5 },
      { itemId: "mat_wood", quantity: 2 }
    ],
    description: "Forge a sturdy iron blade for the Warden."
  },
  {
    id: "recipe_hunting_bow",
    name: "Hunting Longbow",
    resultItemId: "weapon_hunting_bow",
    resultQuantity: 1,
    requiredLevel: 3,
    inputs: [
      { itemId: "mat_wood", quantity: 5 },
      { itemId: "mat_iron_ore", quantity: 2 }
    ],
    description: "Craft a longbow strung and reinforced with iron fittings."
  },
  {
    id: "recipe_moon_focus",
    name: "Moonlit Focus",
    resultItemId: "weapon_moon_focus",
    resultQuantity: 1,
    requiredLevel: 3,
    inputs: [
      { itemId: "mat_essence", quantity: 5 },
      { itemId: "mat_iron_ore", quantity: 1 }
    ],
    description: "Bind Wisp Essence into a fresh casting focus."
  },
  {
    id: "recipe_ironhide_vest",
    name: "Ironhide Vest",
    resultItemId: "armor_ironhide_vest",
    resultQuantity: 1,
    requiredLevel: 4,
    inputs: [
      { itemId: "mat_iron_ore", quantity: 4 },
      { itemId: "mat_wood", quantity: 1 }
    ],
    description: "Reinforce leather armor with studded iron plates."
  },
  {
    id: "recipe_greater_health_potion",
    name: "Greater Health Draught",
    resultItemId: "potion_greater_health",
    resultQuantity: 2,
    requiredLevel: 5,
    inputs: [
      { itemId: "mat_moonpetal", quantity: 2 },
      { itemId: "mat_herb", quantity: 3 }
    ],
    description: "A stronger brew, steeped with rare Moonpetal."
  },
  {
    id: "recipe_lucky_charm",
    name: "Lucky Charm",
    resultItemId: "trinket_lucky_charm",
    resultQuantity: 1,
    requiredLevel: 5,
    inputs: [
      { itemId: "mat_silver_ore", quantity: 3 },
      { itemId: "mat_moonpetal", quantity: 2 }
    ],
    description: "Set a sliver of silver ore into a wearable charm."
  },
  {
    id: "recipe_silver_blade",
    name: "Silvered Greatblade",
    resultItemId: "weapon_silver_blade",
    resultQuantity: 1,
    requiredLevel: 8,
    inputs: [
      { itemId: "mat_silver_ore", quantity: 6 },
      { itemId: "mat_starlight_essence", quantity: 1 }
    ],
    description: "A masterwork blade quenched in starlight."
  },
  {
    id: "recipe_starlight_bow",
    name: "Starlight Recurve",
    resultItemId: "weapon_starlight_bow",
    resultQuantity: 1,
    requiredLevel: 8,
    inputs: [
      { itemId: "mat_silver_ore", quantity: 4 },
      { itemId: "mat_starlight_essence", quantity: 2 }
    ],
    description: "A recurve bow fletched with starlit feathers."
  },
  {
    id: "recipe_starlight_focus",
    name: "Starlight Conduit",
    resultItemId: "weapon_starlight_focus",
    resultQuantity: 1,
    requiredLevel: 8,
    inputs: [
      { itemId: "mat_starlight_essence", quantity: 3 },
      { itemId: "mat_moonpetal", quantity: 3 }
    ],
    description: "A conduit wrought entirely from distilled starlight."
  },
  {
    id: "recipe_moonweave_robe",
    name: "Moonweave Robe",
    resultItemId: "armor_moonweave_robe",
    resultQuantity: 1,
    requiredLevel: 9,
    inputs: [
      { itemId: "mat_moonpetal", quantity: 5 },
      { itemId: "mat_starlight_essence", quantity: 2 }
    ],
    description: "Weave a robe from thread spun under a full moon."
  },
  {
    id: "recipe_moon_pendant",
    name: "Moon Pendant",
    resultItemId: "trinket_moon_pendant",
    resultQuantity: 1,
    requiredLevel: 9,
    inputs: [
      { itemId: "mat_starlight_essence", quantity: 3 },
      { itemId: "mat_silver_ore", quantity: 3 }
    ],
    description: "Set starlight essence into a pendant that pulses with the tides."
  }
];

export function getRecipe(id: string): RecipeDef | undefined {
  return RECIPES.find((r) => r.id === id);
}
