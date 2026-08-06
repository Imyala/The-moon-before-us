# The Moon Above Our World — Game Design Document

## Vision

A coop action-RPG with an MMO *feel* — the moment-to-moment combat and character-building depth of Guild Wars 2 or WoW, the social ease of Fellowship, without the friction of scheduling raids or committing hours you don't have. You can:

- **Play entirely solo**, at your own pace, in the same living world.
- **Start a party** and get a 5-character code to text to friends.
- **Join a friend's party** and be standing next to them in seconds — no character wipe, no separate solo/multiplayer progress, no queue.
- **Leave anytime.** Nothing blocks you from quitting mid-session; your character and the party simply continue without you.

Everything in the current build is built around that pillar: quick jump in, quick jump out, and full character depth either way. Layered on top of it is the game's narrative premise: **the moon Selen is chained to Aethon by the Moonthread, the thread is fraying, and every player character is Moon-Touched** — able to hear the moon's memories, and slowly, subtly, becoming something the world isn't sure it can trust.

## Design pillars

1. **Drop-in, drop-out first.** Every system (loot, XP, respawn, party membership) is designed so a player joining or leaving mid-session never blocks or punishes anyone.
2. **Deep enough to matter, light enough to onboard in a minute.** Three classes, five abilities each, a 3-rank upgrade per ability, real itemization — but no 40-hour tutorial.
3. **Coop-friendly, not coop-required.** XP and loot are rolled per-player (not shared/contested), so a full party never feels worse than soloing.
4. **Beautiful without needing an art team.** Stylized, toon-shaded low-poly geometry + moonlit lighting reads as intentional and charming without hand-authored art assets.
5. **Choices remembered, not cutscened.** NPCs react to what you did, in dialogue delivered while you're still standing in the world — no camera lock, no paused combat, no forced cutscene (see "Playable conversations" below).

## Current scope: the vertical slice

This build is a **foundation**, not the finished game. It implements six zones with the full gameplay loop working end-to-end — movement, combat, AI, gathering, crafting, itemization, leveling, zone travel, faction/NPC-memory dialogue, and real-time coop — so every future feature (more classes, dungeons, PvP, mounts, a real economy, the rest of the narrative) has a proven spine to build on rather than a prototype that needs rearchitecting.

### World

Every room instance (solo or party) simulates its own live copy of the whole world, not just one zone. Threadhold is the hub; five standing travel points around its edge lead out to the other five zones, each with a return point home. Walk into one and you're through — no loading screen or confirmation, the same way a zone line works in a classic MMO:

