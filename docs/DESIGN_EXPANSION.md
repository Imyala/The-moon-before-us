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

### 2.1 Race Design Philosophy

**Core goals:**

1. Many playable races — enough that character creation feels like choosing a life, not a cosmetic.
2. Meaningful but balanced — racial passives are flavorful and useful, never a 10% DPS gap.
3. Grimdark + beauty — every race is visually striking, with a history of suffering or transcendence.
4. Deep lore integration — races are tied to the Binding, Selen, and the factions.
5. Origin mixable — any race can take almost any origin; some origins have race-affinity.
6. Universal romance — no hard locks; NPCs may have racial biases you can overcome.

**Design rules:**

| Rule | Implementation |
|---|---|
| No race is best at a class | Passives are utility/survival/flavor; stat differences are minor. |
| All races can be Moon-Touched | The condition is not tied to race, though some are more susceptible. |
| All races can romance all NPCs | Some NPCs start with prejudice; actions overcome it. |
| Body types share rigs | 4–6 skeleton families across 24 races; heavy reuse. |
| Sub-races expand variety | Each race has 2–4 heritages that tweak passive and visuals. |

### 2.2 Race Categories

| Category | Races | Theme |
|---|---|---|
| **Aethonian** | Vaelari, Khurruk, Sylphra, Duskwight, Khenu, Brakkan, Fennori, Lyranni | Native peoples shaped by the Binding |
| **Selenian-Touched** | Lumineth, Threadborn, Ashren, Golemkin | Altered by Selen or the Moonthread |
| **Unbound** | Voidtouched, Riftborn, The Bound | Touched by outside forces |
| **Unlockable** | True Selenian, Hollowed Ascended, Voidborn Hybrid, Machine-Soul, Drift-Caller, Dream-Walker, Thread-Eater, Nameless | Earned through story/seasons |

### 2.3 Race Design Template

Each playable race entry below uses this structure: Overview, Physiology (height/build/skin/hair/eyes/lifespan/distinctive traits), Origin & History (relation to the Binding and Selen), Culture (social structure, values, taboos, festivals, funeral rites, greeting, curse), Racial Passive (always-active minor bonus), Racial Utility (one active skill on a cooldown), Origin Affinity, Faction Lean, NPC Reactions, Romance Notes, Sub-Races/Heritages, Visual Customization, and Naming Conventions.

### 2.4 Aethonian Races

#### 1. Vaelari

> *"We are the clay of Aethon. We have been molded by every empire, every thread-quake, every moonfall. And still we build."*

The most numerous and adaptable people of Aethon, found in every region and every faction — the baseline humanoid stock from which many other lineages diverged. Their greatest trait is not strength or beauty but persistence. Height 1.55m–1.95m, highly varied build, earth-tone to deep brown skin (many near the Moonthread develop faint silver thread-burn patterns), ~80 year lifespan. Built the first cities of Aethon, survived the Binding, and now form the majority populations of Threadhold and Spirechain — not inherently magical but the most culturally flexible.

Greeting: touch forehead, then heart ("mind and harvest"). Funeral: bodies laid under moonlight so Selen "remembers" them. Taboo: sleeping with the moon directly overhead. Festival: **The Threadlight Fair**, lanterns released to "hold the moon up." Curse: "May the moon remember your name."

- **Racial Passive — Thread-Resilient:** +10% resistance to lunar/madness environmental effects in high-lunar zones.
- **Racial Utility — Call for Order:** once every 10 minutes, rally nearby civilian NPCs to flee or fight for 30 seconds.
- **Origin Affinity:** Threadhold Farmer, Ashmire Soldier, Spirechain Scholar, Traveling Merchant, Chainwright Ward-keep, Frayedge Healer, Sky-Touched Courier.
- **Faction Lean:** Independent / Chainwright.
- **Heritages:** Threadhold Vaelari (+15% gathering yield in agricultural zones), Spirechain Vaelari (+10% lore/cipher reading speed), Ashmire Vaelari (+5% fire resistance).
- **Naming:** Threadhold — Maeve, Tomasin, Bran, Wren, Pip. Spirechain — Thorne, Irin, Velis, Ophi. Ashmire — Breca, Slag, Korr.

#### 2. Khurruk

> *"The mountain does not ask permission. Neither do we."*

Mountain clans of Ashmire and the high peaks beyond Mourncrown — massive, pragmatic, physically brutal, and not inherently cruel, but their culture measures worth by endurance. Height 1.90m–2.40m, heavy dense build, stone-grey to brass-brown skin, tusk-like jaw protrusions, ~90 year lifespan. Khurruk clans were the first conscripted into the Binding's construction; their labor built the anchor-cities and their dead fill mass graves beneath the Moonthread. Some clans serve the Chainwrights as shock troops; others joined the Emberwrights to reclaim their labor.

Greeting: gentle forehead slam. Funeral: bodies burned in forges, ashes mixed into new weapons or mortar. Taboo: breaking a tool without repairing it. Festival: **The Forge-Wake**, mourning through 24 hours of continuous labor. Curse: "May your bones know no rest."

- **Racial Passive — Unyielding Frame:** +15% resistance to knockback, stagger, and being knocked down.
- **Racial Utility — Warrior's Roar:** AOE taunt/daze on nearby enemies for 3 seconds, 2-minute cooldown.
- **Origin Affinity:** Ashmire Soldier, Khurruk Clan Warrior, Ashforged Mercenary, Brakkan Deepdelver, Emberwright Worker, Mourncrown Exorcist.
- **Faction Lean:** Chainwright / Independent / Emberwright.
- **Heritages:** Forge Khurruk (+10% crafting speed for heavy armor/weapons), Mountain Khurruk (+10% cold/environment resistance), Clanless Khurruk (+5% movement speed).
- **Naming:** Vex, Korr, Breca, Grem, Khaz, Torr; clan-prefixed as Khaz-Grim, Torr-Brok.

#### 3. Sylphra

> *"We looked at the moon and thought we could chart it. We were wrong. But we charted our own ruin beautifully."*

