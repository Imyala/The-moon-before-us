/**
 * Per-NPC memory (section 1 of the NPC memory framework): a small set of tags plus whether
 * you've met them at all. Relationship state is derived from those tags and the player's
 * standing with the NPC's faction — never stored redundantly, so it can't drift out of sync.
 */
import type { LoyaltyKey, LoyaltyScores } from "./factions.js";

export interface NpcMemoryEntry {
  met: boolean;
  tags: string[];
}

export type NpcMemoryState = Record<string, NpcMemoryEntry>;

export function memoryFor(state: NpcMemoryState, npcId: string): NpcMemoryEntry {
  return state[npcId] ?? { met: false, tags: [] };
}

export function withTag(state: NpcMemoryState, npcId: string, tag: string): NpcMemoryState {
  const entry = memoryFor(state, npcId);
  if (entry.tags.includes(tag)) return { ...state, [npcId]: { ...entry, met: true } };
  return { ...state, [npcId]: { met: true, tags: [...entry.tags, tag] } };
}

export function markMet(state: NpcMemoryState, npcId: string): NpcMemoryState {
  const entry = memoryFor(state, npcId);
  if (entry.met) return state;
  return { ...state, [npcId]: { ...entry, met: true } };
}

export type RelationshipState = "unknown" | "met" | "friendly" | "trusted" | "hostile";

export type LoyaltyType = "fanatic" | "institutional" | "trueBeliever" | "pragmatic" | "ideological" | "personal" | "mercenary";

/**
 * Fanatics (section 6.1) never forgive a betrayal of their faction, regardless of your current
 * loyalty score; everyone else's relationship follows your standing with the faction (or the
 * general Independent reputation, for NPCs who belong to none) that `gaugeKey` names.
 */
export function computeRelationship(
  gaugeKey: LoyaltyKey,
  loyaltyType: LoyaltyType,
  entry: NpcMemoryEntry,
  loyalty: LoyaltyScores
): RelationshipState {
  if (!entry.met) return "unknown";

  const betrayed = entry.tags.includes(`betrayed_${gaugeKey}`);
  if (betrayed && loyaltyType === "fanatic") return "hostile";

  const score = loyalty[gaugeKey];
  if (score >= 40) return "trusted";
  if (score >= 10) return "friendly";
  if (score <= -40) return "hostile";

  return "met";
}
