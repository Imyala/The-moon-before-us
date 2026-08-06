/**
 * A first, fully-wired slice of the wider NPC roster from the design bible: each of these six
 * has memory-conditional greetings and one signature choice with real faction consequences,
 * demonstrating the pattern (see docs/GDD.md's "Playable conversations" section) that the rest
 * of the cast can be authored against. Not every named character from the bible is here yet —
 * this is the system proven out with real content, not a claim that the full roster is built.
 */
import type { Vec3 } from "../vec.js";
import type { FactionId, LoyaltyDelta, LoyaltyKey, LoyaltyScores } from "./factions.js";
import { computeRelationship, memoryFor, type LoyaltyType, type NpcMemoryState, type RelationshipState } from "./memory.js";

export interface DialogueOption {
  id: string;
  label: string;
  tag: string;
  delta: LoyaltyDelta;
  followUp: string;
}

export interface SignatureChoice {
  prompt: string;
  resolvedTag: string;
  options: DialogueOption[];
}

export interface NpcDef {
  id: string;
  name: string;
  title: string;
  zoneId: string;
  position: Vec3;
  primaryFaction: FactionId | null;
  loyaltyType: LoyaltyType;
  greetings: Record<RelationshipState, string>;
  signatureChoice?: SignatureChoice;
}

export function gaugeKeyFor(npc: NpcDef): LoyaltyKey {
  return npc.primaryFaction ?? "independent";
}

