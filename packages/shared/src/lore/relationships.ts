/**
 * The NPC relationship web, formalized (design bible's "NPC Influence Map"): rivalries and
 * alliances as first-class graph data, rather than the one-off `crossReferences` every NPC
 * already carries. Two things live here:
 *
 * - `NPC_RELATIONSHIPS`: who's allied or at odds with whom, independent of anything the player
 *   has done — reference data a future UI (a relationship map, a "who do I know" panel) can walk
 *   without re-deriving it from scattered dialogue text.
 * - `DEATH_CASCADES`: the mechanism for "one NPC's fate removes or transforms another." A
 *   cascade fires when a *source* NPC's memory carries a specific tag (their fate is decided)
 *   and overrides a *target* NPC's greeting to react to it — the same "derive, don't store"
 *   discipline `computeRelationship` already uses (see memory.ts), just keyed off someone else's
 *   memory entry instead of your own loyalty score.
 */
import { memoryFor, type NpcMemoryState } from "./memory.js";

export type RelationshipKind = "rivalry" | "alliance";

export interface NpcRelationship {
  a: string;
  b: string;
  kind: RelationshipKind;
  summary: string;
}

export const NPC_RELATIONSHIPS: NpcRelationship[] = [
  { a: "warden_oris", b: "castellan_yora", kind: "alliance", summary: "Two Order loyalists who correspond across zones and vouch for each other to Command." },
  { a: "castellan_yora", b: "warden_kael", kind: "rivalry", summary: "A Chainwright castellan and the man sheltering everyone her Order calls a threat." },
  { a: "elder_maeve", b: "sister_wren", kind: "alliance", summary: "Threadhold's two quiet protectors of the Moon-Touched, working the same problem from different angles." },
  { a: "forge_mother_breca", b: "ilsa_marche", kind: "rivalry", summary: "A mercenary arms-dealer and a Luminari engineer competing for Ashmire's dwindling resources." },
  { a: "brother_ink", b: "novice_tarn", kind: "alliance", summary: "Both want the truth of the Binding published, whatever it costs them." },
  { a: "magistrate_thorne", b: "chancellor_irin", kind: "rivalry", summary: "Two Chainwright political players in Spirechain, each collecting leverage on the other." },
  { a: "sera_voss", b: "old_finn", kind: "alliance", summary: "The privateer captain and the lighthouse keeper — the last two people in Sunken Llyr who trust no faction." },
  { a: "tidecaller_oren", b: "the_selenian", kind: "rivalry", summary: "Opposite instincts about the drowned city: let it sleep, or learn what it's still hiding." },
  { a: "thane_corvin", b: "skald_varn", kind: "alliance", summary: "A clan chief and the bard who has sung his saga since before either of them expected it to matter." },
  { a: "thane_corvin", b: "lady_maren", kind: "rivalry", summary: "Two competing claims on what's left of Mourncrown's old nobility." },
  { a: "slag", b: "pyra_emberhand", kind: "alliance", summary: "A smith and a firebrand, agreeing on nothing except that the Hollowed have to go." },
  { a: "aldric_vane", b: "vesryn_duskborne", kind: "rivalry", summary: "A Chainwright who erases inconvenient villages and a Duskborne who watches people die for the Choir's mercy — neither can stand the other's arithmetic." },
  { a: "warden_kael", b: "the_cartographer", kind: "alliance", summary: "Two people who built something out of nothing at the world's ragged edge, and back each other without needing to say so." },
  { a: "warden_kael", b: "hollow_singer", kind: "rivalry", summary: "The sanctuary that shelters the Moon-Touched and the commune that wants them to stop fighting what they're becoming." },
  { a: "sera_voss", b: "hook_dallow", kind: "alliance", summary: "A privateer captain and the first mate who's sailed with her for ten years and still hasn't told her he wants out." },
  { a: "archivist_sela_wynne", b: "novice_tarn", kind: "alliance", summary: "Two record-keepers in two different zones, both smuggling truth past the same Order censors." },
  { a: "archivist_sela_wynne", b: "chancellor_irin", kind: "rivalry", summary: "The archivist who hides testimony and the Chancellor whose censors are hunting it." },
  { a: "construct_warden_iyo", b: "magistrate_thorne", kind: "rivalry", summary: "The warden who built the constructs for pure defense, and the magistrate who keeps trying to make them leverage." },
  { a: "rook_ashvane", b: "slag", kind: "rivalry", summary: "Two prospectors working the same Ashmire ruins, each convinced the other is claim-jumping." },
  { a: "grask_the_unmade", b: "slag", kind: "rivalry", summary: "A Frayedge trader in 'safe' Hollowed-touched shard fragments, and the Ashmire smith who thinks nothing about that trade is safe." },
  { a: "moonthread_warden", b: "the_cartographer", kind: "alliance", summary: "The guide who charts the road to Selen, and the warden who's waited at its end for someone to finally walk it." },
  { a: "archmagister_thessaly_vane", b: "aldric_vane", kind: "alliance", summary: "Mother and son, one holding the Order's line at the Moonthread itself, the other holding it at Threadhold — neither quite sure the other still agrees with why." }
];

