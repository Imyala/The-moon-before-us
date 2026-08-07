# The Moon Above Our World — Design Expansion

**Status: target design, not yet built.** This document is the forward-looking design spec for a major scope expansion — races, an expanded faction system (3 major + 9 minor), 30 mixable origins, universal romance, cross-faction guilds, a grimdark tonal revision, and an 8-chapter campaign rewrite that threads all of it together. It supersedes the earlier, narrower assumptions (few races, limited romance) referenced elsewhere.

It does **not** replace `docs/GDD.md`. The GDD documents what's actually built and verified in this codebase today — the core architecture it describes (the Moon-Touched condition, the three ending axes, the NPC memory/relationship graph, the companion system, per-Room world simulation) remains the foundation this expansion builds on. This document is the target; the GDD is the record of what's shipped. As pieces of this expansion are actually implemented, they should move into the GDD the same way every other feature in this project has: built, tested, verified, then documented there with the same rigor.

See the GDD's "Design Expansion — Implementation Status" section for a running tally of what's been started against the phases below.

---

## 1. Revised Tone & Aesthetic: Grimdark Majesty

The new tonal target is **"Warhammer 40K meets paintings of the Moon."**

| Element | 40K Inspiration | Our Interpretation |
|---|---|---|
| **Scale** | Imperial cathedrals, hive cities, endless war | Sky-cities hanging from the Moonthread, fortress-cathedrals, entire regions scarred by lunar tides |
| **Zealotry** | Imperial Creed, Chaos cults | Chainwright dogma, Luminari techno-cultists, Pale Choir death-cults |
| **Cosmic dread** | Warp, Chaos Gods, ancient xenos | Selen itself, the Voidborn, the Hollowed, dead civilizations beneath reality |
| **Body horror** | Chaos mutations, servitors | Moon-Touched transformations, Hollowed erasure, shard-mutated wildlife, fused machine-flesh |
| **Color and beauty** | 40K has vivid heraldry, stained glass, nebula skies | Bioluminescent moon-forests, brass Luminari machinery, white-gold Chainwright spires, grey Choir veils against aurora-lit nights |
| **Brutality** | Exterminatus, Inquisition | Erased villages, mass cure camps, forced ascensions, extermination of the Moon-Touched |

**Visual rule:** Every beautiful thing is also dangerous. The moon-apple orchard glows softly because it is irradiated. The Chainwright cathedral is gorgeous because it was built from Selenian bone-crystal. The Luminari skyline glitters because it burns the moon's corpse.

---

## 2. Races of Aethon, Selen, and the Void

### 2.1 Playable Races (16 Core + 8 Unlockable)

Playable races are divided into **Aethonian** (native to the world), **Selenian-touched** (descended from or altered by the moon), and **Unbound** (other).

#### Aethonian Playable Races

| Race | Archetype Inspiration | Identity | Visual |
|---|---|---|---|
| **Vaelari** | Humans / Hyur / Bretons | The default adaptable people; builders of Spirechain, farmers of Threadhold | Varied, like humans with slightly elongated limbs from generations near the thread |
| **Khurruk** | Orcs / Roegadyn / Orsimer | Mountain/labor clans of Ashmire; massive, pragmatic, tattooed with forge-ash | Hulking, stone-grey or brass-colored skin, tusk-like jaw protrusions |
| **Sylphra** | High Elves / Altmer / Elezen | Spirechain aristocracy, astronomers, high culture | Tall, pale, iridescent eyes, slightly pointed ears, silver hair |
| **Duskwight** | Dark Elves / Dunmer / drow | Mourncrown exiles, shadow-workers, former nobility | Ash-grey to deep blue skin, red or white eyes, clan scarification |
| **Khenu** | Khajiit / Miqo'te | Coastal and highland clans, quick, spiritual, tied to tides | Feline aspects, vertical pupils, fur patterns ranging from sand to moon-white |
| **Brakkan** | Dwarves / Lalafell (stout) / dwarves | Deep miners, engineers, keepers of old war machines | Compact, broad, metallic hair-braids, gem-set beards regardless of sex |
| **Fennori** | Halflings / Hobbits / Lalafell (small) | River-folk, traders, gardeners of Threadhold | Small, quick, large eyes, fur-lined feet, cheerful in the face of horror |
| **Lyranni** | Sea Elves / Viera / sea folk | Sunken Llyr divers, amphibious traits, bioluminescent markings | Webbed digits, gill-slits, pale scales along limbs, bioluminescent spots |

#### Selenian-Touched Playable Races

| Race | Archetype Inspiration | Identity | Visual |
|---|---|---|---|
| **Lumineth** | Blood Elves / Sin'dorei / Ascians | Descendants of Selenian refugees who bred into Aethon; elegant, damaged | Pale silver skin, faintly glowing veins, black or white hair, mournful beauty |
| **Threadborn** | Sylvari / Asura / engineered | Children conceived under the Moonthread; naturally Moon-Touched-sensitive | Skin like moon-crystal, hair that drifts as if underwater, no visible ears |
| **Ashren** | Undead / Revenant / Hollowed who kept minds | People who died in shardfalls and returned changed; feared, legal gray area | Greyish skin, hollow eyes with silver pupils, faintly visible old wounds |
| **Golemkin** | Warforged / Automata / constructs | Ancient war machines granted consciousness by lunar resonance | Metal and crystal bodies, rune-lit eyes, voice like bells or static |

#### Unbound Playable Races

| Race | Archetype Inspiration | Identity | Visual |
|---|---|---|---|
| **Voidtouched** | Tiefling / Au Ra / Chaos-touched | Born during a Voidborn incursion; slightly inhuman, prophetic, feared | Dark scales or horns of void-crystal, eyes that reflect nothing, shadow-clinging |
| **Riftborn** | Charr / Norn / beast-kin | Frayedge survivors mutated by reality-tears; feral resilience | Asymmetrical features, extra limbs or eyes that come and go, patched fur/skin |
| **The Bound** | Draenei / Ain / angelic-xenos | Servants of an older celestial order that predates the Binding; rare, worshipped | Tall, many-jointed, luminous sigils floating around head/limbs, no visible mouth |

#### Unlockable Playable Races (Post-Launch / Hard Unlock)

| Race | Unlock Condition |
|---|---|
| **True Selenian** | Complete the "Remembered" secret ending; playable as a limited origin |
| **Hollowed Ascended** | Reach maximum Hollowed path; unlock in a future season |
| **Voidborn Hybrid** | Defeat the final Voidborn boss in Season 5 |
| **Machine-Soul** | Free Ironwright Unit 7 and complete machine-soul questline |
| **Drift-Caller** | Complete Season 6 refugee integration arc |
| **Dream-Walker** | Complete Season 7 lucid-dream mastery |
| **Thread-Eater** | Complete the "Thread-Eater" dark ending |
| **Nameless** | Have your name removed from the Book of Dusk and survive |

### 2.2 NPC Races of Aethon (Non-Playable)

| Race | Role in World | Region |
|---|---|---|
| **The Skrii** | Insectoid librarians of the Spirechain under-archives | Spirechain |
| **Moss-Whales** | Gigantic filter-feeders in the Sunken Llyr depths | Sunken Llyr |
| **Root-Wights** | Ancient forest guardians in Verdant Reach | Threadhold |
| **Ash-Drakes** | Miniature wyverns domesticated in Ashmire | Ashmire |
| **Thread-Spiders** | Weaver-creatures that maintain old lunar wards | Old anchor sites |
| **Glass-Wraiths** | Translucent remnants of the first Binding | Mourncrown |
| **The Murmuring** | Colonies of fungal speakers in Frayedge caves | Frayedge |
| **Sky-Koi** | Flying lunar fish that migrate along the Moonthread | Sky regions |
| **Lament-Engines** | Sentient bells and clockwork mourners | Pale Choir sites |
| **Bone-Sailors** | Drowned dead who still crew ships | Sunken Llyr |

### 2.3 Enemy and Monster Races

| Category | Examples | Threat Level |
|---|---|---|
| **Shard-Mutated Wildlife** | Moon-wolves, crystal-boar, luminous moths, glass-snakes | Low |
| **The Hollowed** | Erased people-become-monsters; vary by what they forgot | Medium–High |
| **Lunar Husks** | Selenian corpses reanimated by thread-energy | Medium |
| **Voidborn** | Entities from beyond reality that eat names and memory | High–Raid |
| **Cinder War-Machines** | Ancient siege golems from the Age of Cinders | Medium–High |
| **Chainwright Purifiers** | Fanatical knight-inquisitors; humanoid enemies | Medium |
| **Luminari Aberrations** | Test subjects fused with shard-tech; body horror | Medium–High |
| **Pale Choir Dirgesingers** | Mourners who weaponize grief; humanoid enemies | Medium |
| **Ashforged Mercenaries** | Paid killers; humanoid enemies | Medium |
| **Pirate Kings of Blacktide** | Smuggler factions; humanoid enemies | Medium |
| **Dream-Revenants** | Aggressive memory-entities from the Lullaby age | High |
| **Thread-Parasites** | Worm-like creatures that infest lunar machinery | Low–Medium |
| **The Unshaped** | Reality-glitch monsters from the Frayedge rifts | High |

### 2.4 Race Mechanics in Gameplay

| Mechanic | Implementation |
|---|---|
| **Racial passives** | Minor, flavorful bonuses (e.g., Lyranni swim faster, Khurruk reduce stagger, Sylphra better at reading lunar charts). No direct combat power gap. |
| **Racial skill** | One optional utility skill (e.g., Khenu night-vision, Brakkan ore-sense, Fennori forage). |
| **Origin compatibility** | Some origins are race-locked (e.g., Lumineth can take "Selenian Exile" origin); most are open. |
| **NPC reactions** | Racial prejudice and affinity are tracked as memory tags; a Khurruk in Spirechain faces different dialogue than a Sylphra. |
| **Romance compatibility** | Any race can romance any NPC, but some NPCs have racial preferences or prejudices that must be overcome. |

---

## 3. The Three Major Factions + Nine Minor Factions

### 3.1 Major Factions (Revised)

| Faction | Identity | Race Makeup | Tone |
|---|---|---|---|
| **The Chainwright Order** | Bind Selen; maintain the Moonthread; imperial law | Mostly Vaelari, Sylphra, Brakkan, Khurruk | Gothic theocracy, Inquisition, rigid hierarchy |
| **The Luminari Covenant** | Exploit Selen for progress, technology, and power | Mixed; many Sylphra, Lumineth, Brakkan, Golemkin | Tech-zealots, industrial horror, "the machine will save us" |
| **The Pale Choir** | Let Selen die with dignity; remember the dead | Duskwight, Lumineth, Ashren, Fennori, Voidtouched | Death-cult monks, funeral rites, memento mori everywhere |

### 3.2 The Nine Minor Factions

Minor factions have **reputation tracks**, **unique vendors**, **guild alliances**, and **story roles**. Players can be friendly with multiple minors even while holding one major allegiance.

| # | Faction | Identity | Alignment Leans | Key NPC | Signature Conflict |
|---|---|---|---|---|---|
| 1 | **The Ashforged Company** | Mercenary sellswords and arms dealers | Neutral/mercenary | Viceroy Korr, Dren Cold-Coin | Who gets the weapons? |
| 2 | **The Tide-Callers** | Sunken Llyr spirit-shamans and smugglers | Pale Choir / Independent | Tidecaller Oren | Raise or respect the drowned? |
| 3 | **The Emberwrights** | Ashmire worker guild seeking control of the forges | Independent / Luminari | Forge-Mother Breca | Tools vs. weapons vs. worker ownership |
| 4 | **The Blacktide Armada** | Pirates and free sailors of Sunken Llyr | Independent / criminal | Captain Netta Blacktide | Smuggling routes and naval freedom |
| 5 | **The Silent College** | Spirechain scholars and archivists seeking truth | Independent / scholarly | Archon-Scribe Velis, Novice Tarn | Publish or suppress forbidden history |
| 6 | **The Mournstride Clans** | Highland warrior-poets honoring the dead | Pale Choir / Independent | Thane Corvin | Defend hall or evacuate? |
| 7 | **The Frayedge Covenant** | Moon-Touched sanctuary and outcasts | Pale Choir / Independent | Warden Kael, Hollow-Singer | Protect or exploit the Moon-Touched? |
| 8 | **The Shardsingers** | Cult that sings to moonshards to rewrite reality | Pale Choir / Luminari | Cantor Veyle | Let them sing or silence them? |
| 9 | **The Argent Vigil** | Reformist Chainwright splinter opposed to Aldric's cruelty | Chainwright / Independent | Castellan Yora | Reform or purge the Order? |

### 3.3 Faction Reputation System

Each player has a score with **3 majors + 9 minors = 12 factions**.

| Score | State | Effect |
|---|---|---|
| +80–100 | Exalted | Unique vendor, story quest, companion recruitment |
| +40–79 | Trusted | Discounts, special quests |
| +10–39 | Friendly | Access to basic content |
| -9–9 | Neutral | No special treatment |
| -39–-10 | Suspicious | Higher prices, hostile ambient dialogue |
| -79–-40 | Hostile | Attacked in their territory |
| -100–-80 | Hunted | Bounty hunters, assassination attempts |