export const NPCS: NpcDef[] = [
  {
    id: "elder_maeve",
    name: "Elder Maeve",
    title: "Village Elder of Threadhold",
    zoneId: "threadhold",
    position: { x: 2, y: 0, z: 10 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "You're the sky-child from the crater, aren't you? Word travels fast in a village this small.",
      met: "Threadhold holds. That's more than I can say for some nights.",
      friendly: "There you are. The wardens speak well of you — mind that continues.",
      trusted: "There you are, sky-child. Sit a moment. You've done more for this village than most who were born here.",
      hostile: "I remember what you let happen. Don't linger."
    },
    signatureChoice: {
      prompt: "The Chainwright patrol wants a list of who's been sheltering Moon-Touched refugees. Do I give it to them?",
      resolvedTag: "maeve_refugee_choice",
      options: [
        {
          id: "hand_list",
          label: "Hand over the list — the Order keeps order.",
          tag: "maeve_gave_list",
          delta: { chainwrights: 15, paleChoir: -15, independent: -10 },
          followUp: "She writes the names in a shaking hand. \"On your head, then.\""
        },
        {
          id: "burn_list",
          label: "Burn the list. Let them ask her yourself.",
          tag: "maeve_burned_list",
          delta: { chainwrights: -10, paleChoir: 10, independent: 10 },
          followUp: "She sets it alight in the hearth without a word of thanks — or blame."
        },
        {
          id: "warn_refugees",
          label: "Warn the refugees first, then stall the patrol.",
          tag: "maeve_warned_refugees",
          delta: { independent: 15, paleChoir: 5 },
          followUp: "\"Sky-child,\" she says quietly, \"that's the first kind thing anyone's offered this house in a month.\""
        }
      ]
    }
  },
  {
    id: "warden_oris",
    name: "Threadward Warden Oris",
    title: "Keeper of the Threadhold Ward",
    zoneId: "threadhold",
    position: { x: -3, y: 0, z: 14 },
    primaryFaction: "chainwrights",
    loyaltyType: "institutional",
    greetings: {
      unknown: "You're the one Sister Wren keeps vouching for. Good — I need hands that don't flinch near the ward.",
      met: "The ward's holding, for now. Mind the flicker near the eastern post.",
      friendly: "Good to see you. The ward's steadier since you started coming round.",
      trusted: "Order's better for having you in it. Truly.",
      hostile: "The Order doesn't forget deserters. Keep walking."
    },
    signatureChoice: {
      prompt: "The threadward is cracking again. I can reinforce it with Order steel, or let Sister Wren try one of her old rites first. Your read?",
      resolvedTag: "oris_ward_choice",
      options: [
        {
          id: "order_steel",
          label: "Reinforce it with Order steel.",
          tag: "oris_steel",
          delta: { chainwrights: 15, paleChoir: -5 },
          followUp: "He nods, already signaling the Hounds forward. \"Order it is. Fast and sure.\""
        },
        {
          id: "old_rite",
          label: "Let Sister Wren try the old rite.",
          tag: "oris_rite",
          delta: { paleChoir: 10, chainwrights: -5 },
          followUp: "He hesitates, then waves her forward. \"...Fine. But I'm watching.\""
        },
        {
          id: "both",
          label: "Do both — steel to buy her time.",
          tag: "oris_both",
          delta: { independent: 15 },
          followUp: "He blinks, then almost smiles. \"That's — actually good sense. Alright.\""
        }
      ]
    }
  },
  {
    id: "aldric_vane",
    name: "Aldric Vane",
    title: "High Chainwright of the Silver Thread",
    zoneId: "threadhold",
    position: { x: 5, y: 0, z: 2 },
    primaryFaction: "chainwrights",
    loyaltyType: "fanatic",
    greetings: {
      unknown: "High Chainwright Aldric Vane. I've heard of the Moon-Touched wandering my Order's roads. Convince me you are not a liability.",
      met: "The thread frays daily. I have little patience for those who waste my time.",
      friendly: "You've proven steadier than most who carry the Moon-Touched. Don't disappoint me.",
      trusted: "Few Moon-Touched earn my trust. You have. Do not make me regret it.",
      hostile: "Traitor. The Hounds have your description. Walk away while you still can."
    },
    signatureChoice: {
      prompt: "I have evidence a village was erased on my order, to stop a rupture from spreading. Expose it, or let it lie for the Order's sake?",
      resolvedTag: "aldric_crimes_choice",
      options: [
        {
          id: "expose",
          label: "Expose him publicly.",
          tag: "aldric_exposed",
          delta: { chainwrights: -25, paleChoir: 15, independent: 10 },
          followUp: "His jaw tightens. \"Then it is done. I hope your conscience is worth what comes next.\""
        },
        {
          id: "conceal",
          label: "Conceal it — the Order needs stability.",
          tag: "aldric_concealed",
          delta: { chainwrights: 20, independent: -10 },
          followUp: "\"Wise,\" he says, and for once sounds almost grateful."
        },
        {
          id: "confront",
          label: "Confront him privately, demand he confess.",
          tag: "aldric_confronted",
          delta: { chainwrights: 5, independent: 15 },
          followUp: "He is silent a long moment. \"...I will consider it. That is more than I have offered anyone in years.\""
        }
      ]
    }
  },
  {
    id: "vesryn_duskborne",
    name: "Vesryn the Duskborne",
    title: "Hierophant of the Pale Choir",
    zoneId: "threadhold",
    position: { x: -4, y: 0, z: -2 },
    primaryFaction: "paleChoir",
    loyaltyType: "ideological",
    greetings: {
      unknown: "You carry Selen's memory too, don't you? I can hear it in how you stand. I am Vesryn. I name what the world forgets.",
      met: "The moon remembers even what we do not. Walk gently.",
      friendly: "It eases something in me, seeing you again. Few return to a mourner twice.",
      trusted: "You have done what most cannot — you have grieved without looking away. Thank you.",
      hostile: "You have made your choice, and it was not remembrance. I will not stop you. I will only remember what it cost."
    },
    signatureChoice: {
      prompt: "A village nearby is being erased even now. I can only fully save one soul — myself, or a nameless child. What would you have me do?",
      resolvedTag: "vesryn_village_choice",
      options: [
        {
          id: "save_child",
          label: "Save the child. Let the Choir mourn you if it must.",
          tag: "vesryn_child_saved",
          delta: { paleChoir: 15, independent: 10 },
          followUp: "He does not hesitate. \"Then let it be so,\" he says, already walking toward the fire."
        },
        {
          id: "save_self",
          label: "You're needed more than one more name. Save yourself.",
          tag: "vesryn_self_saved",
          delta: { paleChoir: 5, independent: -5 },
          followUp: "His eyes close briefly. \"...I will carry that child's name regardless. Every name matters, sky-child.\""
        },
        {
          id: "find_both",
          label: "There has to be a third way — help me find it.",
          tag: "vesryn_both_sought",
          delta: { paleChoir: 10, independent: 15 },
          followUp: "For the first time, something like hope crosses his face. \"Then let us not waste the time that gives us.\""
        }
      ]
    }
  },
  {
    id: "forge_mother_breca",
    name: "Forge-Mother Breca",
    title: "Lord of the Ashmire Forges",
    zoneId: "ashmire",
    position: { x: 3, y: 0, z: 34 },
    primaryFaction: null,
    loyaltyType: "mercenary",
    greetings: {
      unknown: "New face at my forge. Coin's coin regardless of whose banner you fly. What do you need?",
      met: "Forge's hot today. Mind the sparks.",
      friendly: "Good customer, you. I keep the good stock in back for people like you.",
      trusted: "Best client Ashmire's seen in years. Anything in the forge is yours at cost.",
      hostile: "You cost me a contract once. Get out of my forge."
    },
    signatureChoice: {
      prompt: "Both the Chainwrights and the Luminari want exclusive weapon contracts. I can arm one, arm both under the table, or arm the independents instead. What's your read?",
      resolvedTag: "breca_contract_choice",
      options: [
        {
          id: "arm_chainwrights",
          label: "Arm the Chainwrights.",
          tag: "breca_armed_chainwrights",
          delta: { chainwrights: 20, luminari: -10 },
          followUp: "\"Order pays on time, at least,\" she grunts, already sketching new tallies."
        },
        {
          id: "arm_luminari",
          label: "Arm the Luminari.",
          tag: "breca_armed_luminari",
          delta: { luminari: 20, chainwrights: -10 },
          followUp: "She grins. \"Now that's interesting work. I like interesting work.\""
        },
        {
          id: "arm_independents",
          label: "Arm the independents instead.",
          tag: "breca_armed_independents",
          delta: { independent: 20 },
          followUp: "She raises an eyebrow, then laughs. \"Bad for business. I like it anyway.\""
        }
      ]
    }
  },
  {
    id: "artificer_perrin",
    name: "Artificer Perrin",
    title: "Chief Engineer of the Luminari",
    zoneId: "ashmire",
    position: { x: -3, y: 0, z: 32 },
    primaryFaction: "luminari",
    loyaltyType: "trueBeliever",
    greetings: {
      unknown: "Oh — oh! You're really Moon-Touched, aren't you? Sorry, I don't mean to stare, it's just — the readings I could take —",
      met: "The reactor's stable today. Mostly. Statistically.",
      friendly: "Good, you're back. I've been dying to show someone the new coil array.",
      trusted: "I trust you more than half the Luminari council, honestly. Don't tell Ilsa I said that.",
      hostile: "I— I have to report this conversation. I'm sorry. I have to."
    },
    signatureChoice: {
      prompt: "Ilsa wants to test a device that pulls memory straight from a Moon-Touched subject. I don't know if I can say no to her. What would you do?",
      resolvedTag: "perrin_experiment_choice",
      options: [
        {
          id: "participate",
          label: "I'll volunteer myself — better me than someone unwilling.",
          tag: "perrin_volunteered",
          delta: { luminari: 20, paleChoir: -15 },
          followUp: "His hands shake worse than usual. \"Thank you. I— thank you. I'll be careful. I promise.\""
        },
        {
          id: "refuse_report",
          label: "Refuse, and report the research.",
          tag: "perrin_reported",
          delta: { luminari: -25, paleChoir: 10, independent: 10 },
          followUp: "He goes pale. \"You don't understand what you've just—\" He doesn't finish the sentence."
        },
        {
          id: "find_volunteer",
          label: "Find a willing volunteer instead.",
          tag: "perrin_volunteer_found",
          delta: { luminari: 5, independent: 10 },
          followUp: "He exhales, relieved. \"That's— yes. That's better. That's so much better.\""
        }
      ]
    }
  }
];

