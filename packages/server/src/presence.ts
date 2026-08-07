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
}

const online = new Map<string, PresenceEntry>();

export function registerPresence(token: string, character: CharacterState, notify: () => void): void {
  online.set(token, { character, notify });
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