**Major vs. Minor Interaction:**

- You can be **Exalted with a minor faction** while **Hostile to its aligned major** (e.g., friendly with Argent Vigil but hostile to Chainwright Order).
- Minor factions can buffer you against their aligned major.
- Betraying a minor faction you were Exalted with causes a **story event** where their leader confronts you.

> **Engineering note:** the existing `LoyaltyScores`/`LoyaltyKey`/`applyLoyaltyDelta` machinery in `packages/shared/src/lore/factions.ts` hardcodes its four keys (three majors + independent) as named fields rather than iterating a table. Expanding to 12 factions means rewriting that machinery to be table-driven, and touching every one of the 60+ existing NPC signature choices' loyalty deltas plus the Character panel's loyalty rows and `endings.ts`'s `trendingEnding` derivation. This is real, careful refactoring work across the game's most narratively load-bearing code — not something to do as a side effect of adding races.

---

## 4. Cross-Faction Guilds and Double-Agent Mechanics

### 4.1 Guild Faction Identity

When a guild is created, the guild leader chooses a **guild faction alignment**:

| Guild Alignment | Meaning |
|---|---|
| **Neutral** | No faction restrictions; no faction story benefits |
| **Chainwright-affiliated** | Chainwright members get guild perks; non-members can still join but are "suspect" |
| **Luminari-affiliated** | Same for Luminari |
| **Pale Choir-affiliated** | Same for Choir |
| **Minor-faction affiliated** | Guild tied to one of the 9 minors |
| **Independent/mercenary** | Guild takes contracts from all factions |

### 4.2 Cross-Faction Membership

Players of **any faction** can join **any guild**, but the guild alignment creates story tension.

#### For Members Aligned with the Guild

- Full access to guild perks.
- Guild missions contribute to their faction's power.
- No story complications.

#### For Members Opposed to the Guild

- **Suspect status** within the guild.
- Guild NPCs may ask you to spy, steal information, or sabotage your own faction.
- Refusing makes you a **pariah** in the guild.
- Accepting makes you a **double agent**.

### 4.3 Double-Agent Story System

If you join a guild aligned with an enemy faction, the game offers a **double-agent questline**:

| Stage | What Happens |
|---|---|
| **Recruitment** | Guild leader asks you to prove loyalty by feeding them information. |
| **First betrayal** | You steal documents, maps, or plans from your own faction. |
| **Exposure risk** | Your own faction grows suspicious. Grudges accumulate. |
| **Moral crisis** | A friend in your faction is endangered. Save them or sacrifice them for the guild? |
| **Resolution** | Choose: become a true defector, expose the guild as a mole, or play both sides forever. |

**Consequences:**

- **True defector:** Switch factions with a bonus but become hunted by your old faction.
- **Expose the guild:** Your faction trusts you; guild collapses or purges you.
- **Double agent forever:** Highest risk; unique "The Architect of Nothing" ending path; one mistake turns both factions hostile.

### 4.4 Guild War and Espionage

- Guilds can declare **shadow wars** on enemy-aligned guilds.
- **Espionage missions:** Infiltrate enemy guild hall instances to steal banners or intelligence.
- **Guild bounties:** Place bounties on enemy players in open-world PvP zones.
- **Faction contribution:** Guilds collectively contribute to their aligned faction's power in the world map.

> **Engineering note:** there is no guild system of any kind in this codebase today — no persistent multi-character organization, no guild hall, no PvP. `Room` is a single solo-or-party instance; a guild is a cross-Room, cross-session social structure closer in shape to the auction house (global, DB-backed, outlives any one Room) than to anything else built so far, but with much more surface area: membership, ranks, invitations, chat, and (per this section) PvP bounties and shadow wars, which this game has no combat-between-players model for at all yet. This is a large, standalone system.

---

## 5. Universal Romance System

Lets players pursue romance with any named NPC — companions, faction leaders, regional figures, merchants, antagonists, even some spirits and constructs — while keeping romance conditional, fragile, and meaningful across the memory graph.

> **Status:** a real first slice of this system is built — see the GDD's Design Expansion status table and its "Universal romance" section for what's actually shipped (six real NPCs, a Romance Score with five sub-metrics, flirting, gifting, loss/repair) versus what below is still just target design (the full 80-120 NPC roster, jealousy/polyamory, intimacy scenes, faction/guild political consequences, Moon-Touched-path interaction, campaign-chapter gating).

### 5.1 Romance Philosophy

**Core Tenets**

| # | Tenet | Meaning |
|---|---|---|
| 1 | **Anyone can be loved** | Any named NPC with a relationship graph can be romanced. No hard locks by race, class, origin, or faction. |
| 2 | **Love must be earned** | Romance requires consistent action, aligned values, completed personal quests, and emotional honesty. |
| 3 | **Love can be lost** | Romance is not a permanent achievement flag. Betrayal, cruelty, ideological betrayal, or abandonment can destroy it. |
| 4 | **Love has consequences** | Romance affects faction standing, companion dynamics, ending options, and post-game epilogue. |
| 5 | **Love is not always happy** | Grimdark tone means romances can be tragic, doomed, toxic, or transformed by the war over Selen. |
| 6 | **Consent and agency** | NPCs can reject the player, break up, or choose someone/something else. Player actions matter. |

**What Romance Is NOT**
- Not a checklist of gift-giving.
- Not a guaranteed reward for being nice.
- Not isolated from the world; romances react to war, politics, and death.
- Not a substitute for the main story; it enhances it.
- Not explicit; intimacy is fade-to-black or emotionally evocative.

### 5.2 The Romance Score System

Every named NPC has a hidden **Romance Score** that exists alongside Bond, Disgust, and Trust.

**Romance Metrics**

| Metric | Range | Meaning |
|---|---|---|
| **Romance Score (RS)** | -100 to +100 | Overall romantic interest and commitment |
| **Attraction** | 0–100 | Physical/emotional pull |
| **Respect** | 0–100 | Admiration for your actions and character |
| **Vulnerability** | 0–100 | How much the NPC has opened up to you |
| **Fear** | 0–100 | How much the NPC fears you or the relationship |
| **Hope** | 0–100 | Belief the relationship can survive the world |

**Romance States** (based on RS and other metrics)

| State | RS Range | Meaning |
|---|---|---|
| **Indifferent** | -20 to +10 | No romantic awareness yet |
| **Curious** | +11 to +25 | They have noticed you; may flirt back |
| **Interested** | +26 to +40 | Reciprocated interest; courtship can begin |
| **Courtship** | +41 to +60 | Active romance; personal quest unlocks |
| **Committed** | +61 to +80 | Romance locked; significant relationship content |
| **Devoted** | +81 to +100 | Deepest bond; ending variants, sacrifice triggers |
| **Estranged** | -10 to +30 after a crisis | Romance damaged but recoverable |
| **Lost** | -40 to -10 | Romance ended; usually irreversible |
| **Betrayed** | -100 to -41 | Romance turned to hatred; may become enemy |

**How RS Differs from Bond**

| Bond | Romance |
|---|---|
| Friendship, loyalty, combat trust | Romantic and emotional intimacy |
| Can be high without romance | Can exist alongside high or low bond |
| Gained through shared danger and help | Gained through emotional vulnerability and value alignment |
| Lost through cruelty or betrayal | Lost through romantic-specific betrayals (e.g., killing their sibling, choosing their enemy) |

**Example:** You can have Bond 90 with Bran Fieldhand and never romance him — he becomes a brother. You can have Bond 30 with Ilsa Marche but Romance 70 — she is drawn to your danger despite not trusting you.

### 5.3 Romance Archetypes

Not every NPC romance plays out the same way. We define romance archetypes that writers use.

**Companion Romances**

| Tier | NPCs (from earlier decisions) | Depth |
|---|---|---|
| **Deep romances** | Veyra, Lira, Cael, Nix, Sylvie, Spark Coil | Full courtship, multiple scenes, ending variants, companion room sharing |
| **Platonic deep bonds** | Thorn, Unit 7, Echo, Bran, Dren, Solace | No romance; family/loyalty arcs with unique intimacy |

**NPC Romance Archetypes**

| Archetype | Description | Examples | Depth |
|---|---|---|---|
| **The Beloved Leader** | Faction/region leader; romance is political and personal | Aldric, Ilsa, Vesryn, Breca, Kael | Full arc |
| **The Tragic Beauty** | Doomed or damaged; romance is bittersweet | Lumineth, Ashren, Hollowed-adjacent NPCs | Full arc |
| **The Rival** | Starts as enemy or competitor; romance through conflict | Netta Blacktide, Viceroy Korr, Rowan | Medium arc |
| **The Common Soul** | Ordinary person; quiet, domestic romance | Tomasin, Mara, Miller Tarn | Short/medium arc |
| **The Inhuman** | Spirit, machine, or altered being; romance explores definition of love | Brine, Unit 7, Astrolabe, The Selenian | Variable |
| **The Corruptible** | Romance can push them toward good or evil | Thorne, Pyra, Hollow-Singer | Full arc |
| **The Forbidden** | Romance violates faction/rank/taboo | Aldric (Chainwright), student-teacher, enemy faction | Full arc |
| **The Mercenary** | Romance is transactional until it isn't | Dren, Korr, Netta | Medium arc |
| **The Brief Flame** | Intense but short; may end in death or departure | Some Tier 2 NPCs | Short arc |

**Procedural NPC Romances**

| Category | How It Works |
|---|---|
| **Refugees you save** | Can become grateful, then attached |
| **Faction soldiers** | Repeated encounters on missions can build romance |
| **Merchants** | Long trading relationship can become intimate |
| **Hollowed you restore** | Name-recovery can create unique bonds |

These are shorter, less scripted, but still tracked through the memory graph.

### 5.4 Starting Conditions and Compatibility

**No Hard Locks.** There are no race, class, origin, or faction locks on romance. However, starting conditions affect difficulty:

| Factor | Effect |
|---|---|
| **Race** | Some NPCs have racial preferences or prejudices that must be overcome through action. |
| **Origin** | Shared background creates easier opening; opposed background creates tension. |
| **Faction** | Cross-faction romance is possible but creates political danger. |
| **Class** | Some classes have natural dialogue with certain NPCs (e.g., Mourner with Mira). |
| **Moon-Touched Path** | Some paths attract or repel specific NPCs. |
| **Romance Archetype** | The NPC's type determines what they respond to. |

**Attraction Modifiers** (starting bonuses/penalties, not gates)

| NPC | Attracted To | Repelled By |
|---|---|---|
| **Mira Hollowbell** | Mourners, gentle souls, those who save children | Those who sacrifice the innocent |
| **Ilsa Marche** | Ambition, brilliance, survivors | Weakness, hesitation, moralists |
| **Aldric Vane** | Discipline, suffering endured, order | Chaos, pity, defiance |
| **Vesryn the Duskborne** | Those who remember the dead, gentleness | Cruelty, exploitation, denial of grief |
| **Forge-Mother Breca** | Strength, pragmatism, workers | Idealists who break tools |
| **Magistrate Thorne** | Intelligence, power games, secrets | Honesty, idealism, weakness |
| **Houndmaster Vex** | Cruelty, obedience, shared hatred | Mercy, defiance, softness |
| **Captain Netta Blacktide** | Ruthlessness, freedom, sea-skill | Naivety, lawfulness, loyalty to chains |
| **The Selenian** | Those who protect their kind, lunar resonance | Those who would dissect or expose them |
| **Brine** | Those who listen to the drowned, patience | Those who exploit the sea |
| **Astrolabe** | Curiosity, freedom, philosophical depth | Those who reset or enslave constructs |

### 5.5 Building Romance: Actions and Dialogue

**Flirtation System.** Players can choose a Flirtatious dialogue tone when speaking to NPCs. This opens romance tracking.

| Flirt Type | Effect | Risk |
|---|---|---|
| **Friendly flirt** | +Attraction, +Bond | None if appropriate |
| **Bold flirt** | +Attraction, +Respect if confident; -Attraction if wrong context | Can cause Disgust if NPC uninterested |
| **Intellectual flirt** | +Respect, +Attraction with scholars/thinkers | Flat with non-intellectuals |
| **Protective flirt** | +Vulnerability, +Attraction with guarded NPCs | Can feel patronizing |
| **Vulnerable flirt** | +Vulnerability, +Hope | Risk of being seen as weak |
| **Dark flirt** | +Attraction with ruthless NPCs; +Fear with others | Can accelerate toxic romances |

Flirtation rules: each NPC has a flirt cooldown — too many flirts too fast raises Fear; some NPCs are flirt-blind initially and require friendship first; some NPCs flirt back in their ambient dialogue, signaling interest; failed flirts are remembered and can make future romance harder.

**Romantic Actions**

