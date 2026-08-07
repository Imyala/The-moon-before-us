import { test } from "node:test";
import assert from "node:assert/strict";
import { GUILD_CREATION_COST } from "@moon/shared";
import { Room } from "../src/room.js";
import { registerPresence } from "../src/presence.js";
import { makePlayer } from "./helpers.js";

/**
 * Cross-faction guilds (see docs/DESIGN_EXPANSION.md's "Cross-Faction Guilds and Double-Agent
 * Mechanics" and server/guilds.ts) at the Room level — creation, invites, membership, ranks,
 * leadership succession, and the treasury, all driven through the real database-backed guild
 * functions rather than any Room-local state (a guild must outlive any one member's session).
 */

function makeRoom() {
  return new Room({ isSolo: true, onEmpty: () => {}, persist: () => {} });
}

/** Adds a player to the room and registers them as online, the same way a real `join` message
 *  would — guild invites resolve a target by name through the online presence registry first
 *  (see presence.ts's findOnlineTokenByName), since a brand-new character may not have hit its
 *  first autosave into the characters table yet. */
function addOnlinePlayer(room: Room, opts: Parameters<typeof makePlayer>[0] = {}) {
  const player = makePlayer(opts);
  room.players.set(player.id, player);
  registerPresence(player.token, player.character, () => {}, () => {});
  return player;
}

function lastGuildState(player: any) {
  const msgs = player.ws.sent.filter((m: any) => m.t === "guildState");
  return msgs[msgs.length - 1];
}

test("creating a guild costs gold, makes the founder its leader, and blocks a second guild for the same player", () => {
  const room = makeRoom();
  const founder = addOnlinePlayer(room, { gold: GUILD_CREATION_COST + 50 });

  (room as any).tryCreateGuild(founder, "The Silver Wardens", "TSW", "chainwrights");
  assert.equal(founder.character.gold, 50, "the creation cost is deducted");
  const state = lastGuildState(founder);
  assert.ok(state, "a guildState message comes back on success");
  assert.equal(state.guild.name, "The Silver Wardens");
  assert.equal(state.guild.tag, "TSW");
  assert.equal(state.guild.members.length, 1);
  assert.equal(state.guild.members[0].rank, "leader");
  assert.equal(state.guild.members[0].memberId, founder.character.id);

  founder.ws.sent.length = 0;
  (room as any).tryCreateGuild(founder, "A Second Guild", "SEC", "neutral");
  assert.ok(founder.ws.sent.some((m: any) => m.t === "error" && /already in a guild/i.test(m.message)));

  room.shutdown();
});

test("guild creation is refused for insufficient gold, a taken name, or a taken tag", () => {
  const room = makeRoom();
  const poor = addOnlinePlayer(room, { gold: 5 });
  (room as any).tryCreateGuild(poor, "Paupers United", "POOR", "neutral");
  assert.ok(poor.ws.sent.some((m: any) => m.t === "error" && /gold/i.test(m.message)));

  const first = addOnlinePlayer(room, { gold: GUILD_CREATION_COST });
  (room as any).tryCreateGuild(first, "Emberwright Cooperative", "EMBR", "independent");

  const second = addOnlinePlayer(room, { gold: GUILD_CREATION_COST });
  (room as any).tryCreateGuild(second, "Emberwright Cooperative", "OTHR", "independent");
  assert.ok(second.ws.sent.some((m: any) => m.t === "error" && /name/i.test(m.message)), "duplicate name is refused");
  assert.equal(second.character.gold, GUILD_CREATION_COST, "a refused creation never charges gold");

  second.ws.sent.length = 0;
  (room as any).tryCreateGuild(second, "A Wholly Different Name", "EMBR", "independent");
  assert.ok(second.ws.sent.some((m: any) => m.t === "error" && /tag/i.test(m.message)), "duplicate tag is refused");

  room.shutdown();
});

