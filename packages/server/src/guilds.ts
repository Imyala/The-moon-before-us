import { randomUUID } from "node:crypto";
import {
  DEFAULT_LOYALTY,
  GUILD_CREATION_COST,
  GUILD_NAME_MAX_LENGTH,
  MAX_GUILD_MEMBERS,
  getGuildAlignment,
  isValidGuildName,
  isValidGuildTag,
  membershipStatus,
  type CharacterState,
  type GuildAlignment,
  type GuildInvite,
  type GuildMember,
  type GuildRank,
  type GuildSnapshot,
  type LoyaltyScores
} from "@moon/shared";
import {
  countGuildMembers,
  deleteGuild,
  deleteGuildInvite,
  deleteGuildInvitesForToken,
  deleteGuildMember,
  findTokenByName,
  getGuildById,
  getGuildByName,
  getGuildByTag,
  getGuildInvite,
  getGuildMemberByCharacterId,
  getGuildMembership,
  insertGuild,
  insertGuildInvite,
  insertGuildMember,
  listGuildInvitesForToken,
  listGuildMembers,
  loadCharacter,
  setGuildMemberContribution,
  setGuildMemberRank,
  setGuildTreasury,
  type GuildMemberRow
} from "./db.js";
import { findOnlineTokenByName, getOnlineCharacter, notifyGuildChange } from "./presence.js";

/**
 * Cross-faction guilds (see docs/DESIGN_EXPANSION.md's "Cross-Faction Guilds and Double-Agent
 * Mechanics" and lore/guilds.ts). Global and cross-room like the auction house — a guild's
 * membership must outlive any one member's session — so every function here works off tokens and
 * the database rather than a Room's in-memory entities, and callers pass in whichever live
 * `CharacterState` they already have (for gold/name/id) the same way auctionHouse.ts does.
 */
export type GuildResult = { ok: true } | { ok: false; reason: string };

export function createGuild(character: CharacterState, token: string, name: string, tag: string, alignment: GuildAlignment): GuildResult {
  if (getGuildMembership(token)) return { ok: false, reason: "You're already in a guild." };
  if (!isValidGuildName(name)) return { ok: false, reason: `Guild name must be 3-${GUILD_NAME_MAX_LENGTH} characters.` };
  if (!isValidGuildTag(tag)) return { ok: false, reason: "Guild tag must be 2-4 letters or numbers." };
  if (!getGuildAlignment(alignment)) return { ok: false, reason: "Unknown guild alignment." };
  if (getGuildByName(name)) return { ok: false, reason: "That guild name is already taken." };
  if (getGuildByTag(tag)) return { ok: false, reason: "That guild tag is already taken." };
  if (character.gold < GUILD_CREATION_COST) return { ok: false, reason: `Founding a guild costs ${GUILD_CREATION_COST} gold.` };

  character.gold -= GUILD_CREATION_COST;
  const guildId = randomUUID();
  const now = Date.now();
  insertGuild({ id: guildId, name: name.trim(), tag: tag.toUpperCase(), alignment, treasuryGold: 0, createdAt: now });
  insertGuildMember({
    guildId,
    playerToken: token,
    playerCharacterId: character.id,
    playerName: character.name,
    rank: "leader",
    contributionGold: 0,
    joinedAt: now
  });
  return { ok: true };
}

export function inviteToGuild(character: CharacterState, token: string, playerName: string): GuildResult {
  const membership = getGuildMembership(token);
  if (!membership) return { ok: false, reason: "You're not in a guild." };
  if (membership.rank === "member") return { ok: false, reason: "Only guild leaders and officers can invite." };
  const guild = getGuildById(membership.guildId);
  if (!guild) return { ok: false, reason: "Your guild no longer exists." };
  if (countGuildMembers(guild.id) >= MAX_GUILD_MEMBERS) return { ok: false, reason: `Guilds are capped at ${MAX_GUILD_MEMBERS} members.` };

  const targetToken = findOnlineTokenByName(playerName) ?? findTokenByName(playerName);
  if (!targetToken) return { ok: false, reason: `No character named "${playerName}".` };
  if (targetToken === token) return { ok: false, reason: "You can't invite yourself." };
  if (getGuildMembership(targetToken)) return { ok: false, reason: `${playerName} is already in a guild.` };
  if (getGuildInvite(guild.id, targetToken)) return { ok: false, reason: `${playerName} already has a pending invite from this guild.` };

  insertGuildInvite({ guildId: guild.id, inviteeToken: targetToken, inviteeName: playerName, invitedByName: character.name, createdAt: Date.now() });
  notifyGuildChange(targetToken);
  return { ok: true };
}

export function respondToGuildInvite(character: CharacterState, token: string, guildId: string, accept: boolean): GuildResult {
  const invite = getGuildInvite(guildId, token);
  if (!invite) return { ok: false, reason: "That invite is gone." };
  if (!accept) {
    deleteGuildInvite(guildId, token);
    return { ok: true };
  }
  if (getGuildMembership(token)) return { ok: false, reason: "You're already in a guild." };
  const guild = getGuildById(guildId);
  if (!guild) {
    deleteGuildInvite(guildId, token);
    return { ok: false, reason: "That guild no longer exists." };
  }
  if (countGuildMembers(guildId) >= MAX_GUILD_MEMBERS) return { ok: false, reason: `Guilds are capped at ${MAX_GUILD_MEMBERS} members.` };

  insertGuildMember({
    guildId,
    playerToken: token,
    playerCharacterId: character.id,
    playerName: character.name,
    rank: "member",
    contributionGold: 0,
    joinedAt: Date.now()
  });
  deleteGuildInvitesForToken(token);
  return { ok: true };
}