export function relationshipsFor(npcId: string): NpcRelationship[] {
  return NPC_RELATIONSHIPS.filter((r) => r.a === npcId || r.b === npcId);
}

export function relationshipBetween(a: string, b: string): NpcRelationship | undefined {
  return NPC_RELATIONSHIPS.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a));
}

/**
 * "mourns"/"exploits" leave the target's own greeting-state and signature choice untouched
 * beneath the override line; "departs" additionally suppresses their signature choice
 * permanently (they've left, or won't talk business with you anymore) — the "removes" half of
 * "removes or transforms another"; "transforms" is the same suppression-free override used when
 * the reacting NPC's own role or standing has changed, not just their mood.
 */
export type CascadeEffect = "mourns" | "exploits" | "departs" | "transforms";

export interface DeathCascade {
  id: string;
  sourceNpcId: string;
  triggerTag: string;
  targetNpcId: string;
  kind: RelationshipKind;
  effect: CascadeEffect;
  greetingOverride: string;
}

export const DEATH_CASCADES: DeathCascade[] = [
  {
    id: "corvin_falls_varn_mourns",
    sourceNpcId: "thane_corvin",
    triggerTag: "corvin_hall_defended",
    targetNpcId: "skald_varn",
    kind: "alliance",
    effect: "mourns",
    greetingOverride: "I already know why you're here. I was there, at the end — I saw it, so I could sing it true. Thane Corvin died the way he wanted to: remembered, not evacuated. I haven't been able to sing anything since."
  },
  {
    id: "corvin_falls_maren_exploits",
    sourceNpcId: "thane_corvin",
    triggerTag: "corvin_hall_defended",
    targetNpcId: "lady_maren",
    kind: "rivalry",
    effect: "exploits",
    greetingOverride: "Corvin got his glorious death. Convenient, really — the hall's masterless now, and I have the oldest surviving claim to it. Don't look at me like that. Someone was always going to pick up what he dropped."
  },
  {
    id: "corvin_falls_rurik_transforms",
    sourceNpcId: "thane_corvin",
    triggerTag: "corvin_hall_defended",
    targetNpcId: "rurik_ashgrave",
    kind: "alliance",
    effect: "transforms",
    greetingOverride: "They call me Thane now. I never wanted the title this way — I wanted forty more years of him telling me I still had it wrong. Say what you came to say. I'm still learning how to wear this."
  },
  {
    id: "corvin_falls_karse_mourns",
    sourceNpcId: "thane_corvin",
    triggerTag: "corvin_hall_defended",
    targetNpcId: "widow_karse",
    kind: "alliance",
    effect: "mourns",
    greetingOverride: "I carved his name into the standing stones myself, the old way, before the Order could tell me I wasn't allowed. Thane Corvin gets his rite whether they permit it or not. Some things I still decide."
  },
  {
    id: "kael_betrays_quartz_departs",
    sourceNpcId: "warden_kael",
    triggerTag: "kael_sanctuary_betrayed",
    targetNpcId: "quartz",
    kind: "alliance",
    effect: "departs",
    greetingOverride: "You sold us. I patched up half of Frayedge on the promise this place was safe, and you sold the location for a reward. I don't have anything left to say to you, and I'm not staying to find out if the Order's already on its way."
  },
  {
    id: "kael_defends_quartz_transforms",
    sourceNpcId: "warden_kael",
    triggerTag: "kael_sanctuary_defended",
    targetNpcId: "quartz",
    kind: "alliance",
    effect: "transforms",
    greetingOverride: "We held. I still can't quite believe we held. Kael won't say it, but he tells everyone who'll listen what you did here — so I'll say it instead: thank you. Whatever you need mending, it's yours, no charge."
  },
  {
    id: "grask_lost_hollowsinger_mourns",
    sourceNpcId: "grask_the_unmade",
    triggerTag: "grask_became_lost",
    targetNpcId: "hollow_singer",
    kind: "rivalry",
    effect: "mourns",
    greetingOverride: "There's a name I don't say anymore. Grask went further than any of us meant to go, further than the commune could pull him back from, and it happened alone, trading shards in the dark instead of singing with the rest of us. That's the whole argument for why we don't do this alone. I'd hoped you'd understand it without losing him first."
  }
];

export function cascadeFor(targetNpcId: string, memory: NpcMemoryState): DeathCascade | undefined {
  return DEATH_CASCADES.find((c) => c.targetNpcId === targetNpcId && memoryFor(memory, c.sourceNpcId).tags.includes(c.triggerTag));
}