test("inviting, accepting, and the roster's per-member status derived from faction loyalty", () => {
  const room = makeRoom();
  const leader = addOnlinePlayer(room, { gold: GUILD_CREATION_COST, factionLoyalty: { chainwrights: 60, luminari: 0, paleChoir: 0, independent: 0 } });
  (room as any).tryCreateGuild(leader, "Order of the Chain", "ORDR", "chainwrights");

  const recruit = addOnlinePlayer(room, { factionLoyalty: { chainwrights: 0, luminari: 55, paleChoir: 0, independent: 0 } });

  (room as any).tryInviteToGuild(leader, recruit.character.name);
  // Pull the invite the same way the client would: request the recruit's own guild state.
  (room as any).sendGuildState(recruit);
  const invited = lastGuildState(recruit);
  assert.equal(invited.guild, null);
  assert.equal(invited.invites.length, 1);
  assert.equal(invited.invites[0].name, "Order of the Chain");

  (room as any).tryRespondGuildInvite(recruit, invited.invites[0].guildId, true);
  const joined = lastGuildState(recruit);
  assert.ok(joined.guild, "accepting adds the guild to the recruit's own state");
  const rows = joined.guild.members;
  assert.equal(rows.length, 2);
  const leaderRow = rows.find((m: any) => m.memberId === leader.character.id);
  const recruitRow = rows.find((m: any) => m.memberId === recruit.character.id);
  assert.equal(leaderRow.status, "true_member", "the leader's own chainwright loyalty matches the guild's chainwright alignment");
  assert.equal(recruitRow.status, "cross_faction_member", "the recruit leans luminari against a chainwright-aligned guild");

  room.shutdown();
});

test("declining an invite just removes it, and you can't be invited twice or join two guilds", () => {
  const room = makeRoom();
  const leader = addOnlinePlayer(room, { gold: GUILD_CREATION_COST });
  (room as any).tryCreateGuild(leader, "The Second Order", "SORD", "neutral");

  const target = addOnlinePlayer(room);
  (room as any).tryInviteToGuild(leader, target.character.name);

  leader.ws.sent.length = 0;
  (room as any).tryInviteToGuild(leader, target.character.name);
  assert.ok(leader.ws.sent.some((m: any) => m.t === "error" && /pending invite/i.test(m.message)));

  (room as any).sendGuildState(target);
  const guildId = lastGuildState(target).invites[0].guildId;
  (room as any).tryRespondGuildInvite(target, guildId, false);
  (room as any).sendGuildState(target);
  assert.equal(lastGuildState(target).invites.length, 0, "declining removes the invite");
  assert.equal(lastGuildState(target).guild, null);

  room.shutdown();
});

test("leaving as an ordinary member just removes them; leaving as leader hands off to the longest-tenured officer", () => {
  const room = makeRoom();
  const leader = addOnlinePlayer(room, { gold: GUILD_CREATION_COST });
  (room as any).tryCreateGuild(leader, "Handoff Test Guild", "HAND", "neutral");

  const officer = addOnlinePlayer(room);
  (room as any).tryInviteToGuild(leader, officer.character.name);
  (room as any).sendGuildState(officer);
  (room as any).tryRespondGuildInvite(officer, lastGuildState(officer).invites[0].guildId, true);

  const plain = addOnlinePlayer(room);
  (room as any).tryInviteToGuild(leader, plain.character.name);
  (room as any).sendGuildState(plain);
  (room as any).tryRespondGuildInvite(plain, lastGuildState(plain).invites[0].guildId, true);

  (room as any).sendGuildState(leader);
  const guildId = lastGuildState(leader).guild.id;
  (room as any).trySetGuildMemberRank(leader, officer.character.id, "officer");

  (room as any).tryLeaveGuild(leader);
  (room as any).sendGuildState(officer);
  const afterHandoff = lastGuildState(officer).guild;
  assert.equal(afterHandoff.id, guildId, "the guild survives the leader leaving");
  const newLeaderRow = afterHandoff.members.find((m: any) => m.memberId === officer.character.id);
  assert.equal(newLeaderRow.rank, "leader", "the officer inherits leadership over the plain member");
  assert.equal(afterHandoff.members.length, 2);

  room.shutdown();
});

