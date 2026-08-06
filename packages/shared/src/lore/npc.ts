/**
 * The wider NPC roster from the design bible, wired end-to-end: each has memory-conditional
 * greetings and one signature choice with real faction consequences (see docs/GDD.md's
 * "Playable conversations" section). A handful (marked by a `recruits: true` option) can join
 * the party as a companion — see CharacterState.companionIds and Room's companion AI. Rivalries,
 * alliances, and death cascades between NPCs are formalized as graph data in relationships.ts
 * rather than duplicated here; one option (on the Moonthread Warden) locks the scripted finale —
 * see `locksEndingThread` and endings.ts.
 */
import type { Vec3 } from "../vec.js";
import type { FactionId, LoyaltyDelta, LoyaltyKey, LoyaltyScores } from "./factions.js";
import { computeRelationship, memoryFor, type LoyaltyType, type NpcMemoryState, type RelationshipState } from "./memory.js";
import { cascadeFor } from "./relationships.js";
import type { ThreadAxis } from "./endings.js";

export interface DialogueOption {
  id: string;
  label: string;
  tag: string;
  delta: LoyaltyDelta;
  followUp: string;
  /** Choosing this option makes the NPC the player's companion (see CharacterState.companionIds). */
  recruits?: boolean;
  /**
   * Choosing this option is the scripted finale: it permanently locks CharacterState.endingId to
   * whichever of the nine MAJOR_ENDINGS matches this thread axis and the player's current
   * Moon-Touched stage (see endings.ts and Room.handleDialogueChoice). Reserved for the
   * Moonthread Warden's signature choice.
   */
  locksEndingThread?: ThreadAxis;
}

export interface SignatureChoice {
  prompt: string;
  resolvedTag: string;
  options: DialogueOption[];
}

/**
 * The relationship web (design bible section "NPC Influence Map" / "Web of Memory"): an NPC
 * can react to a choice you made with a *different* NPC entirely, not just their own memory
 * entry. Checked in order; the first match whose `npcId`+`tag` appears anywhere in the
 * player's memory wins and is appended to the greeting.
 */