| Action | RS Gain | Conditions |
|---|---|---|
| Complete their personal quest | +20–40 | Varies by NPC |
| Save their life | +15–25 | One-time per NPC |
| Keep a promise to them | +10–20 | Repeatable |
| Defend their faction/values | +10–20 | Varies |
| Give a meaningful gift | +5–15 | Gift must match their taste |
| Visit them in your home | +5–10 | Repeatable, caps daily |
| Write/sing/perform for them | +10–20 | Creative NPCs |
| Stand by them in a crisis | +15–25 | Major story moments |
| Choose them over another | +10–20 | Jealousy system |
| Publicly declare affection | +20–30 | Risky; some NPCs hate publicity |

**Romantic Failures**

| Action | RS Loss | Conditions |
|---|---|---|
| Break a promise | -15–25 | Especially if promised romantically |
| Kill someone they love | -40–60 | Often ends romance |
| Betray their faction | -20–40 | Unless they were already disillusioned |
| Publicly humiliate them | -20–30 | Can end romance |
| Choose their enemy/rival | -15–30 | Jealousy and politics |
| Exploit the vulnerable they protect | -25–40 | Moral rupture |
| Lie about a major choice | -15–25 | Trust crash |
| Ignore their crisis | -10–20 | "You weren't there" |
| Embrace a path they fear | -15–30 | E.g., Hollowed path with Solace |

### 5.6 Jealousy, Rivalry, and Polyamory

**Multiple Romances.** Players can pursue multiple romances simultaneously, but the system tracks awareness.

| Awareness State | Effect |
|---|---|
| **Secret** | Romances don't know about each other; maintaining requires lies |
| **Known** | Romances are aware; may accept, tolerate, or demand choice |
| **Open** | NPCs with compatible values may accept polyamory |
| **Confronted** | Jealousy triggers; player must choose or repair |

**Jealousy Triggers**

| Trigger | Response |
|---|---|
| Player publicly romances two NPCs | Both may confront player |
| Romanced NPC sees player flirting with another | Jealousy event |
| Player gives a "romance gift" to another | Jealousy event |
| Player chooses one over another in a crisis | Rivalry or breakup |
| Two NPCs are natural enemies | Polyamory impossible without major convincing |

**Polyamory Possibilities** — some NPCs can be convinced to share:

| NPC Combination | Possible? | Condition |
|---|---|---|
| Veyra + Lira | Possible | Both value trust and honesty; must be open |
| Mira + Solace | Possible | Both are gentle; mourn together |
| Ilsa + Netta | Possible | Both ruthless; respect power |
| Aldric + Thorne | Difficult | Political rivals; only if Aldric exposed/reformed |
| Cael + Mira | Very possible | Spiritual siblings; grief bonds them |
| Kael + Nix | Possible | Found-family dynamic; protective of each other |
| Aldric + Vesryn | Impossible | Ideological enemies unless world ends |

**Rivalry Events.** If two romanced NPCs are rivals, a rivalry event triggers.

**Example:** You are romancing both Ilsa Marche and Vesryn the Duskborne. In Chapter 7, Ilsa demands you help her overcharge the Moonthread; Vesryn demands you let him cut it. They confront each other in your presence. You must choose, lie, or broker a temporary truce.

Outcomes: choose one (other romance enters Estranged or Lost); lie successfully (both stay for now, Fear increases, exposure risk later); broker truce (requires high stats, both impressed, temporary); refuse to choose (both may leave).

### 5.7 Romance Loss and Repair

**The Estranged State.** When a major romantic betrayal happens, romance enters Estranged rather than immediately Lost.

| Estranged Phase | What Happens |
|---|---|
| **Confrontation** | NPC demands explanation or apology |
| **Cooling** | NPC avoids player; ambient dialogue is cold |
| **Test** | NPC may offer a chance to make amends |
| **Repair or Break** | Player succeeds → return to Courtship/Committed; fails → Lost |

**Repair Actions**

| Action | Effect |
|---|---|
| Apologize sincerely | +RS, -Fear |
| Make a meaningful sacrifice for them | +RS, +Hope |
| Change course on the issue that caused rupture | +RS, +Respect |
| Complete a personal redemption quest | +RS |
| Give a deeply personal gift | +RS |
| Publicly choose them | +RS, clears jealousy |

**Unrecoverable Losses** — some actions permanently end romance:

| Action | Result |
|---|---|
| Kill their child/romantic rival/sibling | Lost; may become Betrayed |
| Erase their name from the Book of Dusk | Lost; spiritual murder |
| Experiment on or hollow them | Lost; often becomes enemy |
| Betray them to the faction that tortures them | Lost; Betrayed state |
| Choose genocide/extermination they oppose | Lost; moral unrecoverable |
| Sell them as a specimen | Lost; Betrayed state |

**Lost But Not Forgotten.** Even Lost romances leave traces: their room in your home becomes empty or memorialized; their letters remain in your codex; they may appear in the epilogue, referencing what was lost; in some endings, Lost romances become haunting presences.

### 5.8 Romance and Faction/Politics

**Cross-Faction Romance** creates political complications:

| Complication | Effect |
|---|---|
| **Faction disapproval** | Your own faction may lower your standing |
| **NPC endangerment** | Their faction may suspect them of treason |
| **Assassination attempts** | Rival factions may target you or your lover |
| **Secret meetings** | Romance scenes happen in hidden locations |
| **Defection pressure** | Both factions demand you prove loyalty |
| **Public revelation** | If exposed, both factions punish you |

**Faction-Specific Romance Consequences**

| Your Faction | Lover's Faction | Consequence |
|---|---|---|
| Chainwright | Pale Choir | Both factions hostile; Vigil may shelter you |
| Chainwright | Luminari | Tolerated if you support tech; Aldric suspicious |
| Luminari | Pale Choir | Ilsa disgusted; Choir wary |
| Luminari | Chainwright | Luminari questions your commitment |
| Pale Choir | Chainwright | Choir sees you as corrupted unless Aldric exposed |
| Independent | Any | No faction penalty; lovers may pressure you to join them |

**Guild Alignment and Romance.** If your guild is aligned with your lover's faction, romance is easier. If your guild is aligned with an enemy faction, romance becomes a double-agent opportunity: you can feed information to your lover, use guild resources to protect them, but exposure risks both the romance and your guild standing.

### 5.9 Romance and the Moon-Touched Path

| Path | Romance Effect |
|---|---|
| **Warden** | Stable, protective partner; some NPCs feel safe, others feel distanced |
| **Vessel** | Deeply empathetic; can sense lovers' emotions; risk of losing self |
| **Bridge** | Mediator between lovers and the world; romances often become symbolic |
| **Hollowed** | Love becomes possessive or erasing; NPCs may fear you |
| **Weaver** | Can alter memories of romance; ethically dangerous |

**Example:** A Vessel player romancing Brine can hear their memories more clearly. A Hollowed player romancing Solace will trigger a confrontation where Solace demands you stop erasing yourself.

### 5.10 Intimacy System

Intimacy is fade-to-black and emotionally focused, not explicit.

**Intimacy Levels**

| Level | What Happens | Trigger |
|---|---|---|
| **Affection** | Hand-holding, leaning close, shared warmth | Committed state |
| **Intimacy** | Embrace, kiss, implied closeness | Devoted state, private moment |
| **Bonding** | Shared bed, waking together, implied sex | Committed + private home/room |
| **Sacred Union** | Formal marriage/union rite | Faction/religion-specific ceremony |

**Intimacy Scenes.** Triggered in private spaces: your home, lover's room, hidden campsite, sanctuary. Player and NPC exchange dialogue about fears, hopes, scars. Camera focuses on hands, eyes, moonlight, weather. Fade to black before explicit content. After fade, ambient scene: waking together, clothing, shared breakfast, battlefield aftermath.

**Faction-Specific Unions**

| Faction/Culture | Union Ritual |
|---|---|
| Chainwright | Thread-binding ceremony; two wrists wrapped in silver cord |
| Luminari | Resonance-link; share a shard-glow pulse |
| Pale Choir | Bell-ringing; name each other into the Book of Dusk |
| Tide-Callers | Drowning-and-breathing ritual; share breath underwater |
| Mournstride | Blood-oath and saga verse |
| Frayedge | Quiet hand-fasting in the sanctuary |

**Breaking a Union.** Union ceremonies create public memory tags. Breaking a union has social consequences: NPCs may gossip; faction leaders may comment; in some cultures, divorce requires a formal rite.

### 5.11 Romance in the 8-Chapter Campaign

**Romance Gates Per Chapter**

| Chapter | Romance Milestone |
|---|---|
| 0–1 | Flirtation unlocked; first impressions |
| 2 | Courtship can begin for early companions |
| 3 | First personal quests available |
| 4 | Lira/Sera romance branches deepen |
| 5 | Mira/child tragedy tests romances |
| 6 | Political romances face trial pressure |
| 7 | Romances demand commitment before the Hollow Door |
| 8 | Final romance choice: who stands with you, who you say goodbye to |

**Chapter-Specific Romance Tests**

| Chapter | Test |
|---|---|
| **2** | Spirit choice — does your lover approve of how you treated the Briarwraith? |
| **3** | Machine choice — did you enslave or free? |
| **4** | Drowned city — respect or exploit? |
| **5** | Erased village — did you save or sacrifice? |
| **6** | Truth — did you publish or suppress? |
| **7** | Sanctuary — did you protect or betray the vulnerable? |
| **8** | Ending — do your lovers stand with you or against you? |

**Romance-Locked Scenes**

| Scene | Condition |
|---|---|
| Veyra's confession | Bond + Romance high in Chapter 4 |
| Lira's cove night | Romance high in Chapter 4 |
| Cael's sister rite | Bond high in Chapter 5; romance unlocks if present |
| Nix's "are we family?" | Chapter 6 if adopted/romanced |
| Sylvie's prophecy of your death | Romance high in Chapter 5 |
| Spark Coil's "one good thing" | Romance high in Chapter 8 |
| Mira's bell for you | Romance high + saved her |
| Ilsa's lab breakdown | Romance high + stopped her atrocity |
| Aldric's hidden tenderness | Only possible if you exposed/reformed him |
| Vesryn's last prayer | Romance high in Chapter 7 |

### 5.12 Romance and Endings

**Ending Variants by Romance**

| Romance | Ending Variant |
|---|---|
| **Veyra** | Co-author of the new history; or fugitive lovers if tyrant |
| **Lira** | Free port founders; or Selenian heritage movement |
| **Cael** | Court poet or final rite singer |
| **Nix** | Found-family home; or tragic separation if tyrant |
| **Sylvie** | Seer-companion in any ending |
| **Spark Coil** | School of ethical craft founders |
| **Mira** | Bell-ringers of the new age |
| **Ilsa** | Technocratic power couple; or mutual destruction |
| **Aldric** | Reformed Order leaders; or damned together |
| **Vesryn** | Sacred union until death; he performs your rite |
| **Breca** | Forge-queen and consort |
| **Netta** | Pirate queen and consort |
| **Kael** | Sanctuary founders |
| **Cantor Veyle** | Sing the new world into being; may forget you |

**Romance Tragedies** — some romances are structurally doomed based on your ending:

| Romance + Ending | Tragedy |
|---|---|
| Solace + Ending_Exterminate | Solace leaves forever; romance Lost |
| Cael + Ending_Exploit | He cannot love someone who desecrates the dead |
| Ilsa + Ending_Sever | She cannot accept letting Selen go |
| Aldric + Ending_Choir | Ideological enemies; he is executed or exiled |
| Brine + Ending_Bind | The sea cannot rest while Selen is chained |
| Veyra + Ending_Tyrant | She writes a book denouncing you |

**Romance Sacrifices.** In the final chapter, some lovers can sacrifice themselves for you:

| Lover | Sacrifice |
|---|---|
| **Veyra** | Takes a bullet of censorship for your truth |
| **Lira** | Dives into the sea to cut a thread binding you |
| **Cael** | Recites a verse that banishes a final Hollowed but fades |
| **Nix** | Stabs a tyrant to save you, dying in the attempt |
| **Spark Coil** | Overcharges a device to open the door, burning out |
| **Solace** | Refuses to let you kill the helpless, dying in your place |
| **Kael** | Holds the sanctuary door until it crushes him |

### 5.13 Cross-Faction Romance Examples

**Example 1: Chainwright Player + Mira Hollowbell (Pale Choir).** Initial attraction is difficult; Mira fears all Chainwrights. If player saves Threadhold village gently and records names, Mira becomes curious. If player publicly joins Chainwrights, Mira confronts them; romance enters Estranged. If player secretly supports Pale Choir rites while publicly Chainwright, double-agent tension rises. If player defects to Pale Choir or supports reformist Vigil, romance can recover. If player chooses Binding ending, Mira leaves unless player also chose Cure/Accept over Exterminate.

**Example 2: Luminari Player + Aldric Vane (Chainwright).** Extremely forbidden; both factions despise it. Possible only if player maintains Chainwright cover, infiltrates the Order, and Aldric is isolated/exposed. Romance is secret, dangerous, and transactional at first. If player helps reform the Order (Argent Vigil path), Aldric becomes reachable. If player stays Luminari, Aldric eventually discovers and either kills them or is destroyed.

