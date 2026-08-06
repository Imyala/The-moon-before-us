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

This build is a **foundation**, not the finished game. It implements two zones with the full gameplay loop working end-to-end — movement, combat, AI, gathering, crafting, itemization, leveling, zone travel, faction/NPC-memory dialogue, and real-time coop — so every future feature (more zones, more classes, dungeons, PvP, mounts, a real economy, the rest of the narrative) has a proven spine to build on rather than a prototype that needs rearchitecting.

### World

Every room instance (solo or party) simulates its own live copy of the whole world, not just one zone. Two zones exist today, linked by a standing travel point — walk into it and you're through, no loading screen or confirmation, the same way a zone line works in a classic MMO:

- **Threadhold** (~58-unit radius) — verdant riverlands where the story begins; agricultural, tradition-bound, and quietly afraid of what falls from the sky. 12 enemy spawns across 5 enemy types (3 common "minion" types, 1 "elite," 1 zone "boss"), 13 resource nodes across 4 gathering types — ore, timber, herbs, and **Aether crystals**, which are narratively fragments of Selen herself (see "The Moon-Touched condition" below). Its southern gate, past the zone boss, leads to Ashmire.
- **Ashmire** (~46-unit radius) — a barren, volcanic-glass wasteland beyond Threadhold, guarded by Stone Sentinels rather than a single boss. 11 enemy spawns (a step up in density/elite presence rather than a unique boss), 9 resource nodes (ore and crystal dominate; no timber — the ground is too dead for trees).

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

Six NPCs are fully wired end-to-end today, each with a **signature choice** — a real decision with real faction-loyalty consequences — demonstrating the pattern the rest of a much larger planned roster (see below) is designed against:

| NPC | Where | Faction | Signature choice |
|---|---|---|---|
| Elder Maeve | Threadhold | Independent | Hand a Chainwright patrol a list of who's sheltering Moon-Touched refugees, burn it, or warn the refugees first. |
| Threadward Warden Oris | Threadhold | Chainwrights | Reinforce the failing ward with Order steel, let Sister Wren's old rite try first, or both. |
| Aldric Vane | Threadhold | Chainwrights | Expose, conceal, or privately confront his order to erase a village to stop a rupture spreading. |
| Vesryn the Duskborne | Threadhold | Pale Choir | With only one soul savable from an erasure, save a nameless child, save himself, or search for a third way. |
| Forge-Mother Breca | Ashmire | Independent (mercenary) | Arm the Chainwrights, arm the Luminari, or arm the independents instead. |
| Artificer Perrin | Ashmire | Luminari | Volunteer yourself for a memory-extraction experiment, refuse and report it, or find a willing volunteer. |

### Fate: a trending-ending preview, not a fake finale

This vertical slice has no scripted story finale to actually branch into yet — it's an open sandbox. Rather than bolt on a fake ending cutscene that doesn't fit that, the Character panel's "Fate" section computes and shows an honest **trending ending** live from your current faction loyalty and Moon-Touched stage (`packages/shared/src/lore/endings.ts`), across the three axes the eventual story is designed around:

- **The Moonthread**: Bind (repair it) / Balance (weaken but maintain) / Sever (break it and let Selen drift) — read from your Chainwrights vs. Pale Choir loyalty.
- **The Moon-Touched**: Cure / Accept / Embrace — read from your `lunarResonance` stage.
- **The dominant faction** you're leaning toward, including Independent.

Those two axes combine into nine possible "major endings" (The Silver Chain, The Gilded Cage, The Lullaby, The Dim Light, The Shared Sky, The Bridge, The Long Fall, The Drift, The Becoming) — see `endings.ts` for the full table. A real playthrough will eventually branch into one of these for real; right now it's a reading of where you're headed.

### What's designed but not yet built

Being explicit about scope, because it matters: the original narrative design for this game specifies a roster of **60+ named recurring characters** across seven planned regions (Threadhold, Ashmire, Sunken Llyr, Mourncrown, Spirechain, Frayedge, and the endgame Moonthread itself), a full NPC relationship web (rivalries, alliances, death cascades), an 8-chapter story, and a much richer ending system with secret endings and NPC-survival variants. Six characters and two regions are real, working, and playable today. The rest is designed — dialogue voice, faction ties, signature choices, and relationship webs are written for the remaining ~55 — but not yet wired into the game; building it out is authoring content against the systems above, not new engineering.

A handful of the original brief's "immediate decisions" are also still genuinely open and worth answering before writing more of the roster: how many playable origins (all Moon-Touched the same way, vs. class-based, vs. region/race-based, vs. player-authored background); whether more than three factions should exist or players can belong to more than one at once; overall tone (hopeful-gothic vs. cosmic horror vs. high fantasy adventure); whether the moon's true nature is revealed at launch or stays ambiguous for years; how deep companion romance/loyalty arcs should go versus staying functional; and voice acting scope (full, partial, or text+whisper-audio only).

## Architecture notes (for whoever picks this up next)

- `@moon/shared` is the single source of truth for game data (classes/abilities/items/recipes/enemies, zones, factions/memory/NPC dialogue/endings) and the WebSocket protocol types. Client and server both import it, so balance and protocol changes can't silently drift apart.
- The server is authoritative for all gameplay state (position, HP, combat resolution, loot, faction loyalty, NPC memory); the client renders and predicts local movement for responsiveness, softly reconciling against the server snapshot rather than hard-snapping.
- The tick loop runs at ~15 Hz; the client interpolates/animates at full frame rate between snapshots.
- Narrative/lore code lives under `packages/shared/src/lore/`: `factions.ts` (loyalty scores + ladder), `memory.ts` (per-NPC memory tags + relationship derivation), `npc.ts` (the NPC roster + dialogue resolution), `moonTouched.ts` (Moon-Touched stage progression), `endings.ts` (the ending-axis model).

## Roadmap ideas (not yet built)

Roughly in the order they'd most improve the game:

1. **The rest of the NPC roster** — the remaining ~55 designed characters across the five regions not yet built (Sunken Llyr, Mourncrown, Spirechain, Frayedge) plus the Moonthread endgame zone. Content authoring against the existing dialogue/memory/faction system, not new engineering.
2. **A fourth combat class, and/or a second specialization tier** (à la GW2's multiple elite specs) — the weapon-kit/specialization system generalizes cleanly to more of both.
3. **Dungeons**: an instanced room variant with a boss-gated multi-enemy encounter and its own loot table.
4. **Player trading / a shared economy** — deliberately deferred; per-player loot avoids needing it for the vertical slice, but a real game wants it.
5. **Mounts / faster traversal** for a bigger world.
6. **Persistent world events** (e.g., a roaming rare spawn) to give solo and party play a reason to cross paths without forcing grouping.
7. **A real story finale** — chapters, a scripted ending sequence that actually branches on the ending-axis model instead of just previewing it, and the NPC-survival/relationship-web consequences the original design calls for.
8. **Audio** — currently silent; ambient per-zone audio + combat SFX, and voice for the dialogue system, would be a high-impact next pass.