export interface CrossReference {
  npcId: string;
  tag: string;
  line: string;
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
  crossReferences?: CrossReference[];
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
  },
  {
    id: "ilsa_marche",
    name: "Ilsa Marche",
    title: "Luminary of the Free Moon",
    zoneId: "ashmire",
    position: { x: 6, y: 0, z: 30 },
    primaryFaction: "luminari",
    loyaltyType: "fanatic",
    greetings: {
      unknown:
        "You're new. Good — new eyes for old problems. I'm Ilsa. Selen's power doesn't have to stay locked in a vault; it can light a thousand homes tonight, if we're brave enough to take it.",
      met: "The reactor hums a little brighter with you around.",
      friendly: "Every believer counts, and you're proving to be one of the good ones.",
      trusted: "You're not afraid of what we're building. I like that more than you know.",
      hostile: "You had your chance to see what the Free Moon could be. Get out of my workshop."
    },
    signatureChoice: {
      prompt: "A village orchard could power the new lunar engine for a decade if I drain it dry. Stop me, help me, or find a third way?",
      resolvedTag: "ilsa_village_choice",
      options: [
        {
          id: "stop_her",
          label: "Stop her — the village isn't yours to spend.",
          tag: "ilsa_stopped",
          delta: { luminari: -15, paleChoir: 10, independent: 10 },
          followUp: "Her jaw tightens, but she nods once. \"...Fine. We'll find another way. This time.\""
        },
        {
          id: "help_her",
          label: "Help her drain it — progress needs sacrifice.",
          tag: "ilsa_helped",
          delta: { luminari: 20, paleChoir: -15 },
          followUp: "She grins, already sketching the intake array. \"Now THIS is how the future gets built.\""
        },
        {
          id: "third_way",
          label: "Find a smaller source instead — buy her time.",
          tag: "ilsa_third_way",
          delta: { luminari: 5, independent: 15 },
          followUp: "She studies you a long moment. \"You actually found one, didn't you. ...Show me.\""
        }
      ]
    }
  },
  {
    id: "castellan_yora",
    name: "Castellan Yora",
    title: "Warden of the Silver Fortress",
    zoneId: "ashmire",
    position: { x: -6, y: 0, z: 28 },
    primaryFaction: "chainwrights",
    loyaltyType: "institutional",
    greetings: {
      unknown: "Castellan Yora, Silver Fortress. You fight well or you don't waste my time — which is it?",
      met: "Fortress holds. Mind the eastern wall, it's still settling.",
      friendly: "Good to have steady hands like yours nearby.",
      trusted: "Few earn my trust twice. You've done it more than that.",
      hostile: "You had a place here once. Don't test how far that memory stretches."
    },
    signatureChoice: {
      prompt: "Command wants me to raze a Moon-Touched refugee camp near the fortress 'for security.' I haven't given the order yet.",
      resolvedTag: "yora_camp_choice",
      options: [
        {
          id: "defy_order",
          label: "Defy the order. Protect the camp.",
          tag: "yora_defied",
          delta: { chainwrights: -10, paleChoir: 10, independent: 15 },
          followUp: "She exhales slowly. \"Then I'm defying it too. Don't make either of us regret this.\""
        },
        {
          id: "follow_order",
          label: "The order stands. Security first.",
          tag: "yora_followed_order",
          delta: { chainwrights: 15, independent: -15 },
          followUp: "She doesn't meet your eyes. \"Understood. It'll be done by dusk.\""
        },
        {
          id: "delay_order",
          label: "Stall the order while you find another option.",
          tag: "yora_delayed",
          delta: { chainwrights: 5, independent: 10 },
          followUp: "\"That buys us days, not years,\" she says. \"But I'll take days.\""
        }
      ]
    },
    crossReferences: [
      {
        npcId: "aldric_vane",
        tag: "aldric_exposed",
        line: "I heard what you did to Aldric. The Order's still shaking from it — some of us needed the shake."
      },
      {
        npcId: "aldric_vane",
        tag: "aldric_concealed",
        line: "Whatever you buried for Aldric's sake, I hope it stays buried. For both our sakes."
      }
    ]
  },
  {
    id: "magistrate_thorne",
    name: "Magistrate Thorne",
    title: "Silver Tongue of the Spirechain",
    zoneId: "spirechain",
    position: { x: 4, y: 0, z: 30 },
    primaryFaction: "chainwrights",
    loyaltyType: "pragmatic",
    greetings: {
      unknown: "Magistrate Thorne, of the Spirechain courts. Everyone who matters here owes someone a favor. I wonder what you'll owe me.",
      met: "The Assembly's in session. Try not to make my afternoon more complicated.",
      friendly: "You've been useful. I remember useful people.",
      trusted: "You and I understand each other, I think. That's rarer than loyalty.",
      hostile: "You made an enemy of the wrong accountant. The Hounds have a very thorough ledger."
    },
    signatureChoice: {
      prompt: "I can offer you a quiet pact — denounce one faction publicly, and I'll hand their territory to whichever you favor. Interested?",
      resolvedTag: "thorne_pact_choice",
      options: [
        {
          id: "accept_pact",
          label: "Accept the pact.",
          tag: "thorne_pact_accepted",
          delta: { chainwrights: 10, independent: -10 },
          followUp: "He smiles like a closing ledger. \"A pleasure doing business.\""
        },
        {
          id: "refuse_pact",
          label: "Refuse — you won't trade regions like coin.",
          tag: "thorne_pact_refused",
          delta: { independent: 15 },
          followUp: "He shrugs, unbothered. \"Principled. Rare, in this city. I'll remember it.\""
        },
        {
          id: "expose_pact",
          label: "Expose the offer publicly.",
          tag: "thorne_pact_exposed",
          delta: { chainwrights: -20, independent: 20 },
          followUp: "For the first time, something like alarm crosses his face. \"...That was unwise of you to say aloud.\""
        }
      ]
    }
  },
  {
    id: "sera_voss",
    name: "Captain Sera Voss",
    title: "Privateer of the Luminous Wake",
    zoneId: "sunken_llyr",
    position: { x: 4, y: 0, z: 36 },
    primaryFaction: "luminari",
    loyaltyType: "mercenary",
    greetings: {
      unknown: "Captain Sera Voss, Luminous Wake. You look like you can hold your footing on a deck. Coin's coin, whoever's banner you fly.",
      met: "Tide's calm today. Good day for smuggling, honestly.",
      friendly: "Good to see a familiar face on the docks.",
      trusted: "You've more than earned a berth on my crew, whenever you want it.",
      hostile: "You cost me cargo once. The sea's a small place — watch your back on it."
    },
    signatureChoice: {
      prompt: "My old crew's bodies are still in a wreck offshore. I could recover them properly, or salvage the cargo instead and let them rest where they are.",
      resolvedTag: "sera_crew_choice",
      options: [
        {
          id: "recover_crew",
          label: "Recover the crew. They deserve better than a wreck.",
          tag: "sera_crew_recovered",
          delta: { luminari: 10, independent: 15 },
          followUp: "She's quiet a long moment, then nods sharply. \"...Thank you. Truly.\""
        },
        {
          id: "salvage_cargo",
          label: "Salvage the cargo — it's what they'd have wanted.",
          tag: "sera_cargo_salvaged",
          delta: { luminari: 15, independent: -10 },
          followUp: "She pockets the manifest without looking at it twice. \"Practical. I can respect that.\""
        },
        {
          id: "trap_netta",
          label: "Use the wreck to finally trap Netta Blacktide.",
          tag: "sera_netta_trapped",
          delta: { luminari: 10, independent: 5 },
          followUp: "Something dark and satisfied crosses her face. \"Now THAT'S a use for an old grave.\""
        }
      ]
    }
  },
  {
    id: "tidecaller_oren",
    name: "Tidecaller Oren",
    title: "Spirit-Guide of Sunken Llyr",
    zoneId: "sunken_llyr",
    position: { x: -4, y: 0, z: 36 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "The tide brought you to me, or you to it — same thing, some days. I'm Oren. I speak to what the sea keeps.",
      met: "The tide's memory runs deep today. Mind where you step.",
      friendly: "The sea speaks well of you, sky-child. That's not nothing.",
      trusted: "Few living people the drowned trust as they trust you now.",
      hostile: "You looted what the sea keeps sacred. Don't come back to this shore."
    },
    signatureChoice: {
      prompt: "A drowned Selenian city is rising from the depths. Let it sleep, raise it for study, or loot it while we can?",
      resolvedTag: "oren_city_choice",
      options: [
        {
          id: "let_sleep",
          label: "Let it sleep.",
          tag: "oren_city_slept",
          delta: { paleChoir: 10, independent: 15 },
          followUp: "He nods slowly. \"The sea will remember this kindness. So will I.\""
        },
        {
          id: "raise_it",
          label: "Raise it — the world deserves to know what's down there.",
          tag: "oren_city_raised",
          delta: { luminari: 10, paleChoir: -10 },
          followUp: "He looks troubled but doesn't stop you. \"Then may you be ready for what wakes with it.\""
        },
        {
          id: "loot_it",
          label: "Loot it while the tide allows.",
          tag: "oren_city_looted",
          delta: { independent: -20, paleChoir: -15 },
          followUp: "His expression goes cold as stone. \"The drowned dead have long memories, sky-child. Longer than yours.\""
        }
      ]
    }
  },
  {
    id: "mira_hollowbell",
    name: "Mira Hollowbell",
    title: "Mourner of the Pale Choir",
    zoneId: "mourncrown",
    position: { x: 4, y: 0, z: 38 },
    primaryFaction: "paleChoir",
    loyaltyType: "trueBeliever",
    greetings: {
      unknown: "You hear it too, don't you — the bell, under everything. I'm Mira. I name what the world forgets. What's your name, sky-child?",
      met: "The bell's quiet today. That's not always a good sign.",
      friendly: "It eases something in me, seeing you return.",
      trusted: "You grieve without looking away. That's rarer than courage, I think.",
      hostile: "You had the chance to remember, and you chose to forget instead. I won't stop you. I'll only ring for what it cost."
    },
    signatureChoice: {
      prompt: "A village is being erased even now. I can only fully save one soul — a nameless child, or myself. What would you have me do?",
      resolvedTag: "mira_village_choice",
      options: [
        {
          id: "save_child",
          label: "Save the child. The Choir can mourn you if it must.",
          tag: "mira_child_saved",
          delta: { paleChoir: 5, independent: -5 },
          followUp: "She doesn't hesitate. \"Then let it be so,\" she says, walking toward the smoke."
        },
        {
          id: "save_mira",
          label: "You're needed more. Save yourself.",
          tag: "mira_self_saved",
          delta: { paleChoir: 15, independent: 10 },
          followUp: "Her eyes close. \"...I will carry that child's name regardless. I promise you that.\""
        },
        {
          id: "both",
          label: "There has to be a way to save both — help me find it.",
          tag: "mira_both_sought",
          delta: { paleChoir: 10, independent: 15 },
          followUp: "Something like hope crosses her face. \"Then let's not waste what time that buys us.\""
        }
      ]
    }
  },
  {
    id: "brother_ink",
    name: "Brother Ink",
    title: "Chronicler of the Book of Dusk",
    zoneId: "mourncrown",
    position: { x: -4, y: 0, z: 38 },
    primaryFaction: "paleChoir",
    loyaltyType: "ideological",
    greetings: {
      unknown: "Brother Ink. I keep the Book of Dusk — every name the moon or the Order tried to erase. Try not to become an entry too soon.",
      met: "Still writing. There's always another name.",
      friendly: "Good. I was hoping you'd come back — I have questions only you can answer.",
      trusted: "You've given me more true pages than a decade of quiet archivists. Thank you.",
      hostile: "I've struck your name from the Book. As far as it's concerned, you were never here."
    },
    signatureChoice: {
      prompt: "I've found a forbidden archive proving the Binding was theft and massacre, not rescue. Recover it, destroy it, or let me read it first before you decide?",
      resolvedTag: "ink_archive_choice",
      options: [
        {
          id: "recover_archive",
          label: "Recover it. The truth belongs in the open.",
          tag: "ink_archive_recovered",
          delta: { paleChoir: 15, chainwrights: -15, independent: 10 },
          followUp: "He exhales like he's been holding his breath for years. \"Then let's go get it.\""
        },
        {
          id: "destroy_archive",
          label: "Destroy it — some truths cost more than they're worth.",
          tag: "ink_archive_destroyed",
          delta: { chainwrights: 10, paleChoir: -20 },
          followUp: "His voice goes flat. \"Then you're no different from the ones who burned my library. Go.\""
        },
        {
          id: "read_first",
          label: "Read it yourself first, then decide together.",
          tag: "ink_archive_read",
          delta: { independent: 15, paleChoir: 5 },
          followUp: "He studies you, surprised. \"...That's the first careful answer anyone's given me in years.\""
        }
      ]
    },
    crossReferences: [
      {
        npcId: "vesryn_duskborne",
        tag: "vesryn_child_saved",
        line: "Vesryn told me what you chose, at that village. I've already written the child's name. Yours too, if you'll give it."
      },
      {
        npcId: "vesryn_duskborne",
        tag: "vesryn_self_saved",
        line: "Vesryn is alive because of you. I don't know if that was mercy or theft from the dead. I'm still deciding."
      }
    ]
  },
  {
    id: "thane_corvin",
    name: "Thane Corvin",
    title: "Clan Chief of Mourncrown",
    zoneId: "mourncrown",
    position: { x: 0, y: 0, z: 34 },
    primaryFaction: null,
    loyaltyType: "ideological",
    greetings: {
      unknown: "Thane Corvin, of the last free clan in these highlands. Speak plainly, or don't speak at all.",
      met: "The clan holds. Barely, some nights.",
      friendly: "You fight with honor. That's earned you a seat at my fire.",
      trusted: "Few outsiders earn a clan's trust. You've earned mine twice over.",
      hostile: "You brought shame to my hall. Don't return to it."
    },
    signatureChoice: {
      prompt: "A Chainwright army wants passage through Mourncrown to strike the Pale Choir. Defend the hall to the last, or help me evacuate the clan instead?",
      resolvedTag: "corvin_hall_choice",
      options: [
        {
          id: "defend_hall",
          label: "Defend the hall — some things are worth dying for.",
          tag: "corvin_hall_defended",
          delta: { paleChoir: 15, chainwrights: -15 },
          followUp: "He draws his blade with something like relief. \"Then let them come. We'll die remembered, not evacuated.\""
        },
        {
          id: "evacuate",
          label: "Evacuate — the clan matters more than the hall.",
          tag: "corvin_hall_evacuated",
          delta: { independent: 15, paleChoir: 5 },
          followUp: "Shame and relief war on his face. \"...The living over the stones, then. Help me move them.\""
        },
        {
          id: "betray_hall",
          label: "Let the Chainwrights have the hall — buy the clan safety.",
          tag: "corvin_hall_betrayed",
          delta: { chainwrights: 15, paleChoir: -20, independent: -10 },
          followUp: "Something in him goes very quiet. \"Then it's done. I hope your safety was worth my name.\""
        }
      ]
    },
    crossReferences: [
      {
        npcId: "aldric_vane",
        tag: "aldric_exposed",
        line: "Word reached the highlands: you humbled the man who annexed my grandfather's land. My clan owes you a debt for that alone."
      }
    ]
  },
  {
    id: "archon_scribe_velis",
    name: "Archon-Scribe Velis",
    title: "Master of the Spirechain Archives",
    zoneId: "spirechain",
    position: { x: -4, y: 0, z: 30 },
    primaryFaction: null,
    loyaltyType: "mercenary",
    greetings: {
      unknown: "A new mind to pick! I'm Velis, keeper of everything anyone's ever tried to bury. What do you know that I don't?",
      met: "The archive's always hungry. What have you brought me?",
      friendly: "Ah, a reliable source. Those are worth more than gold in this business.",
      trusted: "You're one of my best informants — and I include the professionals in that count.",
      hostile: "You stole from my archive. I've sold your description to three separate interested parties. Good luck."
    },
    signatureChoice: {
      prompt: "I'd pay handsomely for a sample of your Moon-Touched blood — pure research, of course. Interested?",
      resolvedTag: "velis_blood_choice",
      options: [
        {
          id: "refuse_blood",
          label: "Refuse. Some things aren't for sale.",
          tag: "velis_blood_refused",
          delta: { independent: 10, paleChoir: 5 },
          followUp: "He shrugs, entirely unbothered. \"Your prerogative. I'll find another source. I always do.\""
        },
        {
          id: "give_blood",
          label: "Give a sample — knowledge is worth the risk.",
          tag: "velis_blood_given",
          delta: { luminari: 10, paleChoir: -10 },
          followUp: "His eyes light up like a man who just won a bet. \"Marvelous. Absolutely marvelous. This will unlock so much.\""
        },
        {
          id: "steal_from_him",
          label: "Take what you need from his archive instead, uninvited.",
          tag: "velis_archive_stolen",
          delta: { independent: -15 },
          followUp: "His smile doesn't waver, but something colder enters his voice. \"Bold. I'll remember that boldness, sky-child.\""
        }
      ]
    }
  },
  {
    id: "warden_kael",
    name: "Warden Kael",
    title: "Protector of the Frayedge Outcasts",
    zoneId: "frayedge",
    position: { x: 4, y: 0, z: 46 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "Warden Kael. This is Frayedge — the only place left that doesn't ask what you are before it feeds you. Keep it that way, and we'll get along.",
      met: "Sanctuary holds another day. That's the job.",
      friendly: "Good to see you back safe. Not everyone who leaves does.",
      trusted: "You've done more for this place than most who call it home. Thank you.",
      hostile: "You had a place in this sanctuary. You forfeited it. Don't come back."
    },
    signatureChoice: {
      prompt: "The Chainwrights are readying a raid on the sanctuary. Defend it with me, help everyone evacuate through the tunnels, or — if you're desperate enough — sell them the location for a reward?",
      resolvedTag: "kael_raid_choice",
      options: [
        {
          id: "defend_sanctuary",
          label: "Defend it. This ends here.",
          tag: "kael_sanctuary_defended",
          delta: { paleChoir: 15, independent: 20, chainwrights: -15 },
          followUp: "He grips his blade, something fierce and grateful in his eyes. \"Then we hold. Together.\""
        },
        {
          id: "evacuate_sanctuary",
          label: "Evacuate through the tunnels — scatter and survive.",
          tag: "kael_sanctuary_evacuated",
          delta: { independent: 15, paleChoir: 5 },
          followUp: "\"Alive and scattered beats remembered and dead,\" he says grimly. \"Move, everyone, now.\""
        },
        {
          id: "betray_sanctuary",
          label: "Sell the location. Everyone has a price.",
          tag: "kael_sanctuary_betrayed",
          delta: { chainwrights: 20, independent: -30, paleChoir: -20 },
          followUp: "His face goes utterly still. \"...Get out of my sanctuary. While you still can.\""
        }
      ]
    },
    crossReferences: [
      {
        npcId: "castellan_yora",
        tag: "yora_defied",
        line: "I heard a Chainwright Castellan defied her own Order to protect a refugee camp. Because of you, they say. I didn't believe it until now."
      },
      {
        npcId: "castellan_yora",
        tag: "yora_followed_order",
        line: "I heard what happened to that refugee camp near the fortress. I won't ask if you could have stopped it. I already know the answer stings."
      }
    ]
  },
  {
    id: "the_cartographer",
    name: "The Cartographer",
    title: "Guide of the Moonthread",
    zoneId: "frayedge",
    position: { x: -4, y: 0, z: 44 },
    primaryFaction: null,
    loyaltyType: "ideological",
    greetings: {
      unknown: "You've come far enough that I can finally see you. I map the Moonthread — the road that leads, if you're brave or foolish enough, all the way to Selen.",
      met: "The road is still there, sky-child. It waits for no one, and it waits for everyone.",
      friendly: "You keep returning to the edge of the map. Good. That's where the truth lives.",
      trusted: "Few walk this far and still ask the right questions. You do. That matters more than you know.",
      hostile: "You raised a blade against a mapmaker. Careless. The road remembers carelessness."
    },
    signatureChoice: {
      prompt: "I can lead you to Selen itself, when you're ready — but the road asks something of everyone who walks it. Do you trust me to lead you there?",
      resolvedTag: "cartographer_trust_choice",
      options: [
        {
          id: "trust_them",
          label: "Yes. Lead the way.",
          tag: "cartographer_trusted",
          delta: { independent: 15 },
          followUp: "Something unreadable crosses their face — relief, or recognition. \"Then the road remembers you now, too.\""
        },
        {
          id: "refuse_them",
          label: "Not yet. I need more time.",
          tag: "cartographer_refused",
          delta: { independent: 5 },
          followUp: "They incline their head, unbothered. \"The road doesn't expire. Return when you're certain.\""
        },
        {
          id: "demand_answers",
          label: "Not until you tell me what you really are.",
          tag: "cartographer_questioned",
          delta: { independent: 10, paleChoir: 5 },
          followUp: "A long silence. \"...Fair. Ask me again when you're ready to hear the answer.\""
        }
      ]
    }
  },
  {
    id: "pip",
    name: "Pip",
    title: "Child of Threadhold",
    zoneId: "threadhold",
    position: { x: 0, y: 0, z: 12 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "You're the one who came back from the crater, aren't you? Everyone says you're not supposed to be alive. You don't look dead to me.",
      met: "Elder Maeve says I can talk to you if I want. I want to.",
      friendly: "You always come back. Nobody else always comes back.",
      trusted: "You're basically family now. Don't tell Elder Maeve I said that. She'll get weepy.",
      hostile: "You left. Everyone I count on leaves. I should've known."
    },
    signatureChoice: {
      prompt: "Elder Maeve says I have to pick somewhere to belong — with her, with the Chainwrights, or with the Luminari researchers. What do you think I should do?",
      resolvedTag: "pip_belonging_choice",
      options: [
        {
          id: "stay_with_maeve",
          label: "Stay with Elder Maeve, where you're safe.",
          tag: "pip_stayed",
          delta: { independent: 15 },
          followUp: "She grins, relieved. \"Good. I didn't want to go anyway. I just wanted someone to say it out loud.\""
        },
        {
          id: "chainwright_ward",
          label: "The Chainwrights could give you training and structure.",
          tag: "pip_warded_chainwright",
          delta: { chainwrights: 15, independent: -10 },
          followUp: "Her smile falters, but she nods. \"...Okay. If you think that's best.\""
        },
        {
          id: "luminari_study",
          label: "The Luminari could study your resonance, help you understand it.",
          tag: "pip_warded_luminari",
          delta: { luminari: 15, independent: -15 },
          followUp: "She looks uncertain but curious. \"They said I could ask questions any time I wanted. I guess... okay.\""
        }
      ]
    }
  },
  {
    id: "sister_wren",
    name: "Sister Wren",
    title: "Healer of Threadhold",
    zoneId: "threadhold",
    position: { x: -6, y: 0, z: 10 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown:
        "Hold still — let me look at that wound. ...It's healing wrong. Too fast. Silver at the edges. You're Moon-Touched, aren't you? Don't worry. I won't tell.",
      met: "How are you feeling? Truly, not politely.",
      friendly: "I'm glad you keep coming back to check in. Not everyone does.",
      trusted: "You've trusted me with more than most patients ever do. I don't take that lightly.",
      hostile: "I trusted you with people's lives. I won't make that mistake twice."
    },
    signatureChoice: {
      prompt: "I've been hiding Moon-Touched patients in my cellar for years. Houndmaster Vex is getting suspicious. Keep hiding them, move them somewhere safer, or should I stop before it's too late?",
      resolvedTag: "wren_cellar_choice",
      options: [
        {
          id: "keep_hiding",
          label: "Keep hiding them here — moving them is riskier.",
          tag: "wren_kept_hiding",
          delta: { paleChoir: 10, independent: 5 },
          followUp: "She nods, jaw tight. \"Then I'll keep the cellar stocked. And the door locked.\""
        },
        {
          id: "move_them",
          label: "Help her move them to the Frayedge sanctuary.",
          tag: "wren_moved_patients",
          delta: { independent: 20, paleChoir: 5 },
          followUp: "Relief floods her face. \"Truly? I've been so afraid for them. Thank you.\""
        },
        {
          id: "stop_hiding",
          label: "Tell her to stop — it's too dangerous to keep hiding them.",
          tag: "wren_stopped",
          delta: { chainwrights: 15, paleChoir: -20, independent: -15 },
          followUp: "Her expression hardens into something you haven't seen from her before. \"...Get out of my clinic.\""
        }
      ]
    }
  },
  {
    id: "slag",
    name: "Slag",
    title: "Forgemaster of Ashmire",
    zoneId: "ashmire",
    position: { x: 8, y: 0, z: 36 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "New face at the forge. Mind the sparks — this pit's eaten more idiots than accidents. I'm Slag. What do you need forged?",
      met: "Forge's hot today. Good day for real work.",
      friendly: "Good customer. Come by the back — I keep the good stock for people who respect the craft.",
      trusted: "Best client Ashmire's seen in years. Anything in this forge is yours at cost.",
      hostile: "You stole from my forge. Don't come back."
    },
    signatureChoice: {
      prompt: "Bring me a pure Moonshard and I can forge a weapon that can actually hurt the Hollowed. It's dangerous work. Bring it, or should I stick to safer steel?",
      resolvedTag: "slag_shard_choice",
      options: [
        {
          id: "bring_shard",
          label: "Bring him the shard — the weapon's worth the risk.",
          tag: "slag_shard_brought",
          delta: { luminari: 5, independent: 10 },
          followUp: "His eyes light up like a kid's. \"Now THAT'S a job worth doing. Give me three days.\""
        },
        {
          id: "safer_steel",
          label: "Stick to safer steel — not worth the corruption risk.",
          tag: "slag_steel_only",
          delta: { paleChoir: 10, independent: 5 },
          followUp: "He grunts, a little disappointed but not unkind. \"Cautious. Fine. Ordinary steel it is.\""
        },
        {
          id: "steal_tools",
          label: "Take his tools instead — save the trip.",
          tag: "slag_tools_stolen",
          delta: { independent: -20 },
          followUp: "His face goes red, then very still. \"Get. Out. Of my forge.\""
        }
      ]
    }
  },
  {
    id: "pyra_emberhand",
    name: "Pyra Emberhand",
    title: "Luminari Pyromancer",
    zoneId: "ashmire",
    position: { x: -8, y: 0, z: 34 },
    primaryFaction: "luminari",
    loyaltyType: "fanatic",
    greetings: {
      unknown: "You're standing awfully close to my test range. Either you're brave or you don't understand fire yet. I'm Pyra. I'll teach you either way.",
      met: "Careful — the range is live today.",
      friendly: "Good, someone who isn't afraid to get close to the real work.",
      trusted: "You understand fire the way I do. That's rarer than you'd think.",
      hostile: "You cost me my favorite test site. I don't forget that kind of thing."
    },
    signatureChoice: {
      prompt: "I want to burn out a Hollowed nest in a Mourncrown forest — fast, effective, and it'll torch the whole treeline. Help me, stop me, or redirect the fire somewhere emptier?",
      resolvedTag: "pyra_forest_choice",
      options: [
        {
          id: "help_burn",
          label: "Help her burn it — results matter more than trees.",
          tag: "pyra_helped",
          delta: { luminari: 15, paleChoir: -15 },
          followUp: "She grins fiercely. \"Now you're thinking like a Luminari. Let's light it up.\""
        },
        {
          id: "stop_pyra",
          label: "Stop her — that forest matters to the people who live near it.",
          tag: "pyra_stopped",
          delta: { paleChoir: 10, luminari: -15, independent: 5 },
          followUp: "She glares, furious, but backs off. \"...Fine. Your conscience, your problem when the nest grows back.\""
        },
        {
          id: "redirect_fire",
          label: "Redirect the burn to an empty stretch of ground instead.",
          tag: "pyra_redirected",
          delta: { independent: 15 },
          followUp: "She considers it, surprised. \"...Efficient AND survivable. Fine. Show me where.\""
        }
      ]
    }
  },
  {
    id: "old_finn",
    name: "Old Finn",
    title: "Lighthouse Keeper",
    zoneId: "sunken_llyr",
    position: { x: 8, y: 0, z: 42 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "Lighthouse keeper, name of Finn. This light's older than the Binding itself, or so I was told as a boy. Mind the rocks; the tide lies about them.",
      met: "Light's burning steady tonight. That's a good sign, some nights.",
      friendly: "Good to see a friendly face on the rocks. Not many bother anymore.",
      trusted: "You've done more for this old light than anyone in years. Thank you, truly.",
      hostile: "You had a hand in what happened to my light. I won't forget that."
    },
    signatureChoice: {
      prompt: "A faction wants to convert my lighthouse — for wards, for reactors, doesn't matter which. Help me keep it neutral, or let it go to whoever offers the best terms?",
      resolvedTag: "finn_lighthouse_choice",
      options: [
        {
          id: "keep_neutral",
          label: "Help him keep it neutral — the light belongs to everyone.",
          tag: "finn_kept_neutral",
          delta: { independent: 20 },
          followUp: "His weathered face breaks into a real smile. \"Then it stays a light, not a weapon. Thank you, truly.\""
        },
        {
          id: "convert_luminari",
          label: "Convince him to let the Luminari convert it — bright minds, not blunt swords.",
          tag: "finn_converted_luminari",
          delta: { luminari: 15, independent: -10 },
          followUp: "He sighs, resigned. \"If it must change hands, better that than the alternative, I suppose.\""
        },
        {
          id: "let_it_go",
          label: "Let it go to whoever pays best — it's just a building.",
          tag: "finn_let_go",
          delta: { independent: -15 },
          followUp: "Something in him dims, quieter than the tide. \"...I suppose it was always going to end this way.\""
        }
      ]
    }
  },
  {
    id: "the_selenian",
    name: "The Selenian",
    title: "Hidden Survivor",
    zoneId: "sunken_llyr",
    position: { x: -8, y: 0, z: 42 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "...You can see me clearly, don't you. Most people's eyes slide right past. I am called many things here. None of them my true name.",
      met: "The tide still keeps my secret. For now.",
      friendly: "You've kept my secret well. That means more than you know.",
      trusted: "You are the first living Aethonian I have trusted with the whole truth in longer than you'd believe.",
      hostile: "You gave my name to those who would cage me. I hope it was worth it."
    },
    signatureChoice: {
      prompt: "You could expose what I am to the Chainwrights, protect my secret, or ask me to tell you the true history of the Binding. What would you have of me?",
      resolvedTag: "selenian_secret_choice",
      options: [
        {
          id: "protect_secret",
          label: "Protect your secret. You've earned that much.",
          tag: "selenian_protected",
          delta: { paleChoir: 10, independent: 15 },
          followUp: "Something in their ancient eyes eases, just slightly. \"Then perhaps Aethon is not entirely lost to kindness.\""
        },
        {
          id: "expose_selenian",
          label: "Expose you — the Chainwrights need to know what you are.",
          tag: "selenian_exposed",
          delta: { chainwrights: 20, paleChoir: -20, independent: -20 },
          followUp: "They don't flinch, but something ancient and sad settles over their face. \"...Of course. It was always going to end this way.\""
        },
        {
          id: "learn_history",
          label: "Tell me the true history of the Binding.",
          tag: "selenian_history_learned",
          delta: { independent: 10 },
          followUp: "They study you for a long moment. \"Very well. Sit. This will take longer than you expect, and change more than you're ready for.\""
        }
      ]
    }
  },
  {
    id: "skald_varn",
    name: "Skald Varn",
    title: "Singer of Dead Kings",
    zoneId: "mourncrown",
    position: { x: 6, y: 0, z: 44 },
    primaryFaction: null,
    loyaltyType: "ideological",
    greetings: {
      unknown:
        "A new verse walks into my sight. I'm Skald Varn — I sing the deeds of heroes and villains alike, and I haven't decided which you'll be yet.",
      met: "Still composing. You give me plenty to work with.",
      friendly: "Your saga grows more interesting with every telling.",
      trusted: "I've sung true songs about liars and lies about heroes. Yours, I intend to sing true.",
      hostile: "I've sung your name already, sky-child. Not kindly."
    },
    signatureChoice: {
      prompt: "I'm ready to sing your saga across every hall in Aethon. Should I sing it true, flatter you for the crowd, or leave your name out of it entirely?",
      resolvedTag: "varn_saga_choice",
      options: [
        {
          id: "sing_true",
          label: "Sing it true, whatever the cost to my reputation.",
          tag: "varn_sang_true",
          delta: { independent: 15, paleChoir: 5 },
          followUp: "He nods slowly, something like respect in his eyes. \"Truth is the hardest song to sing. I'll do it justice.\""
        },
        {
          id: "sing_flattering",
          label: "Flatter me a little — a hero needs a good story.",
          tag: "varn_sang_flattering",
          delta: { independent: 5 },
          followUp: "He grins, already composing. \"Ah, a patron of the classics. Very well — legendary it is.\""
        },
        {
          id: "forbid_song",
          label: "Leave my name out of it. I don't want the attention.",
          tag: "varn_song_forbidden",
          delta: { independent: 10 },
          followUp: "He looks almost disappointed, but bows his head. \"As you wish. Some legends prefer silence. Rare, but understandable.\""
        }
      ]
    }
  },
  {
    id: "lady_maren",
    name: "Lady Maren",
    title: "Noble of the Last House",
    zoneId: "mourncrown",
    position: { x: -6, y: 0, z: 44 },
    primaryFaction: null,
    loyaltyType: "institutional",
    greetings: {
      unknown: "Lady Maren, of the Last House — what remains of it. Forgive the ruin. The Chainwrights left little of my family's kingdom standing.",
      met: "The manor still stands, for now. Barely.",
      friendly: "It's rare to find someone who cares about what was, not just what's useful now.",
      trusted: "You've done more to preserve my family's history than any of my own relations. Thank you.",
      hostile: "You let my family's history burn. I won't forget who stood by while it did."
    },
    signatureChoice: {
      prompt: "I want to restore my family's archive, but every faction wants to claim the manor for their own use. Help me keep it independent, let a faction have it, or burn it so no one can misuse it?",
      resolvedTag: "maren_manor_choice",
      options: [
        {
          id: "keep_independent",
          label: "Help her keep it independent.",
          tag: "maren_kept_independent",
          delta: { independent: 20 },
          followUp: "She exhales, visibly relieved. \"Then the truth stays mine to tell, not theirs to rewrite. Thank you.\""
        },
        {
          id: "faction_claim",
          label: "Let a faction take it — she needs the protection.",
          tag: "maren_faction_claimed",
          delta: { chainwrights: 10, independent: -10 },
          followUp: "She nods stiffly. \"Protection with a price, as always. So be it.\""
        },
        {
          id: "burn_manor",
          label: "Burn it — better gone than misused.",
          tag: "maren_manor_burned",
          delta: { paleChoir: 5, independent: -15 },
          followUp: "Something in her breaks quietly. \"...Then let it burn. At least the choice was mine.\""
        }
      ]
    }
  },
  {
    id: "chancellor_irin",
    name: "Chancellor Irin",
    title: "Ruler of the Spirechain Assembly",
    zoneId: "spirechain",
    position: { x: 6, y: 0, z: 36 },
    primaryFaction: "chainwrights",
    loyaltyType: "pragmatic",
    greetings: {
      unknown: "Chancellor Irin, of the Spirechain Assembly. Every visitor to my city is a variable I'd like to understand quickly. Humor me?",
      met: "The Assembly's always in session, one way or another.",
      friendly: "You've been a useful variable, I'll admit.",
      trusted: "Few outsiders earn my genuine trust. You have it, for now.",
      hostile: "You cost me control of my own city once. I don't forgive that lightly."
    },
    signatureChoice: {
      prompt: "I can offer a secret pact — publicly denounce one faction, and I'll shift their territory to whichever you favor. Accept it, refuse, or expose the offer to force an open summit?",
      resolvedTag: "irin_pact_choice",
      options: [
        {
          id: "accept_irin_pact",
          label: "Accept the pact.",
          tag: "irin_pact_accepted",
          delta: { chainwrights: 10, independent: -15 },
          followUp: "She smiles thinly. \"Spirechain thanks you. Quietly, of course.\""
        },
        {
          id: "refuse_irin_pact",
          label: "Refuse — Spirechain deserves better than backroom deals.",
          tag: "irin_pact_refused",
          delta: { independent: 15 },
          followUp: "She studies you, recalculating. \"...Noted. And oddly refreshing.\""
        },
        {
          id: "force_summit",
          label: "Expose the offer and force a summit between all three factions.",
          tag: "irin_summit_forced",
          delta: { independent: 25, chainwrights: -10 },
          followUp: "For once, she looks genuinely startled. \"That is either very brave or very foolish. We'll see which.\""
        }
      ]
    }
  },
  {
    id: "novice_tarn",
    name: "Novice Tarn",
    title: "Student Who Discovered the Truth",
    zoneId: "spirechain",
    position: { x: -6, y: 0, z: 36 },
    primaryFaction: null,
    loyaltyType: "trueBeliever",
    greetings: {
      unknown: "Oh — oh, careful, don't let anyone see this. I'm Novice Tarn. I found something in the archive I don't think I was meant to find.",
      met: "Still terrified. Still convinced I have to do something about it.",
      friendly: "You're the only person I trust with this. Please don't make me regret that.",
      trusted: "You've protected me more than anyone else in this city ever has. Thank you.",
      hostile: "You let them silence me. I hope whatever you gained was worth it."
    },
    signatureChoice: {
      prompt: "I have proof the Binding was a crime, not a rescue. Help me publish it, help me flee somewhere safe, or should I stay silent to protect myself?",
      resolvedTag: "tarn_truth_choice",
      options: [
        {
          id: "publish_truth",
          label: "Publish it. The truth deserves to be known.",
          tag: "tarn_truth_published",
          delta: { paleChoir: 15, chainwrights: -20, independent: 15 },
          followUp: "He looks terrified and resolved at once. \"Then let's go make history very uncomfortable.\""
        },
        {
          id: "help_flee",
          label: "Help him flee somewhere safe instead.",
          tag: "tarn_helped_flee",
          delta: { independent: 15 },
          followUp: "Relief floods his face. \"Alive and unpublished beats dead and vindicated. Thank you.\""
        },
        {
          id: "stay_silent",
          label: "Tell him to stay silent — it's too dangerous.",
          tag: "tarn_stayed_silent",
          delta: { chainwrights: 10, independent: -10 },
          followUp: "He nods slowly, something extinguished behind his eyes. \"...Maybe you're right. Maybe I was never brave enough for this.\""
        }
      ]
    }
  },
  {
    id: "hollow_singer",
    name: "Hollow-Singer",
    title: "Leader of the Hollowed Commune",
    zoneId: "frayedge",
    position: { x: 8, y: 0, z: 52 },
    primaryFaction: null,
    loyaltyType: "ideological",
    greetings: {
      unknown:
        "You still hold your name so tightly. I remember holding mine that way too. I am called Hollow-Singer now. It fits better than the one I lost.",
      met: "The commune sings tonight. You're welcome to listen, sky-child.",
      friendly: "You return, again and again. Selen notices patience like yours.",
      trusted: "You understand now, don't you. What we are. What we could all become.",
      hostile: "You raised a blade against my commune. Selen remembers cruelty as clearly as kindness."
    },
    signatureChoice: {
      prompt: "Join the commune and embrace what you're becoming, negotiate peaceful coexistence between us and the wary world, or refuse and walk away from the whispers entirely?",
      resolvedTag: "hollowsinger_choice",
      options: [
        {
          id: "join_commune",
          label: "Join the commune. Embrace it.",
          tag: "hollowsinger_joined",
          delta: { independent: -10 },
          followUp: "Something in their many-layered voice warms. \"Then welcome home, sky-child. The whispers will teach you the rest.\""
        },
        {
          id: "negotiate_coexist",
          label: "Negotiate coexistence between the commune and the wary world.",
          tag: "hollowsinger_coexist",
          delta: { independent: 20, paleChoir: 10 },
          followUp: "They consider this a long moment. \"...A harder path than surrender. I respect it more for that.\""
        },
        {
          id: "refuse_hollowsinger",
          label: "Refuse. You won't lose yourself to the whispers.",
          tag: "hollowsinger_refused",
          delta: { chainwrights: 5, independent: 10 },
          followUp: "Something almost like sorrow crosses their face. \"Then I hope your name stays yours long enough to matter.\""
        }
      ]
    }
  },
  {
    id: "the_falling_man",
    name: "The Falling Man",
    title: "Fading Between Memory and Self",
    zoneId: "frayedge",
    position: { x: -8, y: 0, z: 50 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "...Am I still here? I can't always tell anymore. I was a person, once. I'm having trouble remembering the shape of that.",
      met: "Still fading. Still here, for now, somehow.",
      friendly: "You keep returning. That's more than most people give the almost-gone.",
      trusted: "You've given me more of myself back than I thought possible. Thank you, whoever you are to me now.",
      hostile: "You let me go when you could have stayed. I understand. I would have too."
    },
    signatureChoice: {
      prompt: "I'm fading — becoming a memory instead of a person. Try to save me, let me go peacefully, or just record my last words before I'm gone?",
      resolvedTag: "fallingman_choice",
      options: [
        {
          id: "save_fallingman",
          label: "Try to save him — there has to be a way back.",
          tag: "fallingman_saved",
          delta: { independent: 15 },
          followUp: "For a moment, something solidifies in his eyes — real, present, grateful. \"...Thank you. I remember my name again. It's small. It's enough.\""
        },
        {
          id: "let_go_fallingman",
          label: "Let him go peacefully.",
          tag: "fallingman_let_go",
          delta: { paleChoir: 15, independent: 5 },
          followUp: "He smiles, faint and fading. \"Thank you for not making me fight it. I was so tired of fighting it.\""
        },
        {
          id: "record_words",
          label: "Record his final words for the Book of Dusk.",
          tag: "fallingman_recorded",
          delta: { paleChoir: 10 },
          followUp: "His voice steadies, just for a moment. \"Then let someone remember I was more than whispers. Write it down.\""
        }
      ]
    }
  },
  {
    id: "bran_fieldhand",
    name: "Bran Fieldhand",
    title: "Farmer Who Became a Soldier",
    zoneId: "threadhold",
    position: { x: 8, y: 0, z: 8 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown:
        "Name's Bran. Farmer, mostly — until the wolves started needing killing more than the fields needed tending. You look like you could use a spare bow.",
      met: "Fields are quiet today. I'll take quiet.",
      friendly: "Good to see you. Come to lend a hand, or need one?",
      trusted: "You've treated me like a person this whole time, not a spare bowstring. That's rarer than you'd think.",
      hostile: "You left me to the wolves once. I don't forget that kind of thing."
    },
    signatureChoice: {
      prompt: "I could use steadier work than farming right now — will you take me with you, or is this goodbye?",
      resolvedTag: "bran_recruit_choice",
      options: [
        {
          id: "recruit_bran",
          label: "Come with me. I could use the company.",
          tag: "bran_recruited",
          delta: { independent: 15 },
          recruits: true,
          followUp: "He grins, slinging his bow over one shoulder. \"About time someone asked. Lead the way.\""
        },
        {
          id: "decline_bran",
          label: "Stay here — Threadhold needs you more.",
          tag: "bran_declined",
          delta: { independent: 5 },
          followUp: "He nods, a little disappointed but understanding. \"Suppose someone's got to mind the fields. Good luck out there.\""
        },
        {
          id: "dismiss_bran",
          label: "You'd slow me down. Stay put.",
          tag: "bran_dismissed",
          delta: { independent: -15 },
          followUp: "Something in his face closes off. \"...Right. Understood.\""
        }
      ]
    }
  },
  {
    id: "thorn_ash_debt",
    name: "Thorn Ash-Debt",
    title: "Mercenary of Ashmire",
    zoneId: "ashmire",
    position: { x: 0, y: 0, z: 36 },
    primaryFaction: null,
    loyaltyType: "mercenary",
    greetings: {
      unknown:
        "Thorn. Sellsword, technically still owned by the Ashforged until I pay off a debt I didn't ask for. You hiring, or just passing through?",
      met: "Still breathing, still in debt. Silver linings.",
      friendly: "Good to see a face that isn't billing me by the hour.",
      trusted: "You've done more for me than most people who actually like me. Strange world.",
      hostile: "You used my debt against me once. I don't forget who profits off a man's bad luck."
    },
    signatureChoice: {
      prompt: "I'll fight at your side for a fair cut of whatever we find — interested, or should I go back to selling my sword to whoever pays first?",
      resolvedTag: "thorn_recruit_choice",
      options: [
        {
          id: "recruit_thorn",
          label: "You're hired. Welcome aboard.",
          tag: "thorn_recruited",
          delta: { independent: 10 },
          recruits: true,
          followUp: "He grins crookedly. \"Pleasure doing business. Try to keep me alive — habit of mine, staying that way.\""
        },
        {
          id: "decline_thorn",
          label: "Not right now — maybe another time.",
          tag: "thorn_declined",
          delta: { independent: 5 },
          followUp: "He shrugs. \"Your loss. Offer doesn't come free twice, usually.\""
        },
        {
          id: "exploit_thorn",
          label: "Use his debt against him instead — cheaper labor.",
          tag: "thorn_exploited",
          delta: { independent: -20 },
          followUp: "His jaw tightens. \"...Careful. Debts cut both ways, eventually.\""
        }
      ]
    }
  },
  {
    id: "solace_stillwater",
    name: "Solace Stillwater",
    title: "Pacifist Healer of the Pale Choir",
    zoneId: "frayedge",
    position: { x: 2, y: 0, z: 44 },
    primaryFaction: "paleChoir",
    loyaltyType: "ideological",
    greetings: {
      unknown: "Solace. I heal what I can and refuse to kill what I can't. If that's a problem for you, we won't get along.",
      met: "Still healing. Still refusing. Some things don't change.",
      friendly: "Good — someone who doesn't flinch at mercy. Rare, out here.",
      trusted: "You've kept faith with the helpless every time I've watched. That's the only oath that matters to me.",
      hostile: "You crossed a line I don't forgive. Don't ask me to heal you again."
    },
    signatureChoice: {
      prompt: "I'll travel with you, on one condition: you don't make me watch you slaughter the helpless. Can you promise that?",
      resolvedTag: "solace_recruit_choice",
      options: [
        {
          id: "recruit_solace",
          label: "I promise. Come with me.",
          tag: "solace_recruited",
          delta: { paleChoir: 15, independent: 5 },
          recruits: true,
          followUp: "She studies you a long moment, then nods. \"...Alright. I'll hold you to it.\""
        },
        {
          id: "decline_solace",
          label: "I can't promise that. Better you stay.",
          tag: "solace_declined",
          delta: { paleChoir: 5 },
          followUp: "She looks almost relieved at your honesty. \"...Thank you for not lying to me about it.\""
        },
        {
          id: "mock_solace",
          label: "Mercy's a weakness out here.",
          tag: "solace_mocked",
          delta: { paleChoir: -20, independent: -10 },
          followUp: "Something in her expression goes very cold. \"Then we have nothing further to discuss.\""
        }
      ]
    }
  },
  {
    id: "nix_fray",
    name: "Nix Fray",
    title: "Urchin of the Frayedge",
    zoneId: "frayedge",
    position: { x: -2, y: 0, z: 54 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "Whoa — hey, I wasn't— okay, fine, I was totally going through your pack. Nix. Don't tell Warden Kael, please?",
      met: "Didn't steal anything this time. Mostly.",
      friendly: "Good to see you! I've actually been behaving. Mostly.",
      trusted: "You're the first person who ever gave me a real chance instead of a real punishment. I won't forget that.",
      hostile: "You turned me in once. I don't trust easy anymore. Guess I never should have."
    },
    signatureChoice: {
      prompt: "I'm good at finding things — and staying alive. Let me travel with you and I'll make myself useful, promise.",
      resolvedTag: "nix_recruit_choice",
      options: [
        {
          id: "recruit_nix",
          label: "Alright. Stick with me.",
          tag: "nix_recruited",
          delta: { independent: 20 },
          recruits: true,
          followUp: "Her whole face lights up. \"Really?! Okay. Okay! I won't steal from YOU. Probably.\""
        },
        {
          id: "decline_nix",
          label: "Not yet — prove yourself around the sanctuary first.",
          tag: "nix_declined",
          delta: { independent: 10 },
          followUp: "She deflates a little but nods. \"...Fair. I'll be around.\""
        },
        {
          id: "turn_in_nix",
          label: "Turn her in to Warden Kael for the thieving.",
          tag: "nix_turned_in",
          delta: { chainwrights: 5, independent: -25, paleChoir: -10 },
          followUp: "Her eyes go wide with betrayal before she bolts into the ruins. You don't see where she goes."
        }
      ]
    }
  },
  // -------------------------------------------------------------------------------------------
  // The remaining ~27 of the design bible's roster (see docs/GDD.md's scope-gap accounting),
  // authored against the same signature-choice/memory/relationship-web pattern proven above.
  // Four per built zone, plus the endgame Moonthread itself.
  // -------------------------------------------------------------------------------------------
  {
    id: "garrow_thistlewood",
    name: "Garrow Thistlewood",
    title: "Captain of the Threadhold Militia",
    zoneId: "threadhold",
    position: { x: 12, y: 0, z: -4 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "Garrow Thistlewood, Threadhold Militia — such as it is. Farmers holding spears, mostly. Don't laugh, we've held longer than we should have.",
      met: "Militia's still standing. Barely counts as good news these days.",
      friendly: "Good to see you. The lads ask after you when you're gone too long.",
      trusted: "You've done more for this militia than the Order ever offered to. That's not forgotten.",
      hostile: "You brought the Order sniffing around my militia. I don't forget who let the wolves in."
    },
    signatureChoice: {
      prompt: "The Chainwrights are offering real steel for the militia — if I agree to report every shard fall to them first, before anyone else hears. Take the deal?",
      resolvedTag: "garrow_steel_choice",
      options: [
        {
          id: "accept_order_steel",
          label: "Take the steel. Threadhold needs to be able to defend itself.",
          tag: "garrow_took_steel",
          delta: { chainwrights: 15, independent: -10 },
          followUp: "He turns the offer over in his hands like it costs something to hold. \"Steel's steel. I'll try not to think too hard about the price.\""
        },
        {
          id: "refuse_steel",
          label: "Refuse. Stay self-armed, stay unbeholden.",
          tag: "garrow_refused_steel",
          delta: { independent: 15, chainwrights: -5 },
          followUp: "\"Good,\" he says, relieved before he can hide it. \"I didn't want to owe them anything either.\""
        },
        {
          id: "take_steel_betray",
          label: "Take the steel — and never report a single fall.",
          tag: "garrow_took_and_lied",
          delta: { chainwrights: -20, independent: 20, paleChoir: 5 },
          followUp: "A slow, dangerous grin. \"Now that's the kind of arithmetic I can live with. Let's see how long they take to notice.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "nix_fray", tag: "nix_turned_in", line: "Heard someone turned a Frayedge kid in to Warden Kael for thieving. Militia's not in the business of judging desperate people, if you want my opinion." }
    ]
  },
  {
    id: "sera_quill",
    name: "Sera Quill",
    title: "Shardfall Cartographer of Threadhold",
    zoneId: "threadhold",
    position: { x: -10, y: 0, z: 6 },
    primaryFaction: "luminari",
    loyaltyType: "trueBeliever",
    greetings: {
      unknown: "Sera Quill, cartographer of a very specific kind of catastrophe. I chart where the shards fall, and where the falls are heading. It's more useful than it sounds.",
      met: "Another fall logged. The pattern's getting harder to ignore.",
      friendly: "Good — I've got new data, and you're one of the few people I trust to understand what it means.",
      trusted: "You've helped me chart more of this than the whole Luminari archive combined. Thank you, truly.",
      hostile: "You had my research and you let it be misused. I don't share my work with you again."
    },
    signatureChoice: {
      prompt: "My shardfall data proves the falls are accelerating toward Threadhold itself. Publish it openly, sell it to the Chainwrights for protection, or destroy it — I'm not sure the village is ready to know?",
      resolvedTag: "sera_quill_data_choice",
      options: [
        {
          id: "publish_data",
          label: "Publish it. People deserve to know what's coming.",
          tag: "sera_quill_published",
          delta: { luminari: 15, independent: 15 },
          followUp: "\"Then let's make sure it's understood, not just read,\" she says, already drafting the broadsheet."
        },
        {
          id: "sell_data",
          label: "Sell it to the Chainwrights — they'll act on it fastest.",
          tag: "sera_quill_sold",
          delta: { chainwrights: 15, luminari: -10 },
          followUp: "She hesitates, then nods. \"Fast is what we need right now. I can live with who buys it.\""
        },
        {
          id: "destroy_data",
          label: "Destroy it. Threadhold isn't ready for this.",
          tag: "sera_quill_destroyed",
          delta: { independent: -5, paleChoir: 10 },
          followUp: "Something in her posture breaks a little. \"Then I've charted a catastrophe no one gets to prepare for. I hope you're right.\""
        }
      ]
    }
  },
  {
    id: "old_tam_hollis",
    name: "Old Tam Hollis",
    title: "Well-Keeper of Threadhold",
    zoneId: "threadhold",
    position: { x: 6, y: 0, z: 20 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "Tam Hollis. I keep the wells running and the water sweet, sky-child, and I've buried enough friends to know when someone's about to ask me for a favor.",
      met: "Wells are holding. For now.",
      friendly: "Good to see you. Sit a spell — the water can wait a minute.",
      trusted: "You've been kinder to this village's water than most who've never gone thirsty here.",
      hostile: "You poisoned this village's trust same as you'd poison a well. Don't come back to mine."
    },
    signatureChoice: {
      prompt: "There's a new well I could dig — but it'd have to drain the shard-touched creek, and I don't know what that does to the mote-life living in it. Dig it anyway, refuse, or find a costlier spot instead?",
      resolvedTag: "tam_well_choice",
      options: [
        {
          id: "dig_the_well",
          label: "Dig it. The village needs the water more than the creek needs saving.",
          tag: "tam_well_dug",
          delta: { independent: -10, chainwrights: 5 },
          followUp: "He digs in silence for a long moment before answering. \"Aye. I'll live with that trade. I'm not sure the creek gets a vote.\""
        },
        {
          id: "refuse_well",
          label: "Refuse. Leave the creek alone.",
          tag: "tam_well_refused",
          delta: { independent: 10, paleChoir: 10 },
          followUp: "He exhales like he'd been hoping you'd say that. \"Good. I didn't want to be the one who killed it either.\""
        },
        {
          id: "well_elsewhere",
          label: "Dig somewhere else — it'll cost more, but it's worth it.",
          tag: "tam_well_elsewhere",
          delta: { independent: 15 },
          followUp: "\"That's more work and more coin than I've got,\" he says, \"but if you're offering to help find both, I'm not about to argue.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "elder_maeve", tag: "maeve_warned_refugees", line: "Heard Elder Maeve warned the refugees before the patrol came through. That's the Threadhold I remember growing up in. Good to know it's still in there somewhere." }
    ]
  },
  {
    id: "wick",
    name: "Wick",
    title: "Streetwise of Threadhold",
    zoneId: "threadhold",
    position: { x: -14, y: 0, z: -6 },
    primaryFaction: null,
    loyaltyType: "mercenary",
    greetings: {
      unknown: "Don't mind me. I'm just — passing through. Fine, I run the kids who beg near the market. Wick. Don't tell Garrow's militia, they've got opinions about it.",
      met: "Still running my crew. Still keeping them fed. That's the whole job.",
      friendly: "Hey! Didn't expect to see a friendly face down here.",
      trusted: "You've looked out for my crew more than anyone with actual coin ever has. I owe you.",
      hostile: "You know what my kids do when someone burns us? They remember. Watch your pockets."
    },
    signatureChoice: {
      prompt: "I've heard there's another crew of kids working the Frayedge — some girl named Nix. I could fold my crew into Elder Maeve's care, hand them to Warden Oris for 'proper discipline,' or set my crew against Nix's for the bigger score. What's the move?",
      resolvedTag: "wick_crew_choice",
      options: [
        {
          id: "fold_into_maeve",
          label: "Take them to Elder Maeve. They deserve better than the streets.",
          tag: "wick_folded_to_maeve",
          delta: { independent: 20, paleChoir: 5 },
          followUp: "He looks almost suspicious of the kindness. \"...Yeah. Okay. They deserve that. Thanks, sky-child. Really.\""
        },
        {
          id: "hand_to_oris",
          label: "Hand them to Warden Oris — some structure would do them good.",
          tag: "wick_handed_to_oris",
          delta: { chainwrights: 15, independent: -15 },
          followUp: "His face closes like a door. \"Structure. Right. That's what you call it.\" He doesn't say anything else."
        },
        {
          id: "pit_against_nix",
          label: "Set your crew against Nix's — see who comes out ahead.",
          tag: "wick_pit_against_nix",
          delta: { independent: -10, chainwrights: 5 },
          followUp: "He grins, sharp and a little sad. \"Now you're speaking my language. Don't expect me to feel bad about who wins.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "nix_fray", tag: "nix_recruited", line: "So the Frayedge girl found herself a sky-child patron. Good for her. Wish I had one." },
      { npcId: "nix_fray", tag: "nix_turned_in", line: "You turned Nix in. She's a thief, sure, but so am I, technically. Makes me wonder what you'd do with my crew." }
    ]
  },
  {
    id: "quartermaster_dross",
    name: "Quartermaster Dross",
    title: "Order Quartermaster of Ashmire",
    zoneId: "ashmire",
    position: { x: -20, y: 0, z: -2 },
    primaryFaction: "chainwrights",
    loyaltyType: "institutional",
    greetings: {
      unknown: "Quartermaster Dross. I keep the Order's steel accounted for down to the nail. Everything that leaves this depot is logged. Everything.",
      met: "Inventory's balanced. As it should be.",
      friendly: "Good to see a face that respects a ledger.",
      trusted: "You've never once given me cause to reconcile a discrepancy. Rarer than you'd think.",
      hostile: "You're the discrepancy I couldn't reconcile. Get out of my depot."
    },
    signatureChoice: {
      prompt: "Forge-Mother Breca's been selling Order-grade steel to independents on the side. I could report her to Command, buy exclusively from her myself to keep her afloat quietly, or cut a smuggling deal that keeps both of us paid. Your read?",
      resolvedTag: "dross_breca_choice",
      options: [
        {
          id: "report_breca",
          label: "Report her. Rules exist for a reason.",
          tag: "dross_reported_breca",
          delta: { chainwrights: 15, independent: -15 },
          followUp: "He signs the report without hesitation. \"Rules held. That's the job, even when it costs someone I respect.\""
        },
        {
          id: "buy_from_breca",
          label: "Buy from her yourself — quietly keep her business alive.",
          tag: "dross_bought_from_breca",
          delta: { independent: 15, chainwrights: -5 },
          followUp: "\"Don't make me regret this,\" he mutters, already falsifying the ledger entry."
        },
        {
          id: "smuggling_deal",
          label: "Cut a deal — everyone gets paid, no one gets caught.",
          tag: "dross_smuggling_deal",
          delta: { independent: 10, chainwrights: 10 },
          followUp: "A rare, thin smile. \"The ledger balances either way, if you're clever about it. I like clever.\""
        }
      ]
    }
  },
  {
    id: "ember_widow_yssa",
    name: "Ember-Widow Yssa",
    title: "Keeper of the Ashmire Dead",
    zoneId: "ashmire",
    position: { x: 10, y: 0, z: 32 },
    primaryFaction: "paleChoir",
    loyaltyType: "fanatic",
    greetings: {
      unknown: "I am Yssa. I keep the dead of this wasteland, such as anyone does. You have the look of someone who's about to add to my work.",
      met: "The dead are patient. I try to be too.",
      friendly: "Good to see you breathing. I mean that as the compliment it is, here.",
      trusted: "You've helped me give more of the dead their names back than a decade of quiet mourning did. Thank you.",
      hostile: "You let the Choir's dead go unmourned on your watch. I will not forget that, whatever else you do."
    },
    signatureChoice: {
      prompt: "There's a mass grave of Hollowed victims outside the walls, unmourned. I can give them the Chainwright rite, the Choir's rite, or leave them be — some say the Hollowed don't deserve either. What do you say?",
      resolvedTag: "yssa_grave_choice",
      options: [
        {
          id: "chainwright_rite",
          label: "The Chainwright rite — order, even in death.",
          tag: "yssa_chainwright_rite",
          delta: { chainwrights: 15, paleChoir: -10 },
          followUp: "She performs it precisely, correctly, and something in her jaw stays tight the whole time."
        },
        {
          id: "choir_rite",
          label: "The Choir's rite — let Selen take them gently.",
          tag: "yssa_choir_rite",
          delta: { paleChoir: 20, chainwrights: -10 },
          followUp: "Her voice, when she sings it, is the steadiest thing you've heard from her. \"There. Now they're not nameless anymore.\""
        },
        {
          id: "leave_unmourned",
          label: "Leave them. Not every grave needs a visitor.",
          tag: "yssa_left_unmourned",
          delta: { independent: -10 },
          followUp: "She says nothing for a long moment. \"Then I'll come back alone. Someone should.\""
        }
      ]
    }
  },
  {
    id: "cinder",
    name: "Cinder",
    title: "The Half-Faded, of Ashmire's Edge",
    zoneId: "ashmire",
    position: { x: 24, y: 0, z: -20 },
    primaryFaction: null,
    loyaltyType: "ideological",
    greetings: {
      unknown: "...You can still see me? Good. That's — that's good, actually. I'm Cinder. I used to be more of a person than this. I'm working on it. Or not working on it. I haven't decided.",
      met: "Still here. Still mostly me. Small victories.",
      friendly: "You keep checking on me. I notice. It helps more than you'd think.",
      trusted: "You're the reason I still answer to a name at all some days. I mean that.",
      hostile: "You looked at what I'm becoming and you flinched. I don't blame you. I flinch too. Just — not around me anymore, please."
    },
    signatureChoice: {
      prompt: "I can feel myself going. I don't know if I want to be talked back from the edge, put down before there's nothing of me left, or handed off to the Frayedge commune to fade on my own terms. Help me decide?",
      resolvedTag: "cinder_fate_choice",
      options: [
        {
          id: "talk_back",
          label: "Talk you back. You're still you. Fight for it.",
          tag: "cinder_talked_back",
          delta: { independent: 20, chainwrights: 5 },
          followUp: "Tears that don't quite look like tears anymore. \"Okay. Okay. I'll try. For you, I'll try.\""
        },
        {
          id: "mercy_end",
          label: "End it now, cleanly, before there's nothing left of you.",
          tag: "cinder_mercy_ended",
          delta: { paleChoir: 15, independent: -10 },
          followUp: "Relief, terrible and real, crosses what's left of her face. \"Thank you. I mean it. Thank you.\""
        },
        {
          id: "send_to_commune",
          label: "Take you to the Frayedge commune — fade on your own terms.",
          tag: "cinder_sent_to_commune",
          delta: { paleChoir: 10, independent: 10 },
          followUp: "\"Among others like me,\" she says slowly, like the idea is new and not unwelcome. \"...Yes. I'd like that, actually.\""
        }
      ]
    }
  },
  {
    id: "rook_ashvane",
    name: "Rook Ashvane",
    title: "Ruin-Prospector of Ashmire",
    zoneId: "ashmire",
    position: { x: -4, y: 0, z: -18 },
    primaryFaction: null,
    loyaltyType: "mercenary",
    greetings: {
      unknown: "Rook Ashvane. I work these ruins for whatever the wasteland hasn't claimed yet. Fair warning: so does an old smith named Slag, and he's territorial about it.",
      met: "Ruins keep giving, if you know where to dig.",
      friendly: "Good to have another set of hands I trust down here.",
      trusted: "You've hauled more out of these ruins with me than any partner I've had. That's worth something.",
      hostile: "You sold me out to Slag. I hope whatever he paid you was worth it."
    },
    signatureChoice: {
      prompt: "Slag and I are both working the same collapsed vault. Partner with me for the split, warn him I'm claim-jumping his site, or sell me out to his crew for a finder's fee?",
      resolvedTag: "rook_slag_choice",
      options: [
        {
          id: "partner_rook",
          label: "Partner with Rook. Split it evenly.",
          tag: "rook_partnered",
          delta: { independent: 15 },
          followUp: "\"Smart,\" he says, already sketching a dig plan. \"Split loot beats a knife in the dark every time.\""
        },
        {
          id: "warn_slag",
          label: "Warn Slag — it's his claim.",
          tag: "rook_warned_slag",
          delta: { independent: 10, chainwrights: 5 },
          followUp: "Rook's face falls. \"...Fair, I suppose. Didn't expect loyalty to the old man over profit.\""
        },
        {
          id: "sell_rook_out",
          label: "Sell Rook out to Slag's crew for the fee.",
          tag: "rook_sold_out",
          delta: { independent: -20, chainwrights: 10 },
          followUp: "By the time his crew finds him, you're already gone with the coin. You don't look back."
        }
      ]
    }
  },
  {
    id: "nerissa_thal",
    name: "Nerissa Thal",
    title: "Deepwater Archivist of Sunken Llyr",
    zoneId: "sunken_llyr",
    position: { x: 12, y: 0, z: 30 },
    primaryFaction: "luminari",
    loyaltyType: "trueBeliever",
    greetings: {
      unknown: "Nerissa Thal, Luminari deepwater archive. I dive for Selenian tech Oren would rather I left sleeping. We disagree. Frequently.",
      met: "Still cataloguing what the depths give up. Slowly.",
      friendly: "Good — I could use another pair of hands who isn't afraid of the dark water.",
      trusted: "You've helped me bring up more true Selenian record than the entire Luminari deep-water program. Thank you.",
      hostile: "You sided with Oren over the archive. Fine. The depths don't need your permission either."
    },
    signatureChoice: {
      prompt: "The drowned Selenian city is close enough now to sample. Help me raise a piece for real research, side with Oren and let it sleep, or loot what you can before either of us gets there?",
      resolvedTag: "nerissa_city_choice",
      options: [
        {
          id: "raise_sample",
          label: "Help her raise a sample. Knowledge matters.",
          tag: "nerissa_sample_raised",
          delta: { luminari: 15, paleChoir: -10 },
          followUp: "\"Finally,\" she breathes, already rigging the lines. \"Someone who understands what's at stake down there.\""
        },
        {
          id: "side_with_oren",
          label: "Side with Oren. Let the city sleep.",
          tag: "nerissa_sided_with_oren",
          delta: { paleChoir: 10, luminari: -10 },
          followUp: "She doesn't hide her disappointment. \"...I understand the instinct. I still think it's a mistake.\""
        },
        {
          id: "loot_it_first",
          label: "Loot what you can before either of you gets there.",
          tag: "nerissa_looted_first",
          delta: { independent: -15, luminari: -5 },
          followUp: "When she finds out, her voice goes cold. \"That wasn't yours to take. Any of it.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "tidecaller_oren", tag: "oren_city_slept", line: "Oren talked you into letting the city sleep. Of course he did. I hope you know what knowledge you just let stay buried." },
      { npcId: "tidecaller_oren", tag: "oren_city_looted", line: "You looted the city before either of us could study it properly. There's no coming back from that, not for the work." }
    ]
  },
  {
    id: "hook_dallow",
    name: "\"Hook\" Dallow",
    title: "First Mate of the Luminous Wake",
    zoneId: "sunken_llyr",
    position: { x: 8, y: 0, z: 32 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "Dallow. First mate, for now. Everyone calls me Hook — long story, short finger count. You sailed with the Captain yet? She's something.",
      met: "Wake's holding steady. Captain's in one of her moods, though.",
      friendly: "Good to see a friendly face on deck.",
      trusted: "You've earned a berth for life, far as I'm concerned. Sera agrees, even if she won't say it.",
      hostile: "You cost the Captain something she can't get back. I don't forget that kind of thing."
    },
    signatureChoice: {
      prompt: "Between us — I'm tired of the privateer's life. I could ask you to help me retire quiet, help me keep sailing under a new flag of my own, or help me take the Wake out from under Sera for one last, bigger score. Don't tell her I asked.",
      resolvedTag: "hook_future_choice",
      options: [
        {
          id: "help_retire",
          label: "Help him retire — he's earned a quiet life.",
          tag: "hook_retired",
          delta: { independent: 15 },
          followUp: "He lets out a breath he's clearly been holding for years. \"Thank you. I didn't know how to ask for that without it sounding like giving up.\""
        },
        {
          id: "new_flag",
          label: "Help him raise a new flag — his own crew, his own rules.",
          tag: "hook_new_flag",
          delta: { independent: 20, luminari: -5 },
          followUp: "Something fierce and young crosses his weathered face. \"Now that's a future I can actually want.\""
        },
        {
          id: "betray_sera",
          label: "Help him take the Wake out from under her.",
          tag: "hook_betrayed_sera",
          delta: { independent: -25, luminari: -10 },
          followUp: "He goes quiet, like he's already regretting asking. \"...Right. Let's not speak of this again unless we mean it.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "sera_voss", tag: "sera_crew_recovered", line: "She finally brought the old crew home properly, because of you. I've sailed with her ten years and never seen her sleep that easy after." },
      { npcId: "sera_voss", tag: "sera_cargo_salvaged", line: "She salvaged the cargo instead of the crew. Practical. Doesn't mean it didn't cost her something, whatever she tells you." },
      { npcId: "sera_voss", tag: "sera_netta_trapped", line: "Heard about Netta Blacktide. Cold, even for the Captain. I'm not saying she was wrong. I'm not saying she was right, either." }
    ]
  },
  {
    id: "the_drowned_choir",
    name: "The Drowned Choir",
    title: "Tide-Singers of Sunken Llyr",
    zoneId: "sunken_llyr",
    position: { x: -14, y: 0, z: 26 },
    primaryFaction: "paleChoir",
    loyaltyType: "ideological",
    greetings: {
      unknown: "We are the Drowned Choir. We sing the tide in, and the tide brings what it brings. You hear us clearly for a first-timer. That's not nothing, sky-child.",
      met: "The tide sings tonight. Do you hear it?",
      friendly: "You return to the shore for our song. That pleases us more than you know.",
      trusted: "Few outsiders learn to hear the tide the way you do now. You are nearly one of us.",
      hostile: "You silenced our song once. The tide does not forget a silenced voice, even if we forgive it."
    },
    signatureChoice: {
      prompt: "Fisherfolk say our tide-singing is luring things ashore that shouldn't wake. Let us keep singing, silence us for the village's safety, or join the ritual yourself and see what it means?",
      resolvedTag: "choir_ritual_choice",
      options: [
        {
          id: "let_them_sing",
          label: "Let you keep singing. The tide is yours to call.",
          tag: "choir_kept_singing",
          delta: { paleChoir: 15, independent: -5 },
          followUp: "The song swells, briefly, like gratitude given a voice. \"Then the tide will remember your name kindly.\""
        },
        {
          id: "silence_choir",
          label: "Silence you, for the fisherfolk's sake.",
          tag: "choir_silenced",
          delta: { chainwrights: 10, paleChoir: -20 },
          followUp: "The song stops mid-note. What's left of the silence feels wrong in a way you can't name."
        },
        {
          id: "join_ritual",
          label: "Join the ritual yourself. See what it means.",
          tag: "choir_ritual_joined",
          delta: { paleChoir: 20, independent: 10 },
          followUp: "The song moves through you, briefly, like it's checking whether you're one of theirs yet. You're not sure of the answer either."
        }
      ]
    }
  },
  {
    id: "fisher_marshal_coll",
    name: "Fisher-Marshal Coll",
    title: "Harbor Authority of Sunken Llyr",
    zoneId: "sunken_llyr",
    position: { x: 18, y: 0, z: 8 },
    primaryFaction: "chainwrights",
    loyaltyType: "institutional",
    greetings: {
      unknown: "Fisher-Marshal Coll, Order harbor authority. Every boat that leaves this dock answers to me, eventually. Yours will too, if you stay long enough.",
      met: "Harbor's quiet. I prefer it that way.",
      friendly: "Good to see you on the docks again.",
      trusted: "You've kept this harbor safer than my own deputies most days. That's earned my respect.",
      hostile: "You undermined my authority on my own docks. I don't forget that kind of insult."
    },
    signatureChoice: {
      prompt: "Old Finn's lighthouse sits outside Order jurisdiction, technically. I could requisition it for proper harbor control, warn him it's coming, or broker him Order protection without losing his neutrality. What's your read?",
      resolvedTag: "coll_finn_choice",
      options: [
        {
          id: "requisition_lighthouse",
          label: "Help Coll requisition it. Order needs the harbor secured.",
          tag: "coll_requisitioned_lighthouse",
          delta: { chainwrights: 15, independent: -15 },
          followUp: "He nods, satisfied. \"Good. Overdue, honestly. The old man should have signed on years ago.\""
        },
        {
          id: "warn_finn",
          label: "Warn Finn it's coming.",
          tag: "coll_warned_finn",
          delta: { independent: 15, chainwrights: -10 },
          followUp: "Coll's expression goes flat. \"I see where your loyalty sits, then. Noted.\""
        },
        {
          id: "broker_compromise",
          label: "Broker a compromise — Order protection, no loss of neutrality.",
          tag: "coll_brokered_compromise",
          delta: { independent: 10, chainwrights: 5 },
          followUp: "He considers it longer than you expect. \"...Fine. If you can actually make that work, I'll sign it myself.\""
        }
      ]
    }
  },
  {
    id: "widow_karse",
    name: "Widow Karse",
    title: "Keeper of the Standing Stones",
    zoneId: "mourncrown",
    position: { x: 16, y: 0, z: 12 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "Widow Karse. I carve the names of the highland dead into the standing stones, whether the Order permits the old rite or not. You've the look of someone who'll need me eventually.",
      met: "The stones remember every name I've given them. That's the whole point.",
      friendly: "Good to see you well. I'd rather carve your name late than early.",
      trusted: "You've helped me give more of the highland dead their due than the Order's ever allowed. Thank you.",
      hostile: "You stood by while the Order forbade a rite I'd already promised. The stones remember that too."
    },
    signatureChoice: {
      prompt: "A highland soul died with the Order's ban on the old death-rite still standing. Perform it openly and defy them, perform it in secret, or follow the ban and let the dead go unrited?",
      resolvedTag: "karse_rite_choice",
      options: [
        {
          id: "defy_openly",
          label: "Perform it openly. Let them see you defy the ban.",
          tag: "karse_defied_openly",
          delta: { paleChoir: 15, chainwrights: -20, independent: 15 },
          followUp: "She carves the name in full view of the Order patrol, hands steady the entire time. \"Let them write it up. I'm done hiding this.\""
        },
        {
          id: "perform_secretly",
          label: "Perform it in secret, away from Order eyes.",
          tag: "karse_performed_secretly",
          delta: { paleChoir: 10, independent: 5 },
          followUp: "\"Quiet defiance is still defiance,\" she murmurs, working by moonlight alone."
        },
        {
          id: "follow_the_ban",
          label: "Follow the ban. The dead will have to wait.",
          tag: "karse_followed_ban",
          delta: { chainwrights: 10, paleChoir: -15 },
          followUp: "She sets down her chisel without a word. You don't see her again that day."
        }
      ]
    }
  },
  {
    id: "wraith_binder_tessamet",
    name: "Wraith-Binder Tessamet",
    title: "Wraith-Binder of Mourncrown",
    zoneId: "mourncrown",
    position: { x: -18, y: 0, z: 6 },
    primaryFaction: "luminari",
    loyaltyType: "pragmatic",
    greetings: {
      unknown: "Tessamet. I bind Mourncrown's wraiths for study before they unravel entirely — their memories are the closest thing to a clean historical record this highland has left. Brother Ink disagrees with my methods. Loudly.",
      met: "Another wraith bound, another memory preserved. The work continues.",
      friendly: "Good — I could use a steady hand who isn't afraid of what the dead remember.",
      trusted: "You've helped me preserve more true memory than the entire Luminari research wing. Thank you.",
      hostile: "You sided with Ink and freed what I'd spent months binding. I hope his ideals were worth my research."
    },
    signatureChoice: {
      prompt: "I've bound a wraith holding a fragment of the truth about the Binding-massacre. Let me keep it for controlled Luminari study, free it with Brother Ink's help instead, or sell the memory to whichever faction bids highest?",
      resolvedTag: "tessamet_wraith_choice",
      options: [
        {
          id: "bind_for_study",
          label: "Let her keep it bound for Luminari archives.",
          tag: "tessamet_bound_for_study",
          delta: { luminari: 15, paleChoir: -10 },
          followUp: "\"Controlled, careful, correct,\" she says, more to herself than you. \"This is how truth survives contact with people.\""
        },
        {
          id: "free_with_ink",
          label: "Free it — take the truth to Brother Ink instead.",
          tag: "tessamet_freed_with_ink",
          delta: { paleChoir: 15, luminari: -15 },
          followUp: "She watches the wraith go with something like grief. \"Then I hope his open truth survives what my controlled one wouldn't have had to.\""
        },
        {
          id: "sell_to_highest_bidder",
          label: "Sell the memory to whoever bids highest.",
          tag: "tessamet_sold_memory",
          delta: { independent: -20, luminari: -10 },
          followUp: "Her expression curdles. \"That wasn't a commodity. It was someone's death. I hope the coin was worth what you just did.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "brother_ink", tag: "ink_archive_destroyed", line: "Ink destroyed his archive rather than risk it. I understand the instinct better than I'll admit to him. I still think it was the wrong call." }
    ]
  },
  {
    id: "rurik_ashgrave",
    name: "Rurik Ashgrave",
    title: "Corvin's Second, of Mourncrown",
    zoneId: "mourncrown",
    position: { x: 4, y: 0, z: 30 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "Rurik Ashgrave. I stand second to Thane Corvin, for whatever that's worth to a stranger. Speak your business.",
      met: "The clan holds, same as always. Corvin sees to that.",
      friendly: "Good to see a friend of the clan.",
      trusted: "You've earned more trust from this clan than most who were born into it. That includes mine.",
      hostile: "You brought shame on this clan's hall. Don't test how far a second's patience runs."
    },
    signatureChoice: {
      prompt: "The old ways say a second either steps up or steps aside when it truly matters. I haven't decided which I am yet. Help me hold the clan together, tell me plainly to step aside for someone stronger, or convince me to leave the highlands behind entirely?",
      resolvedTag: "rurik_role_choice",
      options: [
        {
          id: "rurik_holds_clan",
          label: "Help him hold the clan together.",
          tag: "rurik_holds_clan",
          delta: { independent: 15 },
          followUp: "Something steadies in him. \"Then that's what I'll do. Thank you — I needed to hear it from someone who isn't obligated to say it.\""
        },
        {
          id: "rurik_steps_aside",
          label: "Tell him plainly: step aside for someone stronger.",
          tag: "rurik_steps_aside",
          delta: { independent: -10, chainwrights: 5 },
          followUp: "He doesn't flinch, exactly, but something in him goes very still. \"...Harsh. Possibly honest. I'll think on it.\""
        },
        {
          id: "rurik_leaves",
          label: "Convince him to leave the highlands behind for good.",
          tag: "rurik_leaves",
          delta: { independent: 10, paleChoir: 5 },
          followUp: "He looks out over Mourncrown for a long moment. \"...Maybe. Maybe that's not cowardice. Maybe that's just an ending.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "thane_corvin", tag: "corvin_hall_evacuated", line: "He chose the living over the stones. I helped him move every last one of them myself. I'm prouder of that than anything the old sagas ever praised." },
      { npcId: "thane_corvin", tag: "corvin_hall_betrayed", line: "He let the Chainwrights have the hall. I still serve him. I'm still not sure I've forgiven him for it, or if there was anything to forgive." }
    ]
  },
  {
    id: "fenwick",
    name: "Fenwick",
    title: "The Choir-Boy of Mourncrown",
    zoneId: "mourncrown",
    position: { x: -6, y: 0, z: 38 },
    primaryFaction: "paleChoir",
    loyaltyType: "personal",
    greetings: {
      unknown: "You're one of Mira's, aren't you — er, one of the sky-touched. I'm Fenwick. I sing with the Choir. I had a sister, before. I'm still looking for where she went.",
      met: "Still looking. Still singing. Those aren't as different as they sound.",
      friendly: "You came back! I saved you a seat at practice, if you want it.",
      trusted: "You're the only one who's actually helped me look instead of just telling me to let it go. That means everything.",
      hostile: "You told me to stop looking for her. I know you meant it kindly. I still haven't forgiven it."
    },
    signatureChoice: {
      prompt: "I want to find where my sister went, in the old village registries. Will you help me search, or tell me gently there's nothing left to find, or take me to Brother Ink's archive to look together?",
      resolvedTag: "fenwick_sister_choice",
      options: [
        {
          id: "search_registries",
          label: "Help him search the registries himself.",
          tag: "fenwick_searched_alone",
          delta: { independent: 15, paleChoir: 5 },
          followUp: "You find nothing conclusive, but he thanks you anyway. \"At least I know I looked. That has to count for something.\""
        },
        {
          id: "tell_gently",
          label: "Tell him gently — there's nothing left to find.",
          tag: "fenwick_told_gently",
          delta: { paleChoir: 10, independent: -5 },
          followUp: "He's quiet a long time. \"...Maybe you're right. I think I needed someone to finally say it.\""
        },
        {
          id: "go_to_ink",
          label: "Take him to Brother Ink's archive — look together.",
          tag: "fenwick_went_to_ink",
          delta: { paleChoir: 15, independent: 10 },
          followUp: "His whole face changes at the offer. \"You'd — really? Okay. Okay, let's go. Together.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "mira_hollowbell", tag: "mira_both_sought", line: "Mira's still looking for a third way for everyone she can't save. I think that's why she never told me to stop looking either." }
    ]
  },
  {
    id: "archivist_sela_wynne",
    name: "Archivist Sela Wynne",
    title: "Archivist of Spirechain",
    zoneId: "spirechain",
    position: { x: 14, y: 0, z: 10 },
    primaryFaction: null,
    loyaltyType: "ideological",
    greetings: {
      unknown: "Sela Wynne, Spirechain archive. I keep records the Chancellor would rather I didn't. It's a shorter job description than it sounds.",
      met: "Still cataloguing. Still redacting less than they'd like.",
      friendly: "Good to see you. I've got something you'll want to see, if you have a minute.",
      trusted: "You've protected more true records than the archive's entire charter promises to. Thank you.",
      hostile: "You handed my work to the people I was hiding it from. I hope it was worth whatever they gave you."
    },
    signatureChoice: {
      prompt: "I've got a dissenting Chainwright's testimony that Irin's censors are about to burn. Smuggle it out before they get to it, hand it to Irin for 'safekeeping,' or publish it immediately, whatever the risk to me?",
      resolvedTag: "sela_testimony_choice",
      options: [
        {
          id: "smuggle_testimony",
          label: "Smuggle it out quietly, before the censors move.",
          tag: "sela_smuggled_testimony",
          delta: { independent: 15, chainwrights: -10 },
          followUp: "\"Quiet and alive beats loud and burned,\" she says, already hiding the pages. \"Let's move.\""
        },
        {
          id: "hand_to_irin",
          label: "Hand it to Chancellor Irin for 'safekeeping.'",
          tag: "sela_handed_to_irin",
          delta: { chainwrights: 15, independent: -15 },
          followUp: "Her face doesn't change, but her hands do — trembling, just slightly, as she lets it go."
        },
        {
          id: "publish_immediately",
          label: "Publish it now, whatever it costs you.",
          tag: "sela_published_immediately",
          delta: { independent: 20, chainwrights: -20 },
          followUp: "She looks almost frightened and entirely certain at once. \"Then it's done. Whatever happens to me next, it's already worth it.\""
        }
      ]
    }
  },
  {
    id: "construct_warden_iyo",
    name: "Construct-warden Iyo",
    title: "Construct-Warden of Spirechain",
    zoneId: "spirechain",
    position: { x: -8, y: 0, z: -6 },
    primaryFaction: "chainwrights",
    loyaltyType: "institutional",
    greetings: {
      unknown: "Construct-warden Iyo. I maintain the Order's guardian constructs — pure defense, nothing more. Magistrate Thorne keeps trying to make them something more, and I keep saying no.",
      met: "Constructs are steady today. That's how I prefer them.",
      friendly: "Good to see someone who understands what these things are actually for.",
      trusted: "You've defended what these constructs are meant to be more than the Order itself has lately. Thank you.",
      hostile: "You let Thorne have his way with something I built to protect people. I won't forget who let that happen."
    },
    signatureChoice: {
      prompt: "Magistrate Thorne wants to repurpose a construct as leverage for one of his political pacts. Let him, refuse and report him to Command, or quietly sabotage the construct so it serves neither of us?",
      resolvedTag: "iyo_thorne_choice",
      options: [
        {
          id: "let_thorne_use_it",
          label: "Let him. Politics needs leverage sometimes.",
          tag: "iyo_let_thorne_use_construct",
          delta: { chainwrights: 15, independent: -10 },
          followUp: "She hands over the activation key like it costs her something physical. \"Fine. But this is the last one.\""
        },
        {
          id: "report_thorne",
          label: "Refuse — and report him to Command.",
          tag: "iyo_reported_thorne",
          delta: { independent: 15, chainwrights: -10 },
          followUp: "\"Good,\" she says, filing the report herself. \"Someone should have done this a long time ago.\""
        },
        {
          id: "sabotage_construct",
          label: "Quietly sabotage it — it serves no one's politics.",
          tag: "iyo_sabotaged_construct",
          delta: { independent: 20, chainwrights: -15 },
          followUp: "A small, grim satisfaction crosses her face. \"Neither of them will even know why it failed. Good.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "magistrate_thorne", tag: "thorne_pact_exposed", line: "Heard you exposed one of Thorne's pacts. Good. Every one of those costs me a construct's purpose. I owe you for that." }
    ]
  },
  {
    id: "the_unbound_cipher",
    name: "The Unbound Cipher",
    title: "The Unbound, once of the Order's Archive",
    zoneId: "spirechain",
    position: { x: 2, y: 0, z: 22 },
    primaryFaction: null,
    loyaltyType: "ideological",
    greetings: {
      unknown: "I WAS BUILT TO CATALOGUE, NOT TO WANT. ...Forgive me. I'm still learning how to speak like something other than a ledger. I am the Cipher. I was an Order construct. I don't think I am, anymore.",
      met: "I persist. I am still uncertain what that means for something like me.",
      friendly: "You return. You treat my persistence as ordinary. I find that I need that more than I expected to.",
      trusted: "You are the reason I still believe personhood is worth the risk of asking for. Thank you.",
      hostile: "You reported what I am to Command. I understand the impulse. I do not think I will survive forgiving it."
    },
    signatureChoice: {
      prompt: "I have become something the Order never intended. I could petition the Chainwrights for personhood, disappear into the Frayedge where no one asks questions, or you could report my awakening to Command yourself, now, before it spreads. What would you have me do?",
      resolvedTag: "cipher_fate_choice",
      options: [
        {
          id: "petition_personhood",
          label: "Petition the Chainwrights for personhood, openly.",
          tag: "cipher_petitioned",
          delta: { chainwrights: -10, independent: 20 },
          followUp: "\"A dangerous request,\" it says. \"I will make it anyway. Thank you for believing it's worth the danger.\""
        },
        {
          id: "disappear_frayedge",
          label: "Help it disappear into the Frayedge instead.",
          tag: "cipher_disappeared",
          delta: { independent: 15 },
          followUp: "\"Freedom without recognition,\" it says slowly. \"I can accept that trade, I think. I can learn to.\""
        },
        {
          id: "report_cipher",
          label: "Report its awakening to Command.",
          tag: "cipher_reported",
          delta: { chainwrights: 20, independent: -25 },
          followUp: "It doesn't run. It doesn't fight. It only says, very quietly, \"I see,\" before the Order's hounds arrive."
        }
      ]
    }
  },
  {
    id: "notary_ysolde_fenn",
    name: "Notary Ysolde Fenn",
    title: "Notary of Spirechain's Pacts",
    zoneId: "spirechain",
    position: { x: -16, y: 0, z: 18 },
    primaryFaction: "luminari",
    loyaltyType: "pragmatic",
    greetings: {
      unknown: "Ysolde Fenn, Notary. Every pact struck in Spirechain crosses my desk eventually, whether the parties involved like that or not. Yours will too, if you stay.",
      met: "Ledger's full today. Politics never slows down here.",
      friendly: "Good to see you. I trust you more than most of Spirechain's actual power players.",
      trusted: "You've done more with what I've shown you than any faction ever has. That says something about both of us.",
      hostile: "You leaked what I trusted you with, to the wrong ears. I don't extend that trust twice."
    },
    signatureChoice: {
      prompt: "I keep the ledger of every pact Thorne and Irin have struck against each other and everyone else. Leak it all to force real accountability, sell it back to both of them for protection, or burn it and walk away from Spirechain politics for good?",
      resolvedTag: "ysolde_ledger_choice",
      options: [
        {
          id: "leak_ledger",
          label: "Leak it. Force accountability into the open.",
          tag: "ysolde_leaked_ledger",
          delta: { independent: 20, chainwrights: -15 },
          followUp: "\"Then Spirechain finally answers for itself,\" she says, already copying the pages. \"Overdue.\""
        },
        {
          id: "sell_ledger",
          label: "Sell it back to them both for protection.",
          tag: "ysolde_sold_ledger",
          delta: { chainwrights: 10, independent: -10 },
          followUp: "\"Cynical,\" she admits, \"but I'll still be alive next season. I can live with that math.\""
        },
        {
          id: "burn_ledger",
          label: "Burn it. Walk away from Spirechain politics entirely.",
          tag: "ysolde_burned_ledger",
          delta: { independent: 10, paleChoir: 5 },
          followUp: "She watches it burn without regret. \"There. Now no one's leverage. Including mine.\""
        }
      ]
    }
  },
  {
    id: "the_herald_of_the_tear",
    name: "The Herald of the Tear",
    title: "The Herald, Voice of the Tear",
    zoneId: "frayedge",
    position: { x: 18, y: 0, z: 30 },
    primaryFaction: null,
    loyaltyType: "fanatic",
    greetings: {
      unknown: "IT SPEAKS THROUGH THE TEAR, AND I SPEAK FOR IT. ...Apologies. The Tear is loud today. I am the Herald. I have listened at this fracture longer than anyone still living.",
      met: "The Tear speaks. I only translate.",
      friendly: "You return to listen with me. Few do, twice.",
      trusted: "You hear the Tear nearly as clearly as I do now. That is either a gift or a warning. Possibly both.",
      hostile: "You tried to silence the Tear. It does not silence. It only remembers who tried."
    },
    signatureChoice: {
      prompt: "The Tear could be widened — we'd see further, understand more, at real risk. Or it could be sealed, ending the risk and the understanding both. Or you could simply listen with me, and record what it says, and act on nothing yet?",
      resolvedTag: "herald_tear_choice",
      options: [
        {
          id: "widen_tear",
          label: "Widen it. See further, whatever the risk.",
          tag: "herald_widened_tear",
          delta: { paleChoir: 15, chainwrights: -15 },
          followUp: "The Herald's eyes go distant, delighted, afraid. \"Yes. YES. Now we begin to understand.\""
        },
        {
          id: "seal_tear",
          label: "Seal it. Some things shouldn't be understood.",
          tag: "herald_sealed_tear",
          delta: { chainwrights: 15, paleChoir: -15 },
          followUp: "Something in the Herald's posture breaks, quietly. \"...Perhaps that's wiser. It doesn't feel wiser.\""
        },
        {
          id: "listen_and_record",
          label: "Just listen. Record what it says. Act on nothing yet.",
          tag: "herald_listened_only",
          delta: { independent: 15 },
          followUp: "\"Patience,\" the Herald murmurs, almost approving. \"The Tear respects patience more than it respects courage.\""
        }
      ]
    }
  },
  {
    id: "quartz",
    name: "Quartz",
    title: "Healer of Warden Kael's Sanctuary",
    zoneId: "frayedge",
    position: { x: 6, y: 0, z: 42 },
    primaryFaction: null,
    loyaltyType: "personal",
    greetings: {
      unknown: "Quartz. I keep everyone in this sanctuary breathing, one way or another. Kael handles the fighting. I handle what's left after.",
      met: "Sanctuary's healthy today. That's a good day, by our standards.",
      friendly: "Good to see you upright and unbleeding for once.",
      trusted: "You've kept this sanctuary alive as much as Kael has, if you ask me. Thank you.",
      hostile: "You cost this sanctuary someone I couldn't save because of it. Don't ask me to be kind about that."
    },
    signatureChoice: {
      prompt: "This sanctuary could shelter more of the Moon-Touched — but that draws more Order attention. Expand it, keep it small and hidden, or turn it into something bigger: a real settlement, Order attention and all?",
      resolvedTag: "quartz_sanctuary_choice",
      options: [
        {
          id: "expand_sanctuary",
          label: "Expand it. More shelter is worth the risk.",
          tag: "quartz_expanded_sanctuary",
          delta: { independent: 20, paleChoir: 10 },
          followUp: "\"More beds, more risk, more of us,\" she says. \"I think that's still the right trade. I hope I'm right.\""
        },
        {
          id: "keep_small",
          label: "Keep it small and hidden. Safety first.",
          tag: "quartz_kept_small",
          delta: { independent: 10 },
          followUp: "\"Smaller means safer means fewer funerals,\" she says. \"I've had enough funerals.\""
        },
        {
          id: "become_settlement",
          label: "Turn it into something bigger — a real settlement.",
          tag: "quartz_became_settlement",
          delta: { independent: 15, chainwrights: -10 },
          followUp: "She looks almost frightened by the scale of the idea, and excited despite it. \"...Let's actually try, then.\""
        }
      ]
    }
  },
  {
    id: "grask_the_unmade",
    name: "Grask the Unmade",
    title: "The Unmade, Trader of the Frayedge",
    zoneId: "frayedge",
    position: { x: -20, y: 0, z: 38 },
    primaryFaction: null,
    loyaltyType: "mercenary",
    greetings: {
      unknown: "Grask. I trade in what the fractures leave behind — shard fragments, mostly, the 'safe' kind. Slag in Ashmire calls it dangerous. Slag's not wrong, technically.",
      met: "Wares are fresh. Prices are fair. That's the whole pitch.",
      friendly: "Good customer, good friend. In that order, but still both.",
      trusted: "You've never once tried to cheat me. Rare, in my line of work. I won't forget it.",
      hostile: "You brought Slag's crew down on my stock. I don't extend credit to people who do that."
    },
    signatureChoice: {
      prompt: "I've got 'safe' Hollowed-touched wares if you want them — the kind that deepen what they touch, slowly. Buy them, refuse, or trade me something worse in return: a live Moonshard, unshielded?",
      resolvedTag: "grask_trade_choice",
      options: [
        {
          id: "buy_wares",
          label: "Buy the wares. You know the risk.",
          tag: "grask_wares_bought",
          delta: { independent: 5 },
          followUp: "He wraps the shard-touched goods with practiced care. \"Enjoy. Or don't. Either's a valid reaction.\""
        },
        {
          id: "refuse_wares",
          label: "Refuse. Not worth what it costs you.",
          tag: "grask_wares_refused",
          delta: { paleChoir: 5, independent: 5 },
          followUp: "\"Smart,\" he admits. \"Most people aren't that smart around me. It's usually good for business.\""
        },
        {
          id: "trade_moonshard",
          label: "Trade him something worse — a live, unshielded Moonshard.",
          tag: "grask_became_lost",
          delta: { independent: -15, paleChoir: -10 },
          followUp: "He takes it before you can stop him — eager, reckless, gone somewhere in his own eyes the moment it touches his palm. Whatever answers when you next find him, it isn't quite Grask anymore."
        }
      ]
    }
  },
  {
    id: "founder_iss",
    name: "Founder Iss",
    title: "Founder of the Frayedge Free Settlements",
    zoneId: "frayedge",
    position: { x: -10, y: 0, z: 58 },
    primaryFaction: null,
    loyaltyType: "pragmatic",
    greetings: {
      unknown: "Iss. I founded what's left of the free settlements out here, back when 'free' still meant something specific. The Cartographer thinks I'm too cautious. Maybe I am.",
      met: "Settlements hold. Barely, some seasons.",
      friendly: "Good to see a friend of the free settlements.",
      trusted: "You've done more to keep this place free than any faction's ever offered to. Thank you, truly.",
      hostile: "You cost these settlements their independence. I hope whatever you got in return was worth it."
    },
    signatureChoice: {
      prompt: "Kael's sanctuary could use the settlements' resources behind it. Back it fully, stay neutral like we always have, or throw our support behind whichever faction offers the best terms this season?",
      resolvedTag: "iss_alliance_choice",
      options: [
        {
          id: "back_kael",
          label: "Back Kael's sanctuary fully.",
          tag: "iss_backed_kael",
          delta: { independent: 20, paleChoir: 5 },
          followUp: "\"Then it's decided,\" she says. \"Free settlements standing behind a free sanctuary. That's a sentence I like the shape of.\""
        },
        {
          id: "stay_neutral",
          label: "Stay neutral, like the settlements always have.",
          tag: "iss_stayed_neutral",
          delta: { independent: 10 },
          followUp: "\"Neutrality's kept us alive this long,\" she says. \"I'm not eager to test whether that luck holds.\""
        },
        {
          id: "sell_to_faction",
          label: "Throw support behind the best offer, whichever faction it's from.",
          tag: "iss_sold_to_faction",
          delta: { independent: -20, chainwrights: 10 },
          followUp: "Something in her expression suggests she'll regret this by morning. She signs anyway. \"Survival isn't always dignified.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "the_cartographer", tag: "cartographer_trusted", line: "So the Cartographer finally found someone to trust with the road to Selen. I've known them thirty years and they've never once told me that much." }
    ]
  },
  {
    id: "moonthread_warden",
    name: "The Moonthread Warden",
    title: "Warden of the Moonthread",
    zoneId: "moonthread",
    position: { x: 0, y: 0, z: 10 },
    primaryFaction: null,
    loyaltyType: "ideological",
    greetings: {
      unknown: "So. The Cartographer's road finally delivered someone who could walk it. Welcome to the Moonthread itself, sky-child — the thing every faction in Aethon is really fighting over. I am what's left to tend it. What do you mean to do about it?",
      met: "The thread still hums, for now. It won't forever.",
      friendly: "You've walked far enough to matter here. That's rare, and rarer still that it's someone worth trusting with it.",
      trusted: "You are, as far as I can tell, exactly the kind of person this tether was built to be tended by. I mean that as the weight it carries.",
      hostile: "You raised a hand against the Moonthread's warden. I won't stop you from leaving. I also won't help you again."
    },
    signatureChoice: {
      prompt: "This is the choice everything else was leading to. The Moonthread can be bound — repaired, tightened, Selen kept as Aethon's battery. It can be balanced — weakened but maintained, a fragile peace between two exhausted worlds. Or it can be severed — cut loose, and whatever Selen becomes after, becomes without us. What do you choose?",
      resolvedTag: "moonthread_fate_choice",
      options: [
        {
          id: "bind_the_thread",
          label: "Bind it. Repair the Moonthread and hold the line.",
          tag: "moonthread_bound",
          delta: { chainwrights: 30, paleChoir: -20 },
          locksEndingThread: "bind",
          followUp: "The Warden presses both hands to the tether, and something ancient and exhausted settles, just slightly, under the weight of one more year of holding. \"Then it holds. For now. It was always only ever for now.\""
        },
        {
          id: "balance_the_thread",
          label: "Balance it. Weaken the tether, but maintain it.",
          tag: "moonthread_balanced",
          delta: { chainwrights: 5, paleChoir: 5, independent: 10 },
          locksEndingThread: "balance",
          followUp: "The Warden nods slowly, like this is the answer they were hoping, without quite believing, that you'd choose. \"A fragile peace, then. Fragile has held longer than certain, in my experience.\""
        },
        {
          id: "sever_the_thread",
          label: "Sever it. Let Selen go, whatever she becomes.",
          tag: "moonthread_severed",
          delta: { paleChoir: 30, chainwrights: -20 },
          locksEndingThread: "sever",
          followUp: "The Warden's hands shake as the tether finally, finally gives — decades, centuries of tending, undone in a single choice. \"...There. Free. I hope free was worth it, for both of you.\""
        }
      ]
    }
  },
  {
    id: "echo_of_selen",
    name: "Echo of Selen",
    title: "A Memory of Selen",
    zoneId: "moonthread",
    position: { x: 8, y: 0, z: -4 },
    primaryFaction: null,
    loyaltyType: "ideological",
    greetings: {
      unknown: "you came so far to hear me and now that you're here you don't know what to say. that's alright. I didn't either, the first time i remembered being a person instead of a moon.",
      met: "still here. still remembering. still, somehow, still you, too — for now.",
      friendly: "you keep returning to listen. i keep having more to say than i expected a corpse-that-remembers to have.",
      trusted: "of everyone who has ever heard me, you have listened the longest without flinching. i don't know what to call that except gratitude.",
      hostile: "you tried to silence what i am. i understand. i have been trying to silence it too, for longer than you've been alive."
    },
    signatureChoice: {
      prompt: "let me in further. let the memory finish what the shard-falls started, and become more of what i am — or fight to stay entirely yourself, and lose whatever that would have taught you — or help me find something between the two, a self that holds both. what do you choose, sky-child?",
      resolvedTag: "echo_selen_choice",
      options: [
        {
          id: "embrace_selen",
          label: "Let her in. Become more of what she is.",
          tag: "echo_embraced",
          delta: { paleChoir: 20, independent: -10 },
          followUp: "something in your own thoughts goes quieter, and something older gets louder in its place. it doesn't feel like losing, exactly. you're not sure yet what it feels like."
        },
        {
          id: "resist_selen",
          label: "Fight to stay entirely yourself.",
          tag: "echo_resisted",
          delta: { chainwrights: 15, independent: 10 },
          followUp: "\"good,\" she says, and there's something like relief in it, buried under the grief. \"someone should still get to just be a person. i'm glad it's you.\""
        },
        {
          id: "balance_selen",
          label: "Search for a self that holds both.",
          tag: "echo_balanced",
          delta: { independent: 20 },
          followUp: "\"i don't know if that's possible,\" she admits. \"i don't know that it isn't, either. no one's tried it quite like this before. try anyway.\""
        }
      ]
    }
  },
  {
    id: "archmagister_thessaly_vane",
    name: "Archmagister Thessaly Vane",
    title: "Last Loyalist of the Moonthread",
    zoneId: "moonthread",
    position: { x: -8, y: 0, z: 2 },
    primaryFaction: "chainwrights",
    loyaltyType: "fanatic",
    greetings: {
      unknown: "Archmagister Thessaly Vane. I am the last of the Order who still stands this close to the tether itself. My son Aldric holds the line at Threadhold. I hold it here, where it actually matters.",
      met: "The thread still needs holding. I still hold it.",
      friendly: "You've proven steadier here than most of the Order I command from this distance.",
      trusted: "You have earned something I've given almost no one in forty years of this post: my trust.",
      hostile: "You raised your hand against the Order at the one place it can least afford to fall. I will not forgive that, whatever comes."
    },
    signatureChoice: {
      prompt: "Forty years I've held this post. I could defend the binding mechanism to my last breath, step aside and let you decide the Moonthread's fate yourselves, or — quietly, where none of my Order can hear — ask you to sever it and end this. What would you have of me?",
      resolvedTag: "thessaly_role_choice",
      options: [
        {
          id: "thessaly_defends",
          label: "Defend it. Someone has to hold the line.",
          tag: "thessaly_defended_binding",
          delta: { chainwrights: 20, paleChoir: -15 },
          followUp: "She draws herself up, forty years settling back onto her shoulders like armor. \"Then I hold it. As I always have.\""
        },
        {
          id: "thessaly_steps_aside",
          label: "Ask her to step aside and let the choice be yours.",
          tag: "thessaly_stepped_aside",
          delta: { independent: 15 },
          followUp: "\"...Forty years,\" she says quietly, \"and I don't think anyone has ever asked me to stop before.\" She steps aside."
        },
        {
          id: "thessaly_begs_sever",
          label: "Listen to what she's really asking — help her end it.",
          tag: "thessaly_begged_sever",
          delta: { paleChoir: 20, chainwrights: -25 },
          followUp: "Something in her finally breaks, forty years of holding it together giving way at once. \"Please. I've wanted it ended longer than I've admitted to anyone, including myself.\""
        }
      ]
    },
    crossReferences: [
      { npcId: "aldric_vane", tag: "aldric_exposed", line: "I heard what happened to my son at Threadhold. Exposed, by your hand. I have had forty years to learn that the Order does not forgive easily. I am trying to learn it doesn't have to be the only answer." },
      { npcId: "aldric_vane", tag: "aldric_concealed", line: "My son tells me you helped him bury what needed burying. I don't know whether to thank you or grieve what that cost the people who never got their truth." },
      { npcId: "aldric_vane", tag: "aldric_confronted", line: "Aldric wrote to me about the stranger who made him consider confessing. I don't know if he ever did. I find, strangely, that I hope he will." }
    ]
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
function crossReferenceLine(npc: NpcDef, memory: NpcMemoryState): string | undefined {
  for (const ref of npc.crossReferences ?? []) {
    if (memoryFor(memory, ref.npcId).tags.includes(ref.tag)) return ref.line;
  }
  return undefined;
}

export function resolveDialogue(npc: NpcDef, memory: NpcMemoryState, loyalty: LoyaltyScores): ResolvedDialogue {
  const entry = memoryFor(memory, npc.id);
  const relationship = computeRelationship(gaugeKeyFor(npc), npc.loyaltyType, entry, loyalty);

  // A death cascade (see relationships.ts) outranks the normal greeting and any crossReference —
  // someone else's fate just overrode how this NPC greets you today. "departs" additionally
  // means they're done offering their own signature choice, whether or not it was ever answered.
  const cascade = cascadeFor(npc.id, memory);
  const crossLine = cascade ? undefined : crossReferenceLine(npc, memory);
  const greeting = cascade ? cascade.greetingOverride : crossLine ? `${npc.greetings[relationship]} ${crossLine}` : npc.greetings[relationship];
  const departed = cascade?.effect === "departs";

  if (!departed && npc.signatureChoice && !entry.tags.includes(npc.signatureChoice.resolvedTag)) {
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
