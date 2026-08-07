/**
 * Universal romance (docs/DESIGN_EXPANSION.md's "Universal Romance System"): a Romance Score and
 * five sub-metrics per NPC, separate from Bond/Disgust — you can have high Bond with someone and
 * never romance them, or a rocky Bond and a real romance despite it. Immutable-update style
 * throughout, matching memory.ts's own `withTag` — romance state changes return a new value rather
 * than mutating in place, so `Room` reassigns `character.romance` the same way it already
 * reassigns `character.npcMemory`.
 *
 * This ships six real NPCs (three companions — Bran Fieldhand, Solace Stillwater — plus Mira
 * Hollowbell, Warden Kael, Ilsa Marche, Forge-Mother Breca) as the first slice, each wired to
 * tags their *existing* signature choices already write — no new dialogue content, just new
 * meaning read back from choices the player was already making. The full 80-120 NPC roster the
 * design doc calls for is explicitly out of scope for this pass; see the GDD's Design Expansion
 * status table.
 */
export type RomanceStatus = "indifferent" | "curious" | "interested" | "courtship" | "committed" | "devoted" | "estranged" | "lost" | "betrayed";

export interface RomanceMetrics {
  attraction: number; // 0-100
  respect: number;
  vulnerability: number;
  fear: number;
  hope: number;
}

export interface RomanceState {
  score: number; // -100..100, the overall Romance Score (RS)
  metrics: RomanceMetrics;
  status: RomanceStatus;
  lastFlirtAt: number; // ms epoch; drives the flirt-cooldown "too many too fast" penalty
  /** Memory tags whose one-time romance effect (an attraction boost, or a sticky rupture) has
   *  already been applied — prevents re-applying the same trigger every time memory is scanned. */
  appliedTags: string[];
}

export type RomanceRecord = Record<string, RomanceState>;

export type FlirtType = "friendly" | "bold" | "intellectual" | "protective" | "vulnerable" | "dark";

export type RomanceArchetype =
  | "beloved_leader"
  | "tragic_beauty"
  | "rival"
  | "common_soul"
  | "inhuman"
  | "corruptible"
  | "forbidden"
  | "mercenary"
  | "brief_flame";

export interface RomanceDef {
  npcId: string;
  archetype: RomanceArchetype;
  likesFlirt: FlirtType[];
  dislikesFlirt: FlirtType[];
  /** Memory tags on this NPC that grant a one-time attraction boost the moment they're set. */
  attractedByTags: string[];
  /** Memory tags that force status to "estranged" — damaged but recoverable via attemptRepair. */
  estrangedByTags: string[];
  /** Memory tags that force status to "lost" — the romance is over, but not hateful. */
  lostByTags: string[];
  /** Memory tags that force status to "betrayed" — the romance has turned to hatred. */
  betrayedByTags: string[];
  likedItemIds: string[];
}

