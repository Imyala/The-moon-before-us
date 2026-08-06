/**
 * The Moon-Touched condition (section 2.8): every player is Moon-Touched from the start.
 * `lunarResonance` accumulates from handling Aether crystals — the game's existing "Aether
 * crystal" gathering nodes are, narratively, fragments of Selen herself — and its threshold
 * determines how deep into the condition a character has drifted.
 */
export type MoonTouchedStage = "touched" | "resonant" | "aligned" | "hollowed";

export interface MoonTouchedStageDef {
  stage: MoonTouchedStage;
  minResonance: number;
  description: string;
}

export const MOON_TOUCHED_STAGES: MoonTouchedStageDef[] = [
  { stage: "touched", minResonance: 0, description: "You came back from a Moonshard fall. You hear whispers, faintly, at the edges of sleep." },
  { stage: "resonant", minResonance: 10, description: "Echoes and hidden paths reveal themselves near shardfall sites. Some fear what you're becoming." },
  { stage: "aligned", minResonance: 25, description: "You've begun agreeing with memories that aren't yours. NPCs notice; some revere it, some dread it." },
  { stage: "hollowed", minResonance: 50, description: "The whispers outnumber your own thoughts most days. You are losing the argument for your name." }
];

export function moonTouchedStageFor(lunarResonance: number): MoonTouchedStageDef {
  let current = MOON_TOUCHED_STAGES[0];
  for (const def of MOON_TOUCHED_STAGES) {
    if (lunarResonance >= def.minResonance) current = def;
  }
  return current;
}