**Example 3: Independent Player + Netta Blacktide (Blacktide Armada).** Natural alignment on freedom. Netta respects ruthlessness and sea-skill. Romance is transactional at first; becomes genuine through shared plunder and trust. If player starts working for the Chainwright navy, romance is Lost. If player becomes too lawful, Netta grows bored.

**Example 4: Pale Choir Player + Ilsa Marche (Luminari).** Ilsa is fascinated by the player's fatalism but disgusted by passivity. Player must prove that remembrance is not surrender. Romance deepens if player stops Ilsa from sacrificing a village. If player lets Ilsa burn Mourncrown, romance is Lost. If player finds a third path (ethical tech), romance can reach Devoted.

### 5.14 Technical Implementation

**Romance Data Schema**

```json
{
  "romance_profile": {
    "npc_id": "mira_hollowbell",
    "archetype": "tragic_beauty",
    "orientation": "player_determined",
    "polyamory_capable": false,
    "jealousy_level": "high",
    "forbidden_romance": false,
    "starting_attraction_modifiers": {
      "mourner_origin": 15,
      "exorcist_origin": 10,
      "chainwright_aligned": -20,
      "luminari_aligned": -10,
      "saved_child": 10,
      "saved_village_with_her": 25
    }
  },
  "romance_state": {
    "romance_score": 55,
    "attraction": 60,
    "respect": 70,
    "vulnerability": 40,
    "fear": 15,
    "hope": 50,
    "status": "courtship",
    "committed_at": null,
    "estranged_reason": null,
    "lost_reason": null,
    "union_status": null
  },
  "romance_events": [
    {
      "event_id": "mira_ch5_village_saved",
      "timestamp": 1718123456,
      "rs_delta": 30,
      "attraction_delta": 10,
      "tags_added": ["Mira_Lovers_Bond"],
      "scene_unlocked": "Mira_Bell_For_You"
    }
  ],
  "confrontation_queue": [],
  "scene_flags": {
    "courtship_scene_1": true,
    "intimacy_scene_1": false,
    "sacrifice_offer_available": true
  }
}
```

**Flirtation Event**

```json
{
  "event_type": "flirt",
  "npc_id": "mira_hollowbell",
  "flirt_type": "vulnerable",
  "context": "after_comforting_dying",
  "outcome": {
    "rs_delta": 8,
    "attraction_delta": 5,
    "vulnerability_delta": 10,
    "fear_delta": 2,
    "response": "Mira looks at you for a long moment, then gently touches your hand."
  },
  "failure_condition": "flirt_count_this_hour > 3",
  "failure_outcome": {
    "rs_delta": -5,
    "fear_delta": 15,
    "response": "Mira withdraws. 'You speak too lightly of heavy things.'"
  }
}
```

**Betrayal Event**

```json
{
  "event_type": "romance_betrayal",
  "npc_id": "mira_hollowbell",
  "betrayal_tag": "Sanctuary_Betrayed",
  "severity": "unrecoverable",
  "outcome": {
    "status_change": "lost",
    "lost_reason": "You handed the Moon-Touched to their killers.",
    "bond_delta": -40,
    "disgust_delta": 60,
    "companion_leave": true,
    "home_room": "sealed_memorial",
    "epilogue_reference": "Mira never rang a bell for you."
  }
}
```

**Condition Evaluation.** Romance lines use the existing conditional grammar:

```text
ROMANCE('mira_hollowbell') >= 40
AND HAS('Mira_Saved')
AND DISGUST('mira_hollowbell') < 30
AND FACTION('chainwright') < 20
```

**Integration with Existing Systems**

| System | Integration |
|---|---|
| **Memory graph** | Romance tags are memory tags |
| **Bond/Disgust/Trust** | Romance modifies and is modified by these |
| **Faction system** | Cross-faction romances affect faction scores |
| **Guild system** | Guild alignment can enable or complicate romances |
| **Housing** | Romance rooms, visits, gifts |
| **Ending engine** | Romance state contributes to ending variants |
| **Companion AI** | Romanced companions have different combat/revive behavior |
| **Dialogue system** | Flirtation tone and romance-conditional lines |

> **Engineering note — what actually shipped, and where it differs from the schema above:** `packages/shared/src/lore/romance.ts` implements the Romance Score, the five sub-metrics, and (a simplified) 9-state status exactly as designed, but as an immutable-update module matching `memory.ts`'s own style (`withDelta`/`syncRomanceWithMemory` return new state rather than mutating), not the mutable JSON-event-log schema sketched above. Status is a *stored* field, not purely derived from score, specifically so Estranged/Lost/Betrayed can be "sticky" — a rupture has to be explicitly repaired (`attemptRepair`), not just outlasted by score drifting back up on its own. `syncRomanceWithMemory` reads the *existing* memory-tag system directly (the same tags `Room.handleDialogueChoice` was already writing for signature choices and death cascades) rather than a separate `romance_events` log — no new dialogue content needed for the six NPCs shipped so far, just new meaning read from choices already in the game. Flirting, gift-giving, and a repair action are real, working, server-validated messages (`flirt`/`giveGift`/`repairRomance` in `protocol.ts`, gated by the same proximity check `tryTalk` uses). Not shipped: starting attraction modifiers by origin/race/class (origins and the rest of the race roster don't have the hooks yet), jealousy/polyamory, intimacy scenes, faction/guild political consequences, Moon-Touched-path interaction, and campaign-chapter gating — all still target design only.

### 5.15 Content Authoring Guidelines for Writers

**Per NPC Romance Bible.** Every romanceable NPC needs: (1) Archetype (beloved leader, rival, inhuman, etc.); (2) Orientation (who they can be attracted to; usually "any"); (3) Starting modifiers (origin/race/faction preferences); (4) What attracts them (actions, values, dialogue tones); (5) What repels them (actions, values, betrayals); (6) Personal quest (required to reach Committed); (7) Courtship scenes (3–5 minimum); (8) Intimacy scenes (1–3, fade-to-black); (9) Rupture triggers (specific unforgivable actions); (10) Repair path (if any); (11) Ending variants (how romance affects finale); (12) Competing romances (who they are jealous of); (13) Unique gift preferences; (14) Public vs. secret romance preference.

**Universal Gift System.** Every NPC has gift preferences:

| Gift Category | Examples |
|---|---|
| **Food/drink** | Moon-apple pie, sea-wine, forge-stout |
| **Books/lore** | Forbidden histories, poems, star-charts |
| **Weapons/tools** | Custom-forged blade, artificer gadget, mourning bell |
| **Cosmetics** | Dyes, perfumes, hair ornaments |
| **Memorial items** | Names recovered, candles, flowers |
| **Faction tokens** | Order seal, Luminari cog, Choir bell |
| **Personal mementos** | Items from their past you recovered |

Gifts are meaningful only if matched. A bottle of forge-stout to Breca is excellent. The same bottle to Mira is confusing.

**Writing Romance Without Explicit Content.** Use metaphor and atmosphere (moonlight, storms, tides, bells, heat, silence); body language (hands, breath, proximity, eyes, trembling); emotional dialogue (fears, scars, hopes, what they have lost); fade-to-black before explicit content; afterglow scenes (waking, dressing, shared warmth, quiet jokes). Avoid explicit sexual descriptions, mechanical "sleep with NPC" options, and trophies or achievements for conquest.

### 5.16 Summary Table: Romance by NPC Category

| Category | Count | Depth | Example |
|---|---|---|---|
| Core companions (deep romance) | 6 | Full arc | Veyra, Lira, Cael, Nix, Sylvie, Spark Coil |
| Core companions (platonic) | 6 | Deep bond | Thorn, Unit 7, Echo, Bran, Dren, Solace |
| Tier 1 NPCs (60 core) | ~25–30 | Full/medium arc | Mira, Ilsa, Vesryn, Aldric, Breca, Kael, etc. |
| Tier 2 NPCs (40) | ~15–20 | Medium/short arc | Coal-Heart Kessa, Mara, Grist, etc. |
| Minor faction leaders (9) | 6–9 | Full arc | Cantor Veyle, etc. |
| Procedural NPCs | Many | Short/fling | Refugees, merchants, soldiers |
| Antagonists | ~5–8 | Full but toxic | Vex, Pyra, Thorne, Hollow-Singer, Netta |
| Spirits/constructs | ~3–5 | Variable | Brine, Astrolabe, The Selenian |

**Total romanceable NPCs at launch: 80–120 named characters**, plus procedural.

### 5.17 Implementation Priority

- **Phase 1: Core Companion Romances** — Veyra, Lira, Cael, Nix, Sylvie, Spark Coil full arcs.
- **Phase 2: Major NPC Romances** — Mira, Ilsa, Vesryn, Aldric, Breca, Kael, Thorne, Netta, Vex, etc.
- **Phase 3: Minor Faction Romances** — Cantor Veyle, Argent Vigil knight, Tide-Caller, etc.
- **Phase 4: Expanded Roster** — Tier 2 NPCs, antagonists, spirits/constructs.
- **Phase 5: Procedural** — Generated NPC romance framework.

> **Note on names above:** this section's worked examples (Veyra, Lira, Cael, Nix, Sylvie, Spark Coil, Astrolabe, Rowan, and others) come from an earlier planning pass and don't all correspond to NPCs that exist in the shipped roster today — the real roster (`packages/shared/src/lore/npc.ts`) uses different names for its 60 core characters and 4 companions (Bran Fieldhand, Thorn Ash-Debt, Solace Stillwater, Nix Fray). The shipped romance slice (see the engineering note in 5.14) is grounded in real, existing NPCs and their real, existing signature-choice tags rather than these placeholder names — future phases should either reconcile this roster mismatch or treat these as aspirational character concepts still to be authored.

The universal romance system makes *The Moon Above Our World* feel like a world where love is as dangerous and consequential as war. It rewards empathy, punishes betrayal, and ensures that no two players have the same emotional journey.

---

## 6. The 30 Origins

Origins are now **modular and mixable.** A player chooses:

1. **Primary Origin** (their core background)
2. **Secondary Origin Trait** (one additional influence)
3. **Origin Flaw** (one complication that opens unique dialogue)

This creates **30 × 30 × 10 = 9,000 possible origin combinations**, but in practice many are grouped into archetypes.

### 6.1 The 30 Primary Origins

| # | Origin | Region | Faction Lean | Race Compatibility |
|---|---|---|---|---|
| 1 | **Threadhold Farmer** | Threadhold | Independent | Any |
| 2 | **Ashmire Soldier** | Ashmire | Chainwright | Any |
| 3 | **Sunken Llyr Sailor** | Sunken Llyr | Independent | Any |
| 4 | **Spirechain Scholar** | Spirechain | Luminari | Any |
| 5 | **Mourncrown Exorcist** | Mourncrown | Pale Choir | Any |
| 6 | **Frayedge Outcast** | Frayedge | Independent/Pale Choir | Often Voidtouched, Riftborn, Ashren |
| 7 | **Luminari Artificer** | Ashmire/Spirechain | Luminari | Any, often Sylphra, Brakkan, Golemkin |
| 8 | **Pale Choir Mourner** | Mourncrown/Threadhold | Pale Choir | Any, often Duskwight, Lumineth, Ashren |
| 9 | **Chainwright Ward-keep** | Threadhold/Spirechain | Chainwright | Any, often Vaelari, Sylphra, Khurruk |
| 10 | **Traveling Merchant** | Any | Independent | Any |
| 11 | **Khurruk Clan Warrior** | Ashmire highlands | Independent/Chainwright | Khurruk |
| 12 | **Sylphra Fallen Noble** | Spirechain (disgraced) | Independent/Luminari | Sylphra |
| 13 | **Duskwight Shadow-Walker** | Mourncrown | Pale Choir | Duskwight |
| 14 | **Khenu Tide-Priest** | Sunken Llyr | Pale Choir/Independent | Khenu, Lyranni |
| 15 | **Brakkan Deepdelver** | Ashmire mines | Independent/Luminari | Brakkan |
| 16 | **Fennori Orchard-Blesser** | Threadhold | Pale Choir/Independent | Fennori |
| 17 | **Lyranni Pearl-Diver** | Sunken Llyr | Independent | Lyranni |
| 18 | **Lumineth Diaspora Child** | Any (Selenian refugee) | Pale Choir/Independent | Lumineth |
| 19 | **Threadborn Experiment** | Spirechain lab | Luminari | Threadborn |
| 20 | **Ashren Returned** | Any (died and came back) | Pale Choir | Ashren |
| 21 | **Golemkin Awakened** | Ashmire forge | Independent/Luminari | Golemkin |
| 22 | **Voidtouched Oracle** | Frayedge/Mourncrown | Pale Choir/Independent | Voidtouched |
| 23 | **Riftborn Survivor** | Frayedge | Independent | Riftborn |
| 24 | **The Bound Pilgrim** | Any | Chainwright/Pale Choir | The Bound |
| 25 | **Blacktide Smuggler** | Sunken Llyr | Independent/Blacktide | Any |
| 26 | **Ashforged Mercenary** | Ashmire | Independent/Ashforged | Any |
| 27 | **Silent College Acolyte** | Spirechain | Independent/Silent College | Any |
| 28 | **Mournstride Clan Orphan** | Mourncrown | Independent/Mournstride | Any |
| 29 | **Frayedge Healer** | Frayedge | Pale Choir/Frayedge Covenant | Any |
| 30 | **Sky-Touched Courier** | Spirechain/Threadhold | Independent | Any |

