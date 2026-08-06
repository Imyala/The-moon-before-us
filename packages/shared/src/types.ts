import type { Vec3 } from "./vec.js";
import type { LoyaltyScores } from "./lore/factions.js";
import type { NpcMemoryState } from "./lore/memory.js";

export type PlayerClassId = "warden" | "ranger" | "mystic" | "duskblade";

/** How many companions a character can have active at once (see CharacterState.companionIds). */
export const MAX_COMPANIONS = 2;

export type ResourceType = "resolve" | "focus" | "aether" | "umbra";

export interface StatBlock {
  power: number; // scales ability damage & healing
  vitality: number; // scales max HP
  haste: number; // % cooldown reduction, 0-0.6
  critChance: number; // 0-1
  critDamage: number; // multiplier, default 1.5
}

export const BASE_STATS: StatBlock = {
  power: 10,
  vitality: 10,
  haste: 0,
  critChance: 0.05,
  critDamage: 1.5
};

export type EquipmentSlot = "weapon" | "armor" | "trinket";

export type WeaponType =
  | "warden_sword_board"
  | "warden_greataxe"
  | "ranger_bow"
  | "ranger_pistols"
  | "mystic_focus"
  | "mystic_scythe"
  | "duskblade_daggers"
  | "duskblade_glaive";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic";

export const RARITY_MULTIPLIER: Record<ItemRarity, number> = {
  common: 1,
  uncommon: 1.35,
  rare: 1.8,
  epic: 2.4
};

export type ItemKind = "weapon" | "armor" | "trinket" | "material" | "consumable";

export interface ItemDef {
  id: string;
  name: string;
  kind: ItemKind;
  slot?: EquipmentSlot; // present for weapon/armor/trinket
  classId?: PlayerClassId; // weapons are class-restricted
  weaponType?: WeaponType; // present for weapons; determines which weapon-tier abilities are active
  rarity: ItemRarity;
  icon: string; // simple icon key used by client UI
  description: string;
  statBonus?: Partial<StatBlock>; // for equippable items, at rarity=common baseline (scaled by RARITY_MULTIPLIER)
  useEffect?: { heal?: number; restore?: number }; // for consumables
  stackable?: boolean;
}

export interface ItemStack {
  itemId: string;
  quantity: number;
  rarity: ItemRarity;
}

export interface RecipeDef {
  id: string;
  name: string;
  resultItemId: string;
  resultQuantity: number;
  requiredLevel: number;
  requiredSubclass?: string; // if set, only that subclass can learn/craft this recipe
  inputs: { itemId: string; quantity: number }[];
  description: string;
}

export type AbilityEffectType = "damage" | "heal" | "buff" | "debuff" | "cc" | "aoe_damage" | "aoe_heal";

export type AbilityTier = "weapon" | "utility" | "elite";

export interface AbilityDef {
  id: string;
  classId: PlayerClassId;
  tier: AbilityTier;
  weaponType?: WeaponType; // present when tier === "weapon"; ability is only active with this weapon equipped
  specializationId?: string; // present when tier === "elite"; ability is only active with this specialization chosen
  special?: string; // id of a custom hand-written effect handler, for elites whose effect doesn't fit the generic pipeline
  slot: number; // 1-6, hotbar position
  name: string;
  description: string;
  resource: ResourceType;
  resourceCost: number;
  cooldownMs: number;
  castTimeMs: number;
  range: number;
  radius: number; // 0 = single target
  effect: AbilityEffectType;
  basePower: number; // base damage/heal before power-stat scaling
  powerScale: number; // multiplier applied to caster.power
  ccDurationMs?: number; // for cc/debuff effects (stun/root/slow), or buff/special duration
  maxRanks: number;
}

export interface SpecializationDef {
  id: string;
  classId: PlayerClassId;
  name: string;
  tagline: string;
  description: string;
  mechanicDescription: string; // describes the passive mechanic change, shown in UI
  unlockLevel: number;
  color: string;
}

export interface SubclassDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  craftMaterialDiscountPct: number; // 0-1, reduces recipe input quantities
  potionYieldBonus: number; // extra potions produced per potion-recipe craft
  gatherBonusQty: number; // extra material per successful gather roll
  exclusiveRecipeId: string;
}

export interface EnemyLootEntry {
  itemId: string;
  chance: number; // 0-1
  minQty: number;
  maxQty: number;
}

export interface EnemyDef {
  id: string;
  name: string;
  tier: "minion" | "elite" | "boss";
  maxHp: number;
  power: number;
  moveSpeed: number;
  aggroRadius: number;
  attackRange: number;
  attackDamage: number;
  attackCooldownMs: number;
  attackTelegraphMs: number;
  xpReward: number;
  loot: EnemyLootEntry[];
  scale: number; // visual scale multiplier
  color: string; // hex color for stylized low-poly body
  /** Overrides the server's default enemy respawn timer — used for dungeon bosses to create a real lockout. */
  respawnMs?: number;
}

export type ResourceNodeType = "ore" | "tree" | "herb" | "crystal";

export interface ResourceNodeDef {
  id: string;
  type: ResourceNodeType;
  name: string;
  gatherTimeMs: number;
  respawnMs: number;
  loot: EnemyLootEntry[];
  color: string;
}

export interface CharacterSummary {
  id: string;
  name: string;
  classId: PlayerClassId;
  level: number;
  xp: number;
}

export interface CharacterState extends CharacterSummary {
  hp: number;
  maxHp: number;
  resource: number;
  maxResource: number;
  stats: StatBlock;
  skillPoints: number;
  abilityRanks: Record<string, number>;
  specializationId?: string;
  subclassId?: string;
  inventory: ItemStack[];
  equipment: Partial<Record<EquipmentSlot, ItemStack>>;
  position: Vec3;
  zoneId: string;
  factionLoyalty: LoyaltyScores;
  npcMemory: NpcMemoryState;
  /** Aether-crystal exposure; see lore/moonTouched.ts for the stage thresholds it drives. */
  lunarResonance: number;
  /** NPC ids currently traveling with and fighting for this character, up to MAX_COMPANIONS. */
  companionIds: string[];
  /**
   * Set once, permanently, by resolving the Moonthread Warden's signature choice (see
   * `DialogueOption.locksEndingThread` and lore/endings.ts) — the scripted finale. Until then the
   * Character panel shows `trendingEnding` as a live preview instead of a locked-in result.
   */
  endingId?: string;
}

export function xpForLevel(level: number): number {
  return Math.round(50 * Math.pow(level, 1.65));
}

export function maxHpForCharacter(level: number, vitality: number): number {
  return Math.round(60 + level * 8 + vitality * 4);
}

export function maxResourceForCharacter(level: number): number {
  return Math.round(50 + level * 5);
}

