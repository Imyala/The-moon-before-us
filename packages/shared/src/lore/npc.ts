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
    }
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
    }
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
    }
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
    }
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