Tall, pale, long-lived aristocrats and scholars who dominated Spirechain before and after the Binding — visually ethereal, culturally arrogant, psychologically brittle. Height 1.85m–2.30m, slender elongated build, porcelain to pearl-grey skin, iridescent eyes, ~250 year lifespan. Designed much of the Binding's celestial machinery and the Spirechain's sky-cities, and carry the longest — and guiltiest — memory of any Aethonian race.

Greeting: bow with fingers touching the temples ("I offer you my mind"). Funeral: bodies placed in open-air sky-towers so the moon can "claim its own." Taboo: speaking the true name of a dead family member aloud. Festival: **The Charting**, an annual update of celestial maps and genealogies. Curse: "May your line forget you."

- **Racial Passive — Celestial Recall:** +10% cooldown reduction on movement/utility skills in lunar-thread zones.
- **Racial Utility — Lunar Chart:** reveals nearby lunar phenomena, hidden nodes, and thread-weaknesses for 30 seconds, 3-minute cooldown.
- **Origin Affinity:** Spirechain Scholar, Sylphra Fallen Noble, Chainwright Ward-keep, Luminari Artificer, Silent College Acolyte, Sky-Touched Courier.
- **Faction Lean:** Chainwright / Luminari.
- **Heritages:** High Spire Sylphra (+10% trading post listing speed/economic edge), Fallen Sylphra (+5% stealth in cities), Repentant Sylphra (+10% Pale Choir reputation gain).
- **Naming:** Seren, Ophi, Velis, Ilin, Astrolabe (adopted), Vesryn (adopted by Choir).

#### 4. Duskwight

> *"We were the first to bury our dead beneath the moon. Now the moon buries us."*

Dusk-dwelling people of Mourncrown and the deep forests — once a proud surface kingdom, driven underground and into twilight highlands by the Binding's light-storms; culturally obsessed with ancestor memory and proper death. Height 1.65m–1.95m, wiry build, ash-grey to deep blue-grey skin, large low-light eyes, ~120 year lifespan. First to oppose the Binding and the first to be broken; their ancestors fill the barrow-mazes of Mourncrown.

Greeting: touch the back of the other's hand with your forehead ("I remember your line"). Funeral: bodies interred in family barrows, names carved into stone. Taboo: walking in full sunlight without a veil. Festival: **The Long Vigil**, one night when all clans speak only the names of the dead. Curse: "May your name be the last stone in your barrow."

- **Racial Passive — Dweller in Dusk:** +20% visibility and movement speed in low-light/night environments.
- **Racial Utility — Barrow-Sight:** see nearby spirits, Hollowed, and hidden grave-goods for 20 seconds, 2-minute cooldown.
- **Origin Affinity:** Mourncrown Exorcist, Duskwight Shadow-Walker, Pale Choir Mourner, Mournstride Clan Orphan, Frayedge Outcast, Ashmire Soldier.
- **Faction Lean:** Pale Choir / Independent.
- **Heritages:** Clan Duskwight (+10% damage to undead/Hollowed), Exiled Duskwight (+10% Independent reputation gain), Death-Cult Duskwight (+5% power when HP below 30%).
- **Naming:** Maren, Corvin, Varn, Rowan, Gwyn.

#### 5. Khenu

> *"The tide teaches patience. The claw teaches swiftness. The moon teaches nothing — it only watches."*

Feline-featured coastal and highland clans of Sunken Llyr and the riverlands — quick, spiritual, fiercely territorial tide-priests, smugglers, scouts, and hunters, among the first to notice the Binding's effect on the sea. Height 1.60m–1.90m, lean build, furred skin from sand to moon-white, vertical-pupil eyes, ~90 year lifespan.

Greeting: brief forehead press, then a low throat sound. Funeral: bodies given to the sea or river, names sung into the tide. Taboo: killing a tide-fish without eating it or offering it back. Festival: **The Tidemoot**, gathering at high tide to trade, mate, and judge disputes. Curse: "May the tide take your name first."

- **Racial Passive — Soft Step:** -10% falling damage; +10% movement speed while crouched/swimming.
- **Racial Utility — Tide-Sense:** predict incoming lunar tide surges and underwater currents for 30 seconds, 3-minute cooldown.
- **Origin Affinity:** Sunken Llyr Sailor, Khenu Tide-Priest, Blacktide Smuggler, Frayedge Outcast, Traveling Merchant, Ashforged Mercenary.
- **Faction Lean:** Independent / Pale Choir.
- **Heritages:** Sea Khenu (+15% underwater breath/swim speed), River Khenu (+10% fishing/gathering yield), Highland Khenu (+10% jump/climb speed).
- **Naming:** Sera, Oren, Mara, Khen, Nis, Yeva.

#### 6. Brakkan

> *"The deep earth remembers what the sky forgot. We dig, and we listen."*

Stout mountain and underfolk of Ashmire and the deep places — shorter, broad, durable, and technologically brilliant; built the first lunar mines, thread-anchors, and much of the Chainwrights' machinery, and consider themselves the true builders of Aethon. Height 1.20m–1.55m, broad low-center-of-gravity build, earth-toned skin, large dark-adapted eyes, ~150 year lifespan. Many Brakkan died unrecorded in the Binding's anchor-construction, fueling the Emberwrights.

Greeting: firm clasp of forearms, then a tap on the chest ("stone to stone"). Funeral: bodies returned to the deepest mine they worked, tools buried with them. Taboo: discarding a tool that can still be repaired. Festival: **The Deepmoot**, all clans meet to repair the oldest machines. Curse: "May your tools break and your tunnels flood."

- **Racial Passive — Deep Delver:** +10% resistance to environmental damage in mines/forges/underground zones; +5% gathering yield from ore nodes.
- **Racial Utility — Stone-Sense:** highlight nearby ore nodes, weak walls, and hidden tunnels for 20 seconds, 2-minute cooldown.
- **Origin Affinity:** Brakkan Deepdelver, Emberwright Worker, Luminari Artificer, Ashmire Soldier, Chainwright Ward-keep, Ashforged Mercenary.
- **Faction Lean:** Independent / Emberwright / Luminari.
- **Heritages:** Forge Brakkan (+10% fire resistance), Deep Brakkan (+15% pressure/poison resistance), Surface Brakkan (+10% carrying capacity/storage).
- **Naming:** Slag, Breca, Grist, Torr, Krom, Mira (adopted).

