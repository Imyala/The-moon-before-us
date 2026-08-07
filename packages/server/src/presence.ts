import type { CharacterState } from "@moon/shared";
import { creditGoldOffline } from "./db.js";

/**
 * A tiny global registry of who's currently connected, independent of which Room they're in —
 * the auction house (docs/GDD.md's "Auction house" section) needs this because a sale can credit
 * a seller who's online in a *different* room than the buyer, or not connected at all. Room
 * instances have no other way to reach each other.
 */
interface PresenceEntry {
  character: CharacterState;
  notify: () => void;
  notifyGuild: () => void;
}

const online = new Map<string, PresenceEntry>();

export function registerPresence(token: string, character: CharacterState, notify: () => void, notifyGuild: () => void): void {
  online.set(token, { character, notify, notifyGuild });
}

/** Only clears the entry if it still points at this exact character object — guards against a
 *  rapid reconnect (a new session already re-registered the same token) being wiped out by the
 *  old session's cleanup running after it. */
export function unregisterPresence(token: string, character: CharacterState): void {
  const entry = online.get(token);
  if (entry && entry.character === character) online.delete(token);
}

/**
 * Credits gold to a character by token. If they're currently connected anywhere, mutates their
 * live in-memory character directly (picked up by that Room's normal periodic autosave) instead
 * of writing to the database — writing to the database for an online player would just get
 * silently overwritten by the next autosave of their still-stale in-memory gold total. If they're
 * not connected, falls back to a direct database credit. Never both.
 */
export function creditGold(token: string, amount: number): void {
  const entry = online.get(token);
  if (entry) {
    entry.character.gold += amount;
    entry.notify();
  } else {
    creditGoldOffline(token, amount);
  }
}

/** Returns a currently-connected player's live character — used by the guild roster (see
 *  server/guilds.ts) so a fellow member's faction-loyalty-derived status reflects their actual
 *  in-memory state rather than a possibly-stale last-autosave row, the same reasoning creditGold
 *  applies to gold. Null if they're not connected anywhere right now. */
export function getOnlineCharacter(token: string): CharacterState | null {
  return online.get(token)?.character ?? null;
}

/** Case-insensitive name lookup across everyone currently connected — a brand-new character (or
 *  one that just changed something) may not have hit its first autosave yet, so a guild invite
 *  (see server/guilds.ts's inviteToGuild) checks here before falling back to db.ts's
 *  findTokenByName, the same online-first-then-database precedence creditGold uses for gold. */
export function findOnlineTokenByName(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [token, entry] of online) {
    if (entry.character.name.toLowerCase() === lower) return token;
  }
  return null;
}

/** Pushes a fresh guild-state message to a player if they're currently connected, wherever that
 *  is — used after a guild action changes something about them specifically (an invite arrives,
 *  they're kicked, their rank changes, they inherit leadership). A no-op if they're offline; they
 *  see the change next time they request their guild state. */
export function notifyGuildChange(token: string): void {
  online.get(token)?.notifyGuild();
}
