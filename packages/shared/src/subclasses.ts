import type { SubclassDef } from "./types.js";

export const SUBCLASSES: SubclassDef[] = [
  {
    id: "smith",
    name: "Smith",
    tagline: "Forge more from less",
    description: "A dedicated armorer and weaponsmith. Every recipe costs less material, and only a Smith can forge the Bulwark Plate.",
    craftMaterialDiscountPct: 0.2,
    potionYieldBonus: 0,
    gatherBonusQty: 0,
    exclusiveRecipeId: "recipe_smiths_bulwark_plate"
  },
  {
    id: "alchemist",
    name: "Alchemist",
    tagline: "One brew, two draughts",
    description: "A student of tinctures and elixirs. Every potion recipe yields an extra draught, and only an Alchemist can brew the Elixir of the Full Moon.",
    craftMaterialDiscountPct: 0,
    potionYieldBonus: 1,
    gatherBonusQty: 0,
    exclusiveRecipeId: "recipe_elixir_full_moon"
  },
  {
    id: "naturalist",
    name: "Naturalist",
    tagline: "The glade provides",
    description: "Attuned to the wild. Every successful gather yields extra material, and only a Naturalist can craft the Wildheart Charm.",
    craftMaterialDiscountPct: 0,
    potionYieldBonus: 0,
    gatherBonusQty: 1,
    exclusiveRecipeId: "recipe_wildheart_charm"
  }
];

export function getSubclass(id: string): SubclassDef | undefined {
  return SUBCLASSES.find((s) => s.id === id);
}
