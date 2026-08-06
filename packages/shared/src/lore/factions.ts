/**
 * The three powers pulling on the Moonthread (see docs/GDD.md). "independent" isn't a faction
 * players join so much as a standing reputation with the common folk who belong to none of them.
 */
export type FactionId = "chainwrights" | "luminari" | "paleChoir";

export interface FactionDef {
  id: FactionId;
  name: string;
  title: string;
  philosophy: string;
  color: string;
}

export const FACTIONS: Record<FactionId, FactionDef> = {
  chainwrights: {
    id: "chainwrights",
    name: "Chainwrights",
    title: "Order of the Silver Thread",
    philosophy: "The Moonthread must be repaired and tightened. Selen must remain a battery for Aethon.",
    color: "#d9c98a"
  },
  luminari: {
    id: "luminari",
    name: "Luminari",
    title: "The Free Moon",
    philosophy: "Selen's energy belongs to all. Shards should be used to uplift Aethon, not hoarded.",
    color: "#7fb0d8"
  },
  paleChoir: {
    id: "paleChoir",
    name: "Pale Choir",
    title: "The Duskborne",
    philosophy: "Selen is suffering. The tether is cruelty. Let the moon die with dignity.",
    color: "#c9c3d6"
  }
};

export type LoyaltyKey = FactionId | "independent";

export type LoyaltyScores = Record<LoyaltyKey, number>;

export const DEFAULT_LOYALTY: LoyaltyScores = {
  chainwrights: 0,
  luminari: 0,
  paleChoir: 0,
  independent: 0
};

export function clampLoyalty(score: number): number {
  return Math.max(-100, Math.min(100, score));
}

export type LoyaltyState = "exalted" | "trusted" | "friendly" | "neutral" | "suspicious" | "hostile" | "hunted";

/** Section 4.2's faction-state ladder. */
export function loyaltyState(score: number): LoyaltyState {
  if (score >= 80) return "exalted";
  if (score >= 40) return "trusted";
  if (score >= 10) return "friendly";
  if (score >= -9) return "neutral";
  if (score >= -39) return "suspicious";
  if (score >= -79) return "hostile";
  return "hunted";
}

export interface LoyaltyDelta {
  chainwrights?: number;
  luminari?: number;
  paleChoir?: number;
  independent?: number;
}

export function applyLoyaltyDelta(scores: LoyaltyScores, delta: LoyaltyDelta): LoyaltyScores {
  return {
    chainwrights: clampLoyalty(scores.chainwrights + (delta.chainwrights ?? 0)),
    luminari: clampLoyalty(scores.luminari + (delta.luminari ?? 0)),
    paleChoir: clampLoyalty(scores.paleChoir + (delta.paleChoir ?? 0)),
    independent: clampLoyalty(scores.independent + (delta.independent ?? 0))
  };
}
