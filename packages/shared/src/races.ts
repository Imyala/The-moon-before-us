import type { PlayerRaceId, StatBlock } from "./types.js";

/**
 * Playable races (see docs/DESIGN_EXPANSION.md's "Races of Aethon, Selen, and the Void") — the
 * first shipped piece of that design expansion. Orthogonal to class the same way subclasses
 * already are: race changes flavor and a small passive, never which abilities you have or how
 * hard they hit relative to another race. Fifteen playable races are defined here; the design
 * doc's roster also names 8 post-launch unlockable races and 20+ non-playable/monster races,
 * none of which exist as selectable options yet — see the GDD's Design Expansion status table.
 */
export type RaceCategory = "aethonian" | "selenian-touched" | "unbound";

export interface RaceDef {
  id: PlayerRaceId;
  name: string;
  category: RaceCategory;
  identity: string;
  visual: string;
  /** Small, flavorful bonus on top of class base stats — see character.ts's computeEffectiveStats.
   *  Deliberately kept in the same magnitude as a common-rarity item's statBonus, never a real
   *  combat-power gap between races. */
  passive: Partial<StatBlock>;
  passiveDescription: string;
}

export const RACES: RaceDef[] = [
  {
    id: "vaelari",
    name: "Vaelari",
    category: "aethonian",
    identity: "The default adaptable people; builders of Spirechain, farmers of Threadhold.",
    visual: "Varied, like humans with slightly elongated limbs from generations near the thread.",
    passive: { power: 2, vitality: 2 },
    passiveDescription: "Adaptable: a small, even bonus to power and vitality."
  },
  {
    id: "khurruk",
    name: "Khurruk",
    category: "aethonian",
    identity: "Mountain and labor clans of Ashmire; massive, pragmatic, tattooed with forge-ash.",
    visual: "Hulking, stone-grey or brass-colored skin, tusk-like jaw protrusions.",
    passive: { vitality: 6 },
    passiveDescription: "Mountain-Born: bonus vitality."
  },
  {
    id: "sylphra",
    name: "Sylphra",
    category: "aethonian",
    identity: "Spirechain aristocracy, astronomers, high culture.",
    visual: "Tall, pale, iridescent eyes, slightly pointed ears, silver hair.",
    passive: { power: 1, critChance: 0.02 },
    passiveDescription: "Starwise: bonus crit chance and a touch of power."
  },
  {
    id: "duskwight",
    name: "Duskwight",
    category: "aethonian",
    identity: "Mourncrown exiles, shadow-workers, former nobility.",
    visual: "Ash-grey to deep blue skin, red or white eyes, clan scarification.",
    passive: { critDamage: 0.05 },
    passiveDescription: "Shadow-Honed: bonus critical damage."
  },
  {
    id: "khenu",
    name: "Khenu",
    category: "aethonian",
    identity: "Coastal and highland clans, quick, spiritual, tied to the tides.",
    visual: "Feline aspects, vertical pupils, fur patterns ranging from sand to moon-white.",
    passive: { haste: 0.03 },
    passiveDescription: "Tide-Quick: bonus haste."
  },
  {
    id: "brakkan",
    name: "Brakkan",
    category: "aethonian",
    identity: "Deep miners, engineers, keepers of old war machines.",
    visual: "Compact, broad, metallic hair-braids, gem-set beards regardless of sex.",
    passive: { vitality: 4, power: 2 },
    passiveDescription: "Deep-Delved: bonus vitality and power."
  },
  {
    id: "fennori",
    name: "Fennori",
    category: "aethonian",
    identity: "River-folk, traders, gardeners of Threadhold.",
    visual: "Small, quick, large eyes, fur-lined feet, cheerful in the face of horror.",
    passive: { haste: 0.02, critChance: 0.01 },
    passiveDescription: "Quick-Fingered: bonus haste and a touch of crit chance."
  },
  {
    id: "lyranni",
    name: "Lyranni",
    category: "aethonian",
    identity: "Sunken Llyr divers, amphibious traits, bioluminescent markings.",
    visual: "Webbed digits, gill-slits, pale scales along limbs, bioluminescent spots.",
    passive: { vitality: 2, haste: 0.02 },
    passiveDescription: "Current-Born: bonus vitality and haste."
  },
  {
    id: "lumineth",
    name: "Lumineth",
    category: "selenian-touched",
    identity: "Descendants of Selenian refugees who bred into Aethon; elegant, damaged.",
    visual: "Pale silver skin, faintly glowing veins, black or white hair, mournful beauty.",
    passive: { power: 3, critChance: 0.01 },
    passiveDescription: "Selenian Blood: bonus power and a touch of crit chance."
  },
  {
    id: "threadborn",
    name: "Threadborn",
    category: "selenian-touched",
    identity: "Children conceived under the Moonthread; naturally Moon-Touched-sensitive.",
    visual: "Skin like moon-crystal, hair that drifts as if underwater, no visible ears.",
    passive: { power: 2, vitality: 2 },
    passiveDescription: "Thread-Sensitive: a small, even bonus to power and vitality."
  },
  {
    id: "ashren",
    name: "Ashren",
    category: "selenian-touched",
    identity: "People who died in shardfalls and returned changed; feared, legal gray area.",
    visual: "Greyish skin, hollow eyes with silver pupils, faintly visible old wounds.",
    passive: { vitality: 5 },
    passiveDescription: "Returned: bonus vitality."
  },
  {
    id: "golemkin",
    name: "Golemkin",
    category: "selenian-touched",
    identity: "Ancient war machines granted consciousness by lunar resonance.",
    visual: "Metal and crystal bodies, rune-lit eyes, voice like bells or static.",
    passive: { vitality: 6, power: 1 },
    passiveDescription: "Forged: bonus vitality and a touch of power."
  },
  {
    id: "voidtouched",
    name: "Voidtouched",
    category: "unbound",
    identity: "Born during a Voidborn incursion; slightly inhuman, prophetic, feared.",
    visual: "Dark scales or horns of void-crystal, eyes that reflect nothing, shadow-clinging.",
    passive: { critChance: 0.03 },
    passiveDescription: "Void-Marked: bonus crit chance."
  },
  {
    id: "riftborn",
    name: "Riftborn",
    category: "unbound",
    identity: "Frayedge survivors mutated by reality-tears; feral resilience.",
    visual: "Asymmetrical features, extra limbs or eyes that come and go, patched fur/skin.",
    passive: { vitality: 3, haste: 0.01 },
    passiveDescription: "Rift-Hardened: bonus vitality and a touch of haste."
  },
  {
    id: "the_bound",
    name: "The Bound",
    category: "unbound",
    identity: "Servants of an older celestial order that predates the Binding; rare, worshipped.",
    visual: "Tall, many-jointed, luminous sigils floating around head/limbs, no visible mouth.",
    passive: { power: 4 },
    passiveDescription: "Older Oath: bonus power."
  }
];

export function getRace(id: string): RaceDef | undefined {
  return RACES.find((r) => r.id === id);
}
