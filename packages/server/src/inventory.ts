import { ITEMS, RECIPES, type CharacterState, type EquipmentSlot, type ItemRarity } from "@moon/shared";
import { computeEffectiveStats } from "./character.js";
import { maxHpForCharacter, maxResourceForCharacter } from "@moon/shared";

export function addItem(character: CharacterState, itemId: string, quantity: number, rarity: ItemRarity = "common"): void {
  const def = ITEMS.find((i) => i.id === itemId);
  if (!def) return;
  if (def.stackable) {
    const existing = character.inventory.find((s) => s.itemId === itemId && s.rarity === rarity);
    if (existing) {
      existing.quantity += quantity;
      return;
    }
  }
  character.inventory.push({ itemId, quantity, rarity });
}

export function removeItemAt(character: CharacterState, index: number, quantity: number): boolean {
  const stack = character.inventory[index];
  if (!stack || stack.quantity < quantity) return false;
  stack.quantity -= quantity;
  if (stack.quantity <= 0) character.inventory.splice(index, 1);
  return true;
}

export function countItem(character: CharacterState, itemId: string): number {
  return character.inventory.filter((s) => s.itemId === itemId).reduce((sum, s) => sum + s.quantity, 0);
}

export function removeItemsById(character: CharacterState, itemId: string, quantity: number): boolean {
  if (countItem(character, itemId) < quantity) return false;
  let remaining = quantity;
  for (let i = character.inventory.length - 1; i >= 0 && remaining > 0; i--) {
    const stack = character.inventory[i];
    if (stack.itemId !== itemId) continue;
    const take = Math.min(stack.quantity, remaining);
    stack.quantity -= take;
    remaining -= take;
    if (stack.quantity <= 0) character.inventory.splice(i, 1);
  }
  return remaining === 0;
}

export type CraftResult = { ok: true; itemId: string; quantity: number } | { ok: false; reason: string };

export function craft(character: CharacterState, recipeId: string): CraftResult {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return { ok: false, reason: "Unknown recipe." };
  if (character.level < recipe.requiredLevel) return { ok: false, reason: `Requires level ${recipe.requiredLevel}.` };
  for (const input of recipe.inputs) {
    if (countItem(character, input.itemId) < input.quantity) {
      const def = ITEMS.find((i) => i.id === input.itemId);
      return { ok: false, reason: `Not enough ${def?.name ?? input.itemId}.` };
    }
  }
  for (const input of recipe.inputs) {
    removeItemsById(character, input.itemId, input.quantity);
  }
  addItem(character, recipe.resultItemId, recipe.resultQuantity, "common");
  return { ok: true, itemId: recipe.resultItemId, quantity: recipe.resultQuantity };
}

export type EquipResult = { ok: true; slot: EquipmentSlot } | { ok: false; reason: string };

export function equipItem(character: CharacterState, inventoryIndex: number): EquipResult {
  const stack = character.inventory[inventoryIndex];
  if (!stack) return { ok: false, reason: "Empty slot." };
  const def = ITEMS.find((i) => i.id === stack.itemId);
  if (!def || !def.slot) return { ok: false, reason: "That item cannot be equipped." };
  if (def.classId && def.classId !== character.classId) return { ok: false, reason: "Wrong class for this item." };

  const previous = character.equipment[def.slot];
  character.equipment[def.slot] = { itemId: stack.itemId, quantity: 1, rarity: stack.rarity };
  removeItemAt(character, inventoryIndex, 1);
  if (previous) addItem(character, previous.itemId, previous.quantity, previous.rarity);

  refreshDerivedStats(character);
  return { ok: true, slot: def.slot };
}

export function unequipItem(character: CharacterState, slot: EquipmentSlot): EquipResult {
  const current = character.equipment[slot];
  if (!current) return { ok: false, reason: "Nothing equipped there." };
  addItem(character, current.itemId, current.quantity, current.rarity);
  delete character.equipment[slot];
  refreshDerivedStats(character);
  return { ok: true, slot };
}

export function refreshDerivedStats(character: CharacterState): void {
  character.stats = computeEffectiveStats(character);
  const newMaxHp = maxHpForCharacter(character.level, character.stats.vitality);
  const newMaxResource = maxResourceForCharacter(character.level);
  character.hp = Math.min(character.hp, newMaxHp) || newMaxHp;
  character.resource = Math.min(character.resource, newMaxResource);
  character.maxHp = newMaxHp;
  character.maxResource = newMaxResource;
}

export type UseItemResult = { ok: true; heal?: number; restore?: number } | { ok: false; reason: string };

export function useConsumable(character: CharacterState, inventoryIndex: number): UseItemResult {
  const stack = character.inventory[inventoryIndex];
  if (!stack) return { ok: false, reason: "Empty slot." };
  const def = ITEMS.find((i) => i.id === stack.itemId);
  if (!def || def.kind !== "consumable" || !def.useEffect) return { ok: false, reason: "That item cannot be used." };
  removeItemAt(character, inventoryIndex, 1);
  if (def.useEffect.heal) character.hp = Math.min(character.maxHp, character.hp + def.useEffect.heal);
  if (def.useEffect.restore) character.resource = Math.min(character.maxResource, character.resource + def.useEffect.restore);
  return { ok: true, heal: def.useEffect.heal, restore: def.useEffect.restore };
}
