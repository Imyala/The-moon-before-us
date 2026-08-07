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

/** The faction (or "independent") a character's own loyalty scores lean toward — a strict
 *  majority, not just the highest of possibly-tied zeros, so a brand-new character with the
 *  default all-zero spread reads as independent rather than arbitrarily favoring whichever major
 *  happens first. Originally written for guild membership status (see lore/guilds.ts); it belongs
 *  here since it's pure faction-loyalty logic with no guild-specific meaning. */
export function dominantLoyalty(loyalty: LoyaltyScores): LoyaltyKey {
  let best: LoyaltyKey = "independent";
  let bestScore = loyalty.independent;
  for (const key of ["chainwrights", "luminari", "paleChoir"] as const) {
    if (loyalty[key] > bestScore) {
      best = key;
      bestScore = loyalty[key];
    }
  }
  return best;
}

/** A single accent color reflecting where a character's loyalties currently lean — the first
 *  piece of `docs/DESIGN_EXPANSION.md`'s "Visual Identity & World Feel" bible's §6.5 "Faction UI
 *  Variants" (a UI tint that shifts based on aligned faction). Independent (or a fresh, unaligned
 *  character) gets a neutral parchment tone rather than any faction's own color. */
export function factionAccentColor(loyalty: LoyaltyScores): string {
  const key = dominantLoyalty(loyalty);
  if (key === "independent") return "#9aa3c9";
  return FACTIONS[key].color;
}