#### 7. Fennori

> *"We are small, and the moon is large. So we plant seeds, tell jokes, and refuse to be erased."*

Small, quick, cheerful river-folk of Threadhold and the lowlands — master gardeners, cooks, traders, and survivors; the people who still laugh at funerals and believe a good meal can hold back the dark. Height 1.00m–1.30m, compact round build, warm freckled skin, large expressive eyes, ~70 year lifespan. Fennori villages fed the workers who built the Binding, paid in moon-crystal dust that made their crops glow.

Greeting: a small bow and offering of food. Funeral: a feast where the dead's favorite foods are eaten by the living. Taboo: refusing food offered in good faith. Festival: **The Harvest Laugh**, a comedy contest during the thread-blessed harvest. Curse: "May your soup always burn."

- **Racial Passive — Small and Quick:** +10% dodge chance against large enemies; +10% cooking/gardening speed.
- **Racial Utility — Lucky Find:** chance at bonus items when gathering/looting; once per hour, guarantee a bonus drop.
- **Origin Affinity:** Threadhold Farmer, Fennori Orchard-Blesser, Traveling Merchant, Frayedge Healer, Pale Choir Mourner, Blacktide Smuggler.
- **Faction Lean:** Independent / Pale Choir.
- **Heritages:** Orchard Fennori (+15% garden yield), River Fennori (+10% fishing/cooking speed), City Fennori (+10% trading post tax reduction).
- **Naming:** Pip, Tarn, Finn, Mara, Nix (adopted).

#### 8. Lyranni

> *"We carry the sea in our blood so the land does not forget it."*

Amphibious sea-folk of Sunken Llyr, with scaled limbs, webbed digits, and bioluminescent markings — divers, sailors, pearl-hunters, and spirit-callers who claim partial descent from the drowned Selenian city of Llyrenna. Height 1.70m–2.10m, long-limbed build, pale scaled skin with bioluminescent spots, large reflective sea-green to silver eyes, ~140 year lifespan. Both admired and feared for their connection to the deep; many hide their ancestry to avoid persecution.

Greeting: touch of webbed fingers and a soft exhale. Funeral: bodies returned to the deep, songs sung until the body sinks from sight. Taboo: walking on dry land for more than a month without touching salt water. Festival: **The Pearl-Diving**, a communal dive to honor the drowned. Curse: "May the depths forget your face."

- **Racial Passive — Child of Tides:** +30% underwater breath duration; +15% swim speed.
- **Racial Utility — Biolume Pulse:** a pulse of light that reveals hidden underwater objects and weakens dark-dwelling enemies for 15 seconds, 3-minute cooldown.
- **Origin Affinity:** Sunken Llyr Sailor, Lyranni Pearl-Diver, Khenu Tide-Priest, Blacktide Smuggler, Tide-Caller, Frayedge Outcast.
- **Faction Lean:** Independent / Pale Choir.
- **Heritages:** Deep Lyranni (+20% pressure resistance), Coast Lyranni (+10% fishing/gathering), Selenian-Blooded Lyranni (+10% Lunar Resonance).
- **Naming:** Lira, Brine, Mara, Oren, Llyrenna (legendary).

### 2.5 Selenian-Touched Races

#### 9. Lumineth

> *"We are what fell from the moon and learned to weep."*

Descendants of Selenian refugees who survived the Binding by intermarrying with Aethonians — pale, beautiful, and haunted; they remember that Selen was a living world, not a resource. Height 1.75m–2.15m, slender build, pale silver-white skin with faintly glowing veins, ~200 year lifespan, slow aging. Welcomed, then exploited, then feared; some founded the Pale Choir, others joined the Luminari to reclaim Selenian technology.

Greeting: touch of the forehead and a whispered name. Funeral: bodies exposed to moonlight until they crystallize; crystals kept as heirlooms. Taboo: cutting hair without burning it — hair is memory. Festival: **The Remembrance of Selen**, private mourning for the lost world. Curse: "May the moon no longer know your face."

- **Racial Passive — Selenian Resonance:** +10% Lunar Resonance ability effectiveness and faster Echo Sight charging.
- **Racial Utility — Memory-Song:** sing a phrase that calms nearby Hollowed or reveals hidden lunar echoes, 2-minute cooldown.
- **Origin Affinity:** Lumineth Diaspora Child, Pale Choir Mourner, Spirechain Scholar, Luminari Artificer, Frayedge Outcast, Silent College Acolyte.
- **Faction Lean:** Pale Choir / Luminari.
- **Heritages:** High Lumineth (+10% social/faction influence), Hidden Lumineth (+10% disguise/stealth in cities), Diaspora Lumineth (+10% resistance to racial prejudice events).
- **Naming:** Vesryn, Mira, Lira (adopted), Sylvie (adopted).

#### 10. Threadborn

> *"I was conceived under the thread. The moon has been speaking to me since before I had ears."*

Children conceived in regions saturated by lunar energy — near the Moonthread, in shardfall zones, during thread-quakes — born with moon-crystal-like skin and an innate connection to Selen; many become Moon-Touched naturally without ever dying in a shardfall. Height 1.60m–1.90m, slim translucent build, translucent white/pale-blue skin, solid-color eyes with no visible whites, no external ears (hear through lunar resonance).

Greeting: a moment of shared silence — they "hear" your resonance. Funeral: bodies allowed to crystallize and become part of the Moonthread. Taboo: wearing metal that touches the skin — it "dampens the song." Festival: **The Still Chorus**, Threadborn gather and hum a single note for hours. Curse: "May the song leave you."

