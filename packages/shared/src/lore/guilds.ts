/**
 * Cross-faction guilds (see docs/DESIGN_EXPANSION.md's "Cross-Faction Guilds and Double-Agent
 * Mechanics") — a persistent social structure players form across the three majors plus the
 * independent standing, the same four buckets `factions.ts` already tracks. The full design also
 * specifies 9 minor-faction alignments, guild halls, missions, and a whole double-agent
 * espionage/detection/confrontation system; none of those exist yet (no minor factions, no guild
 * hall instances, no espionage) — this module only covers what's actually built: creation,
 * membership, ranks, and a shared treasury. See room.ts's "Guilds" section and guilds.ts (server)
 * for the rest.
 */
import { dominantLoyalty, type LoyaltyKey, type LoyaltyScores } from "./factions.js";

export { dominantLoyalty };

export type GuildAlignment = "neutral" | LoyaltyKey;
export type GuildRank = "leader" | "officer" | "member";
export type GuildMembershipStatus = "true_member" | "cross_faction_member" | "free_agent";

export interface GuildAlignmentDef {
  id: GuildAlignment;
  name: string;
  identity: string;
}

export const GUILD_ALIGNMENTS: GuildAlignmentDef[] = [
  { id: "neutral", name: "Neutral", identity: "No faction affiliation — a mercenary or social guild open to anyone." },
  { id: "chainwrights", name: "Chainwright Order", identity: "Supports the Order; military and lawful focus." },
  { id: "luminari", name: "Luminari Covenant", identity: "Supports progress and shard-tech." },
  { id: "paleChoir", name: "Pale Choir", identity: "Supports remembrance and the Moon-Touched." },
  { id: "independent", name: "Independent", identity: "No single faction, but political — common-folk power." }
];

export function getGuildAlignment(id: string): GuildAlignmentDef | undefined {
  return GUILD_ALIGNMENTS.find((a) => a.id === id);
}

export const GUILD_CREATION_COST = 200;
export const GUILD_TAG_MIN_LENGTH = 2;
export const GUILD_TAG_MAX_LENGTH = 4;
export const GUILD_NAME_MAX_LENGTH = 32;
export const MAX_GUILD_MEMBERS = 30;

/** A neutral guild has no aligned faction to be "true" to, so every member is simply a free
 *  agent; otherwise membership reads as true (matches the guild's alignment) or cross-faction
 *  (doesn't) — the design doc's fuller ladder (aligned member, infiltrator) depends on the 9 minor
 *  factions and isn't buildable until those exist. */
export function membershipStatus(alignment: GuildAlignment, loyalty: LoyaltyScores): GuildMembershipStatus {
  if (alignment === "neutral") return "free_agent";
  return dominantLoyalty(loyalty) === alignment ? "true_member" : "cross_faction_member";
}

export function isValidGuildTag(tag: string): boolean {
  return /^[A-Za-z0-9]+$/.test(tag) && tag.length >= GUILD_TAG_MIN_LENGTH && tag.length <= GUILD_TAG_MAX_LENGTH;
}

export function isValidGuildName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 3 && trimmed.length <= GUILD_NAME_MAX_LENGTH;
}