export function getNpc(id: string): NpcDef | undefined {
  return NPCS.find((n) => n.id === id);
}

export function npcsInZone(zoneId: string): NpcDef[] {
  return NPCS.filter((n) => n.zoneId === zoneId);
}

export interface DialogueChoice {
  id: string;
  label: string;
}

export interface ResolvedDialogue {
  speaker: string;
  line: string;
  choices?: DialogueChoice[];
}

/** Greeting (plus the signature-choice prompt, if it hasn't been resolved yet) for the current visit. */
export function resolveDialogue(npc: NpcDef, memory: NpcMemoryState, loyalty: LoyaltyScores): ResolvedDialogue {
  const entry = memoryFor(memory, npc.id);
  const relationship = computeRelationship(gaugeKeyFor(npc), npc.loyaltyType, entry, loyalty);
  const greeting = npc.greetings[relationship];

  if (npc.signatureChoice && !entry.tags.includes(npc.signatureChoice.resolvedTag)) {
    return {
      speaker: npc.name,
      line: `${greeting} ${npc.signatureChoice.prompt}`,
      choices: npc.signatureChoice.options.map((o) => ({ id: o.id, label: o.label }))
    };
  }

  return { speaker: npc.name, line: greeting };
}

/** The line an NPC says immediately after the player resolves their signature choice. */
export function resolveFollowUp(npc: NpcDef, optionId: string): ResolvedDialogue | undefined {
  const option = npc.signatureChoice?.options.find((o) => o.id === optionId);
  if (!option) return undefined;
  return { speaker: npc.name, line: option.followUp };
}