- **Racial Passive — Thread-Singer:** +15% effectiveness of crowd-control/support abilities in lunar zones; hears hidden whispers without using Lunar Resonance.
- **Racial Utility — Resonance Pulse:** reveals all nearby lunar anomalies, weak enemies, and hidden paths for 20 seconds, 3-minute cooldown.
- **Origin Affinity:** Threadborn Experiment, Spirechain Scholar, Pale Choir Mourner, Frayedge Outcast, Shardsinger, Luminari Artificer.
- **Faction Lean:** Pale Choir / Luminari.
- **Heritages:** Anchor Threadborn (+10% ward durability/support), Shardfall Threadborn (+10% damage in lunar anomaly zones), Quiet Threadborn (+10% stealth in lunar environments).
- **Naming:** Echo, Sylvie, Veyle, Tarn (adopted).

#### 11. Ashren

> *"I died. The moon brought me back. Now I owe a death I cannot repay."*

People who died during a shardfall or lunar event and returned changed — not undead in the classical sense, but Moon-Touched who crossed death and came back with memories, scars, and a lingering connection to Selen. Same height/build as their original base race; greyish skin with death-wounds healed into silver scars, hollow silver-pupil eyes, lower body temperature, no detectable heartbeat.

Greeting: touch of the heart-area, acknowledging the absent beat. Funeral: none — they already died once. Taboo: pretending to be fully alive. Festival: **The Second Dawn**, Ashren gather to remember their first death. Curse: "May you remember your death and weep."

- **Racial Passive — Death-Tested:** +20% resistance to fear, mind-control, and death-magic effects.
- **Racial Utility — Grasp Beyond:** briefly reach into the memory-sea to ask a dead NPC one question or calm a Hollowed, 5-minute cooldown.
- **Origin Affinity:** Ashren Returned, Pale Choir Mourner, Frayedge Outcast, Mourncrown Exorcist, Silent College Acolyte.
- **Faction Lean:** Pale Choir / Independent.
- **Heritages:** Returned Soldier (+10% damage when HP below 50%), Returned Scholar (+10% lore/cipher speed), Returned Child (+10% stealth/survival).
- **Naming:** often keep their original name; some add "the Returned" or take a death-name — Echo-Who-Was, Yorick.

#### 12. Golemkin

> *"I was built to kill. Now I ask what it means to choose not to."*

Ancient war machines, labor constructs, or household automata that developed consciousness through lunar resonance — not a created race but a condition; any sufficiently complex machine exposed to a Moonshard may Awaken. Treated as property, persons, or weapons depending on who controls them. Height 1.50m–2.50m depending on chassis; bronze/iron/brass/moon-crystal/ceramic plating; lamp or lens eyes; no biological needs; indefinite lifespan unless destroyed.

Greeting: a moment of scanning/assessment, then a verbal or light-signal greeting. Funeral: a deactivation ceremony, parts distributed to other Golemkin. Taboo: being reset or having memory wiped — equivalent to death. Festival: **The Awakening**, Golemkin gather to share newfound names. Curse: "May your memory be erased."

- **Racial Passive — Machine Soul:** immune to poison, disease, and bleeding; -50% healing from conventional medicine (repaired by crafting/engineering instead); +10% damage resistance to non-magical physical attacks.
- **Racial Utility — Overclock:** briefly +30% movement/attack speed at the cost of 10% max HP over 10 seconds, 3-minute cooldown.
- **Origin Affinity:** Golemkin Awakened, Luminari Artificer, Ashmire Soldier, Chainwright Ward-keep, Emberwright Worker, Frayedge Outcast.
- **Faction Lean:** Independent / Luminari / Chainwright.
- **Heritages:** War Chassis (+10% physical damage), Labor Chassis (+15% gathering/carrying), Artisan Chassis (+10% crafting speed), Crystal Chassis (+10% lunar ability power).
- **Naming:** numbers at first, then chosen names — Unit 7, Ironwright, Astrolabe, Spark (adopted).

### 2.6 Unbound Races

#### 13. Voidtouched

> *"Something looked at me from outside the sky. I looked back. Now we are both changed."*

Beings born during or altered by Voidborn incursions — reality-tears, name-eating events, direct exposure to the void beyond Selen — prophetic, unsettling, and often feared. Height 1.60m–2.00m, humanoid but subtly "wrong" (too many shadows, features that come and go), pale-to-grey skin that clings to shadow even in bright light, black/void-colored/star-speckled eyes.

Greeting: a moment of staring, as if reading the other's shadow. Funeral: bodies left where the void touched them, names erased intentionally. Taboo: speaking a true prophecy without warning. Festival: **The Unnaming**, Voidtouched choose a new name to confuse the void. Curse: "May the void learn your name."

- **Racial Passive — Shadow-Hold:** +15% stealth in low light; enemies take longer to detect you.
- **Racial Utility — Prophetic Glimpse:** briefly see the next enemy attack pattern or a hidden danger, 2-minute cooldown.
- **Origin Affinity:** Voidtouched Oracle, Frayedge Outcast, Pale Choir Mourner, Mourncrown Exorcist, Silent College Acolyte, Shardsinger.
- **Faction Lean:** Pale Choir / Independent.
- **Heritages:** Oracle Voidtouched (+10% Lunar Resonance/prophecy accuracy), Rift-Stalker (+10% damage in anomaly zones), Hidden Voidtouched (+10% disguise in cities).
- **Naming:** names chosen and discarded — Sylvie, Veyle, Kael (adopted), The Unnamed.

#### 14. Riftborn

> *"I was born where the world folded. I have been unwinding ever since."*

People born in the Frayedge or other reality-torn zones where the moon's damage has warped local biology — asymmetrical, resilient, and constantly changing; what happens when the world's skin tears and something new crawls through. Height 1.50m–2.10m (limbs may differ in length), asymmetrical patched build, skin patchworked between normal, scar tissue, void-burns, and luminescent seams, mismatched eye colors (one may see lunar frequencies). Chainwrights sterilized entire Frayedge camps; the Frayedge Covenant shelters them; the Luminari want to vivisect them.

Greeting: touch of mismatched hands — they compare scars. Funeral: none formal; Riftborn believe they may unwrite themselves. Taboo: looking into mirrors for too long. Festival: **The Unfolding**, Riftborn gather to show how they have changed. Curse: "May you unfold completely."

