import type { PlayerClassId, SpecializationDef } from "./types.js";

export const SPECIALIZATIONS: SpecializationDef[] = [
  {
    id: "warden_bulwark",
    classId: "warden",
    name: "Bulwark",
    tagline: "An unmoving wall",
    description: "Leans further into the Warden's durability, turning banked Resolve into raw damage reduction.",
    mechanicDescription: "Each 25 Resolve you hold reduces incoming damage by 8% (up to 30%).",
    unlockLevel: 5,
    color: "#8fa8c9"
  },
  {
    id: "warden_berserker",
    classId: "warden",
    name: "Berserker",
    tagline: "Strongest when wounded",
    description: "Trades safety for ferocity — the closer to death, the harder the Warden hits.",
    mechanicDescription: "Below 50% health, your weapon attacks deal 25% more damage.",
    unlockLevel: 5,
    color: "#c9634a"
  },
  {
    id: "ranger_strider",
    classId: "ranger",
    name: "Strider",
    tagline: "Never stop moving",
    description: "Rewards a Ranger who keeps circling and repositioning rather than turtling in place.",
    mechanicDescription: "Moving builds up to 5 stacks of Momentum, each granting 2% crit chance.",
    unlockLevel: 5,
    color: "#7fd68f"
  },
  {
    id: "ranger_beastcaller",
    classId: "ranger",
    name: "Beastcaller",
    tagline: "You are never alone",
    description: "Calls a spirit hawk to harry the Ranger's target automatically, in the background of every fight.",
    mechanicDescription: "A spirit hawk periodically strikes your nearest enemy for bonus damage.",
    unlockLevel: 5,
    color: "#d6c25a"
  },
  {
    id: "mystic_tidecaller",
    classId: "mystic",
    name: "Tidecaller",
    tagline: "Healing that lingers",
    description: "Pushes the Mystic further into a dedicated support role — every heal leaves something behind.",
    mechanicDescription: "Your heals also grant a shield equal to 25% of the amount healed.",
    unlockLevel: 5,
    color: "#6fc9d6"
  },
  {
    id: "mystic_voidblade",
    classId: "mystic",
    name: "Voidblade",
    tagline: "Power feeds on power",
    description: "A more aggressive Mystic that channels Aether spent on offense straight back into more offense.",
    mechanicDescription: "Damaging Aether spells stack Umbral Power, up to +15% power.",
    unlockLevel: 5,
    color: "#9a6ad6"
  }
];

export function specializationsForClass(classId: PlayerClassId): SpecializationDef[] {
  return SPECIALIZATIONS.filter((s) => s.classId === classId);
}

export function getSpecialization(id: string): SpecializationDef | undefined {
  return SPECIALIZATIONS.find((s) => s.id === id);
}