export const ROMANCES: RomanceDef[] = [
  {
    npcId: "mira_hollowbell",
    archetype: "tragic_beauty",
    likesFlirt: ["vulnerable", "protective"],
    dislikesFlirt: ["bold", "dark"],
    // Choosing to save the child (at her own expense) is exactly what draws her; choosing to save
    // herself over the child is the one thing she can't fully forgive, per her own values.
    attractedByTags: ["mira_child_saved"],
    estrangedByTags: ["mira_self_saved"],
    lostByTags: [],
    betrayedByTags: [],
    likedItemIds: ["trinket_moon_pendant", "mat_moonpetal"]
  },
  {
    npcId: "warden_kael",
    archetype: "beloved_leader",
    likesFlirt: ["protective", "friendly"],
    dislikesFlirt: ["dark"],
    attractedByTags: ["kael_sanctuary_defended"],
    estrangedByTags: [],
    lostByTags: [],
    // Selling out the sanctuary he'd die to protect, for a reward, is the design doc's own
    // "exploit the vulnerable they protect" example almost verbatim.
    betrayedByTags: ["kael_sanctuary_betrayed"],
    likedItemIds: ["armor_ironhide_vest", "potion_greater_health"]
  },
  {
    npcId: "ilsa_marche",
    archetype: "corruptible",
    likesFlirt: ["bold", "intellectual"],
    dislikesFlirt: ["vulnerable"],
    attractedByTags: ["ilsa_stopped"],
    estrangedByTags: [],
    lostByTags: ["ilsa_helped"],
    betrayedByTags: [],
    likedItemIds: ["mat_starlight_essence", "weapon_starlight_focus"]
  },
  {
    npcId: "forge_mother_breca",
    archetype: "mercenary",
    likesFlirt: ["bold", "friendly"],
    dislikesFlirt: ["vulnerable"],
    attractedByTags: ["breca_armed_independents"],
    estrangedByTags: [],
    lostByTags: [],
    betrayedByTags: [],
    likedItemIds: ["mat_iron_ore", "mat_silver_ore"]
  },
  {
    npcId: "bran_fieldhand",
    archetype: "common_soul",
    likesFlirt: ["friendly", "protective"],
    dislikesFlirt: ["dark"],
    attractedByTags: ["bran_recruited"],
    estrangedByTags: ["bran_dismissed"],
    lostByTags: [],
    betrayedByTags: [],
    likedItemIds: ["mat_wood", "mat_herb"]
  },
  {
    npcId: "solace_stillwater",
    archetype: "tragic_beauty",
    likesFlirt: ["vulnerable", "intellectual"],
    dislikesFlirt: ["dark", "bold"],
    attractedByTags: ["solace_recruited"],
    estrangedByTags: ["solace_mocked"],
    lostByTags: [],
    betrayedByTags: [],
    likedItemIds: ["potion_minor_health", "mat_herb"]
  }
];

export function getRomanceDef(npcId: string): RomanceDef | undefined {
  return ROMANCES.find((r) => r.npcId === npcId);
}

const DEFAULT_METRICS: RomanceMetrics = { attraction: 0, respect: 0, vulnerability: 0, fear: 0, hope: 0 };

