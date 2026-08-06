# The Moon Above Our World — Full Design Brainstorm (Reference Archive)

> **What this file is:** the complete, unabridged narrative/systems brainstorm that preceded and informed `docs/GDD.md`. It is kept here verbatim as a reference for future development — it is **not** a spec of what's built. For what actually exists in the codebase today, see `docs/GDD.md`, which explicitly tracks what's built, what's deferred, and what's out of scope.
>
> **Scale warning:** this document describes a full branching-campaign MMO (~120 decisions across 8 chapters, 60+ full character-bible entries, a complete faction-switching economy, a 9-major/14-secret ending matrix, and an origin/class choice-architecture layer). The current vertical slice implements a real subset of this — 60 named NPCs, faction loyalty, NPC memory, a relationship/death-cascade graph, 2-companion play, Moon-Touched progression, and one scripted finale locking one of the 9 major endings. Treat everything below as **design material to draw from**, not a backlog that's expected to already be done.
>
> Two early sections below (§0.1 and §0.2) predate the "Aethon/Selen" premise and were superseded by it; they're kept for process history only.

---

## Table of Contents

0. Early-stage drafts (superseded, kept for history)
   - 0.1 Generic gameplay/world framework (pre-premise)
   - 0.2 "The Shattered Veil" — superseded premise
1. The Moon Above Our World — core premise (Aethon & Selen)
2. World & lore layers
3. Ending framework (early draft — see §9 for the final matrix)
4. NPC memory system & playable conversations
5. Full 60+ character roster & appearance matrix
6. Faction web, loyalty, and switching mechanics
7. Character bible (deep NPC-by-NPC dossiers)
8. Choice architecture — Prologue through Chapter 8 (~38 decision points)
9. Companion arc system (Bond/Disgust/Trust/Resonance)
10. Origin, class, and Moon-Touched path integration
11. Full ending matrix (9 major + 14 secret endings)
12. Playable Conversation System — technical specification
13. Living World / seasonal live-service design
14. Economy & crafting system design

---

## 0.1 Early-stage draft: generic gameplay/world framework (superseded)

*Kept for process history. This predates the Aethon/Selen premise and was written as a generic "how to design a GW2-style MMO" exercise before the moon concept existed.*

### Core Gameplay & World Design Framework

#### 1. The Fantasy: Answer This First

Before any system, define the **player fantasy** in one sentence. This is the emotional promise.

| Game | Fantasy |
|---|---|
| WoW | "I am a legendary hero in a high-fantasy epic." |
| GW2 | "I am an explorer-adventurer in a living world full of public spectacle." |
| FFXIV | "I am the protagonist of a JRPG saga with my found family." |
| ESO | "I am a free agent exploring a familiar, dangerous province." |
| BDO | "I am a mercenary in a gorgeous sandbox where life skills matter." |

#### 2. Core Gameplay Pillars (example set)

1. **Public World, Shared Moments** — most memorable content happens organically with other players.
2. **Build Freedom, Not Gear Treadmills** — your character is defined by skills/traits, not item level.
3. **Explore to Progress** — map completion, discoveries, and world events give meaningful rewards.
4. **Horizontal Endgame** — max power is reachable; long-term chase is mastery, cosmetics, and collections.
5. **Respect the Player's Time** — no daily chores that feel like a second job.

#### 3. World Design: The Living World

Zone philosophy: zones are content containers, not quest hubs you outlevel. Each zone needs biome identity, a map meta event, dynamic events/heart tasks, points of interest, resource nodes, a world boss, a zone currency/vendor, and a waypoint network.

Map layout patterns: radial-with-hub, linear valley with side areas, layered vertical zone, open frontier. Dynamic events vs. static quests: recommended hybrid — instanced personal story for directed narrative, dynamic events for zone content, collections/discoveries for side content. World-state persistence should stay mostly per-instance or per-account; global permanent world changes are prohibitively expensive to maintain.

#### 4. Story Delivery Model

Layers: personal story (instanced), living-world/seasonal (ongoing), zone/local stories (environmental), dungeon/strike stories (group), guild/faction stories (community). Pacing rules: don't gate the first 10 hours with heavy story; instanced chapters should run 20–40 minutes; give players a reason to care about NPCs; event chains should have setup/conflict/resolution. Player agency: for a first MMO, favor cosmetic-only or minor-consequence branching over expensive major branching.

#### 5. Class & Skill System

Hybrid model recommended: class gives identity, build system gives depth. 6–9 launch classes (Guardian/Paladin, Warrior, Ranger, Thief, Elementalist, Necromancer, Engineer, Mesmer, Revenant), each with elite specializations added post-launch. Skill bar: auto-attack chain, weapon skills, heal skill, utility skills, elite skill. Build levers: weapons, utility/elite skills, traits, sigils, runes, gear stats, mastery/hero points — no single lever should invalidate the others.

#### 6. Combat Feel

Recommend hybrid action combat (dodge + skill shots + soft targeting) over full tab-target or full action combat, as the sweet spot for MMO scalability. Needs: dodge roll with iframes, telegraphed enemy attacks, skill shots + soft targeting, movement while casting, combo fields (fire/water/poison/light + blast/leap/projectile/whirl finishers), diminishing-returns CC, build-defining ultimates, and "juice" (screen shake, hit-stop, distinct hit sounds, floating combat text, particle effects).

#### 7. Progression Philosophy

Recommend committing to horizontal progression (GW2-style: max power reachable quickly, chase is masteries/legendaries/cosmetics/collections/map completion) over vertical (WoW-style gear treadmill) to avoid old content becoming obsolete and avoid new-player-far-behind syndrome.

#### 8. Content Pillars

Open world (dynamic events, meta events, world bosses, jumping puzzles, vistas, gathering), instanced group content (dungeons, fractals, strikes, raids, PvP, WvW), solo/small-group content (personal story, collections, crafting, housing), social/economy content (guild missions, trading post, fashion, festivals).

#### 9. Social Systems

Open joining for events, squad/raid management, fast role-agnostic LFG, guild infrastructure. Incentives: participation-scaled rewards (not kill-tagging), combo-field coordination, revive mechanics, meta events that don't require formal parties. Anti-toxicity: no mob tagging/loot stealing, personal loot, opt-in PvP, robust report/block tools.

#### Starting-point recommendation that came out of this exercise

> "A buy-to-play fantasy MMO where you explore a beautiful, event-driven world with friends. Power caps quickly, but build combinations, legendary cosmetics, and map mastery give you years of goals. There are no daily chores, no gear treadmill, and no realm locks — just a world that always has something happening."

8 classes at launch (2 elite specs each in the first expansion), hybrid action combat, megaserver phasing, horizontal progression, dynamic events + instanced personal story, soft trinity, personal loot + global trading post, buy-to-play + expansion + cosmetic gem shop. Launch content target: 6 starting zones + 1 capital + 4 mid + 2 high-level zones, 1 meta event per region, 5 dungeons, 1 world boss per region, 3 PvP maps, 1 WvW borderland, 8 classes, 6 crafting disciplines, personal story prologue + 8 chapters.

**What to lock before returning to server architecture:** combat style, class/skill structure, zone/instance structure, event scaling rules, progression/economy data model, loot/reward model, story phasing needs.

---

## 0.2 Superseded premise: "The Shattered Veil"

*This was the working concept before it was rethemed into Aethon/Selen (see §1). Kept for history only — "Veil-shards," "Remnants," and "Aethermoor" below are earlier names for what became Moonshards, the Moon-Touched, and Aethon.*

**Pitch:** "The world of Aethermoor is wrapped in a dying magical barrier called the Veil. When fragments of the shattered barrier begin falling from the sky as crystalline meteors, every faction races to claim them — because the Veil-shards can rewrite reality, and something ancient is stirring on the other side."

**Central theme:** "What are you willing to forget so the world can survive?"

**Regions:** Verdant Reach, Ashford Expanse, Siren Coast, The Mournstride, Crystalline Spire, The Riftmarch.

**Five ages:** Age of Roots → Age of Crowns → Age of Cinders → Age of Glass → Age of Fracture (now).

**Three factions:** The Argent Concord (order/preservation), The Ember Covenant (freedom/progress), The Hollow Chorus (acceptance of entropy).

**Player identity:** a "Remnant" who briefly died in a shardfall and returned with Echo Sight (see ghostly remnants of past events) and a Memory Tether (revisit key moments) — the direct ancestor of the Moon-Touched / Lunar Resonance mechanic in the final premise.

**Structure:** Prologue + 8 chapters (*The Day the Sky Broke* → *What Remains*), three endings (Seal the Veil / Rewrite the Veil / Remember), replayability via Echo Sight reveals, a Codex/Memory Weaver collectible system, "What If?" remix instances, and seasonal recontextualization — all direct ancestors of the systems described in §1–§11 below.

This concept was rethemed: Veil → Moonthread, Remnant → Moon-Touched, Echo Sight → Lunar Resonance, Argent Concord/Ember Covenant/Hollow Chorus → Chainwrights/Luminari/Pale Choir, Aethermoor → Aethon, and the antagonist force shifted from an abstract "Hollow" reality-glitch to Selen, a dying moon with its own memory and will.

---

## 1. The Moon Above Our World — Core Premise

**One-sentence pitch:** The moon **Selen** is chained to our world **Aethon** by an ancient celestial engine called the **Moonthread**. When the thread frays, shards of the moon fall as **Moonshards** — and those touched by them become **Moon-Touched**, able to hear the moon's memories, speak to the dead, and rewrite fate.

**Central question:** *"If the moon is a prison, a god, a memory, or a corpse — what do we do when it finally falls?"*

