/**
 * NPC-fate epilogue lines (docs/GDD.md's "Secret endings and epilogue variants"): a curated set
 * of a handful of pivotal signature-choice outcomes, each already recorded as a memory tag the
 * moment the player resolves that choice. Nothing new to track — this just reads back tags that
 * `Room.handleDialogueChoice` was already writing via `withTag`, the same "derive, don't store
 * redundantly" discipline `computeRelationship` and `cascadeFor` use elsewhere in the lore layer.
 */
import { memoryFor, type NpcMemoryState } from "./memory.js";

export interface KeyFateEntry {
  npcId: string;
  tag: string;
  line: string;
}

export const KEY_FATE_EPILOGUE: KeyFateEntry[] = [
  {
    npcId: "thane_corvin",
    tag: "corvin_hall_defended",
    line: "Thane Corvin's hall stands empty in Mourncrown, exactly as he left it the day he chose to die remembered rather than evacuated."
  },
  {
    npcId: "thane_corvin",
    tag: "corvin_hall_evacuated",
    line: "Thane Corvin's clan lives on scattered ground, further from Mourncrown's old hall than he ever wanted — but alive, because you helped him choose the living over the stones."
  },
  {
    npcId: "thane_corvin",
    tag: "corvin_hall_betrayed",
    line: "Thane Corvin's hall belongs to the Chainwrights now, and his name isn't spoken kindly in Mourncrown — the price of the safety you helped him buy."
  },
  {
    npcId: "warden_kael",
    tag: "kael_sanctuary_defended",
    line: "Warden Kael's sanctuary held against the Chainwright raid, and still shelters everyone in Frayedge who has nowhere else to go."
  },
  {
    npcId: "warden_kael",
    tag: "kael_sanctuary_evacuated",
    line: "Warden Kael's sanctuary is gone, scattered through Frayedge's tunnels — but everyone who sheltered there is still alive to remember it."
  },
  {
    npcId: "warden_kael",
    tag: "kael_sanctuary_betrayed",
    line: "Warden Kael never forgave the sanctuary's location being sold. What the Chainwright raid left of it afterward, you never went back to see."
  },
  {
    npcId: "grask_the_unmade",
    tag: "grask_became_lost",
    line: "Whatever answers to Grask's name in the Frayedge now, it isn't quite Grask anymore — not since a live, unshielded Moonshard changed hands."
  },
  {
    npcId: "aldric_vane",
    tag: "aldric_exposed",
    line: "High Chainwright Aldric Vane's erased village is public record now, whatever it cost the Order to admit it."
  },
  {
    npcId: "aldric_vane",
    tag: "aldric_concealed",
    line: "The village Aldric Vane erased stays buried in Order record rooms, kept quiet for a stability only the Order still believes in."
  }
];

/** Every key-fate line the player's own choices have unlocked so far, in roster order. */
export function keyFateEpilogue(memory: NpcMemoryState): string[] {
  return KEY_FATE_EPILOGUE.filter((entry) => memoryFor(memory, entry.npcId).tags.includes(entry.tag)).map((entry) => entry.line);
}