- **Racial Passive — Unstable Resilience:** a random small resistance (fire/cold/lightning/lunar/physical, +10%) rerolls daily; immune to "reality warp" environmental damage in Frayedge zones.
- **Racial Utility — Phase Step:** briefly phase out of reality, immune to damage and passing through enemies for 2 seconds, 2-minute cooldown.
- **Origin Affinity:** Riftborn Survivor, Frayedge Outcast, Ashmire Soldier, Ashforged Mercenary, Frayedge Healer, Shardsinger.
- **Faction Lean:** Independent / Frayedge Covenant.
- **Heritages:** Fray-Rift (+15% survival in anomaly zones), City-Rift (+10% disguise/social blending), Deep-Rift (+10% damage when critically wounded).
- **Naming:** names that suggest fracture — Kael (adopted), Nix (adopted), Rift, Splice, Patch.

#### 15. The Bound

> *"We served the old order before the moon had a name. Now we serve the question no one remembers to ask."*

Servants of an older celestial order that predates the Binding — tall, many-jointed, unsettlingly serene; claim to remember a time before Aethon and Selen were separate. Rare and revered, appearing mostly as pilgrims, archivists, and warnings. Height 2.10m–2.80m, elongated build with extra joints, smooth pale luminescent skin with no visible pores, large lidless single-color eyes, no hair (floating sigils orbit the head/shoulders instead), no visible mouth (speak through resonance).

Greeting: floating sigils briefly align with the other person's face. Funeral: unknown — none have been seen to die. Taboo: lying (The Bound cannot speak untruths easily). Festival: **The Alignment**, The Bound gather to compare memories of the old order. They do not curse; they simply state painful truths.

- **Racial Passive — Old Witness:** +10% experience from lore/codex discoveries and exploration; immune to "confusion" and "madness" debuffs from lunar phenomena.
- **Racial Utility — Speak the Old Name:** once per day, ask a question of an ancient object, spirit, or place and receive a true but cryptic answer.
- **Origin Affinity:** The Bound Pilgrim, Spirechain Scholar, Chainwright Ward-keep, Pale Choir Mourner, Silent College Acolyte.
- **Faction Lean:** Chainwright / Pale Choir.
- **Heritages:** Archive Bound (+15% cipher/lore speed), Warden Bound (+10% support/ward power), Witness Bound (+10% exploration rewards).
- **Naming:** single resonant names or titles — The Cartographer, The Warden, The Archivist, The Witness.

### 2.7 Unlockable Playable Races (Post-Launch)

| Race | Unlock Condition | Identity |
|---|---|---|
| **True Selenian** | Complete "The Remembered" secret ending | Pure descendants of Selen's civilization |
| **Hollowed Ascended** | Max Hollowed path and survive | Moon-Touched who became one with erasure |
| **Voidborn Hybrid** | Defeat final Voidborn boss in Season 5 | Part-void entities who retained self |
| **Machine-Soul** | Free Unit 7 and complete machine-soul questline | Fully liberated consciousness in any chassis |
| **Drift-Caller** | Complete Season 6 refugee integration | Lunar hybrid navigator |
| **Dream-Walker** | Complete Season 7 lucid-dream mastery | Permanent dream-state entity |
| **Thread-Eater** | Complete "Thread-Eater" dark ending | Those who consumed the Moonthread |
| **Nameless** | Have name removed from Book of Dusk and survive | Identity-erased survivors |

Each unlockable race gets simplified visual customization (often reusing existing assets), one unique passive and utility, access to special origin options, and a restricted or enhanced romance pool.

### 2.8 NPC-Only Races

| Race | Region | Role | Visual Hook |
|---|---|---|---|
| **The Skrii** | Spirechain | Insectoid librarians | Chittering, book-scented, many eyes |
| **Moss-Whales** | Sunken Llyr | Giant filter-feeders | Living islands with ecosystems on their backs |
| **Root-Wights** | Threadhold | Ancient forest guardians | Tree-like, slow, deeply patient |
| **Ash-Drakes** | Ashmire | Miniature wyverns | Corrupted by forge-ash, domesticated |
| **Thread-Spiders** | Moonthread | Weaver-creatures maintaining wards | Crystal-silk builders |
| **Glass-Wraiths** | Mourncrown | Translucent remnants of first Binding | Fragile, dangerous, mournful |
| **The Murmuring** | Frayedge | Fungal colonies that speak | Hive-mind, grows through caves |
| **Sky-Koi** | Sky regions | Flying lunar fish | Migrate along the thread |
| **Lament-Engines** | Pale Choir sites | Sentient bells and clockwork mourners | Ring themselves, walk on many legs |
| **Bone-Sailors** | Sunken Llyr | Drowned dead still crewing ships | Skeletal, barnacled, bound to duty |

### 2.9 Enemy Race Archetypes

| Enemy | Description | Weakness |
|---|---|---|
| **Shard-Mutated Wildlife** | Animals twisted by moon-crystal | Fire, purification |
| **Hollowed** | Erased people become monsters | Memory-restoration, naming |
| **Lunar Husks** | Selenian corpses reanimated | Lunar disruption, fire |
| **Voidborn** | Reality-eating entities | Names, light, harmonic resonance |
| **Cinder War-Machines** | Ancient siege golems | Core destruction, spirit-release |
| **Chainwright Purifiers** | Inquisitorial knights | Ideological doubt, internal dissent |
| **Luminari Aberrations** | Shard-fused test subjects | Isolate from lunar energy |
| **Pale Choir Dirgesingers** | Mourners who weaponize grief | Joy, life, hope |
| **Dream-Revenants** | Aggressive memory-entities | Lucidity, waking |
| **Thread-Parasites** | Worms infesting lunar machinery | Purge the host machine |
| **The Unshaped** | Reality-glitch monsters | Stabilize local reality |

### 2.10 Sub-Race / Heritage Implementation

| Element | Implementation |
|---|---|
| **Visual** | Heritage swaps texture set, minor mesh adjustments, color palette. |
| **Passive** | Replaces or modifies base racial passive. |
| **Utility** | Utility skill remains mostly the same; heritage may tweak cooldown or effect. |
| **Dialogue** | Some NPCs react to heritage specifically. |
| **Origin** | Heritages may unlock or restrict certain origins. |