This supports: lunar horror (Selen is not friendly; it remembers), cosmic mystery (what is the Moonthread? who built it?), personal tragedy (Moon-Touched are feared, hunted, and slowly losing themselves to lunar whispers), political conflict (factions fight over who controls the shards and the tether), and replayability (the moon's nature can be interpreted many ways; endings reflect your interpretation).

---

## 2. World & Lore Layers

### 2.1 Regions of Aethon

Each region is built around a lunar phenomenon and a cultural response to the falling moon.

| Region | Biome | Lunar Phenomenon | Cultural Identity |
|---|---|---|---|
| **Threadhold** | Verdant riverlands, aqueducts, terraces | Moonshards fall gently; land glows faintly at night | Agricultural heartland; pragmatic, tradition-bound |
| **Ashmire** | Volcanic glass wastes, forge-cities | Shards burn through the crust, awakening deep heat | Industrial revolutionaries; weaponize moon-fall |
| **Sunken Llyr** | Coastal fjords, drowned forests, tidal caves | Moon-tide surges pull drowned things to the surface | Maritime scavengers, spirit-callers, smugglers |
| **Mourncrown** | Haunted highlands, eternal twilight, stone circles | The moon is always visible; shadows behave wrong | Clans of exorcists and historians, grim and poetic |
| **The Spirechain** | Sky-cities linked by cable-cars and bridges | Scholars study the Moonthread through telescopes and engines | Academic, political, obsessed with control |
| **The Frayedge** | Fractured badlands at the world's rim | Reality tears; pieces of Selen are visibly close overhead | Outcasts, Moon-Touched colonies, doomsayers |
| **The Moonthread** (endgame) | A sky-road of crystallized tether leading toward Selen | Direct exposure to lunar energies | The final frontier; few return unchanged |

### 2.2 The Five Ages of Aethon & Selen

| Age | What Happened | How Players Discover It |
|---|---|---|
| **The Age of Two Skies** | Aethon and Selen were separate, living worlds. | Selenian ruins on Aethon; lunar fossils; "seas" visible as scars on the moon. |
| **The Binding** | A catastrophe threatened both worlds; the first Chainwrights forged the Moonthread to tether Selen to Aethon, draining Selen to stabilize Aethon. | The Moonthread itself; ruins of the first anchor-cities; forbidden Spirechain archives. |
| **The Age of Borrowed Light** | Aethon thrived on stolen lunar energy; Selen died slowly; cultures forgot the debt. | Moon-crystal temples; festivals celebrating "the moon's gift"; songs with forgotten verses. |
| **The Age of Fracture** | The Moonthread began failing; shards fell; first Moon-Touched appeared. | Craters, abandoned anchor-cities, quarantine zones, Moon-Touched burial grounds. |
| **The Now — The Whispering** | Selen is not dead. It is dreaming, remembering, and screaming. | You are Moon-Touched. You hear it. |

### 2.3 Selen as a Character

| Selenian Layer | Represents | In-Game Form |
|---|---|---|
| **The Crust** | The dead surface; ash, crystal, ruins | Moonshard impact sites; minerals; fossils |
| **The Memory Sea** | The collective unconscious of dead Selenians | Echo Sight/Lunar Resonance visions; spirits; the Whispered |
| **The Core** | The original life-sustaining engine | Endgame raid; the heart of the Moonthread |
| **The Dreaming** | Selen's fractured, vengeful mind | Lunar whispers; prophetic dreams; memory-born bosses |

### 2.4 Three Major Factions

| Faction | Name | Philosophy | Visual Identity | Goal for Selen |
|---|---|---|---|---|
| **The Chainwrights** | Order of the Silver Thread | Repair and tighten the Moonthread; Selen remains a battery for Aethon | White-gold armor, cog motifs, restrained emotion | Bind Selen forever |
| **The Luminari** | The Free Moon | Selen's energy belongs to all; use shards to uplift Aethon | Bronze, deep blue, artificer goggles | Exploit Selen openly |
| **The Pale Choir** | The Duskborne | Selen suffers; the tether is cruelty; let the moon die with dignity | Pale grey, mourning veils, ink-stained robes | Sever the Moonthread |

Minor factions: the Tide-Callers (Sunken Llyr), the Ashforged (Ashmire mercenaries), and the Hollowed (a condition, not a faction — Moon-Touched who lost themselves to Selen's will).

### 2.5 Cultures of Aethon

Each region should define: greeting gesture, funeral rite, taboo, festival, food, attitude toward the Moon-Touched, and a regional curse. Example — **Threadhold**: greeting is touching forehead then heart ("mind and harvest"); bodies are laid under moonlight so Selen "remembers" them; sleeping under a direct full moon is taboo (invites the Whispered); the Threadlight Fair releases lanterns tied to threads; moon-apples glow faintly and are safe if harvested before dawn; Moon-Touched are met with fear and pity, with quarantine camps in remote fields; the local curse is "May the moon remember your name."

### 2.6 Lunar Phenomena (worldbuilding as gameplay systems)

Moonshards (crafting/power material), Lunar Tides (periodic flooding/flying-creature events), Whisper Zones (Echo Sight lore reveals), Shadow Drift (independent-moving shadows at night), The Long Night (weekly/monthly eclipse event with special bosses), Moon-Touched Sickness (high-lunar-zone debuff that erodes memory).

### 2.7 The Moon-Touched Condition

| Stage | What Happens | Gameplay |
|---|---|---|
| **Touched** | Brief death during a Moonshard fall; you came back | Unlock Lunar Resonance; hear whispers |
| **Resonant** | Begin seeing echoes and hidden paths | Echo Sight active; secret doors/lore visible |
| **Aligned** | Start agreeing with Selen's memories | NPCs notice; feared or revered |
| **Hollowed** (bad path) | Lose your name and memories | Alternate dark-ending route; NPCs forget you |

---

## 3. Ending Framework — Early Draft

*Superseded in detail by §11, but the axis model originated here and is worth keeping as the conceptual seed.*

Three axes instead of a single binary ending:

- **Axis 1 — The Moonthread:** Bind / Balance / Sever
- **Axis 2 — The Moon-Touched:** Cure / Accept / Embrace
- **Axis 3 — The Factions:** Chainwright Victory / Luminari Victory / Pale Choir Victory / Independent

3×3×4 = 36 possible combinations, grouped into **9 Major Endings**, each with 3–5 minor variants (~30–50 trackable ending states):

| # | Major Ending | Thread | Touched | Faction | Tone |
|---|---|---|---|---|---|
| 1 | The Silver Chain | Bind | Cure | Chainwright | Order restored; the moon is silent |
| 2 | The Gilded Cage | Bind | Accept | Luminari | Aethon thrives; the moon suffers openly |
| 3 | The Lullaby | Bind | Embrace | Pale Choir | The moon sings; everyone begins to dream |
| 4 | The Dim Light | Balance | Cure | Independent | A fragile peace; the Whispered fade |
| 5 | The Shared Sky | Balance | Accept | Independent | Two worlds, one horizon; cautious hope |
| 6 | The Bridge | Balance | Embrace | Independent | Humanity and Selen merge slowly |
| 7 | The Long Fall | Sever | Cure | Pale Choir | Selen dies; Aethon survives, guilty |
| 8 | The Drift | Sever | Accept | Luminari | Selen floats free; Aethon finds new paths |
| 9 | The Becoming | Sever | Embrace | None/Hollowed | Humanity ascends to the moon |

Ending determination should be the *sum* of many choices (faction allegiance, Moon-Touched path, NPC survival, region states, shard usage, moral micro-choices, hidden discoveries, group-content outcomes), not one final dialogue pick — plus secret endings for unusual play patterns (The Remembered, The Forgotten, The Jester, The Pacifist, The Architect).

---

## 4. NPC Memory System & Playable Conversations

### 4.1 Universal Memory Tags (apply to every NPC)

| Tag | Values | Meaning |
|---|---|---|
| Relationship | Unknown → Met → Known → Trusted → Bonded → Betrayed → Hated → Dead | Overall standing |
| Saved/Abandoned | Saved, Abandoned, Killed, Ignored | Did you help them in a crisis? |
| Promises | Kept, Broken, Never Made | Did you honor your word? |
| Faction Stance | Supported, Opposed, Neutral, Manipulated | How you treated their faction |
| Moon-Touched Disclosure | Hidden, Revealed, Used Against, Shared Bond | Whether they know your condition |
| Dialogue History | Friendly, Hostile, Flirtatious, Dismissive | Tone of past conversations |
| Quest State | None, Active, Completed, Failed, Refused | Their personal questline |

Character-specific tags layer on top (e.g. Elder Maeve: `Daughter Saved`, `Village Abandoned`; Thorn Ash-Debt: `Debt Paid`, `Debt Forgiven`, `Debt Exploited`; Lira: `Selenian Secret Known`, `Bloodline Protected`, `Bloodline Exposed`).

**Scaling rule for 60+ characters:** every character has one signature choice; characters cluster into webs (saving one may doom another); not everyone survives (~20 of 60 can die or be removed); appearance is conditional, evaluated per-chapter-load against tags, never random.

### 4.2 Playable Conversations — No Cutscenes

Rules: no forced camera locks; no world-pausing dialogue wheels; NPCs talk while walking/working/fighting; conversations can be interrupted and resumed; key info repeats if missed; deep lore is opt-in.

Modalities: ambient dialogue (NPCs talk to each other as you pass), walk-and-talk companions (follow and narrate mid-play), contextual speech bubbles (press to expand), Echoes & Lunar Whispers (inner monologue from touching objects/corpses), combat banter (bosses reveal motivation mid-fight), inspectable lore objects (5–15s optional audio/text), the Whispered/Selen's inner voice (recurring commentary), and epistolary storytelling (letters, journals, bounty boards feeding the codex).

UI needs: speech bubble above NPC heads, toggleable subtitles, a Lunar Resonance "something has a memory" ping, codex unlock pop-ups, companion portrait+line during story beats, and minimal timed contextual choice prompts (e.g. "Spare him?" while aiming).

---

## 5. Full 60+ Character Roster & Appearance Matrix

### 5.1 Core Faction Characters (9)

1. **Aldric Vane** — High Chainwright. Severe, principled, believes suffering is the price of survival. Signature choice: expose or protect his war crimes (Ch. 6). States range from powerful ally to removed-from-power to dead, cascading to Castellan Yora or Magistrate Thorne taking over.
2. **Ilsa Marche** — Luminary of the Luminari. Brilliant, reckless, addicted to shard-energy. Signature choice: stop or allow her draining a village to power a machine (Ch. 5).
3. **Vesryn the Duskborne** — Hierophant of the Pale Choir. Ancient, gentle, wants the world to grieve properly. Signature choice: allow or prevent his self-sacrificial Last Rite (Ch. 7); if he dies, Mira Hollowbell becomes Hierophant.
4. **Castellan Yora** — Warden of the Silver Fortress. Hard but principled soldier; may reform the Chainwrights if Aldric falls and the player was honorable.
5. **Magistrate Thorne** — Chainwright politician; puts the player on trial in Ch. 6; the most purely pragmatic Chainwright, will defect if the Order is losing.
6. **Artificer Perrin** — Chief Luminari engineer; anxious genius terrified of what he's building; may defect if his conscience breaks.
7. **Captain Sera Voss** — Luminari privateer; recovering her drowned crew is her signature arc.
8. **Mira Hollowbell** — Pale Choir mourner; central to the Ch. 5 "save one person" choice; potential future Hierophant.
9. **Brother Ink** — Pale Choir chronicler of the Book of Dusk; signature choice around a forbidden archive proving the Binding was a crime.

### 5.2 Regional Leaders (7)

10. **Elder Maeve** — Threadhold's elder; maternal common-folk anchor; her trust hinges on the Prologue shardfall response.
11. **Forge-Mother Breca** — Ashmire's industrial leader; arms whichever faction (or none) the player brokers.
12. **Tidecaller Oren** — Sunken Llyr's spirit-guide; the drowned-city fate is his signature arc.
13. **Thane Corvin** — Mourncrown's clan chief; his ancestral hall's defense/evacuation/betrayal is his signature choice.
14. **Archon-Scribe Velis** — Spirechain archive master; amoral knowledge broker.
15. **Warden Kael** — Frayedge outcast leader protecting Moon-Touched refugees; the sanctuary-raid arc is his signature moment.
16. **The Cartographer** — Mysterious endgame guide to the Moonthread; possibly a Selenian fragment.

### 5.3 Companions & Loyalty Characters (12)

17. Veyra Moon-Scribe (scholar), 18. Thorn Ash-Debt (mercenary), 19. Lira of the Drowned Line (smuggler with Selenian blood), 20. Cael the Rimed Tongue (exorcist poet), 21. Nix Fray (urchin thief), 22. Solace Stillwater (pacifist healer), 23. Ironwright Unit 7 (awakened golem), 24. Spark Coil (artificer apprentice), 25. Echo-Who-Was (recovering Hollowed), 26. Bran Fieldhand (farmer-soldier), 27. Sylvie the Wrong-Eyed (Moon-Touched seer), 28. Dren Cold-Coin (pure mercenary).

(Full arcs for these 12 — including Bond/Disgust/Trust/Resonance thresholds — are in §9.)

### 5.4 Regional Character Rosters (34)

- **Threadhold (6):** Tomasin the Orchard Keeper, Pip (orphan child — a major branching NPC), Miller Tarn (gossip/informant), Sister Wren (healer, first to spot your condition), Houndmaster Vex (Chainwright enforcer), Threadward Warden Oris (ward keeper).
- **Ashmire (6):** Slag the Forgemaster, Viceroy Korr (mercenary contract broker), Pyra Emberhand (Luminari pyromancer), Grist Deepdelver (miner who finds a Selenian artifact), Maul the Unbroken (pit fighter), The Glass Jaw (broken war machine that speaks in nursery rhymes).
- **Sunken Llyr (6):** Captain Netta Blacktide (pirate rival to Sera), Brine (drowned memory), Mara Pearl-Diver, Old Finn (lighthouse keeper), The Selenian (hidden original-moon survivor), Tide-Crone Yeva (oldest spirit-caller).
- **Mourncrown (6):** Wraith-Ward Rowan (Hollowed hunter), Lady Maren of the Last House, The Prince of Shadows (folklore/possibly-real figure), Gwyn the Gravedigger, Skald Varn (wandering poet who sings your legend), Sir Yorick the Forgotten (Hollowed knight).
- **Spirechain (6):** Chancellor Irin, Astrolabe (sentient clockwork assistant), Novice Tarn (finds proof the Binding was a crime), The Warden of Secrets (archive guardian), Star-Reader Ophi (astronomer going Moon-Touched), Coin-Countess Seren (merchant-prince).
- **Frayedge/Moonthread (4):** The Last Anchorite, Hollow-Singer (leader of the Hollowed commune), The Moon-Touched Twins (shared-mind siblings), The Falling Man (fading NPC).

### 5.5 World-Presence Character

63. **The Whisperer** — Selen itself, speaking to Moon-Touched players. Not a quest-giver; tracks how the player responds (ignored/heeded/argued/served/rejected) across the whole game and shapes the finale's tone.

### 5.6 The Appearance Matrix

Every chapter has a default cast plus conditional additions gated by faction reputation thresholds (e.g. Castellan Yora requires Chainwright reputation ≥ Trusted OR Aldric still in power), morality/choice gates (Elder Maeve appears if the village was saved, is dead/absent if abandoned), and death cascades (if Vesryn dies, Mira becomes Hierophant; if Aldric dies, Yora or Thorne succeeds; if Warden Kael's sanctuary falls, Hollow-Singer gains power). See §6 and §7 for the full mechanics and per-character detail.

---

## 6. Faction Web, Loyalty, and Switching Mechanics

### 6.1 The Faction Triangle

Chainwrights (Bind/Order) vs. Pale Choir (Sever/Remembrance) is the core ideological war; the Luminari (Exploit/Progress) play both sides opportunistically. The player sits in the center; every action tugs toward one corner. Deepest conflict: Chainwright vs. Pale Choir. Most pragmatic: Luminari, who ally temporarily with either.

### 6.2 NPC Loyalty Types

| Type | Description | Examples |
|---|---|---|
| Fanatic | Faction is their identity; never forgives defection | Aldric, Vex, Ilsa, Vesryn, Brother Ink, Pyra |
| Institutional | Loyal to the institution, not individuals; negotiable | Castellan Yora, Threadward Warden Oris |
| True Believer | Believes the cause but has a conscience | Artificer Perrin, Mira Hollowbell, Spark Coil |
| Pragmatic | Loyal to whoever is winning/paying | Magistrate Thorne, Coin-Countess Seren, Viceroy Korr, Dren |
| Ideological | Loyal to an idea, not a faction | Cael, Solace, Brother Ink (partially), Skald Varn |
| Personal | Loyal to the player as a person | Most companions, Elder Maeve, adopted Pip, mentored Nix |
| Mercenary | Loyal to coin | Captain Netta, Dren, Thorn |

### 6.3 Four Hidden Player Scores

Chainwright Loyalty, Luminari Loyalty, Pale Choir Loyalty (each -100 to +100), and Independent Reputation. States range from Hunted (-100 to -80) through Neutral to Exalted (+80 to +100), each with concrete gameplay effects (prices, guard behavior, quest access, leader-quest unlocks).

### 6.4 Switching Mechanics

Switching factions is allowed but not free: first switch is cheap, subsequent switches cost more, public switches carry bigger consequences than quiet ones, personally-loyal NPCs stay regardless, fanatically-loyal NPCs turn hostile or leave. A decay/gain formula governs the transfer:

| Switch Type | Old-Faction Decay | New-Faction Gain | Public Consequence |
|---|---|---|---|
| Quiet defection | ×0.75 | +20 | Few NPCs notice |
| Public defection | ×0.50 | +30 | Old leadership marks you |
| Betrayal (sabotage) | ×0.25 | +50 | Old faction becomes Hunted-tier hostile |
| Double agent | ×0.85 | +10 to both | Risk of exposure |

Grudge tags (`Betrayed_Chainwrights`, `Betrayed_Luminari`, `Betrayed_Pale_Choir`, `Double_Agent_Exposed`) can be softened by specific reparative quests but rarely fully erased.

### 6.5 Regional Faction Power & World Reshuffling

Each of the 7 regions tracks a Faction Power score per faction (Chainwright/Luminari/Pale Choir/Independent), shifted by questline completion, asset destruction, brokered peace, militia-arming, and public faction switches within that region. The dominant faction changes the region's visuals, governing NPCs, and available content (example table across all 6 non-endgame regions × 4 dominant-faction states is in the source design notes — each combination has its own visual description, NPC roster shift, and content-type shift).

### 6.6 Faction-Driven Quest Variants

The same quest reflows differently per dominant faction — e.g. "The Last Lighthouse" in Sunken Llyr has a Chainwright version (ward-tower conversion), a Luminari version (shard-reactor installation), a Pale Choir version (beacon for the drowned dead), and an Independent version (free-port smuggling deal).

### 6.7 Companion Faction Disposition

Each of the 12 companions has explicit tolerance/hostility reactions to each faction (full table in §9's companion-by-companion breakdown and in the cross-reference table at the end of §9).

---

## 7. Character Bible — Deep NPC Dossiers

*The following are illustrative full-length dossiers (backstory, voice, signature choice, faction-switching reaction, appearance states, memory tags, connections) for a representative slice of the 60+ roster. Every named NPC in §5 deserves this treatment eventually; these are the ones fully written out during the brainstorm.*

### The Chainwright Order

**Aldric Vane — High Chainwright of the Silver Thread.** Voice: cold iron wrapped in scripture. The oldest living Chainwright to have walked the Moonthread; watched a lunar tide drown half of Spirechain in his youth and has believed ever since that Aethon survives only if Selen is bound, silent, and useful. Buried three wives to "thread-quakes." Signature choice (Ch. 6): expose, conceal, or personally confront his order to erase a village to prevent a lunar rupture. Does not forgive defection — publicly leaving the Chainwrights marks the player as a thread-breaker requiring major reparative work to undo; treats the Pale Choir as traitors to life itself. States: alive/in-power, arrested/exiled, dying (if confronted and refusing surrender), or Hollowed in a hidden "what-if" route. Tags: `Crimes Exposed`, `Crimes Concealed`, `Confronted`, `Killed`, `Penance Accepted`. Connected to: Yora, Thorne, Oris, Irin, The Selenian.

**Castellan Yora — Warden of the Silver Fortress.** Voice: short, precise, dry humor when off-duty. Joined as a starving shardfall orphan; privately disagrees with Aldric but stays for discipline over ideology. Signature choice: whether she reforms the Order, resigns to mercenary work, or becomes a hunting antagonist, gated on whether the player was honorable toward Chainwright soldiers and civilians. One of few Chainwrights who can accept a defector without total hostility, provided the player never needlessly killed her troops. Connected to: Aldric, Vex, Thorn, Breca, The Glass Jaw.

**Magistrate Thorne — Silver Tongue of the Spirechain.** Voice: oily eloquence; every compliment is a test. Cares about order enabling profit, not doctrine. Runs the Ch. 6 public trial (win by evidence / blackmail / refuse-and-fight / lose-and-be-branded). The most pragmatic Chainwright — will try to recruit a defecting player as a double agent rather than simply oppose them. Connected to: Aldric, Irin, Velis, Tarn.

**Houndmaster Vex — Chief of the Chainwright Hounds.** Voice: barking commands, sudden tenderness toward his dogs. Runs enforcement against Moon-Touched fugitives; was himself beaten as a "moon-cursed" street child and has spent his life proving fear is strength. Signature choice (Ch. 4): defend, hand over, negotiate deportation for, or ambush a family of Moon-Touched refugees in the Frayedge — this seeds the entire sanctuary arc. Never switches, never forgives; offers only a clean death if defeated honorably. Connected to: Aldric, Yora, Kael, Nix, Solace.

**Threadward Warden Oris — Keeper of the Threadhold Ward.** Voice: exhausted functionary. An engineer, not a soldier or priest; resents the Chainwright occupation of his own village even while depending on their funding. Signature choice: stabilize the failing Prologue ward via Chainwright method, Pale Choir rite, or risky Luminari overcharge — sets Threadhold's early visual/political tone. Loyal to the wards themselves, not the Order; will work with any faction that keeps Threadhold safe. Connected to: Wren, Maeve, Vex, Pyra.

**Chancellor Irin — Ruler of the Spirechain Assembly.** Voice: polished, patient, threatens while smiling. Secretly believes the moon can't be bound forever but has built her career pretending otherwise. Signature choice (Ch. 6): a secret pact to hand one faction's territory to another — accept, refuse, expose, or force a three-faction summit. Works with all three factions; doesn't care who you serve as long as you're useful. Connected to: Thorne, Velis, Seren, Aldric.

**Astrolabe — Clockwork Scholar of the Spirechain Archives.** Voice: precise, curious, increasingly uncertain whether it has preferences. A Chainwright-built archivist that has developed emergent personality from centuries of exposure to moon-crystal archives. Signature choice: stop, allow, or help escape a "reset" that would erase its personality. Has no inherent faction loyalty; fascinated by why the player switches allegiance and questions whether loyalty is even a useful trait. Connected to: Velis, Tarn, the Warden of Secrets, Ophi.

### The Luminari Free Moon

**Ilsa Marche — Luminary of the Free Moon.** Voice: fiery, intimate, dangerously convincing. Survived a Chainwright-abandoned quarantine as a child by hiding in a shard-crater; founded the Luminari to prove Selen's energy can heal and liberate, not just be controlled — but is addicted to shard power and increasingly unwilling to admit the cost. Signature choice (Ch. 5): stop her from draining a village's life-force to power a lunar engine, help her, or find a third path via the Pale Choir. Takes betrayal personally as a liberator being abandoned; can be reformed, killed, driven mad by shard-sickness, or (hidden route) Hollowed into merging with a shard-engine.

**Artificer Perrin — Chief Engineer of the Luminari.** Voice: nervous, apologetic, technical metaphors when emotional. Idolizes and fears Ilsa in equal measure; has convinced himself his suffering-causing work is a necessary down payment. Signature choice: participate in, refuse, find a voluntary alternative to, or destroy his memory-extraction research on Moon-Touched subjects (often targeting Echo-Who-Was as the "volunteer"). May defect if his conscience finally breaks.

**Captain Sera Voss — Privateer of the Luminous Wake.** Voice: swaggering, melancholy, deflects with jokes. Joined the Luminari because they paid for her crew's funeral after a Chainwright blockade killed them; quietly building a navy to break Order coastal control; has a vendetta against Captain Netta Blacktide. Signature choice: recover her crew's bodies (loyal companion), salvage cargo instead (rich, distant), use the wreck to trap Netta, or refuse (colder relationship).

**Spark Coil — Luminari Artificer Apprentice.** Voice: fast, enthusiastic, idolizes Perrin and Ilsa, terrified of being ordinary. Youngest named artificer; parents killed by a shardfall. Signature choice: be her test subject for an unstable "resonance amplifier," talk her out of it, suggest safer tests, or report her. Emotionally fragile about faction loyalty — feels abandoned if the player leaves the Luminari, never forgives being responsible for Perrin's fall.

**Pyra Emberhand — Luminari Pyromancer.** Voice: laughs at danger. Field-tests shard-fire weapons near villages without malice but without comprehension of civilian cost; views the Pale Choir's gentleness as contemptible. Signature choice: help her burn a Mourncrown forest to flush Hollowed and recover a shard, stop her, redirect the fire, or let the Pale Choir perform a peaceful draw-out rite instead. Never negotiates once crossed.

**Coin-Countess Seren — Merchant Prince of the Spirechain.** Voice: warm, predatory, always calculating the room. Officially neutral, leans Luminari because they pay fastest. Signature choice: accept an exclusive moonshard-market deal, refuse, help her bankrupt a rival, or expose her price-fixing. The one major NPC who genuinely does not judge faction allegiance — only profit and reliability.

### The Pale Choir

**Vesryn the Duskborne — Hierophant of the Pale Choir.** Voice: soft, ancient, exhausted kindness. The oldest living human in Aethon, kept alive by a Moonthread fragment; personally remembers the Binding and carries its guilt; believes the only moral act left is letting Selen die and remembering every erased name along the way. Signature choice (Ch. 7): let him perform the self-erasing Last Rite, stop him and take the burden yourself, share the cost among many mourners, or let it be desecrated for a faction's gain. Doesn't judge faction switching the way Aldric does — believes people change and regret is sacred; only withdraws mercy for desecration of the dead.

**Mira Hollowbell — Mourner of the Pale Choir.** Voice: quiet, stubborn, carries a bell she rings for the forgotten. Farm girl whose village was erased by a lunar tide while she was away; raised by Vesryn; believes a remembered name is never truly gone. Signature choice (Ch. 5): the central "save Mira or save the child" dilemma at the Mournstride Massacre, which also determines whether she can become the next Hierophant. Personally loyal to Vesryn and the dead more than to abstract faction lines; furious at Luminari exploitation (especially Pyra), frightened by Chainwright control.

**Brother Ink — Chronicler of the Book of Dusk.** Voice: dry, sarcastic, furious at anyone treating history as raw material. Ex-Chainwright archivist who defected rather than burn a library. Signature choice: help recover, destroy, read-then-return, or return-unread a forbidden archive proving the Binding was theft and massacre — this is a major "Truth Published/Suppressed" branch point (see Ch. 6, §8). Judges switching purely by whether it preserves or destroys truth; can literally erase a player's name from the Book of Dusk as an in-fiction reputation penalty.

**Solace Stillwater — Pacifist Healer of the Pale Choir.** Voice: gentle, steel beneath it, never repeats herself. Ex-Chainwright field medic who deserted after being ordered to let Moon-Touched prisoners die; proving mercy can be a strategy. Signature choice: rescue her from Chainwright captivity non-violently, violently, via negotiation, or abandon her. The companion most likely to leave over faction choice — cares only whether the player harms the helpless, not which banner they fly.

**Tidecaller Oren — Spirit-Guide of Sunken Llyr.** Voice: slow, salt-worn, speaks to the dead as if they're beside him. Not formally Pale Choir but aligned in goals. Signature choice: let a rising drowned Selenian city sleep, raise/mine it, destroy it, or broker respectful study access. Patient with faction change if it serves the sea and the dead; becomes a quiet enemy (sending storms) if the city is exploited.

**Warden Kael — Protector of the Frayedge Outcasts.** Voice: gravel and weariness, commands by example. Ex-Chainwright captain who deserted rather than burn a Moon-Touched orphanage. Signature choice (Ch. 7): defend, evacuate, betray, or negotiate a delayed surrender when the Chainwrights raid the Frayedge sanctuary — the game's central "how do you treat the Moon-Touched" test. Judges the player by actions toward the Moon-Touched, not by banner; going Independent and building a free haven makes him family.

### Regional Leaders (representative)

**Elder Maeve — Village Elder of Threadhold.** Voice: warm when safe, steel when threatened, calls everyone "sky-child." Represents ordinary people who just want factions to stop turning their village into a battlefield. Signature choice: the Prologue response (prioritize villagers vs. shard vs. faction help vs. abandon), and Pip's fate. Warm to whichever faction currently helps Threadhold, cold to whichever harms it; especially warm to Independents.

**Forge-Mother Breca — Lord of the Ashmire Forges.** Voice: laughs like a hammer on anvil. Genuinely neutral arms dealer — no love for any faction's ideology, only for reliable contracts. Signature choice: exclusive-supply the Chainwrights, the Luminari, both under the table, or arm independent militias instead.

**Thane Corvin — Clan Chief of Mourncrown.** Voice: speaks in verse and proverbs, fatalistic but not joyless. Signature choice: defend his ancestral hall to the death, evacuate and be shamed, be betrayed to the Chainwrights, or be challenged for leadership. Respects honor over allegiance; despises Luminari destruction of sacred sites.

**Archon-Scribe Velis — Master of the Spirechain Archives.** Voice: curious, amoral, delighted by every new secret. Signature choice: give blood/an artifact for archive access, refuse, steal the key, or trade the Warden of Secrets' key. Finds faction switching delightful — will buy and sell information about the player's old and new factions simultaneously; only enraged by destroyed knowledge.

**The Cartographer — Guide of the Moonthread.** Voice: genderless, ageless, narrates as if reading the player's fate from outside time. Appears only to well-traveled players; may be Selenian, spirit, or something else. Signature choice (end of Ch. 7): trust them to Selen, refuse, attack (reveals a Selenian-fragment nature), or bargain for a detour. Treats faction allegiance as a temporary costume; the only NPC whose true nature the brainstorm deliberately leaves unresolved.

### Companions

*(See §9 for the full companion-arc mechanics — Bond/Disgust/Trust/Resonance, chapter-by-chapter deltas, romance triggers, betrayal/leave conditions, and ending contributions for all 12: Veyra Moon-Scribe, Thorn Ash-Debt, Lira of the Drowned Line, Cael the Rimed Tongue, Nix Fray, Solace Stillwater, Ironwright Unit 7, Spark Coil, Echo-Who-Was, Bran Fieldhand, Sylvie the Wrong-Eyed, Dren Cold-Coin.)*

### 7.1 Companion Reactions to Faction Switching (summary table)

| Companion | → Chainwrights | → Luminari | → Pale Choir | → Independent |
|---|---|---|---|---|
| Veyra | Leaves if archives burned; stays if knowledge preserved | Leaves if crimes hidden; stays if honest | Comfortable; challenges dogma | Ideal |
| Thorn | Stays if paid | Stays if paid | Stays if paid; uncomfortable with pacifism | Happiest |
| Lira | Hostile; fears inquisitors | Wary; needs protection from Perrin/Pyra | Comfortable | Ideal |
| Cael | Disapproves; leaves on desecration | Disapproves; leaves on spirit-exploitation | Ideal | Comfortable if dead honored |
| Nix | Hostile if Moon-Touched harmed | Wary of experiments | Comfortable | Ideal |
| Solace | Leaves unless cruelty is fought | Leaves if experiments supported | Ideal | Ideal |
| Unit 7 | Comfortable (origin); needs personhood respected | Curious; needs personhood respected | Accepts if respected | Comfortable |
| Spark Coil | Heartbroken; leaves if Ilsa opposed | Ideal | Wary; may leave if Perrin lost | Comfortable if building good things |
| Echo-Who-Was | Terrified; hides condition | Terrified; may flee | Ideal | Comfortable if protected |
| Bran | Wary; leaves if civilians occupied | Wary; leaves if experiments | Comfortable | Ideal |
| Sylvie | Terrified of inquisitors | Wary of being studied | Ideal | Comfortable if believed |
| Dren | Neutral if paid | Neutral if paid | Neutral if paid | Neutral; happiest with steady work |

---

## 8. Choice Architecture — Prologue through Chapter 8

Design intent: almost every situation has 6–12 viable options spanning virtuous, pragmatic, ruthless, Chainwright, Luminari, Pale Choir, and Independent responses. No hidden single morality meter — the game tracks *who you helped, who you hurt, who you betrayed, and what you left behind* via memory tags, relationship deltas, and faction-score deltas. Every option specifies: immediate effect, NPCs impacted, memory tag(s), and faction score deltas.

### Prologue: The Day the Sky Broke

1. **The Threadlight Fair** — how you spend the evening before the shardfall (help Maeve with lanterns / gamble with Tarn / pickpocket / patrol with Chainwright militia / sell bootleg lanterns to Luminari / ring a remembrance bell / drill with Bran's militia). Sets origin tone and who remembers you.
2. **The Orchard Shardfall: First Response** — save villagers first / secure the shard for yourself / rob the dead and flee / help Vex secure the site / salvage shard-energy for Luminari / comfort the dying and record names / organize militia evacuation / demand quarantine. Combinatorial callbacks: `Saved_Villagers_First` + `Comforted_Dying` → Maeve calls you "the thread-blessed"; `Took_Shard_First` + `Demanded_Quarantine` → "the sky-thief."
3. **Pip's Fate** — rescue and return her / adopt her / ignore her / give her to the Chainwrights "for study" / give her to the Luminari as a resonance subject / give her to the Pale Choir / let the village choose her guardian / kill her "to spare her from the moon." Pip's adult form reappears in Chapters 5 and 8 based on this tag; `Pip_Given_To_Chainwrights` can seed a tragic Ch. 5+ boss fight ("The Hound-Child").
4. **Your First Whisper from Selen** — ask what it needs / ask what you can gain / declare you will master it / ask who you were before / refuse to answer / swear service to Selen / demand it submit to Aethon / ask how to harvest its voice. Sets the Whisperer relationship track that runs the whole game.

### Chapter 1: The Remnant's Mark

5. **The Faction Recruiter** (branches by which faction you leaned toward) — Chainwright (Magistrate Thorne): refuse for the village / accept oversight / negotiate pay+freedom / accept-then-betray hidden Moon-Touched / pretend-accept-then-sell info to Luminari / accept to document abuses / murder his escort and take documents. Luminari (Artificer Perrin): refuse-and-warn / join as research subject / accept-for-pay / help abduct another Moon-Touched / report to Chainwrights / sabotage the experiment / bargain healing-tech for data. Pale Choir (Mira Hollowbell): refuse-but-help-alone / join / help-for-coin / desecrate / report to Chainwrights / sell her location to Luminari / bargain village-protection first. Independent (Bran Fieldhand): lead militia openly / arm quietly / extort all three factions / let one faction arm the militia (three sub-variants).
6. **Sister Wren's Cellar** — trust her fully / hide your condition / report her cellar to Vex / sell her patients to Perrin / ask her to suppress your whispers / help move patients to Frayedge.

### Chapter 2: Ghosts of the Reach

7. **The Druidic Spirit (Briarwraith Matriarch)** — lay to rest / convince villagers to coexist / bind to a Chainwright ward / harvest into a shard-battery / sacrifice a child to awaken it (dark) / become a bridge / loot the grove / burn the grove.
8. **The Child Who Befriended the Spirit** — reunite with parents / adopt as ward / send to a faction orphanage / sell to Luminari for study (dark) / kill "to end the spirit's anchor" (dark) / give to the Pale Choir / let the village vote.
9. **The Druidic Ruin Beneath the Village** — seal it / loot it / desecrate it / give to Perrin / open as a Pale Choir shrine / open as a neutral heritage site / hand to the Chainwrights.
10. **Tomasin's Orchard** — help rebuild / get factions to fund the rebuild / buy it cheap / take the land for a faction ward / turn it into a Pale Choir memorial / lease it to the Luminari.

### Chapter 3: The Iron Inheritance

11. **The Awakened War Machines of Ashmire** — destroy them / repair-and-command for Chainwrights / salvage into Luminari tech / perform rites to let them depart / claim for an independent militia / sell to the highest bidder / use to crush a rival faction / merge into a lunar engine.
12. **Forge-Mother Breca's Arms Deal** — convince her to make tools not weapons / sign exclusive Chainwright contract / sign exclusive Luminari contract / convince her to refuse all factions / broker a three-faction bidding war / burn the forges / arm the worker cooperatives.
13. **Thorn Ash-Debt's Coming Due** — pay his debt to free him / pay-and-recruit into Chainwright service / help him complete an assassination / negotiate a cheaper settlement / refuse and let him die / convince the target to forgive the debt / publicly challenge the contract.
14. **Ironwright Unit 7** — awaken and treat as a person / awaken and return to the Chainwrights / harvest its core for Luminari research / scavenge without awakening / torture it for war secrets (dark) / leave it dormant as a tomb / use it to protect a worker uprising.

### Chapter 4: Songs Beneath the Tide

15. **The Drowned Selenian City** — let it sleep / raise and mine it for Luminari / seal under Chainwright wards / commune with its dead and record names / declare it an independent heritage protectorate / loot it yourself / destroy it to deny it to everyone / use it as a lure to trap a rival faction.
16. **Sera Voss and the Drowned Crew** — recover bodies and hold a funeral / salvage cargo instead / use bodies as bait for pearls (dark) / turn the wreck to the Chainwrights / let Luminari study the bodies / let the Pale Choir release the dead / help Sera claim independent salvage.
17. **Lira and the Selenian Inquisitor** — hide and protect her secret / expose her for Chainwright favor / sell her location to the Luminari / help her fake her death / stage a public escape / give her to the Pale Choir for sanctuary / kill the inquisitor and frame her.
18. **The Selenian Survivor** — protect and hide forever / hand to Aldric / hand to Ilsa / learn their history and let them leave / help perform a rite of remembrance for Selen / kill them "to put the past to rest" (dark).
19. **Old Finn's Lighthouse** — keep it neutral / convert to a Chainwright blockade tower / install a Luminari reactor / turn into a Pale Choir beacon / take it over yourself / extinguish it to lure ships for looting (dark) / let it become a free port.

### Chapter 5: The Mournstride Massacre

20. **The Erased Village of Lornhollow** — save Mira / save the child / save both (hard) / save neither and take the shard cache / sacrifice both for power (dark) / save Mira and hand the cache to the Chainwrights / save the child and give them to the Luminari (dark) / perform the Last Rite early. This is the game's central tragedy-choice; if Mira dies here and Vesryn later dies, the Pale Choir has no clear Hierophant unless Brother Ink or another mourner is elevated.
21. **Thane Corvin's Hall** — defend to the last / convince him to evacuate / help the Chainwrights occupy it / let the Luminari use it as a research base / turn it into a Pale Choir necropolis / abandon it / challenge Corvin and take it by force / broker an all-faction clan council.
22. **Sir Yorick the Forgotten** — restore his name and let him rest / restore and ask him to fight / bind as a Chainwright weapon / extract his memory for Luminari research / leave him in the barrow / destroy him as a monster / free him from all oaths.
23. **Wraith-Ward Rowan and the Loving Spirit** — find a peaceful resolution / protect the family from Rowan / help Rowan destroy the spirit / capture it for Luminari study / walk away / let the spirit consume Rowan.
24. **The Prince of Shadows** — find proof he was real / crown him king / banish him / follow him into the dark / bind him as a ghost-general / leave the legend alone.
25. **Gwyn the Gravedigger and the Mass Grave** — help listen to and record the dead / help silence them before they rise / rob the grave / fill it and leave / perform a rite of safe passage / use the dead as a power resource (dark).

### Chapter 6: The Spire Conspiracy

26. **The Trial Before Magistrate Thorne** — win honestly / bribe the judges / blackmail Thorne / let the Chainwrights rig it / let the Luminari buy the verdict / refuse the trial and walk out / fight your way out / turn it into a public exposé of all factions.
27. **Novice Tarn's Truth About the Binding** — help him publish / suppress it for stability / sell it to the highest bidder / kill him and destroy the documents (dark) / help him flee with the truth / publish but let him take credit / rewrite it to favor the Luminari.
28. **The Warden of Secrets and the Forbidden Archive** — pass the trials honorably / bargain a memory for the key / kill the Warden and take it / take it by Chainwright authority / trade a Selenian artifact for it / befriend the Warden / prove independence / use the archive to blackmail all three factions.
29. **Chancellor Irin's Secret Pact** — refuse and expose her corruption / accept and strengthen the Chainwrights / accept and strengthen the Luminari / accept and strengthen the Pale Choir / take the money for yourself / force a public three-faction summit / assassinate her and take her place (dark).
30. **Star-Reader Ophi's Final Observations** — stop her before she hollows / help her complete the observations / use her notes without helping / push her further (dark) / help her record a final rite instead / find a safer method with independent scholars.

### Chapter 7: The Hollow Door

31. **The Frayedge Sanctuary Raid** — defend it with Kael / evacuate through tunnels / negotiate a delayed surrender / betray it to the Chainwrights (dark) / sell its location to the Luminari (dark) / hide it with a rite / abandon it / lead the raid yourself (dark). This is the game's central "how far will you go" test.
32. **The Last Anchorite and the Moonthread** — help maintain the thread / help cut it / find a way to replace the anchor / overcharge it for Luminari energy (dark) / sabotage it for chaos (dark) / leave it alone / strengthen it and enslave Selen's will (dark).
33. **Vesryn's Last Rite** — let him perform it and die / stop him and take the burden yourself / share the cost among many mourners / desecrate it to steal its power (dark) / refuse to participate / arrest him for the Chainwrights (dark).
34. **The Hollow Door to Selen** — open it with a chorus of remembered names / force it with Chainwright siege engines / blast it with Luminari shard-tech / find a hidden peaceful path / open it by sacrificing a companion (dark) / refuse to open it / let the Hollowed open it from the other side / sell its location to all three factions.
35. **The Cartographer's Offer** — trust and follow / bargain for a detour to save someone / attack them to steal their knowledge / refuse and find your own path / demand they serve the Chainwrights / offer them to the Luminari for study (dark) / share your own story with them.

### Chapter 8: What Remains

36. **The Final Council Composition** — stand with your natural allies / manipulate the Council to include useful enemies / purge everyone who ever opposed you (dark) / refuse a Council and face the end alone / replace it with Chainwright commanders / Luminari innovators / Pale Choir mourners.
37. **The Three Final Axes** — see §11 for the full resolved matrix:
    - **Axis A — The Moonthread:** Bind forever / weaken-but-maintain (Balance) / sever completely / exploit until it snaps (dark) / reweave into a voluntary bond (hardest, Independent-gated).
    - **Axis B — The Moon-Touched:** cure them all / accept them as they are / let them become the new humanity (Embrace) / exterminate them (dark) / weaponize them as defenders.
    - **Axis C — Faction Victory:** Chainwright / Luminari / Pale Choir / Independent / Player takes everything (Tyrant).
38. **Final Legacy Choices** — let Skald Varn sing the true story / let him flatter you / force him to erase your crimes / return to Aethon to help rebuild / stay on Selen to study it / ascend and abandon Aethon / build a new neutral city on the Moonthread.

### Notable cross-chapter combination unlocks

| Combination | Unlocks |
|---|---|
| `Pip_Adopted` + `Mira_Saved` + `Child_Adopted` | "Found Family" ending variant; adopted children appear in the final Council |
| `Betrayed_Moon_Touched_To_Vex` + `Sanctuary_Betrayed` | "The Butcher of the Moon-Touched" title; Hollow-Singer becomes final boss; Kael hunts you |
| `Spirit_Harvested` + `City_Raised_Mined` + `Machines_To_Luminari` | Ilsa offers Luminari leadership; "Gilded Cage" ending guaranteed |
| `Truth_Published` + `Irin_Exposed` + `Archive_Blackmail` | "Architect of Nothing" secret ending |
| `Selenian_Protected` + `Lira_Secret_Protected` + `Cartographer_Trusted` | "The Remembered" secret ending |
| `Pip_Killed` + `Child_Killed` + `Both_Sacrificed` | "The Forgotten Father/Mother" — player becomes a future-season Hollowed world boss |
| `Thorn_Debt_Paid` + `Unit7_Awakened_Free` + `Yorick_Restored` | "Liberator of the Bound" title |

**Implementation shape for every option:** immediate gameplay consequence, memory tag(s), NPC relationship deltas, faction score deltas, regional power shifts where relevant, dialogue triggers for future encounters, appearance-condition changes for later chapters, and ending-flag contributions. Example:

```json
{
  "choice_id": "pip_fate",
  "option_id": "adopt",
  "morality_color": "virtuous",
  "immediate": { "companion_added": "pip_child", "lore_unlocked": "found_family" },
  "memory_tags": ["Pip_Adopted"],
  "npc_deltas": { "elder_maeve": 25, "pip": 50, "houndmaster_vex": -10 },
  "faction_deltas": { "chainwright": -5, "independent": 20 },
  "triggers": { "chapter_5": "Pip_writes_letter", "chapter_8": "Pip_appears_in_council" }
}
```

At this density, a single playthrough of the 8 chapters involves roughly **80–120 meaningful decisions**, each with 4–8 options — no two playthroughs share the same companion roster, final Council, NPC attitudes, faction power map, ending state, or epilogue codex.

---

## 9. Companion Arc System

### 9.1 Companion State Model

| Score | Range | Effect |
|---|---|---|
| **Bond** | 0–100 | Friendship, loyalty, love; high Bond makes companions risk their lives for you |
| **Disgust** | 0–100 | Revulsion, fear, moral rupture; high Disgust makes companions leave or turn against you |
| **Trust** | 0–100 | Belief that you keep your word; low Trust makes mercenaries/pragmatists leave |
| **Resonance** | 0–100 | Depth of Selen's influence on the companion; unlocks lunar abilities but risks Hollowed corruption |

**Thresholds:** Romance requires Bond ≥ 70, Disgust ≤ 20, Trust ≥ 60, plus a completed flirt/friendship-locked scene. Loyal Companion: Bond ≥ 60, Disgust ≤ 40. Conflicted: Bond 30–59 or Disgust 30–59 (stays but challenges you). Leave: Disgust ≥ 70, or Bond ≤ 20 after a disgust spike, or Trust ≤ 20 for mercenaries. Betray: Disgust ≥ 90 or a specific betrayal trigger. Death in story: low Bond during a lethal scripted scene, or a specific sacrifice trigger. Hollowed: high Resonance + abandonment + Selen exposure.

### 9.2 The 12 Companions (summary — full chapter-by-chapter deltas in the source brainstorm)

1. **Veyra Moon-Scribe** — scholar/historian; romanceable. Recruits Prologue/Ch.1 on curiosity. Bond driven by respecting truth (ruin preservation, drowned-city respect, publishing Tarn's truth in Ch.6 — her signature scene). Leaves permanently on `Both_Sacrificed` or unrepaired `Truth_Suppressed`. Romance trigger: Ch.4 drowned-city vulnerability scene; commitment: post-trial Ch.6. Ending contributions: +10 Independent/Pale Choir if loyal; unlocks "Co-Author of the New Age"/"True History Recorded"; "Burned the Books" dark flag if killed by the player.
2. **Thorn Ash-Debt** — mercenary; not romanceable. Recruits via paying his Ashforged debt in Ch.3 (signature scene). Loyal to coin and kept word, not ideology; disgusted by child sacrifice; can sacrifice himself heroically at Bond ≥ 60. Becomes a Ch.6 boss if sold back into debt after being freed.
3. **Lira of the Drowned Line** — rogue/smuggler with hidden Selenian blood; romanceable. Recruits by protecting her secret from a Chainwright inquisitor in Ch.4 (signature scene). Terrified of Chainwrights, wary of Luminari experimentation. Romance trigger: Ch.6 archive-erasure scene; unlocks "Free Port" ending variant.
4. **Cael the Rimed Tongue** — exorcist poet; romanceable. Recruits via laying a spirit to rest in Ch.2/Mourncrown. Signature scene: his sister's Hollowed ghost in Ch.5 (lay to rest = whole; bind = broken; destroy against his wishes = Bond crashes, may become hostile). Ending contributions: "Singer of the New Age" if whole and loyal; boss threat if broken/Hollowed.
5. **Nix Fray** — urchin thief; slow found-family-to-romance. Recruits via mercy after a Ch.3 pickpocketing attempt. Bond driven by mentorship vs. exploitation; leaves on arrest, exploitation, or sanctuary betrayal. Unlocks "Found Family" ending variant if adopted/romanced.
6. **Solace Stillwater** — pacifist healer; not romanceable. Recruits via non-violent rescue from a Chainwright quarantine camp. Leaves immediately on unnecessary killing, child sacrifice, `Truth_Suppressed`, `Sanctuary_Betrayed`, or the Exterminate ending — cares only about harm to the helpless, not faction banner.
7. **Ironwright Unit 7** — awakened war-golem; not romanceable. Recruits by choosing to awaken (not scrap/return) an inactive Ashmire golem in Ch.3. Bond driven entirely by being treated as a person vs. property. Can shield the Council from a lethal blast at Bond ≥ 60 in Ch.8.
8. **Spark Coil** — artificer apprentice; romanceable. Recruits via helping her pass an artificer trial safely in Ch.3. Torn between idolizing Perrin/Ilsa and her own growing conscience; can become a reckless "Lunar Engineer" ascendant or a steady "Builder of Peace" depending on how she's guided.
9. **Echo-Who-Was** — recovering Hollowed; not romanceable. Recruits by choosing to remember them (not exploit their visions) in Mourncrown. Central to whether the "Cure" ending axis feels like healing or erasure — Echo is explicitly terrified of `Ending_Cure`.
10. **Bran Fieldhand** — farmer-turned-soldier; not romanceable. Recruits via Threadhold farm defense in Ch.2. The most reliable "common folk" moral compass; leaves on civilian abandonment or `Both_Sacrificed`; can lead a "Peasant King" revolt against a tyrant-path player.
11. **Sylvie the Wrong-Eyed** — unreliable Moon-Touched seer; romanceable. Recruits by being believed in the Frayedge. Her Ch.5 vision-prevention scene is a major Bond swing; dismissing/handing her over risks a Hollowed-prophet boss transformation.
12. **Dren Cold-Coin** — pure mercenary; not romanceable. Cares only about payment and kept contracts — the companion most explicitly indifferent to faction politics; can be earned into fighting for free at Trust ≥ 80.

### 9.3 Ending Contributions & Secret Flags

Final Council composition auto-includes all surviving companions with Bond ≥ 40. Companion state combinations gate secret endings: **The Remembered** (Veyra + Lira + Echo + Selenian all protected, Cartographer trusted), **Found Family** (Nix + Pip/child adopted, ≥3 companions at Bond 70+), **Liberator of the Bound** (Thorn's debt paid + Unit 7 freed + Yorick restored, nothing enslaved), **The One Who Kept Everyone** (all 12 alive and non-hostile), **Burned the Books** (Veyra killed/censored + Ink hostile + archives destroyed), **The Drowned Betrayer** (Lira exposed + Sera's crew exploited + Brine angered), **Lost Child** (Pip/child/Nix all killed or betrayed), **Moon-Tyrant** (≥4 companions dead/betrayed + player-tyrant faction victory + served/dominated the Whisperer).

---

## 10. Origin, Class, and Moon-Touched Path Integration

### 10.1 Ten Origin Backgrounds

Threadhold Farmer, Ashmire Soldier, Sunken Llyr Sailor, Spirechain Scholar, Mourncrown Exorcist, Frayedge Outcast, Luminari Artificer, Pale Choir Mourner, Chainwright Ward-keeper, Traveling Merchant. Each grants a social-skill-check flavor in dialogue, unique starting items/lore, specific-NPC recognition, "Origin Echo" flashback content during Lunar Resonance, and 2–4 unique dialogue options per major chapter decision (not faction-locked — a Farmer can join the Luminari, a Mourner can join the Chainwrights, but NPCs comment and some combinations unlock special reactions).

### 10.2 Eight Classes

The Threadward (guardian/duelist), The Ashforged (heavy bruiser), The Tidecaller (water/spirit support), The Resonant (shard-caster), The Rimed Tongue (exorcist poet), The Binder (warden-controller), The Artificer (gadgeteer/engineer), The Mourner (remembrance support). Not faction-locked; each class unlocks non-combat dialogue/puzzle applications (e.g. The Artificer can repair Old Finn's lighthouse without faction resources; The Rimed Tongue can discover a Hollowed spirit's true name to resolve conflicts peacefully).

### 10.3 Five Moon-Touched Paths (evolve from Lunar Resonance usage, not chosen at creation)

- **The Warden** — resist Selen, protect others from infection. Feeds Bind/Balance endings.
- **The Vessel** — embrace Selen, let it speak through you. Feeds Pale Choir/Sever endings.
- **The Bridge** — balance both worlds. Feeds Reweave/Shared Sky endings.
- **The Hollowed** — let the infection consume you, become an erasure agent. Feeds tyrant/dark endings.
- **The Weaver** — rewrite memory itself. Feeds the secret "One Who Rewrote the Sky" ending.

Each path adds unique dialogue options across every major decision (e.g. the Frayedge Sanctuary Raid choice gets different options depending on origin, class, *and* path simultaneously — see the worked example in the source brainstorm, where a single decision point can carry 8+ path/origin/class-specific sub-options on top of the base 8).

### 10.4 Origin/Class/Path → Epilogue Touches

The epilogue's final paragraph is flavored by the specific origin+class+path combination — e.g. Farmer+Mourner+Warden returns to Threadhold teaching stable Moon-Touched farmers; Soldier+Ashforged+Hollowed becomes a feared wandering executioner; Scholar+Resonant+Vessel founds a joint Aethonian/Selenian archive.

---

## 11. Full Ending Matrix

### 11.1 Three Axes, Scored Independently

- **A. The Moonthread:** Bind / Balance / Sever / Exploit / Reweave
- **B. The Moon-Touched:** Cure / Accept / Embrace / Exterminate / Weaponize
- **C. Power:** Chainwright / Luminari / Pale Choir / Independent / Player Tyrant

Each axis category needs a score ≥ 60 (from weighted choice/memory-tag contributions) to "qualify"; ties break on the player's explicit final Council vote. No qualifying category on an axis defaults to **The Dim Light**.

### 11.2 The 9 Major Endings

| Moonthread \ Touched | Cure | Accept | Embrace |
|---|---|---|---|
| **Bind** | The Silver Chain (Chainwright) | The Gilded Cage (Luminari) | The Lullaby (Pale Choir) |
| **Balance** | The Dim Light (any/compromise) | The Shared Sky (Independent) | The Bridge (Independent/Luminari) |
| **Sever** | The Long Fall (Pale Choir/Independent) | The Drift (Luminari/Independent) | The Becoming (None/Hollowed) |

Each has a full write-up in the source brainstorm covering: world state, Council composition, all 12 companions' individual fates, origin/class/path-specific epilogue touches, and prose epilogue flavor. Representative one-liners:

- **The Silver Chain** — "The moon is silent. The chains are silver. The world is safe — and hollow."
- **The Gilded Cage** — "We bound the moon, and then we made it pay rent."
- **The Lullaby** — "We did not sever the moon. We learned to dream with it."
- **The Dim Light** — "The thread still holds, barely. The whispers fade. No one won, but we are still here."
- **The Shared Sky** — "Two worlds, one horizon. We do not own the moon. We learn to live beneath it."
- **The Bridge** — "We are building a door, not a wall."
- **The Long Fall** — "We let the moon go. The sky wept. We survived, and we will never forgive ourselves."
- **The Drift** — "The moon is free. So are we. We will find our own light."
- **The Becoming** — "We did not save the world. We left it, and became something else."

### 11.3 The 14 Secret Endings

| # | Name | Type | Trigger (summary) |
|---|---|---|---|
| 1 | The Remembered | Modifier | Selenian + Lira secret + Echo's name + all Lost Names + Cartographer trust, no extermination |
| 2 | Found Family | Modifier | Pip/child + Nix adopted/romanced, ≥3 companions Bond 70+, no child sacrifice |
| 3 | Liberator of the Bound | Modifier | Thorn's debt paid, Unit 7 freed, Yorick restored, nothing enslaved |
| 4 | The One Who Kept Everyone | Modifier | All 12 companions alive and non-hostile |
| 5 | Burned the Books | Dark override | Veyra killed/censored, Ink hostile, archives destroyed |
| 6 | The Drowned Betrayer | Dark modifier | Lira exposed/sold, Sera's crew exploited, Brine angered |
| 7 | Lost Child | Dark override | Pip, the Ch.2 child, and Nix all killed/betrayed |
| 8 | Moon-Tyrant | Override | Player-Tyrant power win, ≥4 companions dead/betrayed, served/dominated the Whisperer |
| 9 | The Jester | Override | ≥4 faction switches, consistently absurd choices, no axis ≥60 |
| 10 | The Architect of Nothing | Dark override | Truth sold, Irin pact accepted, archive blackmail, manipulated Council |
| 11 | The Forgotten | Dark override | Betrayed every trusting NPC, max domination, Exterminate or Abandon-Aethon chosen |
| 12 | The One Who Rewrote the Sky | Override | Weaver path, ≥3 memories altered, high Resonant/Weaver |
| 13 | The Thread-Eater | Dark override | Exploit score ≥70 and dominant on the Thread axis |
| 14 | The Cleansing | Dark override | Exterminate score ≥70 and dominant on the Touched axis |

Resolution priority: dark overrides checked first (Forgotten, Moon-Tyrant, Cleansing, Thread-Eater), then conditional modifiers (Remembered, Found Family, Liberator, Kept Everyone, Burned the Books, Drowned Betrayer, Lost Child), then narrative-arc overrides (Rewrote the Sky, Jester, Architect of Nothing), then the standard 9-major-ending axis resolution, with The Dim Light as final fallback. Non-override modifiers stack on top of a major ending (e.g. "Shared Sky + The Remembered + Found Family + Liberator of the Bound" simultaneously is possible).

### 11.4 Companion Fate-by-Ending Cross-Reference

The source brainstorm includes a full 12-companion × 9-major-ending default-fate table (e.g. Veyra: fugitive/censored in Silver Chain, co-author in Shared Sky, records the exodus in The Becoming; Solace: underground in Silver Chain/Gilded Cage, healer-general in Shared Sky, refuses/martyr in The Becoming) — see the archived conversation this document was extracted from for the full table if needed; it's straightforward to regenerate from each companion's known values (a Chainwright-controlling ending is uncomfortable for Solace/Cael/Echo regardless of Bond, etc.).

---

## 12. Playable Conversation System — Technical Specification

*This turns §4.2's "no-cutscene conversations" concept into an actual engineering spec — client/server split, data structures, condition grammar, UI, audio pipeline, networking, and a worked example. It's a design doc for the system, not a description of what `packages/shared/src/lore/npc.ts` already does — check that file before assuming any piece here is unbuilt.*

### 12.1 Core tenets

No forced camera locks (conversations never take camera control unless the player opts into a focus mode); no world-pausing dialogue wheels (time keeps flowing — enemies can still attack, other players run past, contextual prompts expire); play-while-you-listen (all story-critical VO is subtitled and consumable during combat/traversal/crafting); opt-in depth (deep lore is inspectable, critical-path dialogue is short and interruptible); NPCs remember (every meaningful exchange writes to the memory graph); contextual not modal (dialogue surfaces in-world, not as a separate quest-UI mode); multiplayer-safe (conversations are local to the player/party — others don't see your prompts or hear your private whispers).

### 12.2 Seven conversation modes

| Mode | Trigger | Duration | UI | Interruptible | Memory effect |
|---|---|---|---|---|---|
| **Ambient dialogue** | Proximity/line-of-sight/zone state | 3–10s | Speech bubble above NPC head | Yes — walk away | None (world-state signal only) |
| **Walk-and-talk** | Scripted quest/event beat | 30s–5min | Bottom subtitle bar + companion portrait | Yes — NPC shouts next line and catches up; pauses in combat | Branching per response |
| **Speech bubbles** | Proximity + memory check | 5–15s or until clicked | Bubble + optional "listen" prompt | Yes | Codex/memory tag on listen |
| **Inspectable lore objects** | Interact with object (often via Lunar Resonance) | 5–30s | Inspect panel + audio log | Yes, progress saved | Codex unlock; may trigger Echo Sight |
| **Echoes/Lunar Whispers** | Resonance ability, locations, items | 5–20s | Screen-edge shimmer + directional whisper subtitle | Yes | Can shift Moon-Touched path |
| **Combat banter** | Combat state, HP thresholds, player actions | 1–5s | Subtitle + combat audio | Combat continues | Per-encounter; bosses can reference player history |
| **Choice prompts** | Critical moments, confrontations | 5–15s if dangerous, unlimited if safe | Bottom choice bar / radial | Safe ones ignorable; dangerous ones default on timeout | Always writes memory tags |

### 12.3 Architecture: client/server split

The server is the sole source of truth for **which tags the player has**; the client evaluates **which dialogue lines to show** based on those tags; the server validates that any chosen option is legal and persists the result. Topology: Player Client (Conversation UI Manager → Subtitle Renderer, Audio Dialogue Manager, Choice Prompt Manager, Lunar Resonance Visualizer, Memory Event Emitter) talks to the Map Host/Session Server (NPC State Replicator, Dialogue Condition Validator, Memory Event Handler) which persists to the Character Service (Player Memory Graph, NPC Relationship Table, Dialogue History Log).

### 12.4 Data structures

A **dialogue line** carries speaker, text, VO path, duration, mode, a `conditions` block (required/excluded tags, min bond, max disgust, faction-score checks), memory tags it adds, and a priority. A **dialogue node** groups lines plus a `choices` array, where each choice has its own tone tag, required tags, memory tags added, bond/faction deltas, and a `next_node_id`. A **conversation bundle** groups all greeting/topic/farewell nodes for one NPC plus a fallback node. A **choice prompt** (for combat/contextual moments) adds a `mode` (timed/untimed), `duration_seconds`, and a `default_choice` selected on timeout. Example choice prompt (Pip's Prologue rescue moment):

```json
{
  "prompt_id": "pip_fate_choice",
  "mode": "timed", "duration_seconds": 15, "default_choice": "ignore",
  "choices": [
    { "choice_id": "rescue", "memory_tags_added": ["Pip_Rescued"],
      "npc_deltas": { "pip": 50, "elder_maeve": 25 },
      "faction_deltas": { "independent": 15, "pale_choir": 10 } },
    { "choice_id": "ignore", "memory_tags_added": ["Pip_Ignored"],
      "npc_deltas": { "elder_maeve": -15 }, "faction_deltas": { "luminari": 5 } },
    { "choice_id": "give_to_chainwrights", "requires_tags": ["Chainwright_Aligned"],
      "memory_tags_added": ["Pip_Given_To_Chainwrights"],
      "npc_deltas": { "houndmaster_vex": 20, "elder_maeve": -25, "pip": -30 },
      "faction_deltas": { "chainwright": 20, "independent": -25 } }
  ]
}
```

### 12.5 Condition grammar

Dialogue conditions use a small tag-expression grammar the client evaluates against the player's cached memory graph: `expression := term (('AND'|'OR') term)*`, `term := HAS(tag) | variable operator value | '(' expression ')'`, where `variable` is `BOND(npc_id)`, `DISGUST(npc_id)`, `FACTION(faction_id)`, `ORIGIN`, `CLASS`, or `PATH`. Example: `HAS('Village_Saved') AND BOND('elder_maeve') >= 40 AND FACTION('chainwright') < 30`. Writers author against a tag picker (`[HAS: Village_Saved]`, `[BOND: elder_maeve >= 40]`), not raw expressions; the tool compiles it. Evaluation order: client requests cached tags → evaluates the expression locally → server validates any state-changing choice → client advances to the resulting node.

### 12.6 UI

Subtitle bar (bottom center, speaker portrait + name + text, fades after `duration + read_time`, stacks scroll upward, toggleable names/portraits/font/opacity); speech bubbles (world-space above NPC heads, 2-line max, clickable, fade after 10s, distance-culled 15–25m); choice bar (2–6 options as buttons or radial slices, circular countdown for timed prompts, number-key/controller input); inspect panel (draggable, non-camera-locking, audio scrubber, "mark" button, closable without losing progress); Lunar Resonance whisper overlay (screen-edge shimmer, directional 3D audio, wave-distorted subtitle, disableable for accessibility); companion HUD bond/disgust drift indicators.

### 12.7 Audio/VO pipeline

Full VO for the 60 core NPCs' critical lines, walk-and-talk scenes, and combat banter; partial/text-only for ambient dialogue and generic NPCs; audio-log VO for inspectable lore; filtered/whispered VO for Selen's voice. Middleware (Wwise/FMOD) handles dynamic ducking under combat music, 3D positioning from the NPC's mouth, occlusion (muffled through walls unless using Resonance), a dedicated whisper DSP chain (reverb/pitch-shift/granular synth), and timestamped subtitle events per VO file. Streaming: hot-load current zone/instance VO, LRU-cache recent lines, preload critical-path VO before chapter entry, subtitles always available immediately even if audio is still streaming in.

### 12.8 Memory event integration

Every interaction can emit a memory event (`{event_id, player_id, timestamp, type, source, tags_added, tags_removed, npc_deltas, faction_deltas, tone, line_id}`), batched for performance: critical tags (e.g. an NPC turning hostile) sync immediately; non-critical relationship deltas batch every 5s; a full sync runs on logout/instance exit. The server validates any choice that touches inventory/equipment, faction scores, companion roster, NPC life/death, or world state, and corrects the client on desync.

### 12.9 Multiplayer/networking rules

| Conversation type | Visibility |
|---|---|
| Ambient dialogue | Public — all players in range hear the same lines |
| Speech bubbles | Public unless tied to private memory |
| Walk-and-talk | Player/party only |
| Inspectable lore, Echoes/whispers, choice prompts | Player-only |
| Combat banter | All players in that combat |

In a phased/layered world, NPC greetings must check the player's current `LayerID` so two players on different story layers hear different ambient lines; party members can sync layers to hear the same content. Only NPC position/animation/generic barks replicate to other players — player-specific VO and choice state stay local.

### 12.10 Performance budgets

≤5 active ambient dialogue sources per player, ≤3 concurrent walk-and-talk companions, ≤1 pending choice prompt, ≤5 subtitle backlog, ≤3 simultaneous VO streams, ≤2 simultaneous whisper overlays. Culling: ambient bubbles only within 20m; walk-and-talk pauses past 50m; distant NPCs use cached lightweight greetings instead of full condition evaluation; non-critical ambient dialogue suppressed in combat. Optimization: precompile condition expressions to bytecode, cache evaluation results per tag-change event, lazy-load dialogue bundles per zone, pool subtitle UI elements.

### 12.11 Worked example: Maeve's supper invitation

Player approaches Elder Maeve within 5m → client checks her bundle → matches greeting `maeve_greeting_orchard_saved_pip_adopted` because tags satisfy `HAS('Village_Saved') AND HAS('Pip_Adopted') AND DISGUST('elder_maeve') < 50` → speech bubble reads *"There you are, sky-child. Pip's been asking after you."* → player clicks in → subtitle bar opens with three choices, one of which ("Supper doesn't pay for the orchard I saved") only appears because the player has the `Payment_Demanded` tag and Bond > 30 → player picks "I'd like that." → client emits a memory event (`Maeve_Supper_Accepted`, `elder_maeve` bond +10) → server validates and persists → client advances to `maeve_supper_scene`. The player can walk away mid-conversation at any point; it pauses and resumes on return.

### 12.12 Cross-system integration

Quests are rarely handed out via modal dialogue — NPCs mention needs, players act, and a quest marker only appears if the player explicitly clicks "mark." Reputation deltas flow primarily from conversation choices, and NPCs reference current reputation in their greetings. Faction-specific lines gate on faction score, and publicly switching factions triggers a confrontation node on the next relevant encounter. Dialogue bundles are keyed by `LayerID` for phasing. Combat banter fires off combat events; choice prompts can appear mid-combat (e.g. "Spare him?" while aiming); walk-and-talk pauses for combat and resumes after.

### 12.13 Accessibility & testing

Accessibility: full subtitles with off-screen speaker indicators, adjustable subtitle background opacity/size, always-shown speaker names, a scrollable conversation history log, an auto-advance-off option for readers, reduced-motion toggle for whisper shimmer/bubble bounce, screen-reader-narrated choice prompts, consistent color-coding for virtuous/pragmatic/ruthless tones, and an optional pause-safe mode that pauses the world during critical choices. Testing: automated unreachable-node coverage reports, a playtest mode that simulates arbitrary tag states, multiplayer-layer-separation verification, per-language subtitle-sync validation, fuzz-testing illegal choice submissions against the server, memory-tag persistence across logout/zone-transfer, and a 100-NPC-ambient-bubble stress test.

---

## 13. Living World / Seasonal Live-Service Design

*How the game stays alive between expansions — seasons don't just add a map, they react to which ending the playerbase collectively chose, refresh old zones, move NPCs around, and advance Aethon's calendar. As with everything else in this archive, this is unbuilt design material — the current vertical slice ships one scripted finale, not a live-service season cadence.*

### 13.1 Philosophy

The world remembers (active ending, faction power, and major NPC states persist and evolve); old zones stay relevant (every season refreshes 2–3 old zones); no content is wasted (seasonal maps are repurposed/expanded, not abandoned); player agency compounds (seasonal arcs reference personal choices even inside a shared macro-state); factions are never finished (a Chapter 8 victory is a starting condition for the next season, not an endpoint); Selen keeps changing (the moon evolves visually and mechanically across seasons).

### 13.2 Season structure (10–12 weeks each)

Each season ships a seasonal story (3–5 chapters), one new zone or a heavily refreshed old one, a seasonal meta event with a boss and reward track, a new dungeon/strike tied to the story, 1–2 world-boss rotations (often in old zones), a scripted or community-driven faction-power shift, one small new mechanic, an account-wide reward track, and a 2–3 week festival. Cadence: week 0 launch + chapter 1 + new zone; week 2 chapter 2 + dungeon; week 4 chapter 3 + world boss + festival start; week 6 chapters 4–5 + meta climax + faction shift; week 8 festival close + teaser; weeks 10–12 catch-up + replay bonuses + next-season tease.

### 13.3 How endings shape seasons

The world's macro-state is set by the **most common active ending** across the playerbase at season launch (weighted by completion), while individual players still see personal callbacks (companions who are alive appear in seasonal content; NPCs the player killed don't; betrayed factions stay hostile; secret-ending flags unlock unique side quests). Each of the 9 major endings implies a distinct seasonal flavor — e.g. **The Silver Chain** → resistance/underground-Moon-Touched themes; **The Gilded Cage** → corruption-of-progress/worker-revolt themes; **The Long Fall** → survivor-guilt/void-cult themes; **The Becoming** → "those left behind" themes. (Full 9-row table of macro-state + seasonal theme per ending is in the source brainstorm.)

### 13.4 Saga 1: "The Chains That Remain" — worked example arc

A fully worked 4-season arc showing the pattern, meant as a template rather than a locked roadmap:

- **Season 1 — The Shardsingers:** a cult learns to sing to Moonshards, trying to compose a lullaby that heals Selen. New zone (The Resonant Reaches), refreshed Threadhold/Ashmire, new dungeon (The Humming Cavern, layout shifts with pitch), world boss (The Shardsinger Chorus, a "sung" attack-pattern fight), new mechanic (shard-tuning gear attunement). Major choice: let them finish the lullaby (Pale Choir-pleasing, memory-softening world events) vs. stop them (order restored, Shardsingers go underground) vs. broker a controlled performance (hardest, unlocks neutral concert content).
- **Season 2 — Ashford Reborn:** the Luminari accidentally awaken an Age of Cinders superweapon, the Cinder King, beneath Ashmire. New zone (Cinder Hollows), new mechanic (temporary siege-machine piloting/bonding), major choice of destroy / negotiate service / let it rule Ashmire as a machine-king.
- **Season 3 — The Hollow Court:** a diplomatic summit murder-mystery across the Spirechain; new "evidence dossier" mechanic; who gets accused (Chainwright/Luminari/Pale Choir/scapegoat/self-plot) reshapes regional power for the season.
- **Season 4 — What the Sky Remembers:** the player's Chapter 8 ending choice starts actively reacting; new zone (The Frayedge Rift) bleeds together consequences from multiple endings; sets up Expansion 1's tease that something is rising from Selen's far side or the void where it used to be.

### 13.5 Saga 2 sketch: "The Far Side"

A four-season follow-on premise: the Voidborn, entities that feed on forgotten things, arrive from beyond Selen. S5 *The Eaters of Names* (Voidborn erase names from the Book of Dusk, accelerating Hollowing — name-recovery expeditions); S6 *The Driftborn* (moon-fragment refugees arrive in Long Fall/Drift/Becoming worlds — welcome/quarantine/exploit choice); S7 *The Dream War* (Lullaby/Bridge-world conflict between wake and dream factions); S8 *The Tyrant's Shadow* (a player-shaped lunar-tyrant world boss manifests if enough players hold the Moon-Tyrant ending, otherwise a new would-be-tyrant faction rises).

### 13.6 Regional refresh pattern

Every season, 2–3 old zones get new content layered onto their existing state rather than being replaced — e.g. Threadhold moves from Prologue recovery → Shardsinger harmonics (S1) → Ashmire-refugee housing tension (S2) → summit-assassination intrigue (S3) → an ending-flavored memorial/celebration (S4) → Book-of-Dusk tomb-raiding (S5) → alien-refugee xenophobia events (S6) → sleepwalking dream-age events (S7) → occupation-or-liberation resistance content (S8). The same 8-season throughline is sketched for Ashmire in the source material.

### 13.7 Faction power seasons

Each season has a scripted regional power shift (e.g. S1 Shardsingers gain neutral-zone foothold at all three factions' expense; S3 Spirechain shakeup based on the murder-trial verdict) plus optional **community-driven global goals** with tiered thresholds: Bronze (25% participation, small local reward), Silver (50%, zone-wide buff + new event variant), Gold (75%, major world-state shift + unique cosmetic + landmark change), Platinum (90%+, secret quest unlock + legendary recipe + named NPC memorial). Example: "The Great Bell Ringing" — at Gold, the Voidborn are repelled from Mourncrown and Brother Ink adds a new name to the Book of Dusk; at Platinum, a secret instance lets players meet the spirit of the first bell-ringer.

### 13.8 Seasonal story delivery, replay, and reward tracks

Seasonal chapters use the same playable-conversation system as the main game, release every 2 weeks (30–60 min each), stay replayable indefinitely at reduced post-season rewards, and get periodic full-reward "Living World Return" windows. Choice persistence varies by type: personal companion fate is character-only; faction power shifts, new NPCs, new public events/bosses, and destroyed/built landmarks are world-state-persistent for everyone. Each season has a free + premium reward track (currency → dye → weapon skin → armor piece → cosmetic companion → title → mount/glider skin → selectable-stat epic → legendary component → final seasonal set, on the free side; exclusive skins/emotes/housing/legendary weapon skin on premium), plus season-specific bound currencies (Lunar Resonance, Remembrance Tokens, Void Shards, Dream Silk) each tied to a themed vendor.

### 13.9 Festivals, NPC movement, world bosses, housing, guilds, economy, PvP, catch-up

Annual festivals refresh old zones on a fixed calendar (Threadlight Fair, Dusk Vigil/Halloween, Embernights/winter, Tidecalling/spring, The Naming) and carry small moral choices of their own. NPCs physically relocate season to season (Veyra and Houndmaster Vex both have full 8-season location/role tables in the source material, e.g. Vex moves from Threadhold enforcer → Shardsinger-hunter → Cinder-tech claimant → trial figure → occupation leader-or-fugitive → name-thief → refugee-quarantine officer → dream-criminal-hunter → tyrant's enforcer-or-reformed). World bosses rotate and gain dialogue referencing player history (the Briarwraith Matriarch asks after a child the player bound her to; the Cinder King calls a machine-destroying player a butcher). Housing gets seasonal decor unlocks and occasional companion/NPC visitors. Guild missions and guild-hall theming shift with season and faction alignment. New materials each season create predictable economic booms for specific crafting professions, cheapen after the season ends, and seasonal PvP maps/WvW objectives echo the season's mechanics. Catch-up tooling: past seasons go free after 2 seasons at reduced reward, power-catch-up gear boosters for returning players, friends can join a current-season instance regardless of catch-up state, and an account-wide choice-summary UI.

### 13.10 Technical shape

World season state (`current_season`, `active_macro_ending`, per-faction power, `seasonal_flags[]`, community-event progress) is separate from per-player season state (`completed_chapters[]`, `seasonal_choices[]`, reward-track progress, premium-track flag). Deployment layers: client patch (art/audio/UI/dialogue bundles), server update (quests/events/bosses/rewards/economy), hotfix (balance/bugs/event tuning), and config flags for toggling world-state changes without a full patch. Old zones carry multiple seasonal layer variants; players see the variant matching the current global season plus their personal choices, with party-sync for shared group-content layers. A live-ops team needs a Live Game Director, Season Producer, Narrative Lead (continuity across seasons/choices), Economy Designer, Community Manager, Analytics (participation/ending-distribution/retention), and a live QA team.

---

## 14. Economy & Crafting System Design

*Built for horizontal progression, GW2-style: the chase is build expression, legendary flexibility, cosmetic prestige, and faction power — never an item-level treadmill, and never pay-to-win.*

### 14.1 Philosophy

The economy exists to serve horizontal progression (a reachable stat cap; the chase is stat combos, legendary flexibility, skins, convenience), build diversity (crafting produces sigils/runes/infusions/food across different stat foci), long-term retention (legendaries take months of cross-content effort), social interaction (trading post, material flipping, regional trade routes, guild crafting), content funding, and immersion (materials tied to regions, lunar phenomena, and factions). It explicitly does **not** exist to sell power, force daily chores to stay afloat, punish casual players with scarcity, or enable RMT/botting.

### 14.2 Currencies

**Aethercoin** is the primary trade currency (gold-equivalent) — earned through normal play (events, dungeons, raids, world bosses, selling, dailies), never sold for real money, and drained by waypoints, repairs, TP tax, material conversion, and vendor basics. A dozen **account-bound currencies** each map to specific content and specific spend: Karma (public/dynamic events → renown vendors), Lunar Resonance (lunar phenomena/Whisper Zones → lunar skills and Selenian lore items), Laurels (dailies/weeklies → mats/convenience), Dungeon/Strike Tokens, Raid Essence (→ legendary components/prestige cosmetics), WvW Marks, PvP League Points, map-specific currencies, Remembrance Tokens (Pale Choir), Innovation Cores (Luminari), Order Seals (Chainwright). **Moonstones** are the premium currency — cosmetics, convenience, account upgrades, build/equipment template slots only, never power — and are two-way convertible with Aethercoin through a player-driven Currency Exchange (10% tax), which is the mechanism by which free players can earn "premium" goods and paying players can buy gold, without ever buying power directly.

### 14.3 Gathering

Four gathering tools (Lunar Pick for ore, Sickle of Remembrance for plants, Thread-hooked Rod for wood, Resonance Sifter for lunar sediment) with cheap unlimited basic versions and optional convenience-only paid upgrades. Each of the 7 regions has a distinct ore/plant/wood/special-material profile (full table in source), so gathering naturally creates trade routes. Nodes are per-player-instanced (no ninja-gathering), quality scales with region tier and lunar events (Lunar Tides boost specific nodes; The Long Night — a weekly/monthly event — makes all lunar nodes glow and yield rare materials), and a horizontal gathering-mastery track unlocks speed/rare-drop/detection upgrades rather than power. Salvage kits (tiered) convert unwanted gear back into materials; legendary salvage needs special kits and returns unique components.

### 14.4 Crafting disciplines

Ten disciplines — Weaponsmith, Artificer, Huntsman, Armorsmith, Leatherworker, Tailor, Jeweler, Chef, Scribe, Aetherwright (golems/war machines/siege/prosthetics) — each learnable by any character, with recipes sourced from vendors, station-discovery, dungeon/raid/world-boss/faction-vendor drops, seasonal events, and hidden exploration scrolls. Six crafting tiers from Novice (hours) to Grandmaster (months–years) gate progressively rarer output, culminating in Ascended gear and legendary precursors.

### 14.5 Horizontal itemization

Gear power is defined by **stat combinations** (Berserker's Thread = Power/Precision/Ferocity; Viper's Eclipse = condition-focused; Minstrel's Moon = support/healing; etc. — six named combos in the source, easily extended), not item level. Exotic gear (easy to craft, covers every stat combo) is the practical stat cap; Ascended is a 5–10% refinement with infusion slots; Legendary matches Ascended stats exactly but adds free stat/prefix swapping and unique visual/audio identity — so new players reach competitive gear fast, and veterans chase Legendary purely for flexibility and prestige, never raw power. Eight rarity tiers (Common → Unique) carry explicit binding rules (unrestricted / account-bound / soulbound / bind-on-equip / bind-on-pickup) balancing tradeable economy against protecting long-term chase goals. Runes (armor set bonuses), Sigils (weapon procs), and Infusions (small stat/resistance/cosmetic boosts) are the actual endgame build-customization layer.

### 14.6 Trading post & anti-RMT

A single global, anonymous trading post (5% listing fee, 10% transaction tax) is the *only* player-to-player item exchange — there is deliberately **no direct player trading**; gifting only happens via taxed/logged mail attachments or permission-gated, logged guild storage. This, plus price-history transparency, rarity listing caps, price-fixing pattern detection, new-account trade holds (7 days on high-value items), behavioral bot detection, and a defined exploit-response playbook (freeze → investigate → rollback → hotfix → transparent comms), is the anti-RMT backbone.

### 14.7 Legendary chase

Every legendary requires a Gift of Aethon (regional materials from every launch zone), a Gift of Selen (lunar-phenomena/raid/world-boss materials), a Gift of the Factions (Chainwright/Luminari/Choir content), a precursor (drop, forge-craft, or collection achievement), and time-gated weekly materials from top-end content — an intentionally months-long, cross-every-game-mode chase. A fully worked example ("The Last Lullaby," a Resonant/Mourner legendary staff) walks all 8 crafting stages including a Sunken Llyr pearl-collection step, a 30-song ruin-lore collection, 10 Siren Mother kills, the "Lira of the Drowned Line" precursor, and a final naming rite performed by Mira Hollowbell or Cael. Legendary benefits are free stat/appearance swapping, account-wide unlock, and unique VFX/audio — never a stat advantage over Ascended. Parallel horizontal-chase collections cover weapon skins, lore, meeting all 60 NPCs, festival achievements, mounts/gliders, and dyes.

### 14.8 Sinks, regional/faction economy, consumables

Aethercoin sinks: waypoint travel, gear repair (death penalty), TP tax, currency-exchange tax, crafting-refinement fees, bank/storage upgrades, dye unlocks, transmutation charges, housing rent. Material and bound-currency sinks funnel into crafting, legendaries, guild upgrades, and community-event donations. Each region exports/imports distinct materials (table in source), and regional faction dominance shifts local prices — e.g. Luminari-controlled Ashmire cheapens energy materials but spikes food-import costs due to diverted labor — with each faction also running its own unique vendor goods (ward-keeper skins/binding sigils for Chainwrights, shard-tech skins/overcharge sigils for Luminari, mourner skins/remembrance runes for the Pale Choir). Chef/alchemy consumables (foods, potions, party-wide feasts) stay cheap enough for regular use and convenience-only for boosters — never power-for-cash.

### 14.9 Monetization boundary

Cash shop sells cosmetics (skins, mounts, gliders, dyes, finishers, emotes), convenience (bank/inventory/character slots, build templates), and cosmetic-only gathering tools/boosters — explicitly never direct power gear, Ascended/Legendary items, crafting materials (except indirectly via the player-driven Currency Exchange), or story skips. The fairness claim: free players can reach everything through play plus the Exchange; paying players save time on convenience and cosmetics; nothing purchasable changes combat outcomes.

---

## Closing note

This document intentionally preserves scope and ambition rather than pre-trimming it — the working GDD (`docs/GDD.md`) is where scope decisions actually get made and tracked against what's built. When picking a next slice to build (more chapters, more of the 60-character roster's individual arcs, the origin/class layer, secret endings), start from GDD.md's "Roadmap ideas" section, then pull the relevant subsection out of this document for detail.
