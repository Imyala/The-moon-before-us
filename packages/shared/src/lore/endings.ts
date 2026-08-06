/**
 * The three ending axes (section 3.1) and the nine major endings they combine into (section
 * 3.2). This vertical slice has no scripted finale to actually branch into yet, so what's
 * implemented here is a "trending fate" reading, computed live from faction loyalty and
 * Moon-Touched depth — an honest preview of where the character is heading, not a fake ending
 * cutscene bolted onto a sandbox that has no end state.
 */
import { loyaltyState, type LoyaltyScores } from "./factions.js";
import type { MoonTouchedStage } from "./moonTouched.js";

export type ThreadAxis = "bind" | "balance" | "sever";
export type TouchedAxis = "cure" | "accept" | "embrace";

export function threadAxisFor(loyalty: LoyaltyScores): ThreadAxis {
  const bind = loyalty.chainwrights;
  const sever = loyalty.paleChoir;
  if (bind - sever >= 20) return "bind";
  if (sever - bind >= 20) return "sever";
  return "balance";
}

export function touchedAxisFor(stage: MoonTouchedStage): TouchedAxis {
  if (stage === "touched" || stage === "resonant") return "cure";
  if (stage === "aligned") return "accept";
  return "embrace";
}

export interface MajorEnding {
  id: string;
  name: string;
  thread: ThreadAxis;
  touched: TouchedAxis;
  tone: string;
  /** True for the two SECRET_ENDINGS below — never shown by `trendingEnding`'s live preview, only
   *  ever revealed once the finale actually locks one in (see `secretEndingFor`). */
  secret?: boolean;
}

export const MAJOR_ENDINGS: MajorEnding[] = [
  { id: "silver_chain", name: "The Silver Chain", thread: "bind", touched: "cure", tone: "Order restored; the moon is silent." },
  { id: "gilded_cage", name: "The Gilded Cage", thread: "bind", touched: "accept", tone: "Aethon thrives; the moon suffers openly." },
  { id: "lullaby", name: "The Lullaby", thread: "bind", touched: "embrace", tone: "The moon sings; everyone begins to dream." },
  { id: "dim_light", name: "The Dim Light", thread: "balance", touched: "cure", tone: "A fragile peace; the Whispered fade." },
  { id: "shared_sky", name: "The Shared Sky", thread: "balance", touched: "accept", tone: "Two worlds, one horizon; cautious hope." },
  { id: "bridge", name: "The Bridge", thread: "balance", touched: "embrace", tone: "Humanity and Selen merge slowly." },
  { id: "long_fall", name: "The Long Fall", thread: "sever", touched: "cure", tone: "Selen dies; Aethon survives, guilty." },
  { id: "drift", name: "The Drift", thread: "sever", touched: "accept", tone: "Selen floats free; Aethon finds new paths." },
  { id: "becoming", name: "The Becoming", thread: "sever", touched: "embrace", tone: "Humanity ascends to the moon; Aethon is left behind." }
];

export function trendingEnding(loyalty: LoyaltyScores, moonTouchedStage: MoonTouchedStage): MajorEnding {
  const thread = threadAxisFor(loyalty);
  const touched = touchedAxisFor(moonTouchedStage);
  return MAJOR_ENDINGS.find((e) => e.thread === thread && e.touched === touched)!;
}

/**
 * Two secret endings beyond the nine-way axis grid, described but unbuilt in the original design
 * (docs/GDD.md's "What's designed but not yet built"). Each requires a rare loyalty extreme —
 * "exalted" or "hunted" (the top/bottom rungs of factions.ts's ladder) with *all three* factions
 * simultaneously, which the normal thread-axis math never demands on its own — on top of actually
 * choosing the matching thread outcome at the Moonthread Warden. Deliberately absent from
 * `MAJOR_ENDINGS`/`trendingEnding`'s live preview so they stay a genuine surprise rather than a
 * min-maxable target; `secretEndingFor` is only ever consulted at the moment the finale locks in
 * (see `Room.handleDialogueChoice`).
 */
export const SECRET_ENDINGS: MajorEnding[] = [
  {
    id: "threadkeepers_peace",
    name: "The Threadkeeper's Peace",
    thread: "balance",
    touched: "accept",
    tone: "Chainwrights, Luminari, and Pale Choir alike trust you enough to let you hold the thread yourself — not because they agree with each other, but because they've all decided you're the one exception. You keep it standing, in balance, with no one left to contest it.",
    secret: true
  },
  {
    id: "the_unmaking",
    name: "The Unmaking",
    thread: "sever",
    touched: "embrace",
    tone: "Every banner that might once have claimed you has named you Hunted instead, and Selen's memory has gone further into you than it's gone into anyone who's come back to say so. You cut the thread with nothing left on Aethon that still wants you — and nothing of yourself left that still minds.",
    secret: true
  }
];

export function secretEndingFor(thread: ThreadAxis, loyalty: LoyaltyScores, stage: MoonTouchedStage): MajorEnding | undefined {
  if (thread === "balance" && (["chainwrights", "luminari", "paleChoir"] as const).every((k) => loyaltyState(loyalty[k]) === "exalted")) {
    return SECRET_ENDINGS.find((e) => e.id === "threadkeepers_peace");
  }
  if (
    thread === "sever" &&
    stage === "hollowed" &&
    (["chainwrights", "luminari", "paleChoir"] as const).every((k) => loyaltyState(loyalty[k]) === "hunted")
  ) {
    return SECRET_ENDINGS.find((e) => e.id === "the_unmaking");
  }
  return undefined;
}

export type FactionAxis = "chainwrights" | "luminari" | "paleChoir" | "independent";

export function dominantFaction(loyalty: LoyaltyScores): FactionAxis {
  let best: FactionAxis = "independent";
  let bestScore = loyalty.independent;
  for (const key of ["chainwrights", "luminari", "paleChoir"] as const) {
    if (loyalty[key] > bestScore) {
      best = key;
      bestScore = loyalty[key];
    }
  }
  return best;
}