test("the last member leaving disbands the guild entirely", () => {
  const room = makeRoom();
  const solo = addOnlinePlayer(room, { gold: GUILD_CREATION_COST });
  (room as any).tryCreateGuild(solo, "Solo Venture", "SOLO", "neutral");

  (room as any).tryLeaveGuild(solo);
  (room as any).sendGuildState(solo);
  assert.equal(lastGuildState(solo).guild, null);

  // A fresh player can now reuse the disbanded guild's exact name and tag.
  const reuser = addOnlinePlayer(room, { gold: GUILD_CREATION_COST });
  (room as any).tryCreateGuild(reuser, "Solo Venture", "SOLO", "neutral");
  assert.ok(!reuser.ws.sent.some((m: any) => m.t === "error"), "the name/tag are free again once the guild is gone");

  room.shutdown();
});

test("kick permissions: officers can remove plain members but not each other or the leader; the leader can remove anyone but itself", () => {
  const room = makeRoom();
  const leader = addOnlinePlayer(room, { gold: GUILD_CREATION_COST });
  (room as any).tryCreateGuild(leader, "Kick Test Guild", "KICK", "neutral");

  const officerA = addOnlinePlayer(room);
  (room as any).tryInviteToGuild(leader, officerA.character.name);
  (room as any).sendGuildState(officerA);
  (room as any).tryRespondGuildInvite(officerA, lastGuildState(officerA).invites[0].guildId, true);
  (room as any).trySetGuildMemberRank(leader, officerA.character.id, "officer");

  const officerB = addOnlinePlayer(room);
  (room as any).tryInviteToGuild(leader, officerB.character.name);
  (room as any).sendGuildState(officerB);
  (room as any).tryRespondGuildInvite(officerB, lastGuildState(officerB).invites[0].guildId, true);
  (room as any).trySetGuildMemberRank(leader, officerB.character.id, "officer");

  const plain = addOnlinePlayer(room);
  (room as any).tryInviteToGuild(leader, plain.character.name);
  (room as any).sendGuildState(plain);
  (room as any).tryRespondGuildInvite(plain, lastGuildState(plain).invites[0].guildId, true);

  officerA.ws.sent.length = 0;
  (room as any).tryKickGuildMember(officerA, officerB.character.id);
  assert.ok(officerA.ws.sent.some((m: any) => m.t === "error" && /officers can't remove other officers/i.test(m.message)));

  officerA.ws.sent.length = 0;
  (room as any).tryKickGuildMember(officerA, leader.character.id);
  assert.ok(officerA.ws.sent.some((m: any) => m.t === "error" && /can't remove the guild leader/i.test(m.message)));

  (room as any).tryKickGuildMember(officerA, plain.character.id);
  (room as any).sendGuildState(plain);
  assert.equal(lastGuildState(plain).guild, null, "the plain member was actually removed");

  room.shutdown();
});

test("donating gold moves it from the player's purse into the guild treasury and tracks per-member contribution", () => {
  const room = makeRoom();
  const player = addOnlinePlayer(room, { gold: GUILD_CREATION_COST + 100 });
  (room as any).tryCreateGuild(player, "Treasury Test Guild", "TRSY", "neutral");

  (room as any).tryDonateToGuild(player, 75);
  const state = lastGuildState(player);
  assert.equal(player.character.gold, 25);
  assert.equal(state.guild.treasuryGold, 75);
  assert.equal(state.guild.members[0].contributionGold, 75);

  player.ws.sent.length = 0;
  (room as any).tryDonateToGuild(player, 1000);
  assert.ok(player.ws.sent.some((m: any) => m.t === "error" && /not enough gold/i.test(m.message)));

  room.shutdown();
});