- **Threadhold** (~58-unit radius, verdant) — where the story begins; agricultural, tradition-bound, and quietly afraid of what falls from the sky. 12 enemy spawns, 13 resource nodes across ore/timber/herbs/**Aether crystals** (narratively fragments of Selen — see "The Moon-Touched condition" below).
- **Ashmire** (~46-unit radius, ashen) — a barren, volcanic-glass wasteland guarded by Stone Sentinels rather than a single boss. 11 enemy spawns, 9 resource nodes (no timber — the ground is too dead for trees).
- **Sunken Llyr** (~50-unit radius, coastal) — fjords and tidal caves; drowned husks and kelp-tangled stalkers along the shore. 11 enemy spawns, 9 resource nodes (crystal and ore dominate; one driftwood node stands in for timber).
- **Mourncrown** (~52-unit radius, highland) — haunted highlands under an eternal twilight, wraiths drifting among stone circles. 10 enemy spawns, 8 resource nodes (no timber — too exposed for trees).
- **Spirechain** (~42-unit radius, arcane) — sky-cities and archives, abstracted to a plateau; Order guardian constructs far outnumber roaming husks. The smallest, quietest zone — 7 enemy spawns, 5 resource nodes.
- **The Frayedge** (~60-unit radius, fractured) — badlands at the world's rim where reality tears; the densest, toughest spawn mix in the game. 14 enemy spawns, 10 resource nodes.

Each zone has its own ground theme, scatter (tree/rock/mote density and color), and fog, driven by a `theme` field in the shared zone registry (`packages/shared/src/zones.ts`) that the client's scenery builder reads (`packages/client/src/scene/world.ts`'s `THEME_VISUALS` table) — adding a zone's *visual* identity is data, not new rendering code.

Each player tracks their own current zone; a party can freely split across zones and reconvene later (the shared party roster and chat stay room-wide either way). Combat, gathering, enemy AI targeting, and the snapshot each client receives are all scoped to "players/enemies/nodes/NPCs in *my* zone" — the same population/visibility boundary a channel, shard, or zone copy enforces in a full-scale MMO, just applied within a single room instance here. See `packages/shared/src/zones.ts` for the zone registry and `Room.broadcastSnapshot` in `packages/server/src/room.ts` for the per-zone filtering.

### Classes & combat

Three archetypes, each layered the way the best MMO class systems are — base class, weapon-driven kit, and a chosen specialization — so "class" means more than a name and a weapon icon:

| Class | Role | Resource | Weapon kits |
|---|---|---|---|
| **Warden** | Melee bruiser | Resolve | Sword & Board (control: Steel Strike, Shield Bash, Shield Wall) or Greataxe (cleave/burst: Cleave, Rending Swing, Whirlwind) |
| **Ranger** | Ranged skirmisher | Focus | Longbow (range: Quickshot, Piercing Volley, Barrage) or Dual Pistols (close-range: Twin Shot, Scatter Blast, Evasive Shot) |
| **Mystic** | Caster / healer hybrid | Aether | Focus (ranged casting: Moonbolt, Lunar Nova, Arcane Surge) or Scythe (melee lifesteal: Reap, Dark Harvest, Gravity Well) |

The hotbar is 6 slots: swapping your equipped weapon swaps abilities **1–3**; two fixed utility abilities always sit in **4–5** (heal/shield/CC that don't depend on your weapon); slot **6** is an elite ability unlocked by your specialization. Every character starts with both weapon options in their bag, so trying the other kit is just an equip away, mid-session, no cost.

At level 5, each class picks one of two **specializations** — a GW2-elite-spec-style choice that changes how the class *plays*, not just its numbers:

| Class | Specializations |
|---|---|
| Warden | **Bulwark** (banked Resolve converts to damage reduction; elite: *Unbreakable* — brief 50% DR + taunt) vs. **Berserker** (bonus damage below 50% HP; elite: *Bloodrage* — power + lifesteal) |
| Ranger | **Strider** (movement stacks crit; elite: *Windrunner's Volley* — 360° burst) vs. **Beastcaller** (a spirit hawk periodically strikes your target; elite: *Call the Pack* — hawk hits harder for a duration) |
| Mystic | **Tidecaller** (heals also grant a shield; elite: *Lunar Sanctuary* — a ground zone that heals allies standing in it) vs. **Voidblade** (damage spells stack a power buff; elite: *Eclipse* — a heavy self-centered nuke) |

Combat itself is real-time and positional, not tab-target: abilities have range, radius, cast times, and cooldowns; a universal **Dodge** (`Space`) grants brief invulnerability frames, so surviving a boss telegraph is about reading and reacting, not gear checks alone. Enemies telegraph their attacks (a red ground ring) before they land, so the counterplay is legible even solo.

### Progression

- Standard XP-to-level curve; leveling raises max HP/resource and grants a **skill point**.
- Skill points upgrade individual abilities (rank 1 → 3, including elites), each rank adding ~18% power and trimming cooldown — meaningful build choices without a sprawling talent tree to parse.
- Gear: a weapon (class- and kit-restricted), armor, and trinket slot, each with rarity tiers (common → epic) that scale stat bonuses.
- **Subclasses** are a fourth, orthogonal layer — a Log-Horizon-style non-combat trade, chosen (and freely changed) from the crafting panel, independent of combat class or specialization: **Smith** (cheaper crafting, exclusive plate armor), **Alchemist** (bonus potion yield, exclusive elixir), **Naturalist** (bonus gather yield, exclusive trinket).

### Crafting

Gather from nodes in the world (`E` to interact) → open the crafting panel (`R`) → spend materials on recipes gated by character level. Recipes cover starter potions up through best-in-slot weapons/armor built from rare drops off the zone's elite and boss. Crafting has no station requirement by design — it's a portable ability, so a solo player never has to break from exploring to "go back to town."

### Coop model

- A **Room** is a live server-side simulation of the whole world (every zone at once) — either a private **solo** instance or a **party** instance identified by a shareable code.
- Joining or leaving a room never pauses or resets it for anyone else.
- Enemy kills and gathering award XP/loot **per player**, independently — no kill-stealing, no ninja looting, no reason a bigger party ever feels worse than soloing.
- Characters persist per-browser (a local token), independent of which room they're played in — the *character* is the persistent unit, not the session.

## The narrative premise: Aethon and Selen

> *"The moon Selen is chained to our world Aethon by an ancient celestial engine called the Moonthread. When the thread frays, shards of the moon fall as Moonshards — and those touched by them become Moon-Touched, able to hear the moon's memories, speak to the dead, and rewrite fate."*

The central question the story keeps returning to: **if the moon is a prison, a god, a memory, or a corpse — what do we do when it finally falls?** That supports lunar horror (Selen is not friendly; it remembers), cosmic mystery (what *is* the Moonthread, and who built it), personal tragedy (the Moon-Touched are feared, hunted, and slowly losing themselves), and political conflict (three factions fighting over who controls the shards and the tether).

### The Moon-Touched condition

Every player character is Moon-Touched from the moment they're born into this world: they died briefly during a Moonshard fall and came back different. The condition deepens with exposure — and in this build, exposure is concrete and mechanical, not just narration: **handling Aether crystals (the `node_crystal` gathering nodes already in both zones) is, narratively, handling fragments of Selen herself.** Each one gathered raises `lunarResonance` on your character, which moves you through four stages (`packages/shared/src/lore/moonTouched.ts`):

| Stage | Threshold | What it means |
|---|---|---|
| Touched | 0+ | You came back from a Moonshard fall. Whispers, faintly, at the edges of sleep. |
| Resonant | 10+ | Echoes and hidden paths reveal themselves near shardfall sites; some fear what you're becoming. |
| Aligned | 25+ | You've begun agreeing with memories that aren't yours. |
| Hollowed | 50+ | The whispers outnumber your own thoughts most days. |

Your current stage is visible in the Character panel (`C`), alongside your standing with each faction.

### The three factions

| Faction | Title | Philosophy |
|---|---|---|
| **Chainwrights** | Order of the Silver Thread | The Moonthread must be repaired and tightened. Selen must remain a battery for Aethon. |
| **Luminari** | The Free Moon | Selen's energy belongs to all. Shards should uplift Aethon, not sit hoarded. |
| **Pale Choir** | The Duskborne | Selen is suffering. The tether is cruelty. Let the moon die with dignity. |

Every faction-aligned NPC you talk to nudges your standing with these three (plus a fourth, informal "Independent" reputation for staying out of it) via `packages/shared/src/lore/factions.ts`'s loyalty ladder (Exalted down to Hunted). Loyalty is visible per-faction in the Character panel.

### Playable conversations

The rule, end to end: **the player never stops moving, fighting, or exploring while story happens.** No forced camera locks, no dialogue wheel that pauses the world. Concretely, in this build: walk up to an NPC (a gold nameplate identifies them), press `E` to talk (the same key that gathers a resource node — whichever is closer wins), and a subtitle-style panel appears at the bottom of the screen with their line. A plain greeting fades on its own after a few seconds; a real decision waits, with buttons, until you answer it. Nothing else pauses.

Each NPC has a **memory**: whether you've met them, and a small set of tags recording what you've done (`packages/shared/src/lore/memory.ts`). Their greeting changes accordingly — a first meeting reads differently from a returning friend, which reads differently from someone you've betrayed. NPCs whose loyalty type is "fanatic" (see the roster below) never forgive a betrayal of their faction, no matter how your standing later recovers; everyone else's greeting tracks your live faction loyalty score.

NPCs also react to choices you made with *other* NPCs — a first real slice of the design bible's "relationship web." A `crossReferences` list on an `NpcDef` names another NPC and a memory tag; if that tag is present anywhere in your memory, a line about it is folded into the greeting. A few are wired today: Castellan Yora and Thane Corvin both react to Aldric Vane's fate (exposed vs. concealed); Brother Ink reacts to which choice you made with Vesryn the Duskborne; Warden Kael reacts to whether Castellan Yora defied or followed the order to raze the Frayedge-bound refugee camp. It's a real mechanic, not a mock — verified directly against the built package: talk to Aldric, resolve his choice, and Yora's very next greeting changes to reference it before you've said a word to her about it.

Twenty-nine NPCs are fully wired end-to-end today, each with a **signature choice** — a real decision with real faction-loyalty consequences — demonstrating the pattern the rest of the ~60-character planned roster (see below) is designed against:

| NPC | Where | Faction | Signature choice |
|---|---|---|---|
| Elder Maeve | Threadhold | Independent | Hand a Chainwright patrol a list of who's sheltering Moon-Touched refugees, burn it, or warn the refugees first. |
| Threadward Warden Oris | Threadhold | Chainwrights | Reinforce the failing ward with Order steel, let Sister Wren's old rite try first, or both. |
| Aldric Vane | Threadhold | Chainwrights | Expose, conceal, or privately confront his order to erase a village to stop a rupture spreading. |
| Vesryn the Duskborne | Threadhold | Pale Choir | With only one soul savable from an erasure, save a nameless child, save himself, or search for a third way. |
| Forge-Mother Breca | Ashmire | Independent (mercenary) | Arm the Chainwrights, arm the Luminari, or arm the independents instead. |
| Artificer Perrin | Ashmire | Luminari | Volunteer yourself for a memory-extraction experiment, refuse and report it, or find a willing volunteer. |
| Ilsa Marche | Ashmire | Luminari | Stop her draining a village orchard to power the new lunar engine, help her, or find a smaller source instead. |
| Castellan Yora | Ashmire | Chainwrights | Defy Command's order to raze a Moon-Touched refugee camp, follow it, or stall for time. |
| Captain Sera Voss | Sunken Llyr | Luminari | Recover her drowned crew's bodies, salvage the wreck's cargo instead, or use it to trap a rival privateer. |
| Tidecaller Oren | Sunken Llyr | Independent | Let a rising drowned Selenian city sleep, raise it for study, or loot it while the tide allows. |
| Mira Hollowbell | Mourncrown | Pale Choir | With one soul savable from a village erasure, save a nameless child, save herself, or search for a third way. |
| Brother Ink | Mourncrown | Pale Choir | Recover a forbidden archive proving the Binding was a massacre, destroy it, or read it together first. |
| Thane Corvin | Mourncrown | Independent | Defend his ancestral hall to the last against a Chainwright army, evacuate the clan, or trade the hall for their safety. |
| Magistrate Thorne | Spirechain | Chainwrights | Accept his pact to trade a faction's territory for your public denunciation, refuse it, or expose the offer. |
| Archon-Scribe Velis | Spirechain | Independent (mercenary) | Refuse to sell a sample of your Moon-Touched blood for research, give one, or steal from his archive instead. |
| Warden Kael | The Frayedge | Independent | Defend the Moon-Touched sanctuary from a Chainwright raid, evacuate it, or sell its location for a reward. |
| The Cartographer | The Frayedge | Unknown | Trust them to eventually guide you to Selen itself, ask for more time, or demand to know what they really are first. |
| Pip | Threadhold | Independent | Help her decide where to belong: with Elder Maeve, warded by the Chainwrights, or studied by the Luminari. |
| Sister Wren | Threadhold | Independent | Keep hiding Moon-Touched patients in her cellar, help move them to the Frayedge sanctuary, or tell her to stop. |
| Slag | Ashmire | Independent | Bring him a pure Moonshard to forge an anti-Hollowed weapon, stick to safer steel, or take his tools instead. |
| Pyra Emberhand | Ashmire | Luminari | Help her burn out a Hollowed nest (and the forest with it), stop her, or redirect the fire somewhere emptier. |
| Old Finn | Sunken Llyr | Independent | Help him keep his lighthouse neutral, let the Luminari convert it, or let it go to the highest bidder. |
| The Selenian | Sunken Llyr | Independent | Protect their secret, expose them to the Chainwrights, or learn the true history of the Binding. |
| Skald Varn | Mourncrown | Independent | Have him sing your saga true, flatter you for the crowd, or leave your name out of it entirely. |
| Lady Maren | Mourncrown | Independent | Help her keep her family manor independent, let a faction claim it, or burn it so no one can misuse it. |
| Chancellor Irin | Spirechain | Chainwrights | Accept her secret pact, refuse it, or expose it to force an open three-faction summit. |
| Novice Tarn | Spirechain | Independent | Help him publish proof the Binding was a crime, help him flee instead, or tell him to stay silent. |
| Hollow-Singer | The Frayedge | Independent | Join the Hollowed commune, negotiate coexistence for it, or refuse and walk away. |
| The Falling Man | The Frayedge | Independent | Try to save him from fading away, let him go peacefully, or record his final words. |

### Fate: a trending-ending preview, not a fake finale

This vertical slice has no scripted story finale to actually branch into yet — it's an open sandbox. Rather than bolt on a fake ending cutscene that doesn't fit that, the Character panel's "Fate" section computes and shows an honest **trending ending** live from your current faction loyalty and Moon-Touched stage (`packages/shared/src/lore/endings.ts`), across the three axes the eventual story is designed around:

- **The Moonthread**: Bind (repair it) / Balance (weaken but maintain) / Sever (break it and let Selen drift) — read from your Chainwrights vs. Pale Choir loyalty.
- **The Moon-Touched**: Cure / Accept / Embrace — read from your `lunarResonance` stage.
- **The dominant faction** you're leaning toward, including Independent.

Those two axes combine into nine possible "major endings" (The Silver Chain, The Gilded Cage, The Lullaby, The Dim Light, The Shared Sky, The Bridge, The Long Fall, The Drift, The Becoming) — see `endings.ts` for the full table. A real playthrough will eventually branch into one of these for real; right now it's a reading of where you're headed.

### What's designed but not yet built

Being explicit about scope, because it matters: the original narrative design for this game specifies a roster of **60+ named recurring characters** across seven planned regions (Threadhold, Ashmire, Sunken Llyr, Mourncrown, Spirechain, Frayedge, and the endgame Moonthread itself), a full NPC relationship web (rivalries, alliances, death cascades), an 8-chapter story, and a much richer ending system with secret endings and NPC-survival variants. All six non-endgame regions are real, working zones today, and 29 characters are wired end-to-end in them, including a first working slice of the relationship web (NPCs whose dialogue reacts to choices made with *other* NPCs — see "Playable conversations" above). The remaining ~31 are designed in the narrative bible — dialogue voice, faction ties, signature choices, and relationship webs are written — but not yet wired into the game. Still unbuilt from the relationship-web design: rivalry/alliance pairs as a first-class structure (rather than hand-picked cross-references), death cascades where one NPC's fate removes or transforms another, and companions who can join and fight alongside the party — the current roster is all stationary dialogue-givers, none are recruitable. The Moonthread itself remains the one region from the brief with no zone at all yet — reaching it is meant to be a late-game/endgame beat, not an early travel-point destination. Building the rest out is authoring content and relationship-graph data against the systems already in place, not new core engineering.

A handful of the original brief's "immediate decisions" are also still genuinely open and worth answering before writing more of the roster: how many playable origins (all Moon-Touched the same way, vs. class-based, vs. region/race-based, vs. player-authored background); whether more than three factions should exist or players can belong to more than one at once; overall tone (hopeful-gothic vs. cosmic horror vs. high fantasy adventure); whether the moon's true nature is revealed at launch or stays ambiguous for years; how deep companion romance/loyalty arcs should go versus staying functional; and voice acting scope (full, partial, or text+whisper-audio only).

## Architecture notes (for whoever picks this up next)

- `@moon/shared` is the single source of truth for game data (classes/abilities/items/recipes/enemies, zones, factions/memory/NPC dialogue/endings) and the WebSocket protocol types. Client and server both import it, so balance and protocol changes can't silently drift apart.
- The server is authoritative for all gameplay state (position, HP, combat resolution, loot, faction loyalty, NPC memory); the client renders and predicts local movement for responsiveness, softly reconciling against the server snapshot rather than hard-snapping.
- The tick loop runs at ~15 Hz; the client interpolates/animates at full frame rate between snapshots.
- Narrative/lore code lives under `packages/shared/src/lore/`: `factions.ts` (loyalty scores + ladder), `memory.ts` (per-NPC memory tags + relationship derivation), `npc.ts` (the NPC roster + dialogue resolution), `moonTouched.ts` (Moon-Touched stage progression), `endings.ts` (the ending-axis model).

## Roadmap ideas (not yet built)

Roughly in the order they'd most improve the game:

1. **The rest of the NPC roster** — the remaining ~31 designed characters across the six built zones, plus the Moonthread endgame zone itself (not yet built — reaching Selen is meant to be a late-game destination, not another Threadhold travel point). Also unbuilt: rivalry/alliance pairs as first-class relationship-graph data, death cascades (one NPC's fate removing or transforming another), and joinable/fighting companions — today's roster is dialogue-only and stationary. Content + data authoring against the existing dialogue/memory/faction/cross-reference system, not new core engineering.
2. **A fourth combat class, and/or a second specialization tier** (à la GW2's multiple elite specs) — the weapon-kit/specialization system generalizes cleanly to more of both.
3. **Dungeons**: an instanced room variant with a boss-gated multi-enemy encounter and its own loot table.
4. **Player trading / a shared economy** — deliberately deferred; per-player loot avoids needing it for the vertical slice, but a real game wants it.
5. **Mounts / faster traversal** for a bigger world.
6. **Persistent world events** (e.g., a roaming rare spawn) to give solo and party play a reason to cross paths without forcing grouping.
7. **A real story finale** — chapters, a scripted ending sequence that actually branches on the ending-axis model instead of just previewing it, and the NPC-survival/relationship-web consequences the original design calls for.
8. **Audio** — currently silent; ambient per-zone audio + combat SFX, and voice for the dialogue system, would be a high-impact next pass.