export function romanceFor(record: RomanceRecord, npcId: string): RomanceState {
  return record[npcId] ?? { score: 0, metrics: { ...DEFAULT_METRICS }, status: "indifferent", lastFlirtAt: 0, appliedTags: [] };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function statusForScore(score: number): RomanceStatus {
  if (score >= 81) return "devoted";
  if (score >= 61) return "committed";
  if (score >= 41) return "courtship";
  if (score >= 26) return "interested";
  if (score >= 11) return "curious";
  return "indifferent";
}

/**
 * Applies a metrics/score delta and recomputes status from the new score — except while status is
 * one of the three "sticky" states (estranged/lost/betrayed), which only change via an explicit
 * trigger (syncRomanceWithMemory) or a deliberate repair action, never by score alone drifting
 * back up. That stickiness is what makes a rupture mean something instead of just a dip that time
 * quietly heals.
 */
function withDelta(state: RomanceState, delta: Partial<RomanceMetrics> & { score?: number }): RomanceState {
  const score = clamp(state.score + (delta.score ?? 0), -100, 100);
  const metrics: RomanceMetrics = {
    attraction: clamp(state.metrics.attraction + (delta.attraction ?? 0), 0, 100),
    respect: clamp(state.metrics.respect + (delta.respect ?? 0), 0, 100),
    vulnerability: clamp(state.metrics.vulnerability + (delta.vulnerability ?? 0), 0, 100),
    fear: clamp(state.metrics.fear + (delta.fear ?? 0), 0, 100),
    hope: clamp(state.metrics.hope + (delta.hope ?? 0), 0, 100)
  };
  const sticky = state.status === "estranged" || state.status === "lost" || state.status === "betrayed";
  return { ...state, score, metrics, status: sticky ? state.status : statusForScore(score) };
}

/** Too many flirts inside this window in a row reads as glib rather than genuine — see applyFlirt. */
export const FLIRT_COOLDOWN_MS = 60000;

export interface RomanceActionResult {
  state: RomanceState;
  ok: boolean;
  line: string;
}

export function applyFlirt(state: RomanceState, def: RomanceDef, flirtType: FlirtType, now: number): RomanceActionResult {
  if (state.status === "lost" || state.status === "betrayed") {
    return { state, ok: false, line: "They want nothing more to do with you." };
  }
  if (now - state.lastFlirtAt < FLIRT_COOLDOWN_MS) {
    return { state: withDelta({ ...state, lastFlirtAt: now }, { score: -5, fear: 15 }), ok: false, line: "They withdraw. \"You speak too lightly of heavy things.\"" };
  }
  const stamped = { ...state, lastFlirtAt: now };
  if (def.dislikesFlirt.includes(flirtType)) {
    return { state: withDelta(stamped, { score: -8, fear: 10 }), ok: false, line: "That lands wrong. They pull back, guarded." };
  }
  if (def.likesFlirt.includes(flirtType)) {
    return {
      state: withDelta(stamped, {
        score: 10,
        attraction: 8,
        respect: flirtType === "intellectual" ? 8 : 0,
        vulnerability: flirtType === "vulnerable" ? 10 : 0,
        hope: flirtType === "vulnerable" ? 5 : 0
      }),
      ok: true,
      line: "Something in their expression softens."
    };
  }
  return { state: withDelta(stamped, { score: 3, attraction: 2 }), ok: true, line: "They notice, at least." };
}

export function applyGift(state: RomanceState, def: RomanceDef, itemId: string): RomanceActionResult {
  if (state.status === "lost" || state.status === "betrayed") {
    return { state, ok: false, line: "They won't accept anything from you." };
  }
  if (def.likedItemIds.includes(itemId)) {
    return { state: withDelta(state, { score: 15, attraction: 5, respect: 5 }), ok: true, line: "Their eyes light up — you remembered what they'd love." };
  }
  return { state: withDelta(state, { score: 2 }), ok: true, line: "They accept it graciously, if a little puzzled." };
}

/** A deliberate repair attempt, only meaningful while Estranged. Crossing back into Courtship's
 *  score threshold clears the estrangement; anything short of that leaves it in place — repair has
 *  to be earned in one sufficient act (or several), not just attempted. */
export function attemptRepair(state: RomanceState, rsGain: number): RomanceActionResult {
  if (state.status !== "estranged") {
    return { state, ok: false, line: "There's nothing to repair right now." };
  }
  const score = clamp(state.score + rsGain, -100, 100);
  if (score >= 41) {
    return { state: { ...state, score, status: "courtship" }, ok: true, line: "Something mends, slowly, between you." };
  }
  return { state: { ...state, score }, ok: false, line: "It's not enough. Not yet." };
}

/**
 * Scans one NPC's current memory tags and applies any of this romance's tagged trigger events
 * that haven't already been applied to this romance state — one-time attraction boosts, and the
 * sticky estranged/lost/betrayed overrides. Call wherever npcMemory changes for that NPC (see
 * Room.handleDialogueChoice), the same "derive at the moment memory changes" discipline
 * relationships.ts's death cascades and epilogue.ts's key-fate lines already use elsewhere in
 * this lore layer.
 */
export function syncRomanceWithMemory(state: RomanceState, def: RomanceDef, tags: string[]): RomanceState {
  let next = state;
  for (const tag of tags) {
    if (next.appliedTags.includes(tag)) continue;
    let matched = false;
    if (def.attractedByTags.includes(tag)) {
      next = withDelta(next, { score: 20, attraction: 10, respect: 10 });
      matched = true;
    }
    if (def.estrangedByTags.includes(tag)) {
      next = { ...next, status: "estranged", score: Math.min(next.score, 25) };
      matched = true;
    }
    if (def.lostByTags.includes(tag)) {
      next = { ...next, status: "lost" };
      matched = true;
    }
    if (def.betrayedByTags.includes(tag)) {
      next = { ...next, status: "betrayed", score: -80 };
      matched = true;
    }
    if (matched) next = { ...next, appliedTags: [...next.appliedTags, tag] };
  }
  return next;
}
