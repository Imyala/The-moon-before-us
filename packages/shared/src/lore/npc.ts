/**
 * A first, fully-wired slice of the wider NPC roster from the design bible: each has
 * memory-conditional greetings and one signature choice with real faction consequences,
 * demonstrating the pattern (see docs/GDD.md's "Playable conversations" section) that the rest
 * of the cast can be authored against. A handful (marked by a `recruits: true` option) can join
 * the party as a companion — see CharacterState.companionId and Room's companion AI. Not every
 * named character from the bible is here yet — this is the system proven out with real content,
 * not a claim that the full roster is built.
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
  /** Choosing this option makes the NPC the player's companion (see CharacterState.companionId). */
  recruits?: boolean;
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
  const crossLine = crossReferenceLine(npc, memory);
  const greeting = crossLine ? `${npc.greetings[relationship]} ${crossLine}` : npc.greetings[relationship];

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