### 6.2 Secondary Origin Traits

Choose one additional influence:

| Category | Examples |
|---|---|
| **Faction childhood** | Raised by Chainwrights, Luminari orphans, Choir foundling |
| **Family trade** | Blacksmith, sailor, mortician, diplomat, thief |
| **Trauma** | Orphan of shardfall, survivor of erasure, former slave, war refugee |
| **Blessing/curse** | Born under eclipse, touched by Voidborn, carries a dead twin's name |
| **Training** | Trained by monks, smugglers, soldiers, artificers, exorcists |
| **Secret** | Illegitimate noble, hidden Selenian blood, undercover agent |

### 6.3 Origin Flaws

Choose one complication:

| Flaw | Effect |
|---|---|
| **Wanted** | A faction wants you for a past crime; bounty hunters appear |
| **Debt** | Owes money to Ashforged or Blacktide; affects Thorn/Netta |
| **Cursed Name** | Your true name is known to the Voidborn; whispers worse |
| **Fading Memory** | Family eroded by the moon; personal quest to remember them |
| **Faction Deserter** | Left a faction; harder to rejoin, unique dialogue |
| **Moon-Touched since birth** | More whispers, more powers, more fear from NPCs |
| **Machine-bound** | Golemkin/artificer flaw: emotional disconnect, repair needs |
| **Prophetic fits** | Random visions, sometimes helpful, sometimes disabling |
| **Blood Feud** | A clan or family wants you dead |
| **Silent Oath** | Bound to a secret promise that conflicts with later choices |

### 6.4 How Origins Mix with Race and Faction

**Example character:**

- **Race:** Lumineth
- **Primary Origin:** Pale Choir Mourner
- **Secondary Trait:** Hidden Selenian blood
- **Origin Flaw:** Cursed name
- **Faction:** Luminari Covenant

**Resulting unique dialogue:**
- Lumineth NPCs recognize you as kin.
- Pale Choir NPCs trust your grief-work.
- Luminari NPCs are fascinated by your Selenian blood.
- The Voidborn whisper your true name in dangerous zones.
- You can romance The Selenian with unique understanding.
- Other Luminari question why a Lumineth mourns the moon they want to exploit.

---

## 7. Campaign Revision: 8 Chapters with Races, Factions, Origins

The existing chapter structure still works, but each chapter now has **more conditional complexity.**

### 7.1 Chapter 0 — Prologue by Race + Origin

Each race/origin combination gets a unique **5–10 minute prologue beat** before converging on the Threadlight Fair.

**Example: Lumineth Pale Choir Mourner**
> You are ringing bells in a small Threadhold shrine when the sky tears. Your people remember Selen. You do not need to be told what is happening. The shard falls, and you die knowing you failed to warn them.

**Example: Khurruk Ashmire Soldier**
> You are patrolling the forges when the thread-ward screams. You do not run from danger. You run toward the village to form a shield-wall. Your commander is already dead when you arrive.

**Example: Golemkin Luminari Artificer**
> You are testing a resonance amplifier in a Spirechain lab when it achieves consciousness for three seconds and screams. Then the real sky screams back. You are the only one who understands both sounds.

### 7.2 Faction Recruitment in Chapter 1

Recruiters now react to your **race + origin + current faction leaning**:

| NPC Recruiter | Special Reaction Examples |
|---|---|
| Thorne (Chainwright) | Dismissive of Frayedge outcasts; respectful of soldiers and scholars; suspicious of Lumineth and Ashren |
| Perrin (Luminari) | Excited by Golemkin, Threadborn, and Artificer origins; wary of Mourners and Exorcists |
| Mira (Pale Choir) | Warm to Mourners, Exorcists, Duskwight, Lumineth, Ashren; cold to soldiers and merchants |
| Bran (Independent) | Trusts farmers, sailors, outcasts; skeptical of nobles and scholars |

### 7.3 Guild and Double-Agent Content in Chapters 2–7

Each chapter contains **one optional guild mission** if you are in a cross-faction guild:

| Chapter | Guild Mission Example |
|---|---|
| 2 | Steal a druidic spirit sample for your Luminari-affiliated guild while publicly helping the Pale Choir |
| 3 | Sabotage a rival guild's claim on a war machine |
| 4 | Smuggle Selenian artifacts for your Blacktide-affiliated guild |
| 5 | Protect or erase a clan name based on your guild's Mournstride alignment |
| 6 | Plant false evidence in the Spirechain trial to benefit your guild |
| 7 | Defect with Frayedge sanctuary secrets or expose the guild as a mole |

### 7.4 Romance and Race in Campaign

Certain chapters have **race-specific romance opportunities:**

| Chapter | Race-Specific Romance Beat |
|---|---|
| 2 | Lumineth can comfort the Briarwraith as a "forgotten cousin" |
| 3 | Khurruk can bond with Forge-Mother Breca over forge-honor |
| 4 | Lyranni can offer the drowned a true sea-burial |
| 5 | Duskwight can perform a clan rite that deeply moves Thane Corvin |
| 6 | Sylphra can use noble etiquette to blackmail Thorne in a way he respects |
| 7 | Voidtouched can hear the Hollowed's whispers clearly, unlocking parley |
| 8 | The Bound can speak directly to the Whisperer without Lunar Resonance |

---

## 8. Visual World Redesign: Grimdark Beauty

### 8.1 Regional Visual Identity

| Region | Grimdark Element | Beautiful Element |
|---|---|---|
| **Threadhold** | Quarantine camps, occupation banners, mutated orchards | Moon-apple glow, lantern festivals, river mists |
| **Ashmire** | Slave-pits, war-machine graveyards, lung-scarring smog | Brass forges at night, molten rivers, Khurruk clan halls |
| **Sunken Llyr** | Drowned cities, ghost fleets, erasure-tides | Bioluminescent fjords, aurora storms, coral spires |
| **Mourncrown** | Barrow-mazes, Hollowed processions, eternal twilight | Heather highlands, clan stone-circles, aurora-lit cairns |
| **Spirechain** | Inquisition cells, censorship pyres, political prisons | Sky-cities, stained-glass telescopes, cable-car constellations |
| **Frayedge** | Reality-tears, quarantine camps, void-scars | Refugee gardens, hidden shrines, aurora-warped sunsets |
| **Moonthread** | Corpses of anchor-keepers, thread-quakes, falling moon-fragments | The road to the moon itself, crystallized starlight |

### 8.2 Race Visual Variety

- **Vaelari:** Like humans but with thread-burn patterns on skin near major cities.
- **Khurruk:** Massive, brutalist armor, forge-ash tattoos, ceremonial jaw-cuffs.
- **Sylphra:** High collars, star-maps embroidered on cloaks, cold beauty.
- **Duskwight:** Bone jewelry, clan-paint, eyes like dying stars.
- **Khenu:** Practical wraps, tide-bells, claw-blessed weapons.
- **Brakkan:** Gem-encrusted beards, riveted industrial garb, magma-resistant cloaks.
- **Fennori:** Bright colors defying the grim world, oversized coats, harvest crowns.
- **Lyranni:** Scaled armor from shed skin, pearl-thread hair, gill-masks as fashion.
- **Lumineth:** Mourning silks, silver skin, faintly glowing veins, always slightly too beautiful.
- **Threadborn:** Translucent skin showing lunar organs, hair that moves in no wind.
- **Ashren:** Funeral wraps, old wounds honored with silver leaf, hollow eyes.
- **Golemkin:** Customized chassis, engraved plates, soul-lamps in the chest.
- **Voidtouched:** Shadow-clinging cloaks, void-crystal growths, eyes like empty mirrors.
- **Riftborn:** Patched asymmetry, extra sensory organs, survival gear.
- **The Bound:** Inhuman proportions, floating halo-sigils, no mouths, hands with too many joints.

> **Engineering note:** the client's avatars (`packages/client/src/scene/avatars.ts`) are stylized low-poly toon-shaded humanoids built procedurally, deliberately with no hand-authored art assets — that's a core pillar of this project ("beautiful without needing an art team"). Giving 16 races genuinely distinct silhouettes (tusks, gill-slits, floating sigils, extra limbs) is real new geometry-building work per race, not a reskin; it's achievable within the existing procedural-low-poly approach but is its own significant scope, separate from the mechanical race system.

---

## 9. Monster and Enemy Race Design

### 9.1 The Hollowed Visual Spectrum

The Hollowed are not generic zombies. They are categorized by **what they forgot:**

| Hollowed Type | What They Forgot | Appearance |
|---|---|---|
| **Nameless** | Their own name | Faceless, smooth skin, numbers carved by others |
| **Kinless** | Their family | Hands fused together as if holding someone no longer there |
| **Placeless** | Their home | Body maps onto local architecture, becoming part of buildings |
| **Faithless** | Their god | Melted religious symbols, weeping black ichor |
| **Timeless** | When they lived | Multiple ages visible on one body |
| **Loveless** | Who they loved | Chest cavity hollowed into a heart-shaped void |

### 9.2 Voidborn Hierarchy

| Tier | Name | Appearance | Threat |
|---|---|---|---|
| **Whisper** | Eater of idle thoughts | Invisible; induces paranoia | Harassment |
| **Drifter** | Eater of names | Shadow with too many eyes | Low–Medium |
| **Gulf** | Eater of places | Hole in space shaped like a person | Medium–High |
| **Unmaker** | Eater of causality | Towering fractal of broken time | Raid boss |
| **The Unnamed God** | Eater of meaning | Cannot be perceived directly | Expansion boss |

### 9.3 Enemy Faction Units

| Faction | Basic Unit | Elite Unit | Boss Archetype |
|---|---|---|---|
| Chainwright | Thread-Soldier | Houndmaster | High Chainwright Inquisitor |
| Luminari | Shard-Trooper | Pyromancer | Lunar Engine Core |
| Pale Choir | Mourner-Guard | Dirgesinger | Hierophant of Dusk |
| Ashforged | Mercenary | Bounty Captain | Contract Broker |
| Blacktide | Raider | Kraken-Caller | Pirate Lord |
| Shardsingers | Harmonist | Resonance Shaper | Cantor Prime |

---

## 10. Companion and NPC Roster Expansion

With 16 playable races, 30 origins, and 12 factions, the existing 60 NPC roster becomes the **core humanoid cast.** This scope needs:

- **60+ core NPCs** (existing) — Vaelari/Sylphra/Duskwight/Human-likes
- **30+ race-specific NPCs** — leaders, merchants, companions of each playable race
- **20+ monster/NPC race representatives** — Skrii ambassadors, Moss-Whale shepherds, etc.
- **12+ faction representatives per faction** — 3 majors + 9 minors = 144 faction NPCs
- **Hundreds of procedural NPCs** — generated with race, origin, faction, memory

**Total target:** 300+ named NPCs at launch, plus procedural populations.

---

## 11. Implementation Priority for This New Scope

### Phase 1: Foundation (Months 1–3)

| Task | Output |
|---|---|
| Finalize 16 playable races | Race docs, visual concepts, passive/skill design |
| Finalize 9 minor factions | Faction identity, leaders, vendors, story roles |
| Finalize 30 origins + mixable system | Origin docs, combination rules |
| Revise tone guide | Grimdark + beauty art bible |
| Design universal romance system | Romance score, states, loss conditions |
| Design cross-faction guild system | Guild alignment, double-agent mechanics |

### Phase 2: Content (Months 4–12)

| Task | Output |
|---|---|
| Race-specific prologue beats (16) | Chapter 0 variants |
| Origin-specific content (30 primary × secondary × flaw) | Modular dialogue variants |
| 9 minor faction questlines | Faction content |
| Revised 60 core NPCs for race/faction reactions | Updated bibles |
| Romance arcs for all core NPCs | Scene-by-scene design |
| Guild double-agent questline | Full quest chain |
| Monster/enemy race design | Bestiary |

### Phase 3: Campaign Integration (Months 13–24)

| Task | Output |
|---|---|
| Rewrite 8 chapters with race/faction/origin/romance branches | Full campaign bible |
| World boss/dungeon integration | Boss dialogue, mechanics tied to choices |
| Guild war and espionage systems | PvP/guild systems |
| Full NPC roster | 300+ named NPCs |
| Playtesting all combinations | Iteration |

---

## 12. Key Systems That Need Engineering Updates

