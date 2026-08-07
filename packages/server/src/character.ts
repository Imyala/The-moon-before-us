import {
  BASE_STATS,
  CLASSES,
  DEFAULT_LOYALTY,
  ITEMS,
  START_ZONE_ID,
  getRace,
  type CharacterState,
  type ItemStack,
  type PlayerClassId,
  type PlayerRaceId,
  type StatBlock,
  maxHpForCharacter,
  maxResourceForCharacter,
  xpForLevel
} from "@moon/shared";
import { randomUUID } from "node:crypto";
import { loadCharacter, saveCharacter } from "./db.js";

const STARTER_ITEMS: ItemStack[] = [
  { itemId: "potion_minor_health", quantity: 3, rarity: "common" },
  { itemId: "mat_herb", quantity: 3, rarity: "common" },
  { itemId: "mat_wood", quantity: 2, rarity: "common" }
];

/** A new character's starting purse — enough for a couple of vendor potions, not enough to skip
 *  gathering or looting (see vendors.ts and inventory.ts's buyFromVendor). */
export const STARTER_GOLD = 40;

/** Falls back to the baseline generalist race for a missing or unrecognized raceId — the same
 *  "safe default rather than reject the join" treatment START_ZONE_ID gets for a bad zoneId. */
export function resolveRaceId(raceId: string | undefined): PlayerRaceId {
  return getRace(raceId ?? "") ? (raceId as PlayerRaceId) : "vaelari";
}

export function getOrCreateCharacter(token: string, name: string, classId: PlayerClassId, raceId?: string): CharacterState {
  const existing = loadCharacter(token);
  if (existing) return existing;

  const cls = CLASSES[classId];
  const stats: StatBlock = { ...BASE_STATS, ...cls.baseStats };
  const maxHp = maxHpForCharacter(1, stats.vitality);
  const maxResource = maxResourceForCharacter(1);

  const character: CharacterState = {
    id: randomUUID(),
    name: sanitizeName(name),
    classId,
    raceId: resolveRaceId(raceId),
    level: 1,
    xp: 0,
    hp: maxHp,
    maxHp,
    resource: maxResource,
    maxResource,
    stats,
    skillPoints: 0,
    abilityRanks: {},
    // Each stack is its own object (not the shared STARTER_ITEMS entries) — every new character
    // otherwise starts out pointing at the very same ItemStack objects as every other character,
    // so mutating one character's starter stack (gathering more, trading it away, crafting with
    // it) silently corrupted every other character's identical starter stack too.
    inventory: [...STARTER_ITEMS.map((item) => ({ ...item })), { itemId: cls.altWeaponItemId, quantity: 1, rarity: "common" }],
    equipment: { weapon: { itemId: cls.weaponItemId, quantity: 1, rarity: "common" } },
    position: { x: 0, y: 0, z: 0 },
    zoneId: START_ZONE_ID,
    factionLoyalty: { ...DEFAULT_LOYALTY },
    npcMemory: {},
    romance: {},
    lunarResonance: 0,
    companionIds: [],
    gold: STARTER_GOLD
  };
  // Recomputed once up front so the starter weapon's statBonus and the racial passive are both
  // reflected from the very first snapshot, rather than only appearing after the first equip or
  // level-up happens to call computeEffectiveStats.
  character.stats = computeEffectiveStats(character);
  character.maxHp = maxHpForCharacter(1, character.stats.vitality);
  character.hp = character.maxHp;
  saveCharacter(token, character);
  return character;
}

export function sanitizeName(raw: string): string {
  const trimmed = (raw ?? "").trim().slice(0, 16);
  return trimmed.length > 0 ? trimmed.replace(/[^\w \-']/g, "") : "Wanderer";
}

export function computeEffectiveStats(character: CharacterState): StatBlock {
  const cls = CLASSES[character.classId];
  const stats: StatBlock = { ...BASE_STATS, ...cls.baseStats };
  const race = getRace(character.raceId);
  if (race) {
    for (const [key, value] of Object.entries(race.passive)) {
      (stats as any)[key] = ((stats as any)[key] ?? 0) + value!;
    }
  }
  for (const slot of Object.values(character.equipment)) {
    if (!slot) continue;
    const def = ITEMS.find((i) => i.id === slot.itemId);
    if (!def?.statBonus) continue;
    const mult = rarityMultiplier(slot.rarity);
    for (const [key, value] of Object.entries(def.statBonus)) {
      (stats as any)[key] = ((stats as any)[key] ?? 0) + value! * mult;
    }
  }
  // small per-level baseline growth
  stats.power += (character.level - 1) * 1.4;
  stats.vitality += (character.level - 1) * 1.1;
  return stats;
}

function rarityMultiplier(rarity: ItemStack["rarity"]): number {
  switch (rarity) {
    case "common":
      return 1;
    case "uncommon":
      return 1.35;
    case "rare":
      return 1.8;
    case "epic":
      return 2.4;
  }
}

/** Applies xp, handles (possibly multiple) level ups in place. Returns levels gained. */
export function grantXp(character: CharacterState, amount: number): number {
  character.xp += amount;
  let levelsGained = 0;
  while (character.xp >= xpForLevel(character.level + 1)) {
    character.level += 1;
    character.skillPoints += 1;
    levelsGained += 1;
  }
  if (levelsGained > 0) {
    character.stats = computeEffectiveStats(character);
    character.maxHp = maxHpForCharacter(character.level, character.stats.vitality);
    character.maxResource = maxResourceForCharacter(character.level);
    character.hp = character.maxHp;
    character.resource = character.maxResource;
  }
  return levelsGained;
}

export { saveCharacter };