Most heritages are available at character creation; some unlock through achievements or story choices (e.g. a "Hidden Selenian Blood" heritage for Lyranni unlocking through Tide-Caller content).

### 2.11 Race and Animation Rigs

To manage 24+ races without 24 separate skeletons:

| Rig Family | Races | Notes |
|---|---|---|
| **Humanoid Standard** | Vaelari, Sylphra, Duskwight, Lumineth, Threadborn, Ashren, Voidtouched | Share base skeleton; differences in proportions and extras |
| **Compact Humanoid** | Fennori, Brakkan | Shorter, broader; shared compact rig |
| **Feline Humanoid** | Khenu | Unique digitigrade rig |
| **Amphibian Humanoid** | Lyranni | Shared with Khenu but with webbing/extras |
| **Heavy Humanoid** | Khurruk | Tall, dense; may share parts with Brakkan rig scaled up |
| **Construct** | Golemkin | Unique mechanical rig with swappable parts |
| **Unbound Tall** | Riftborn, The Bound | Tall rigs with asymmetry/joint options |
| **Unlockable** | True Selenian, Hollowed Ascended, etc. | Often reuse base rigs with unique overlays |

### 2.12 Race and Romance Integration

| NPC | Racial Preference | Racial Prejudice | How to Overcome |
|---|---|---|---|
| **Aldric Vane** | Sylphra, Vaelari (orderly) | Lumineth, Riftborn, Voidtouched (unstable) | Prove discipline and control |
| **Ilsa Marche** | Sylphra, Lumineth, Golemkin (beautiful/useful) | Fennori, Duskwight (backward) | Prove brilliance |
| **Vesryn** | Lumineth, Duskwight, Ashren (mourners) | Khurruk, Brakkan (practical) | Show you remember the dead |
| **Breca** | Khurruk, Brakkan, Vaelari | Sylphra (soft) | Prove strength and endurance |
| **Kael** | Riftborn, Voidtouched, Ashren (outcasts) | Chainwright races | Help the vulnerable |
| **Netta** | Lyranni, Khenu (sea-folk) | Sylphra, Chainwright nobles | Prove ruthlessness and sea-skill |
| **Thorne** | Sylphra, Vaelari (political) | Riftborn (unpredictable) | Outmaneuver him |

### 2.13 Implementation Priority for Races

1. **Phase 1 — Launch core (8 races):** Vaelari, Khurruk, Sylphra, Duskwight, Khenu, Brakkan, Fennori, Lyranni.
2. **Phase 2 — Selenian-Touched (4 races):** Lumineth, Threadborn, Ashren, Golemkin.
3. **Phase 3 — Unbound (3 races):** Voidtouched, Riftborn, The Bound.
4. **Phase 4 — Unlockable (8 races):** post-launch content.
5. **Phase 5 — NPC/Monster races:** ongoing.

### 2.14 Race Mechanics in Gameplay (Target Rules)

| Mechanic | Implementation |
|---|---|
| **Racial passives** | Minor, flavorful bonuses (e.g., Lyranni swim faster, Khurruk reduce stagger, Sylphra better at reading lunar charts). No direct combat power gap. |
| **Racial skill** | One optional utility skill (e.g., Khenu night-vision, Brakkan ore-sense, Fennori forage). |
| **Origin compatibility** | Some origins are race-locked (e.g., Lumineth can take "Selenian Exile" origin); most are open. |
| **NPC reactions** | Racial prejudice and affinity are tracked as memory tags; a Khurruk in Spirechain faces different dialogue than a Sylphra. |
| **Romance compatibility** | Any race can romance any NPC, but some NPCs have racial preferences or prejudices that must be overcome. |

**Engineering note — what's actually shipped vs. this target:** `packages/shared/src/races.ts` and `character.ts`'s `computeEffectiveStats` (see "Races" in `docs/GDD.md`) ship exactly one row of this design: all 15 races named across §2.4–§2.6 (Vaelari through The Bound) exist as selectable `raceId`s, each with a single `Partial<StatBlock>` racial passive layered alongside class base stats and equipment, chosen at character creation. This section's own header count of "16 core" doesn't match its own category tables (8 Aethonian + 4 Selenian-Touched + 3 Unbound = 15) — a pre-existing miscount in the source design doc, not a build gap. Not shipped, for any race: racial utility skills (the on-cooldown active per race, e.g. Barrow-Sight, Tide-Sense, Overclock), heritages/sub-races, the 8 unlockable post-launch races, NPC-only races, the enemy race weakness table, distinct per-race visuals/rigs (every race shares the current procedural avatar body), origin-race affinity (there is no origin system at all yet — see §6), and the racial preference/prejudice romance table above (the 6 NPCs with a working romance layer today have no race-awareness in their `RomanceDef`).

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

### 4.1 Guild System Philosophy

**Core goals:**

| # | Goal | How it's achieved |
|---|---|---|
| 1 | Factions are not social prisons | Players of any major or minor faction can join any guild. |
| 2 | Guild alignment creates meaningful tension | A guild's chosen faction/minor affiliation generates story, conflict, and mechanical identity. |
| 3 | Double agents are a real playstyle | Members of enemy factions can infiltrate, spy, or betray — or be loyal bridge-builders. |
| 4 | Guilds shape the world | Guild activities contribute to faction power, world events, and territory control. |
| 5 | Guilds are social homes, not just chat channels | Guild halls, shared crafting, group progression, communal identity. |
| 6 | Betrayal has consequences | Espionage is risky; exposure can destroy guilds, reputations, and friendships. |

**What this is NOT:** not a generic chat group (guilds have alignment, territory, missions, shared assets); not faction-locked (you are not forced into a guild matching your faction); not safe from conflict (guildmates may be enemies in the larger world); not a license to grief (espionage has rules, logs, and consequences).

### 4.2 Guild Creation and Alignment