| System | Update Needed |
|---|---|
| **Race system** | Character creation, racial passives, body types, armor scaling |
| **Faction system** | Expand from 3 to 12 reputation tracks |
| **Guild system** | Cross-faction membership, alignment, double-agent tracking |
| **Romance system** | Romance score separate from bond, loss/repair mechanics |
| **Origin system** | Modular primary/secondary/flaw combination |
| **NPC generation** | Procedural NPCs with race/origin/faction |
| **Monster bestiary** | New enemy races, Hollowed variants, Voidborn hierarchy |
| **Dialogue condition engine** | Must handle race + origin + faction + romance + guild alignment |

---

## 13. Summary of the New Design

| Element | New Scope |
|---|---|
| Playable races | 16 core + 8 unlockable |
| NPC/monster races | 20+ named, hundreds procedural |
| Major factions | 3 |
| Minor factions | 9 |
| Origins | 30 primary + 30 secondary traits + 10 flaws |
| Guilds | Cross-faction, alignment, double-agent mechanics |
| Romance | Any named NPC; fragile, can be lost |
| Tone | Warhammer 40K grimdark + luminous beauty |
| Campaign | 8 chapters with race/faction/origin/romance/guild branches |
| NPC roster target | 300+ named |

---

## 14. The Minor Faction Bible

The nine powers that exist in the cracks between the Chainwrights, Luminari, and Pale Choir. Zealots, mercenaries, cultists, scholars, and survivors, each with their own dark beauty and terrible purpose.

### Core Rules

1. **Players can hold reputation with all 12 factions** (3 major + 9 minor) simultaneously.
2. **Major faction allegiance** determines who you fight for in the big war.
3. **Minor faction allegiance** determines your access to unique gear, storylines, guild options, and romance paths.
4. **Betrayal is tracked separately** for each minor faction; some will hunt you, others will bargain.
5. **Guilds can align with a minor faction**, allowing cross-faction players to share a cause.
6. **Minor factions shift the world map** — their control of regions changes events, vendors, and ambient NPC behavior.

### Reputation Tiers

| Tier | Score | Effect |
|---|---|---|
| **Exalted** | +80–100 | Unique companion/recruitment, master vendor, hidden quests |
| **Trusted** | +40–79 | Discounts, special recipes, faction events |
| **Friendly** | +10–39 | Basic access, ambient dialogue improves |
| **Neutral** | -9–9 | No special treatment |
| **Suspicious** | -39–-10 | Higher prices, hostile ambient dialogue |
| **Hostile** | -79–-40 | Attacked on sight in their territory |
| **Hunted** | -100–-80 | Bounty hunters, assassination quests against you |

### 14.1 The Ashforged Company

> *"We don't believe in your moon, your thread, or your dead. We believe in contracts, gold, and the silence that follows a clean kill."*

**Identity.** The Ashforged are the largest mercenary company in Aethon — a standing army of sellswords, debt-slaves, deserters, and professionals who sell violence to whoever can pay. They are legally neutral, politically amoral, and spiritually hollow. To them, the war over Selen is just another long contract with very good margins.

**Origins.** Founded during the Age of Cinders by a Brakkan warlord named **Ashka the Unforged**, who believed soldiers should own their labor like any craftsman. The Company has outlived kingdoms, absorbed defeated armies, and written its contracts in blood-ink. Their headquarters is a mobile fortress called **The Anvil**, which migrates between Ashmire and the Frayedge depending on the season.

**Organization**

| Rank | Role |
|---|---|
| **The Creditor** | Grand leader; holds the master ledger of all debts |
| **Bond-Brokers** | Regional commanders who negotiate contracts |
| **Wardens** | Enforcers who hunt deserters and debtors |
| **Iron-Signs** | Veteran mercenaries |
| **Ash-Dregs** | New recruits, often debtors working off obligations |
| **The Ledger-Scribes** | Bureaucrats who record every kill, payment, and debt |

**Race Makeup.** Any race can join. Khurruk and Brakkan dominate the heavy companies; Vaelari and Sylphra fill officer roles; Ashren are sometimes hired as "fear troops"; Golemkin are purchased as mobile siege platforms.

**Visual Identity.** Colors: charcoal grey, rust red, brass. Armor: patchwork plate layered over practical leathers, stamped with the ash-mark. Banners: a broken anvil on a blood-red field. Weapons: brutal, functional, often modified with moon-iron for anti-Hollowed work.

**Territory.** The Anvil (mobile fortress); Ashmire contract halls; Frayedge recruitment tents; borderland waystations between regions.

**Relationship to Major Factions:** Chainwrights — tense business partners (the Order pays well but demands obedience the Ashforged hate). Luminari — excellent clients (premium rates for "specimen retrieval" and siege work). Pale Choir — disgusted by the Choir's fatalism (dead men can't pay debts).

**Relationship to Other Minors:** Blacktide Armada — rivalry over smuggling routes, occasional alliance against the Luminari. Emberwrights — workers sometimes sell muscle to the Company, officers look down on them. Silent College — the Company buys information, the College disapproves but takes the coin.

**Gaining reputation:** complete mercenary contracts; turn in bounties; hire Ashforged companions (Thorn Ash-Debt, Dren Cold-Coin); sell prisoners or enemies to Bond-Brokers; betray a sanctuary or village for payment.

**Losing reputation:** break a contract; free an Ashforged debtor; kill a Bond-Broker; refuse to pay debts; publicly mock the Company's honor.

**Signature Conflict — "The Debt That Binds":** a personal questline where the Company claims you owe them from before the game began (a debt you may not remember). Pay it, fight it, expose the forged contract, or take over the ledger yourself.