/** Leaving as the last member disbands the guild outright. Leaving as the leader with members
 *  still present hands leadership to the longest-tenured officer, or the longest-tenured member
 *  if there are no officers — never leaves a guild leaderless. */
export function leaveGuild(token: string): GuildResult {
  const membership = getGuildMembership(token);
  if (!membership) return { ok: false, reason: "You're not in a guild." };
  const guildId = membership.guildId;
  deleteGuildMember(guildId, token);

  if (membership.rank === "leader") {
    const remaining = listGuildMembers(guildId);
    if (remaining.length === 0) {
      deleteGuild(guildId);
    } else {
      const nextLeader = remaining.find((m) => m.rank === "officer") ?? remaining[0];
      setGuildMemberRank(guildId, nextLeader.playerToken, "leader");
      notifyGuildChange(nextLeader.playerToken);
    }
  }
  return { ok: true };
}

export function kickGuildMember(token: string, targetMemberId: string): GuildResult {
  const membership = getGuildMembership(token);
  if (!membership) return { ok: false, reason: "You're not in a guild." };
  if (membership.rank === "member") return { ok: false, reason: "Only leaders and officers can remove members." };
  const target = getGuildMemberByCharacterId(membership.guildId, targetMemberId);
  if (!target) return { ok: false, reason: "That member isn't in your guild." };
  if (target.playerToken === token) return { ok: false, reason: "Use Leave Guild to leave yourself." };
  if (target.rank === "leader") return { ok: false, reason: "You can't remove the guild leader." };
  if (membership.rank === "officer" && target.rank === "officer") return { ok: false, reason: "Officers can't remove other officers." };

  deleteGuildMember(membership.guildId, target.playerToken);
  notifyGuildChange(target.playerToken);
  return { ok: true };
}

export function setMemberRank(token: string, targetMemberId: string, rank: "officer" | "member"): GuildResult {
  const membership = getGuildMembership(token);
  if (!membership) return { ok: false, reason: "You're not in a guild." };
  if (membership.rank !== "leader") return { ok: false, reason: "Only the guild leader can change ranks." };
  const target = getGuildMemberByCharacterId(membership.guildId, targetMemberId);
  if (!target) return { ok: false, reason: "That member isn't in your guild." };
  if (target.rank === "leader") return { ok: false, reason: "The leader's own rank can't be changed this way." };

  setGuildMemberRank(membership.guildId, target.playerToken, rank);
  notifyGuildChange(target.playerToken);
  return { ok: true };
}

export function donateToGuild(character: CharacterState, token: string, amount: number): GuildResult {
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, reason: "Invalid donation amount." };
  const membership = getGuildMembership(token);
  if (!membership) return { ok: false, reason: "You're not in a guild." };
  if (character.gold < amount) return { ok: false, reason: "Not enough gold." };
  const guild = getGuildById(membership.guildId);
  if (!guild) return { ok: false, reason: "Your guild no longer exists." };

  character.gold -= amount;
  setGuildTreasury(guild.id, guild.treasuryGold + amount);
  setGuildMemberContribution(guild.id, token, membership.contributionGold + amount);
  return { ok: true };
}

function loyaltyFor(row: GuildMemberRow, callerToken: string, callerCharacter: CharacterState): LoyaltyScores {
  if (row.playerToken === callerToken) return callerCharacter.factionLoyalty;
  const online = getOnlineCharacter(row.playerToken);
  if (online) return online.factionLoyalty;
  return loadCharacter(row.playerToken)?.factionLoyalty ?? DEFAULT_LOYALTY;
}

/** The caller's full guild picture — see GuildStateMessage. Membership status per roster row is
 *  computed fresh from each member's *current* faction loyalty every time this is built, never
 *  stored, so it can't drift out of sync the way a cached field could. */
export function buildGuildStateFor(character: CharacterState, token: string): { guild: GuildSnapshot | null; invites: GuildInvite[] } {
  const membership = getGuildMembership(token);
  if (!membership) {
    const invites = listGuildInvitesForToken(token)
      .map((inv) => {
        const guild = getGuildById(inv.guildId);
        if (!guild) return null;
        const snapshot: GuildInvite = {
          guildId: inv.guildId,
          name: guild.name,
          tag: guild.tag,
          alignment: guild.alignment as GuildAlignment,
          invitedByName: inv.invitedByName
        };
        return snapshot;
      })
      .filter((x): x is GuildInvite => x !== null);
    return { guild: null, invites };
  }

  const guildRow = getGuildById(membership.guildId);
  if (!guildRow) return { guild: null, invites: [] };
  const alignment = guildRow.alignment as GuildAlignment;
  const members: GuildMember[] = listGuildMembers(guildRow.id).map((row) => ({
    memberId: row.playerCharacterId,
    name: row.playerName,
    rank: row.rank as GuildRank,
    status: membershipStatus(alignment, loyaltyFor(row, token, character)),
    contributionGold: row.contributionGold
  }));

  return {
    guild: { id: guildRow.id, name: guildRow.name, tag: guildRow.tag, alignment, treasuryGold: guildRow.treasuryGold, members },
    invites: []
  };
}