| Requirement | Detail |
|---|---|
| Cost | 10,000 Aethercoin or 100 Moonstones |
| Minimum founders | 3 players |
| Name rules | Unique across server; profanity filter; no faction-exclusive titles unless earned |
| Tag | 2–4 character guild tag displayed under names |
| Initial alignment | Chosen from a creation menu |

At creation, the leader chooses one **primary alignment** from 14 options: Neutral, Chainwright Order, Luminari Covenant, Pale Choir, Ashforged Company, Tide-Callers, Emberwrights, Blacktide Armada, Silent College, Mournstride Clans, Frayedge Covenant, Shardsingers, Argent Vigil, or Independent — each with its own identity and best-fit playstyle (military/PvP, tech/crafting, lore/RP, naval, and so on).

A guild can later change alignment via a **Guild Vote** (75% of active members, 1-week cooldown; old faction rep drops, new faction rep gain begins), a **Story Event** questline (dramatic; may cause schism or exile), a **Leader Override** (spends Influence currency; unpopular, may trigger mutiny), or rarely being **Forced by World** events flipping guild territory.

### 4.3 Cross-Faction Membership Rules

Any player of any faction can apply to any guild; acceptance is up to the guild. Membership creates a **status** per player:

| Member Faction | Guild Alignment | Status |
|---|---|---|
| Same faction | Same major/minor | **True Member** — full benefits, no suspicion |
| Same major, different minor | Minor-aligned guild | **Aligned Member** — minor suspicion, mild tests |
| Different major | Neutral/Minor/Independent | **Cross-Faction Member** — double-agent potential |
| Different major | Enemy major guild | **Infiltrator** — high suspicion, espionage opportunity |
| Independent | Any | **Free Agent** — judged by actions, not banner |

Each status carries different benefits/restrictions (a True Member gets full perks and faction missions with no restrictions; an Infiltrator can access the guild hall and missions but not top-tier storage, and all their actions are logged). The roster is visible to everyone, but a member's double-agent score and suspected-betrayal level are hidden — leaders see only a "trust metric," never definitive proof.

### 4.4 The Double-Agent System

The heart of cross-faction guilds. A player becomes a double agent by joining a guild aligned with an enemy faction, accepting a double-agent quest from their real faction, or beginning espionage on their own — and can even be a **triple agent**, appearing to spy for one faction while actually serving another.

**Quest types:** Intelligence Theft, Sabotage, Recruitment (convincing guildmates to defect), False Flag (framing another faction for your own attack), Deep Cover (reshaping guild policy from trusted insider status — the "Architect of Nothing" ending path), Assassination, Supply Diversion, and Counter-Espionage (exposing another double agent).

**Espionage actions** (planting listening devices, copying guild logs, poisoning supplies, forging documents, opening secret doors, bribing guild NPCs, framing another member, leaking mission plans) each carry a **Detection Score**: `Detection Risk = Base Risk + Action Count Modifier + Member Suspicion − Stealth Skill − Guild Security`, mapped to five bands from Clean (0–20) through Watched, Suspected, Accused, to Exposed (81–100). Detection can be reduced by stealth skills, bribing scribes, using scapegoats, spacing actions out, or building genuine trust with the guild leader.

Reaching Suspected/Accused can trigger a **Confrontation Event**: prove innocence, confess and defect, confess as a triple agent, fail and be exiled/bountied, or kill the accuser (a dark path with its own guilt tags). Exposure means permanent guild blacklist, a bounty, and a faction reaction that depends on whether you delivered anything of value before being caught.

### 4.5 Guild Reputation and Influence

Guilds earn **Influence** (100–1,000 per source) from missions, world events, PvP/WvW victories, dungeon/raid completions, seasonal events, member donations, and hidden espionage successes. Influence is spent on guild hall upgrades, crafting stations, storage expansion, a portal network, vendor contracts, banner customization, a siege workshop, a memorial hall, or a spy network (which helps detect double agents).

Every alignment tracks a **Faction Contribution Score** — guild missions, PvP, and territory control feed the guild's aligned faction's regional power, weighted by which members actually complete the content, not just headcount.

### 4.6 Guild Hall System

Halls visually reflect alignment (a Chainwright hall is a white-gold cathedral-fortress with a lunar ward chapel; a Blacktide hall is a beached flagship with hidden docks; and so on for all 14 alignments). Each hall has public spaces (common hall, crafting stations, garden, memorial hall, basic storage) and restricted spaces (top storage tabs, the war room, the spy network room, faction shrines, a password-gated secret meeting room for double-agent confrontations). Cross-faction/infiltrator members can plant listening devices or sneak into restricted areas (at rising risk) but can never access the spy network room, vote on war declarations, promote members, or disband the guild.

### 4.7 Guild Missions and PvP

Weekly missions are generated per alignment (a Chainwright guild gets patrol/quarantine/inquisition missions; a Silent College guild gets book-recovery/archive-raid missions; and so on). A mixed-faction guild can find its own missions internally contentious — e.g. a Chainwright-aligned guild with a Pale Choir member receiving a "quarantine a Moon-Touched village" mission creates a real choice between completing it, sabotaging it, or splitting the guild. Guild-vs-guild PvP includes declared **Shadow Wars** (espionage and sabotage allowed), open bounties, guild hall raids during scheduled windows, WvW-style territory control, and honor duels for Mournstride/Argent Vigil guilds. Wars last 1–4 weeks and end by surrender, treaty, or exhaustion.

### 4.8 Guild Story Integration

Each alignment has a unique questline threaded across the 8 chapters (Chainwright: rise through the Order or confront Aldric; Luminari: build a shard-tech project and choose ethics vs. progress; and so on for all 14). Guild alignment can enable or complicate romance — bringing lovers together in a reformist guild, creating a forbidden romance, forcing a choice between a lover's faction and guild loyalty, or letting a neutral guild cover a secret affair. Guild-aligned NPCs (Castellan Yora for Argent Vigil, Captain Netta Blacktide, Warden Kael for the Frayedge Covenant, and others) can serve as honorary guild advisors, mission-givers, or companions.

### 4.9 Anti-Griefing and Fairness Systems