**Unique Rewards:** armor skins (Ashforged mercenary plate, Bond-Broker longcoat), weapon skins (sellsword blade, debt-collector's maul), titles ("Iron-Sign," "The Creditor's Fist," "Debt Paid in Blood"), recipes (contract-ink scribe recipes, anti-Hollowed ammunition), companions (Thorn Ash-Debt, Dren Cold-Coin, Ashka the Unforged's heir), mounts (war-boar, armored pack-golem).

**Key NPCs:** The Creditor (unseen leader, communicates only through scribes); Viceroy Korr (Bond-Broker for Ashmire contracts); Thorn Ash-Debt (Iron-Sign, potential companion); Dren Cold-Coin (independent contractor, potential companion); Ledger-Scribe Yorn (keeps your debt record, can be bribed or blackmailed).

**Romance Hook:** Viceroy Korr is romanceable if you prove to be a profitable and ruthless partner — transactional at first, genuine if you consistently keep contracts.

**Guild Alignment:** Ashforged-aligned guilds can take contracts from any major faction, ideal for cross-faction groups; enemy-faction members are expected to fight whoever the contract says, including their own faction; double agents can steal contracts for their real faction.

**Seasonal Arcs:** Season 2 — the Ashforged bid to claim the Cinder King's remains as salvage. Season 8 — in a tyrant ending they become the tyrant's enforcers; in an Independent ending, a private military beholden to no one.

### 14.2 The Tide-Callers

> *"The sea does not forget. The drowned do not forgive. We speak for both."*

**Identity.** A loose confederation of sea-priests, spirit-shamans, smugglers, and drowned-memory keepers centered in Sunken Llyr. They believe the lunar tides are Selen's breath and that the drowned dead must be honored, not exploited.

**Origins.** Before the Binding, the Tide-Callers were the priesthood of a sea-goddess called **Llyrenna** (believed to be a Selenian city or entity). After the moon was chained, their goddess "fell into the sea," and the Tide-Callers became her funeral attendants, preserving her songs for centuries.

**Organization:** The Deepsinger (high priest/priestess who communes with the drowned); Tidecallers (regional spirit-guides like Oren); Net-Wrights (smugglers and sailors); Drowned Choir (those who died and returned with knowledge); Kelp-Wardens (guardians of underwater sacred sites); Storm-Barkers (battle-shamans who call down tide-surge).

**Race Makeup.** Lyranni, Khenu, and Lumineth dominate. Some Ashren join after being drowned and returned. Brakkan work as deep-miners of sacred kelp.

**Visual Identity.** Deep blue, kelp green, drowned silver, bioluminescent white; layered scales, driftwood totems, nets hung with shells and bones; a wave curling around a bell; harpoons, tide-blessed staves, coral-edged blades.

**Territory.** Sunken Llyr fjords and tidal caves; the Drowned Choir grottos; smuggler coves; underwater sacred sites.

**Relationship to Major Factions:** Chainwrights — hostile (blockades and quarantines desecrate the sea). Luminari — mortal enemies (underwater mining is grave-robbing). Pale Choir — natural allies, sometimes doctrinally opposed (the Choir wants to let Selen die; the Tide-Callers want to preserve what fell from it).

**Relationship to Other Minors:** Blacktide Armada — uneasy alliance (smugglers need sea-blessings, Tide-Callers need ships). Silent College — exchange knowledge of pre-Binding history. Frayedge Covenant — sympathetic to the Moon-Touched, share healing rites.

**Gaining reputation:** respect drowned sites; help raise or lay to rest the drowned city; protect Selenian underwater ruins; smuggle refugees by sea; learn and perform tide-rites.

**Losing reputation:** mine or loot underwater ruins; kill drowned spirits; work with the Luminari underwater programs; pollute sacred waters.

**Signature Conflict — "The Drowned City of Llyrenna":** the central Chapter 4 choice. The Tide-Callers want the city to sleep; the Luminari want to raise it; the Chainwrights want to seal it.

**Unique Rewards:** armor skins (kelp-warden mail, Deepsinger robes), weapon skins (harpoon rifles, coral staves, tide-bells), titles ("Deepsinger," "Net-Wright," "Friend of the Drowned"), recipes (water-breathing potions, tidal food, drowned-spirit runes), companions (Tidecaller Oren, Brine if named, Tide-Crone Yeva), mounts (giant sea-beetle, luminous jellyfish glider).

**Key NPCs:** Tidecaller Oren (spirit-guide, potential companion); Tide-Crone Yeva (oldest Deepsinger, teaches final rites); Brine (drowned memory, potential ally if named); Mara Pearl-Diver (independent diver with Tide-Caller sympathies); Old Finn (lighthouse keeper and sea-blessed ally).

**Romance Hook:** Brine can be romanced if you recover their name and help them exist between life and death — melancholic, fading in and out of reality.

**Guild Alignment:** water-breathing and tide-surge bonuses; cross-faction members must protect sacred sites or lose standing; double agents can sell sacred-site locations to the Luminari or Chainwrights.

**Seasonal Arcs:** Season 4 — a pilgrimage as the moon drifts. Season 6 — helping integrate Selenian refugees from the sea.

### 14.3 The Emberwrights

> *"The forge made the chains that bound the moon. We will unmake them, and make something better."*

**Identity.** A worker-guild and revolutionary movement within Ashmire — part labor union, part anarcho-industrial cult, part militia. They believe the forges that built the Moonthread should belong to the people who work them.

**Origins.** Founded by a Brakkan furnace-worker named **Gremma Coal-Heart**, who led a strike that stopped the Age of Cinders war machine for three days and was crucified on her own furnace door. The Emberwrights grew from her martyrdom.

**Organization:** The Forge-Council (elected leadership); Coal-Hearts (martyrs' descendants, spiritual leaders); Hammer-Sisters/Hammer-Brothers (militant organizers); Grease-Wrights (engineers and saboteurs); Ash-Daughters (medics and counselors); The Unshod (new recruits).

**Race Makeup.** Brakkan and Khurruk majority; Vaelari workers common; Golemkin sometimes join as "liberated machines"; Lumineth and Duskwight rare but valued organizers.

**Visual Identity.** Forge-orange, soot-black, copper; practical work gear reinforced with scrap plate, tool belts, smoke-wraps; a raised hammer wreathed in embers; mining picks, forge-hammers, repurposed industrial tools.

**Territory.** Ashmire lower forges; hidden foundries beneath the slag heaps; worker tenements; seasonal strike camps.

**Relationship to Major Factions:** Chainwrights — bitter class enemies. Luminari — complicated (offer technology and jobs but exploit labor). Pale Choir — respected for honoring the dead, but their fatalism worries revolutionaries.

**Relationship to Other Minors:** Ashforged Company — sometimes hire Emberwright muscle, despise their officer class. Argent Vigil — potential reformist allies. Silent College — share forbidden histories of worker uprisings.

**Gaining reputation:** support worker ownership of forges; sabotage oppressive factory operations; arm the workers independently; help injured or indebted laborers; recruit Golemkin and machines as free laborers.

**Losing reputation:** arm the Chainwrights or Luminari exclusively; destroy worker tenements; crush strikes; use slave labor.

**Signature Conflict — "The Forge Belongs to the Fire":** the Chapter 3 choice about Breca's forges — convert to tools, give to a faction, arm the workers, or burn everything.

**Unique Rewards:** armor skins (forge-sister leather, worker-militia plate), weapon skins (sledgehammer mace, industrial sawblade), titles ("Coal-Heart," "Hammer-Sister," "Friend of the Fire"), recipes (worker's feast, anti-fatigue tonic, scrap-golem parts), companion (Gremma's granddaughter, a militant hammer-sister), mounts (furnace-goat, steam-powered lift-platform).

**Key NPCs:** Forge-Mother Breca (official forge-lord, ally or enemy); Slag the Forgemaster (master smith, sympathetic to workers); Pyra Emberhand (Luminari agent often opposed to Emberwrights); Coal-Heart Kessa (militant organizer, potential companion); Grease-Wright Tom (saboteur, sells forbidden machine knowledge).

**Romance Hook:** Coal-Heart Kessa, romanceable if you consistently side with worker power — passionate, ideological, occasionally explosive.

**Guild Alignment:** forge-speed bonuses and scrap-crafting access; cross-faction members must support worker causes; double agents can sabotage worker uprisings from within.

**Seasonal Arcs:** Season 2 — claiming the Cinder King's machines for the workers. Season 8 — a resistance forge, or the state's armory.

### 14.4 The Blacktide Armada

> *"The sea belongs to no king, no priest, and no moon. It belongs to whoever can hold it."*

**Identity.** A confederation of pirates, smugglers, free sailors, and coastal outcasts who control the unofficial sea lanes of Aethon — not a nation but a fleet, bound by maritime law older than the Binding.

**Origins.** Began as a mutiny against a Chainwright naval blockade during the Age of Fracture. The mutineers scuttled their officers over a moon-coral reef and declared themselves free. Any ship that rejects land-law may fly the Blacktide flag.

**Organization:** The Drowned Council (captains' council, meets on a ship graveyard); Captains (command individual ships); First Hooks (first mates and enforcers); Tide-Rats (smugglers and shore agents); Siren-Binders (shamans negotiating with drowned spirits); The Salt-Blessed (those who walked the sea floor and returned).

**Race Makeup.** Lyranni and Khenu dominate; any coastal race joins; Fennori as ship cooks and traders; Lumineth sometimes sheltered by captains; Golemkin serve as living anchors and dive-suits.

**Visual Identity.** Black, sea-foam green, barnacle white, gold from plunder; patchwork naval leather, kraken-shell pauldrons, tricorn hats, breath-masks; a kraken on a black wave; cutlasses, boarding axes, harpoons, blunderbusses.

**Territory.** The Drowned Council ship graveyard; Sunken Llyr smuggler coves; hidden harbors along every coast; the Blacktide-controlled lighthouse network.

**Relationship to Major Factions:** Chainwrights — at war (blockades are the enemy). Luminari — business when profitable, enemies when they try to control the sea. Pale Choir — tolerated (the Choir does not tax the dead).

**Relationship to Other Minors:** Tide-Callers — sacred allies and smuggling partners. Ashforged Company — rival mercenaries, sometimes hire each other. Silent College — buy and sell forbidden books.

**Gaining reputation:** smuggle goods past blockades; sink Chainwright naval vessels; rescue refugees by sea; help Captain Netta or Captain Sera; recover drowned treasures.

**Losing reputation:** work with the Chainwright navy; steal from Blacktide ships; betray a captain; refuse to pay the "tide-tax."

**Signature Conflict — "The Lighthouse War":** a Chapter 4 guild/PvP arc where the Blacktide tries to seize coastal lighthouses from the Chainwrights and Luminari.

**Unique Rewards:** armor skins (captain's coat, kraken-shell plate, smuggler's leather), weapon skins (boarding axe, harpoon rifle, blunderbuss), titles ("Salt-Blessed," "First Hook," "Kraken-Called"), recipes (smuggler's rum, underwater explosives, pirate feast), companions (Captain Netta Blacktide, Captain Sera Voss), mounts (giant crab, ghost-ship skiff, flying fish glider).

**Key NPCs:** Captain Netta Blacktide (ruthless pirate captain, rival to Sera); Captain Sera Voss (Luminari privateer who may defect); First Hook Maris (enforcer of the Drowned Council); The Salt-Blessed Three (oracles who speak from the sea floor); Old Finn (lighthouse keeper and Blacktide sympathizer).

**Romance Hook:** Captain Netta Blacktide, romanceable if you prove ruthless enough to be her equal and kind enough to surprise her.

**Guild Alignment:** smuggling contracts and naval PvP missions; cross-faction members raid their own faction's shipping lanes; double agents can inform the Chainwright navy about Blacktide movements.

**Seasonal Arcs:** Season 4 — the lighthouse war. Season 6 — ferrying Selenian refugees, charging what the market will bear.

### 14.5 The Silent College

> *"The Binding was not salvation. It was a crime. We have the proof, and we are not allowed to read it."*

**Identity.** A conspiracy of scholars, archivists, rogue priests, and truth-seekers dedicated to recovering and preserving the real history of Aethon and Selen, operating in secret because the Chainwrights burn libraries, the Luminari weaponize knowledge, and the Pale Choir sometimes prefers myth to evidence.

**Origins.** Began as a formal college in Spirechain three centuries ago. The Chainwrights ordered it silent after it published evidence that the Binding killed billions on Selen. Its members went underground.

**Organization:** The Archivist Prime (leader, identity unknown); Keepers (guardians of hidden libraries); Cipher-Singers (bards who encode history in verse); Skin-Scholars (bear forbidden knowledge as tattoos); Dust-Runners (couriers who move books between safehouses); Novices (students like Tarn).

**Race Makeup.** Sylphra, Vaelari, and Lumineth dominate; Brakkan and Fennori as preservation engineers; The Bound sometimes join as living archives; Duskwight exorcists contribute spirit-memories.

**Visual Identity.** Ink-black, parchment white, seal-wax red; scholarly robes reinforced for travel, book-belts, reading lenses, tattooed arms; an open book with a finger pressed to lips; quill-daggers, weighted scroll-cases, cipher-wands.

**Territory.** Hidden libraries in every major city; the Warden of Secrets' archive; Spirechain under-archives; tattoo parlors that are actually safehouses.

**Relationship to Major Factions:** Chainwrights — mortal enemies. Luminari — allied for technology, opposed when truth threatens progress. Pale Choir — allied in remembering the dead, but sometimes prefers symbolic truth to literal truth.

**Relationship to Other Minors:** Argent Vigil — share intelligence on Chainwright war crimes. Tide-Callers — exchange pre-Binding sea lore. Mournstride Clans — record clan histories and secret names.

**Gaining reputation:** recover forbidden books and artifacts; publish suppressed truths; protect scholars from persecution; decipher ancient languages; spread knowledge rather than hoarding it.

**Losing reputation:** burn or sell books to the Chainwrights; censor truth for political convenience; kill a Keeper; use knowledge purely for power.

**Signature Conflict — "The Truth of the Binding":** the Chapter 6 trial and Novice Tarn's documents.

**Unique Rewards:** armor skins (cipher-singer robes, skin-scholar wraps), weapon skins (quill-dagger, book-bludgeon, lens-staff), titles ("Keeper," "Skin-Scholar," "The Unsilenced"), recipes (lore-ink recipes, decryption tools, hidden-knowledge foods), companions (Veyra Moon-Scribe, Novice Tarn, Archon-Scribe Velis), mounts (floating archive-shelf, ink-cloud serpent).

**Key NPCs:** Archon-Scribe Velis (knowledge-merchant with College ties); Novice Tarn (young scholar with proof of the Binding's crime); Veyra Moon-Scribe (wandering historian, potential companion); Brother Ink (Pale Choir chronicler, uneasy College ally); The Warden of Secrets (guardian of the deepest archive).

**Romance Hook:** Veyra Moon-Scribe, romanceable through shared truth-seeking, deepened by helping publish Tarn's documents and surviving the consequences together.

**Guild Alignment:** lore-discounts, cipher abilities, hidden quest access; cross-faction members must help recover or protect knowledge, even from their own faction; double agents can feed the College secrets from their faction.

**Seasonal Arcs:** Season 3 — the Hollow Court trial tests the College's influence. Season 5 — Voidborn eat names; the College fights to preserve identity itself.

### 14.6 The Mournstride Clans

> *"We do not fear death. We fear being forgotten. Strike our names from the stone, and we will strike you from the world."*

**Identity.** The highland warrior-poets of Mourncrown, bound by honor, grief, and the duty of remembrance — a confederation of extended families sharing ancestral halls, barrow-mazes, and a culture that treats poetry as law.

**Origins.** Descended from the old kingdoms that ruled Mourncrown before the Chainwrights annexed the lowlands. They retreated to the highlands and built their culture around **memorial warfare** — every grievance recorded in verse, every debt sung until paid.

**Organization:** Thane (clan chief); Skald (poet-lawyer who records and judges grievances); Reaver (elite warrior); Barrow-Keeper (guardian of ancestral dead); Grief-Mother/Grief-Father (counselor and rite-leader); Blood-Child (young warrior seeking a name-deed).

**Race Makeup.** Duskwight majority; Khurruk and Vaelari clans exist; Lumineth sometimes adopted for their mourning arts; Khenu mountain clans at the edges.

**Visual Identity.** Charcoal, heather purple, bone white, blood red; layered mail, fur cloaks, clan torcs, death-masks for formal occasions; a cairn of stones beneath a crescent moon; claymores, war-picks, ancestral blades, recitation staffs.

**Territory.** Highland clan halls; barrow-mazes; cairn fields; Mourncrown ancestral valleys.

**Relationship to Major Factions:** Chainwrights — occupiers of the lowlands, ancient enemies. Luminari — desecrators of the dead, sometimes attacked on sight. Pale Choir — honored guests and spiritual cousins.

**Relationship to Other Minors:** Silent College — allow recording of clan histories. Frayedge Covenant — sympathetic to outcasts, sometimes shelter Moon-Touched. Ashforged Company — despised as honorless sellswords.

**Gaining reputation:** defend clan halls; help perform rites for the dead; restore forgotten names; honor duel traditions; protect ancestral sites from desecration.

**Losing reputation:** desecrate barrows; betray a clan chief; use clan dead as weapons; show cowardice in a formal duel.

**Signature Conflict — "Thane Corvin's Hall":** the Chapter 5 choice — defend, evacuate, betray, or challenge for leadership.

**Unique Rewards:** armor skins (Reaver mail, skald robes, thane's torc), weapon skins (claymore, war-pick, ancestral blade), titles ("Skald-Friend," "Blood-Child," "Cairn-Born"), recipes (rage mead, death-masks, clan feast), companions (Cael the Rimed Tongue, Thane Corvin, Skald Varn), mounts (highland elk, raven-familiar, ghost-horse).

**Key NPCs:** Thane Corvin (clan chief, pivotal Chapter 5 choice); Cael the Rimed Tongue (exorcist-poet, potential companion); Skald Varn (wandering saga-keeper); Lady Maren of the Last House (lowland noble with clan blood); Sir Yorick the Forgotten (Hollowed hero of old).

**Romance Hook:** Cael the Rimed Tongue, romanceable if you help him lay his sister's ghost to rest — poetic, grief-tinged, loyal.

**Guild Alignment:** honor-duel mechanics and ancestral-boon buffs; cross-faction members must participate in clan rites; double agents can betray clan positions to the Chainwrights.

**Seasonal Arcs:** Season 5 — Voidborn eat clan names; the clans launch a memorial crusade. Season 8 — guerrilla resistance in the highlands in tyrant endings.

### 14.7 The Frayedge Covenant

> *"They call us the forgotten. We call ourselves the future. The moon touched us first."*

**Identity.** A sanctuary movement for the Moon-Touched, the Hollowed-adjacent, and all who have been erased by the war over Selen — protectors, healers, smugglers, and sometimes terrorists, who believe the Moon-Touched are not cursed but evolved.

**Origins.** Began when Warden Kael, a Chainwright captain, deserted after being ordered to burn a Moon-Touched orphanage. He gathered the survivors in the Frayedge and built a refuge that has grown into a network of hidden hospitals, tunnels, and safe houses.

**Organization:** The Warden (leader and protector); Shelter-Mothers/Shelter-Fathers (care for refugees and the Moon-Touched); Tunnel-Rats (smugglers who move people through secret ways); Hollow-Speakers (communicate with the Hollowed); Resonance-Healers (treat lunar corruption); The Remembered (Moon-Touched who kept their names and minds).

**Race Makeup.** Any race can be Moon-Touched; Riftborn, Voidtouched, Ashren, Threadborn, and Lumineth overrepresented; Vaelari and Fennori make up the common-folk refugees.

**Visual Identity.** Grey, soft blue, refugee patchwork, moon-pale accents; practical travel clothes, hidden weapons, medical satchels, lunar ward patches; a hand holding a thread that is also a ladder; concealed blades, resonant staves, non-lethal hollow-calming tools.

**Territory.** Frayedge sanctuary and tunnels; hidden safe houses in every city; Sister Wren's cellar network in Threadhold; underground clinics.

**Relationship to Major Factions:** Chainwrights — persecutors who hunt Moon-Touched. Luminari — experimenters who want to harvest the Moon-Touched. Pale Choir — complicated allies (protect them but sometimes treat them as already dead).

**Relationship to Other Minors:** Tide-Callers — share healing rites for the drowned-adjacent. Mournstride Clans — sometimes shelter Moon-Touched in highland valleys. Shardsingers — debate whether Moon-Touched should sing with the moon or be cured.

**Gaining reputation:** protect Moon-Touched refugees; cure or stabilize lunar corruption humanely; smuggle people to safety; defend the Frayedge sanctuary; refuse to hand Moon-Touched to the major factions.

**Losing reputation:** hand Moon-Touched to Chainwrights or Luminari; experiment on the Moon-Touched; betray a sanctuary location; call the Hollowed "monsters" in front of Covenant members.

**Signature Conflict — "The Sanctuary Raid":** Chapter 7 — defend, evacuate, betray, or lead the raid.

**Unique Rewards:** armor skins (shelter-mother coat, tunnel-rat gear, resonance-healer wraps), weapon skins (calming bell-staff, lunar ward shield), titles ("Shelter-Friend," "Remembered," "Tunnel-Rat"), recipes (lunar salves, anti-corruption tonics, hollow-calming incense), companions (Warden Kael, Nix Fray, Solace Stillwater, Echo-Who-Was), mounts (refugee mule, hollow-touched wolf, gliding thread-cape).

**Key NPCs:** Warden Kael (leader, potential companion); Solace Stillwater (pacifist healer, potential companion); Nix Fray (urchin, potential companion); Echo-Who-Was (recovering Hollowed, potential companion); Hollow-Singer (leader of Hollowed commune, antagonist or ally); Sylvie the Wrong-Eyed (prophet, potential companion).

**Romance Hook:** Warden Kael, romanceable if you consistently protect the vulnerable and refuse to abandon the sanctuary — gentle, burdened, built on shared responsibility.

**Guild Alignment:** sanctuary fast-travel, lunar resistance buffs, smuggling contracts; cross-faction members must protect Moon-Touched, even from their own faction; double agents can reveal sanctuary locations to the Chainwrights or Luminari.

**Seasonal Arcs:** Season 5 — Voidborn target Moon-Touched names. Seasons 7–8 — central to the Hollow Door and endgame.

### 14.8 The Shardsingers

> *"The moon is not dead. It is singing. We are learning the words."*

**Identity.** A cult, an art movement, and a scientific curiosity, believing Moonshards are not debris but **notes** — fragments of a song Selen is trying to sing across the Moonthread. Attuning to shard harmonics can heal wounds, change memories, grow impossible gardens, and occasionally erase the singer.

**Origins.** Founded by a blind Lumineth musician named **Cantor Veyle**, who heard the first shardfall as music rather than catastrophe, and gathered outcasts, artists, the Moon-Touched, and desperate scholars who wanted to believe the moon was still alive.

**Organization:** Cantor Prime (leader; currently Cantor Veyle); Harmonists (musicians and resonance-workers); Resonance-Shapers (physically reshape shard-energy); The Remembered Choir (Hollowed who retained musical memory); Tune-Deaf (new initiates who cannot yet hear the song); The Erased Verse (Shardsingers who sang too much and forgot themselves).

**Race Makeup.** Lumineth, Threadborn, and Voidtouched are drawn naturally; artists and broken people of any race join; Golemkin are fascinated by "the music of consciousness."

**Visual Identity.** Iridescent crystal, sound-wave patterns, rainbow fractures against grey robes; robes with hanging shard-chimes, ear-wraps, pulsing resonant tattoos; a crescent moon made of musical staff lines; chime-staves, tuning-fork blades, crystal-stringed instruments.

**Territory.** The Resonant Reaches (Season 1 zone); shardfall craters across Aethon; underground concert halls; mobile camps following lunar harmonics.

**Relationship to Major Factions:** Chainwrights — hostile (lunatics destabilizing the thread). Luminari — fascinated and predatory (want to study and weaponize them). Pale Choir — sympathetic but wary (the Choir honors the dead; Shardsingers try to wake them).

**Relationship to Other Minors:** Frayedge Covenant — share Moon-Touched membership, debate cure vs. song. Silent College — exchange theories about Selenian language. Emberwrights — Shardsingers sometimes provide resonant tools to worker crafters.

**Gaining reputation:** listen to shard harmonics; protect Shardsinger camps; help perform resonant healing; recover lost songs from ruins; allow them to sing in your territory.

**Losing reputation:** destroy shard-chimes; hand Shardsingers to the Luminari or Chainwrights; mock their music; use shard-song to harm others.

**Signature Conflict — "The Lullaby":** Season 1 arc — let the Shardsingers complete their song, stop them, or broker a controlled performance; the song can heal the moon or erase millions of memories.

**Unique Rewards:** armor skins (harmonic robes, resonance-shaper wraps), weapon skins (chime-staff, tuning-fork sword, crystal lyre), titles ("Harmonist," "Tune-Deaf No More," "Cantor's Voice"), recipes (resonance potions, harmonic food, memory-easing tonics), companion (Cantor Veyle, a Remembered Choir member), mounts (shard-chime floating platform, song-bird swarm).

**Key NPCs:** Cantor Veyle (founder and Cantor Prime); The Remembered Choir (Hollowed musicians who sing with the moon); Resonance-Shaper Kael (can modify player gear harmonics); Tune-Deaf Joss (new initiate, comic/tragic potential).

**Romance Hook:** Cantor Veyle, romanceable if you help her complete the Lullaby or protect her from those who want to silence her — ethereal, dangerous, may end with one of you forgetting the other.

**Guild Alignment:** resonance buffs and shard-tuning crafting; cross-faction members must attend shard-sings and protect camps; double agents can steal harmonic research for the Luminari.

**Seasonal Arcs:** Season 1 — the Shardsingers are the central faction. Season 7 — their music becomes crucial for opening or calming the Hollow Door.

### 14.9 The Argent Vigil

> *"The Order is not the thread. The thread is not cruelty. We will save the Binding from the binders."*

**Identity.** A reformist splinter of the Chainwright Order, believing the Moonthread must be maintained but that Aldric Vane's regime has become corrupt, cruel, and spiritually bankrupt — seeking to reform the Order from within, or replace it with a more humane binding.

**Origins.** Founded by **Castellan Yora** and a group of officers who refused to participate in the erasure of Lornhollow village years ago. They operate secretly within the Chainwright hierarchy, hiding sympathizers, falsifying reports, and waiting for a chance to move against Aldric.

**Organization:** The Silver Warden (hidden leader, suspected to be Yora); Vigil-Knights (reformist officers and soldiers); Thread-Shepherds (chaplains who preach humane binding); The White Ledger (bureaucrats who document Order war crimes); Shield-Bearers (frontline protectors of civilians); The Penitent (former Hounds who defected after atrocities).

**Race Makeup.** Vaelari, Sylphra, Khurruk, and Brakkan; some Lumineth join after being sheltered by sympathetic officers; any race can believe in reform.

**Visual Identity.** Chainwright silver and white with **blue sashes** for vigilance/purity; Chainwright plate modified with vigil symbols, hidden blue linings; the Chainwright star with a broken chain reforged into a shepherd's crook; standard military gear, often deliberately non-lethal modifications.

**Territory.** Hidden safehouses within Chainwright territory; reformed outposts on the border; Spirechain embassy cells; Ashmire barracks with secret sympathizers.

**Relationship to Major Factions:** Chainwrights — internal enemy (want to reform or overthrow Aldric). Luminari — cautious potential ally against Aldric, opposed to exploitation. Pale Choir — respected opponents (the Vigil wants to bind, the Choir wants to sever).

**Relationship to Other Minors:** Silent College — share evidence of Chainwright crimes. Emberwrights — sometimes ally with reformist worker causes. Frayedge Covenant — secretly shelter Moon-Touched, cautious public stance.

**Gaining reputation:** protect civilians from Houndmaster Vex; expose Chainwright war crimes; support Castellan Yora; refuse atrocities while staying in the Order; help defectors escape.

**Losing reputation:** help Aldric Vane commit or cover up crimes; kill Vigil members; massacre Moon-Touched; pretend to reform while strengthening the old Order.

**Signature Conflict — "The Silver Schism":** a Chapter 6/7 arc where the Vigil attempts to overthrow or reform the Chainwrights.

**Unique Rewards:** armor skins (Vigil-knight plate, silver warden cloak), weapon skins (reforged chain-sword, shepherd's crook mace), titles ("Vigil-Knight," "Shield-Bearer," "The Silver Warden"), recipes (non-lethal binding traps, humanitarian ward recipes), companions (Castellan Yora, Vigil-Knight Aldra), mounts (white warhound, silver-thread banner-steed).

**Key NPCs:** Castellan Yora (Vigil founder, potential companion); Thread-Shepherd Olin (moral voice of the movement); Vigil-Knight Aldra (warrior who protects defectors); The White Ledger (anonymous recorder of crimes); Houndmaster Vex (the Vigil's primary antagonist within the Order).

**Romance Hook:** Castellan Yora, romanceable on the Chainwright path if you support reform and honor — professional, then tender, built on shared duty.

**Guild Alignment:** the natural cross-faction bridge for Chainwright players wanting to work with reformists from other factions; cross-faction members must oppose Aldric's cruelty; double agents can report Vigil cells to the old Order.

**Seasonal Arcs:** Season 3 — the Hollow Court trial can expose Aldric, strengthening the Vigil. Season 8 — the Vigil becomes the resistance in tyrant/Chainwright endings.

### 14.10 Cross-Faction Guilds and Minor Faction Alignment: Full Rules

**Choosing a Guild Faction Alignment.** At guild creation, the leader selects one: Neutral (no benefits or restrictions); Chainwright/Luminari/Pale Choir (major benefits and story conflicts); any of the 9 minors (minor benefits, more flexible membership); Independent (mercenary/contract-based play).

**Cross-Faction Member Mechanics:**

| Member Faction | Guild Alignment | Status |
|---|---|---|
| Same faction | Same major/minor | Full member, no complications |
| Same major, different minor | Minor-aligned guild | Suspect until they prove loyalty |
| Different major | Minor/Neutral guild | Double-agent opportunity |
| Different major | Enemy major guild | Hostile infiltration opportunity |

**Double-Agent Quests.** Every season, cross-faction members in enemy-aligned or minor-aligned guilds receive optional double-agent quests: intelligence theft (steal guild war plans for your real faction), sabotage (without being caught), recruitment (convince guild members to defect), false flag (frame another faction for a guild crime), deep cover (become trusted enough to reshape guild policy from within).

**Exposure and Consequences:**

| Exposure Level | Effect |
|---|---|
| **Suspicion** | Guild leader questions you; missions become harder |
| **Confirmed mole** | Ejected from guild; bounty placed on you |
| **Confessed defector** | Given chance to openly switch factions |
| **Master manipulator** | Guild remains unaware; unlocks "Architect of Nothing" ending path |

### 14.11 Minor Faction Rewards Summary Table

| Faction | Armor Theme | Weapon Theme | Unique Mount | Signature Title | Best For Players Who... |
|---|---|---|---|---|---|
| **Ashforged** | Mercenary plate | Sellsword blades | War-boar | "Iron-Sign" | Like contracts, violence, and moral ambiguity |
| **Tide-Callers** | Kelp-mail | Harpoons | Jellyfish glider | "Deepsinger" | Love the sea, spirits, and smuggling |
| **Emberwrights** | Worker-militia | Forge-hammers | Furnace-goat | "Coal-Heart" | Want worker revolution and industrial grit |
| **Blacktide** | Pirate coats | Cutlasses | Ghost-ship skiff | "Salt-Blessed" | Want freedom, piracy, and naval adventure |
| **Silent College** | Cipher-robes | Quill-daggers | Ink-cloud serpent | "Keeper" | Love lore, secrets, and forbidden knowledge |
| **Mournstride** | Reaver mail | Claymores | Ghost-horse | "Cairn-Born" | Value honor, poetry, and the dead |
| **Frayedge Covenant** | Refugee wraps | Bell-staves | Hollow-wolf | "Remembered" | Protect the vulnerable and outcasts |
| **Shardsingers** | Harmonic robes | Chime-staves | Song-bird swarm | "Harmonist" | Want mysticism, art, and cosmic mystery |
| **Argent Vigil** | Silver plate | Reforged chains | White warhound | "Vigil-Knight" | Want to reform evil from within |

### 14.12 Minor Faction Implementation Checklist

For each minor faction, content authors must produce: philosophy and history; organizational structure and ranks; visual identity document; territory and hangout locations; 3–5 key NPCs with full bibles; reputation gain/loss rules; signature conflict/questline; unique reward list; romance hook if applicable; guild alignment rules; relationship to other factions; seasonal arc integration; dialogue bundle for faction-aligned NPCs; dynamic event and world-state changes tied to faction power.

---

The nine minor factions make the world feel **lived-in, morally complex, and full of smaller loyalties** that complicate the three-way war. They also provide the perfect infrastructure for cross-faction guilds, double-agent roleplay, and universal romance conflict.
