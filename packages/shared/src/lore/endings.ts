/**
 * The three ending axes (section 3.1) and the nine major endings they combine into (section
 * 3.2). This vertical slice has no scripted finale to actually branch into yet, so what's
 * implemented here is a "trending fate" reading, computed live from faction loyalty and
 * Moon-Touched depth — an honest preview of where the character is heading, not a fake ending
 * cutscene bolted onto a sandbox that has no end state.
 */
import type { LoyaltyScores } from "./factions.js";
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