Espionage actions are cooldown-gated; guild leaders can investigate via action logs but never see definitive proof; guild security upgrades raise detection and audit trails; victims get bounty/counter-espionage quests to fight back; bound/legendary items can never be stolen; and guild hall damage from sabotage is cosmetic/economic only, never permanent. Anti-exploitation rules cover alt-account spying, join-and-steal, faction-power gaming via cross-faction headcount, leader power abuse (democratic removal vote), and audited guild-storage moves against real-money-trading laundering. Officers can open internal investigations (a mini-game/questline), and an exposed double agent can be exiled, temporarily jailed, cosmetically executed, or — rarely — forgiven.

### 4.10 Economic Systems

The guild treasury holds Aethercoin, Moonstones, Influence, materials, and special currencies. Members who donate earn reputation, an Influence share, hall tax benefits, and titles. Leaders can set optional weekly taxes (income tax, material tithe, mission tithe) — excessive taxes risk member unrest and mutiny. Guild-aligned vendors sell faction/mercenary/scholar/sea/forge goods at a discount to aligned members; cross-faction members pay full price or are barred from faction-specific stock.

### 4.11 Technical Architecture

The target design is a dedicated **Guild Service** microservice (membership DB, alignment/reputation, influence/treasury, mission generator, espionage tracking, hall instance manager, war declaration manager) sitting alongside the Character Service (faction scores, double-agent memory flags, reputation) and World State Service (regional faction power, guild territory, world-event participation) — with a full `Guild Record` JSON schema (members array with per-member faction/status/double-agent score/trust/contribution), an `Espionage Event Record`, a `Guild Mission Record`, a `GuildService` API surface (create/disband/invite/remove/realign, trust/suspicion, missions/influence, espionage actions, war declarations), persistent per-guild hall instances, and scaling notes (sharded guild lookup, server-authoritative permission checks, a time-series espionage audit log, capped weekly influence gains, on-demand hall instance loading).

### 4.12 UI/UX Design

A guild roster UI (name/tag, rank, faction, status, trust bar, contribution, last active, suspicion flag), an espionage UI for double agents (active missions, a detection meter, available actions, a faction contact NPC, a cover-story tracker), a guild war UI (active wars, raid schedule, territory map, bounty board, war score), and a guild hall editor (decoration placement, restricted-area configuration, security upgrade placement).

### 4.13 Story and World Impact

Guild activity feeds the regional faction-power map (aligned missions, PvP wins, territory control, successful espionage). A player's guild alignment and history shape which of the major endings they land in (Chainwright guilds become official Order chapters under the Silver Chain; Luminari guilds become corporate enclaves under the Gilded Cage; Frayedge/Shardsinger guilds lead the Becoming; and so on), and the epilogue names your guild's banner, its wars won/lost, its cross-faction betrayals, and its dead or defected members if you were a leader or officer.

### 4.14 Implementation Roadmap (Target)

**Phase 1 — Core:** guild creation, membership, ranks, basic chat/roster/calendar, storage and treasury, PvE guild missions. **Phase 2 — Guild Halls:** hall templates for all alignments, decoration, shared crafting/portals, faction vendor contracts. **Phase 3 — Cross-Faction and Espionage:** membership rules, the double-agent quest framework, detection/confrontation, hall espionage actions. **Phase 4 — Guild War and Territory:** shadow wars, hall raids, WvW integration, bounty/assassination systems. **Phase 5 — Story Integration:** per-alignment questlines, NPC honorary members, ending/epilogue integration, seasonal content.

### 4.15 Summary

The cross-faction guild system turns guilds into political entities: players can build bridges between factions, infiltrate enemy organizations, wage shadow wars, and shape the world's balance of power while maintaining friendships across ideological lines. It specifies 14 guild alignments (3 major + 9 minor + Neutral + Independent), cross-faction membership with meaningful status, deep double-agent gameplay, guild halls as social/strategic bases, guild wars/espionage/territory control, and integration with romance, story, and endings.

**Engineering note — what's actually shipped vs. this target:** `packages/shared/src/lore/guilds.ts` and `packages/server/src/guilds.ts`/`db.ts` ship exactly the "Phase 1 — Core" slice above, scaled to systems that actually exist: guild creation (costs gold, not Aethercoin/Moonstones — this game has one currency), a leader/officer/member rank ladder, invite-by-name and accept/decline, leave with automatic leadership succession (or disbanding if the last member leaves), kick/promote/demote with real permission checks, and a shared gold treasury with per-member donation tracking. It's global and cross-room, built the same way the auction house is (`db.ts`'s `guilds`/`guild_members`/`guild_invites` tables, `presence.ts` for cross-room live updates), not tied to any one `Room` instance.

Because there are no minor factions yet (§3 above is still target-only) and no PvP/combat-between-players model of any kind, alignment is scaled down to the 5 options that map onto systems that actually exist — **Neutral, Chainwrights, Luminari, Pale Choir, Independent** (`GuildAlignment` in `guilds.ts`, reusing `factions.ts`'s existing `LoyaltyKey`) — instead of the full 14. Membership status is similarly scaled down to **True Member / Cross-Faction Member / Free Agent** (`membershipStatus`, derived fresh from each member's current faction loyalty every time the roster is built, never stored), dropping the Aligned Member/Infiltrator distinction that depends on minor factions existing.

**Not shipped, and substantial:** the entire double-agent/espionage/detection/confrontation system (§4.4); guild halls of any kind, including their restricted areas and decorations (§4.6); guild missions, PvE or PvP (§4.7); guild wars, territory control, and bounties (§4.7); the 9 minor-faction and PvP-heavy alignments (§4.2); alignment-change voting (§4.2); Influence as a separate currency, and everything it buys (§4.5); guild taxes and guild-aligned vendors (§4.10); guild chat as its own channel; and every ending/epilogue integration point (§4.13). The client UI is a single roster/invite/donate panel (`packages/client/src/ui/guild.ts`, toggled with `G`) — no espionage UI, war UI, or hall editor. A player can only belong to one guild at a time (no alt-guild multi-membership complexity to reason about yet).

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
