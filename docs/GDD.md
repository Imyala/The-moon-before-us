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
2. **Deep enough to matter, light enough to onboard in a minute.** Four classes, five abilities each, a 3-rank upgrade per ability, real itemization — but no 40-hour tutorial.
3. **Coop-friendly, not coop-required.** XP and loot are rolled per-player (not shared/contested), so a full party never feels worse than soloing.
4. **Beautiful without needing an art team.** Stylized, toon-shaded low-poly geometry + moonlit lighting reads as intentional and charming without hand-authored art assets.
5. **Choices remembered, not cutscened.** NPCs react to what you did, in dialogue delivered while you're still standing in the world — no camera lock, no paused combat, no forced cutscene (see "Playable conversations" below).

## Current scope: the vertical slice

This build is a **foundation**, not the finished game. It implements six standard zones plus the endgame Moonthread itself, with the full gameplay loop working end-to-end — movement, combat, AI, gathering, crafting, itemization, leveling, zone travel, faction/NPC-memory dialogue, a real relationship-graph and companion system, a scripted finale, and real-time coop — so every future feature (more classes, dungeons, PvP, mounts, a real economy) has a proven spine to build on rather than a prototype that needs rearchitecting.

### World

Every room instance (solo or party) simulates its own live copy of the whole world, not just one zone. Threadhold is the hub; five standing travel points around its edge lead out to the other five zones, each with a return point home. Walk into one and you're through — no loading screen or confirmation, the same way a zone line works in a classic MMO:

- **Threadhold** (~58-unit radius, verdant) — where the story begins; agricultural, tradition-bound, and quietly afraid of what falls from the sky. 12 enemy spawns, 13 resource nodes across ore/timber/herbs/**Aether crystals** (narratively fragments of Selen — see "The Moon-Touched condition" below).
- **Ashmire** (~46-unit radius, ashen) — a barren, volcanic-glass wasteland guarded by Stone Sentinels rather than a single boss. 11 enemy spawns, 9 resource nodes (no timber — the ground is too dead for trees).
- **Sunken Llyr** (~50-unit radius, coastal) — fjords and tidal caves; drowned husks and kelp-tangled stalkers along the shore. 11 enemy spawns, 9 resource nodes (crystal and ore dominate; one driftwood node stands in for timber).
- **Mourncrown** (~52-unit radius, highland) — haunted highlands under an eternal twilight, wraiths drifting among stone circles. 10 enemy spawns, 8 resource nodes (no timber — too exposed for trees).
- **Spirechain** (~42-unit radius, arcane) — sky-cities and archives, abstracted to a plateau; Order guardian constructs far outnumber roaming husks. The smallest, quietest zone — 7 enemy spawns, 5 resource nodes.
- **The Frayedge** (~60-unit radius, fractured) — badlands at the world's rim where reality tears; the densest, toughest spawn mix in the game. 14 enemy spawns, 10 resource nodes.

Each zone has its own ground theme, scatter (tree/rock/mote density and color), and fog, driven by a `theme` field in the shared zone registry (`packages/shared/src/zones.ts`) that the client's scenery builder reads (`packages/client/src/scene/world.ts`'s `THEME_VISUALS` table) — adding a zone's *visual* identity is data, not new rendering code.

**The Moonthread** (~32-unit radius, lunar) is the seventh and last: the literal tether between Aethon and Selen, and the endgame the brief always called for rather than another Threadhold travel point. It's not reachable the way the other six zones are — the only way in is a gated travel point standing in the Frayedge exactly where The Cartographer waits, and it only opens once you've resolved their signature choice by trusting them to guide you (`TravelPoint.requiresTag` in `zones.ts`; `Room.tryTravel` checks it and sends back a denial line if you haven't earned it yet). Deliberately small and dense rather than another wide spawn field: two Selenian Remnants (a new boss-tier enemy built for this zone) and a Wane Wraith, a couple of Aether-crystal nodes, and three NPCs — the Moonthread Warden, an Echo of Selen, and Archmagister Thessaly Vane (Aldric Vane's mother, still holding the Order's line at the source) — built for one last set of conversations, including the finale itself (see "Fate" below).

Each player tracks their own current zone; a party can freely split across zones and reconvene later (the shared party roster and chat stay room-wide either way). Combat, gathering, enemy AI targeting, and the snapshot each client receives are all scoped to "players/enemies/nodes/NPCs in *my* zone" — the same population/visibility boundary a channel, shard, or zone copy enforces in a full-scale MMO, just applied within a single room instance here. See `packages/shared/src/zones.ts` for the zone registry and `Room.broadcastSnapshot` in `packages/server/src/room.ts` for the per-zone filtering.

### Dungeons

**The Hollow Vault** (~34-unit radius, hollow theme) is the first dungeon: a sealed Order stronghold in Ashmire, fallen to the Hollowed. It doesn't need any new instancing engineering — every zone is already simulated per-Room (solo or party), which *is* instancing, so a dungeon is just a zone authored with dungeon rules: level-gated rather than open (`TravelPoint.requiresLevel`, a new field alongside the Moonthread's tag-gating; level 6 to enter), a gauntlet of Order constructs and Hollowed leading to a single boss chamber, and a real lockout — **the Vault Warden** (a new boss-tier enemy, 1400 HP) has a 10-minute respawn instead of the standard 20 seconds (`EnemyDef.respawnMs`, an optional per-enemy override of the server's default), so a party can't just camp and re-farm it. Its loot table is exclusive: Vault-Sealed Plate and the Hollow Seal, the game's first **epic**-rarity gear (the tier existed in the rarity/stat-multiplier system from the start but nothing had dropped at it until now). The zone name shows a ⚔️ marker in the HUD while you're inside one.

Verified end-to-end against a running server: the level gate correctly denies entry below level 6 and correctly admits at level 6+; a full run from Threadhold through Ashmire into the Vault and back out killed the Vault Warden, dropped loot, and confirmed live 23 seconds after the kill that it had *not* respawned — well past the normal 20-second window every other enemy in the game uses. That same testing pass also caught and fixed a real pre-existing bug: enemy and node loot was always being granted at a hardcoded `"common"` rarity regardless of what the item actually is, meaning every rare drop in the game (Silvered Greatblade, Starlight Recurve, Moon Pendant, and so on, back through the original vertical slice) has always undervalued its own rarity multiplier the moment it dropped. `addItem` (`packages/server/src/inventory.ts`) now resolves an item's own defined rarity by default instead of hardcoding one.

### Persistent world events

A `Room` now keeps exactly one **roaming rare spawn** alive at a time — **The Wandering Moonstag**, a new `"rare"`-tier `EnemyDef` (tougher than any elite and most bosses: 850 HP) — the first content built around the drop-in/drop-out pillar rather than any single zone: it's a reason for solo and party play to cross paths without ever forcing anyone to group up. `Room.tickWorldEvent` runs every tick alongside the normal enemy/node ticks: when no event is active and its cooldown has elapsed, `startWorldEvent` picks one of the six standard zones at random (deliberately excluding the level-gated Hollow Vault and the story-gated Moonthread) and spawns the Moonstag there with a patrol radius covering ~85% of the zone — reusing the same patrol AI every other enemy already has, just with a radius wide enough to read as roaming the whole zone instead of loitering by one spawn point, no new movement code required. Every player in the room, regardless of which zone they're currently standing in, gets a system chat line naming the zone the moment it appears, so a party split across zones can decide together whether to converge on it. It stays up for 6 minutes; killing it (`killEnemy` checks `EnemyEntity.isWorldEvent` and, instead of letting it respawn like a normal enemy, deletes it and announces the kill) or letting it time out unclaimed (`tickWorldEvent`, same cleanup, announced as having "faded") both clear the way for the next one after a 3-minute cooldown. Its nameplate renders in a distinct ice-blue "rare" tone (`nameplate--rare` in `packages/client/src/ui/style.css`) so it reads as a different kind of encounter the moment you see it, and its loot table leans toward the Moon Pendant trinket and bonus Starlight Essence rather than anything zone-exclusive, since it can appear (and be farmed) anywhere.

Verified directly against the live `Room` code: forcing a spawn creates exactly one `isWorldEvent`-flagged enemy in an eligible zone and broadcasts the "sighted" chat line to every connected player; killing it removes it immediately (rather than leaving it to respawn on the normal 20-second timer) and broadcasts a "slain" line; a second spawn attempt is correctly refused until the 3-minute cooldown elapses, then succeeds; and a spawn left alive past its 6-minute window is removed and broadcasts a "faded, unclaimed" line instead of lingering forever. A normal enemy's death was checked against the same code path to confirm it's unaffected — it still respawns on its own timer exactly as before.

### Classes & combat

Four archetypes, each layered the way the best MMO class systems are — base class, weapon-driven kit, and a chosen specialization — so "class" means more than a name and a weapon icon:

| Class | Role | Resource | Weapon kits |
|---|---|---|---|
| **Warden** | Melee bruiser | Resolve | Sword & Board (control: Steel Strike, Shield Bash, Shield Wall) or Greataxe (cleave/burst: Cleave, Rending Swing, Whirlwind) |
| **Ranger** | Ranged skirmisher | Focus | Longbow (range: Quickshot, Piercing Volley, Barrage) or Dual Pistols (close-range: Twin Shot, Scatter Blast, Evasive Shot) |
| **Mystic** | Caster / healer hybrid | Aether | Focus (ranged casting: Moonbolt, Lunar Nova, Arcane Surge) or Scythe (melee lifesteal: Reap, Dark Harvest, Gravity Well) |
| **Duskblade** | Burst melee striker | Umbra | Twin Daggers (fast/close: Twin Strike, Shadowstep Slash, Umbral Flurry) or Shadow Glaive (thrown/return: Glaive Throw, Returning Edge, Umbral Pull) |

The hotbar is 6 slots: swapping your equipped weapon swaps abilities **1–3**; two fixed utility abilities always sit in **4–5** (heal/shield/CC that don't depend on your weapon); slot **6** is an elite ability unlocked by your specialization. Every character starts with both weapon options in their bag, so trying the other kit is just an equip away, mid-session, no cost.

At level 5, each class picks one of now **three specializations** — a GW2-elite-spec-style choice that changes how the class *plays*, not just its numbers:

| Class | Specializations |
|---|---|
| Warden | **Bulwark** (banked Resolve converts to damage reduction; elite: *Unbreakable* — brief 50% DR + taunt) vs. **Berserker** (bonus damage below 50% HP; elite: *Bloodrage* — power + lifesteal) vs. **Sentinel** (taking a hit builds a decaying stack of Ward, up to 5, each worth 3% damage reduction; elite: *Ironclad Stand* — spend all Ward stacks on a heavy shield) |
| Ranger | **Strider** (movement stacks crit; elite: *Windrunner's Volley* — 360° burst) vs. **Beastcaller** (a spirit hawk periodically strikes your target; elite: *Call the Pack* — hawk hits harder for a duration) vs. **Windwalker** (landing weapon hits builds a decaying stack of Windrush, up to 5, each worth 2% haste; elite: *Tempest Volley* — spend all Windrush stacks on a piercing shot's bonus damage) |
| Mystic | **Tidecaller** (heals also grant a shield; elite: *Lunar Sanctuary* — a ground zone that heals allies standing in it) vs. **Voidblade** (damage spells stack a power buff; elite: *Eclipse* — a heavy self-centered nuke) vs. **Wardweaver** (casting a heal builds a decaying stack of Aegis, up to 5, each worth 2% damage reduction for the Mystic themself; elite: *Aegis Pulse* — spend all Aegis stacks on a shield for yourself and every nearby ally) |
| Duskblade | **Nightstalker** (landing a crit builds a decaying stack of +3% crit chance, up to 5; elite: *Vanishing Strike* — a guaranteed critical hit) vs. **Bloodmoon** (all damage dealt lifesteals 12%, always on; elite: *Crimson Eclipse* — an AoE burst that heals you for a share of everything it hits) vs. **Ashwalker** (landing weapon hits builds a decaying stack of Ashfeed, up to 5, each worth 2% lifesteal; elite: *Cinder Reap* — strike and spend all Ashfeed stacks on a burst self-heal) |

Duskblade is the vertical slice's fourth class, added after launch to prove the class framework generalizes: a new resource type (Umbra), two full weapon kits, two utility abilities, and two specializations with their own elites, wired against the exact same generic ability-resolution pipeline (`Room.resolveAbility` in `packages/server/src/room.ts`) the first three classes use — no new core engineering, just new data plus a handful of `special`-tagged mechanic hooks (guaranteed crit, stacking crit chance, flat lifesteal) that mirror the pattern Warden's Bloodrage and Ranger's Strider already established. Verified live over the wire: joining as a Duskblade grants the correct starting weapon and Umbra pool, Twin Strike lands real damage and kills, and swapping to the Shadow Glaive kit correctly swaps which three abilities are active.

Sentinel, Windwalker, Wardweaver, and Ashwalker are a **second specialization tier** — a third elite-spec option per class rather than a sequential upgrade to an existing one, the roadmap's own framing for what this should look like. Nothing about `chooseSpecialization` or the Character panel's spec list needed to change to support a third option per class: `Room.chooseSpecialization` was already just "does this id belong to my class and am I high enough level," and the client already renders every entry `specializationsForClass` returns rather than assuming exactly two — so this was purely new data plus new mechanic hooks, zero core engineering, the same story Duskblade proved a layer up. All four share one generic build-and-spend rhythm — a passive that builds a decaying 0-5 stack (`PlayerEntity.specStacks`/`specStacksUntil`, one shared pair rather than one per class, safe because a character only ever has one specialization active) from a class-appropriate trigger (Sentinel: taking a hit; Windwalker/Ashwalker: landing a weapon-ability hit; Wardweaver: casting a heal), and an elite that spends the whole stack on a burst payoff — while still landing on four distinct playstyles (defense, tempo, group support, sustain). Ashwalker's lifesteal, in particular, needed no new application logic at all: setting `lifestealPct`/`lifestealUntil` from the current stack count is all it takes for the existing generic lifesteal check in `damageEnemy` (the same one Bloodmoon already uses) to pick it up.

Verified directly against the live `Room` code for all four: Sentinel visibly reduces a 100-damage hit by the expected percentage at 5 stacks and Ironclad Stand converts those stacks into the exact shield formula; Windwalker's stacks measurably shorten a real ability's cooldown and Tempest Volley's damage scales with stacks consumed; Wardweaver builds a stack from actually casting Healing Tide and Aegis Pulse shields both the caster and a nearby ally by the right amount; Ashwalker's stack sets a real, checkable `lifestealPct`, and Cinder Reap's self-heal matches its formula. The client side was checked in a real running browser session too: the Character panel correctly lists all three specializations per class (not just the original two), and choosing Sentinel correctly wires Ironclad Stand into hotbar slot 6.

Combat itself is real-time and positional, not tab-target: abilities have range, radius, cast times, and cooldowns; a universal **Dodge** (`Space`) grants brief invulnerability frames, so surviving a boss telegraph is about reading and reacting, not gear checks alone. Enemies telegraph their attacks (a red ground ring) before they land, so the counterplay is legible even solo.

### Progression

- Standard XP-to-level curve; leveling raises max HP/resource and grants a **skill point**.
- Skill points upgrade individual abilities (rank 1 → 3, including elites), each rank adding ~18% power and trimming cooldown — meaningful build choices without a sprawling talent tree to parse.
- Gear: a weapon (class- and kit-restricted), armor, and trinket slot, each with rarity tiers (common → epic) that scale stat bonuses.
- **Subclasses** are a fourth, orthogonal layer — a Log-Horizon-style non-combat trade, chosen (and freely changed) from the crafting panel, independent of combat class or specialization: **Smith** (cheaper crafting, exclusive plate armor), **Alchemist** (bonus potion yield, exclusive elixir), **Naturalist** (bonus gather yield, exclusive trinket).

### Crafting

Gather from nodes in the world (`E` to interact) → open the crafting panel (`R`) → spend materials on recipes gated by character level. Recipes cover starter potions up through best-in-slot weapons/armor built from rare drops off the zone's elite and boss. Crafting has no station requirement by design — it's a portable ability, so a solo player never has to break from exploring to "go back to town."

### Player trading

Two players standing within range of each other (`TRADE_RANGE` in `packages/server/src/world.ts`) can now trade directly: click **Trade** next to a party member's name in the roster, they get a non-blocking accept/decline prompt, and once accepted both players see a live two-column trade window — click any inventory stack to offer all of it, click an offered item to take it back, and **Confirm** when ready. The trade only executes once *both* sides have confirmed; either player changing their offer after that un-confirms both again, the same safety net a real MMO trade window has against "you changed what you're giving me after I'd already agreed." `Room` tracks trade sessions server-side (`TradeSession` in `room.ts`) keyed by a composite id, re-validates both offers against current inventories at the moment of execution (an item crafted away, equipped, or consumed after being offered can't be traded), and transfers items by exact itemId **and rarity** — offering a rare sword never accidentally hands over a common one instead. A trade is auto-cancelled if either participant disconnects mid-negotiation.

Verified in a real two-browser session (two live clients against a running server, not just typechecked): Alice proposing a trade sends Bob a request naming her; accepting opens synced trade windows for both; an item Alice offers appears live on Bob's side over the wire before anyone confirms; confirming both sides transfers the exact offered quantity and rarity in both directions and closes the window for both players; and Bob's own held items land in his inventory correctly. That same pass caught and fixed a real pre-existing bug it happened to be the first feature to exercise: every new character's starter inventory (`STARTER_ITEMS` in `packages/server/src/character.ts`) was built by spreading the same three `ItemStack` objects into every character's inventory array rather than cloning them, so every player's starting Minor Health Draughts, Silverleaf Herb, and Timber stacks were literally the same shared objects — mutating one character's starter stack (via crafting, gathering, or now trading) silently corrupted every other character's identical stack. `getOrCreateCharacter` now clones each starter stack per character.

### Mounts

Press **M** to mount up: a flat `MOUNT_SPEED_MULTIPLIER` (1.8×, `packages/server/src/world.ts`) on top of base move speed, for a bigger world with six open zones to cross. It's deliberately a pure traversal tool rather than something worth building around — combat and gathering both force an automatic dismount (`tryUseAbility`, `damagePlayer`, and `tryGather` in `room.ts` all clear `PlayerEntity.mounted`), so there's no way to fight or gather while mounted, and death/respawn clears it too. Toggling is otherwise free: instant, no cooldown, no cost. Every other player in your zone sees your mount too — `mounted` rides along on the existing `PlayerSnapshot`, so it's just more state on a message the game already broadcasts 15 times a second. The mount itself reuses the low-poly quadruped body `buildQuadruped` already built for the Moonlit Wolf (`packages/client/src/scene/avatars.ts`) in a "steed" color, added as a child of the rider's own avatar group so it inherits position and facing for free instead of needing its own per-frame tracking.

Verified directly against the live `Room` code: mounting moves a player measurably farther per tick than an otherwise-identical unmounted player; taking damage, using an ability, and starting to gather each independently force a dismount; a dead, casting, or already-gathering player can't mount up; and respawning always clears mounted state. The client side was checked in a real running browser session: pressing `M` shows a "Mounted up." toast and attaches the steed visually behind the rider; using an ability mid-ride shows a "Dismounted." toast and detaches it; and pressing `M` again dismounts manually.

### Audio

The game is no longer silent — and, matching the "beautiful without needing an art team" pillar, not a single sound file was added to get there. `packages/client/src/audio.ts`'s `AudioEngine` synthesizes everything at runtime with the Web Audio API: a handful of detuned oscillators through a lowpass filter for a per-zone ambient drone (one param set per `ZoneTheme` — verdant, ashen, coastal, highland, arcane, fractured, lunar, hollow — so Threadhold's woods and the Moonthread's void sound as different as they look), plus short procedural one-shots — decaying-envelope tones for casts/heals/level-ups/loot/mounting, filtered noise bursts for hits/dodges — built from two reusable primitives (`tone`, `noiseBurst`) rather than hand-tuned per sound. Browsers block audio until a real user gesture; `AudioEngine.unlock()` is called from the landing screen's "Enter the Glade" click, the one moment that's guaranteed to be one. A mute toggle (top of the HUD, next to the party roster) persists to `localStorage` and drives the master gain node directly, so muting doesn't stop sounds from being *scheduled* — it just makes them silent, which matters for the ambient drone's continuous graph.

Combat/loot/level-up/craft feedback is deliberately scoped to the player's own actions (`sourceId`/`targetId`/`casterId`/`playerId === selfId`) rather than firing for every hit landing anywhere in a shared zone — a full party's combined combat noise would otherwise drown out everything else. Zone travel gets its own rising whoosh on top of the ambience crossfade, and the persistent world event's "sighted" announcement (see "Persistent world events" above) gets a distinct three-note chime so it reads as the exceptional event it is.

Verified in a real running browser session by instrumenting the actual `OscillatorNode.start`/`AudioBufferSourceNode.start` calls (proof real audio nodes fire, not just that no error was thrown): entering a zone starts the three-oscillator ambient drone; dodging fires a real noise-burst node; mounting and using an ability each fire real oscillator nodes; and the mute button's icon toggles correctly both ways.

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

NPCs also react to choices you made with *other* NPCs — a first real slice of the design bible's "relationship web." A `crossReferences` list on an `NpcDef` names another NPC and a memory tag; if that tag is present anywhere in your memory, a line about it is folded into the greeting. Dozens are wired today across the full roster. It's a real mechanic, not a mock — verified directly against the built package: talk to Aldric, resolve his choice, and Yora's very next greeting changes to reference it before you've said a word to her about it.

### Rivalries, alliances, and death cascades

The relationship web is now a first-class graph, not just hand-picked cross-references: `packages/shared/src/lore/relationships.ts` holds `NPC_RELATIONSHIPS` (22 rivalry/alliance pairs across the whole roster — e.g. Castellan Yora and Warden Kael's rivalry, Thane Corvin and Skald Varn's alliance) and `DEATH_CASCADES`, the mechanism for "one NPC's fate removes or transforms another." A cascade fires when a *source* NPC's memory carries a specific tag — their fate has been decided — and overrides a *target* NPC's greeting to react to it, using the same "derive it live, never store it redundantly" discipline `computeRelationship` already uses, just keyed off someone else's memory instead of your own loyalty score (`cascadeFor`, checked first thing in `resolveDialogue`). Seven cascades are wired today: choosing to have Thane Corvin defend his hall to the last (`corvin_hall_defended`) ripples out to four different NPCs — Skald Varn grieves, Lady Maren exploits the power vacuum, Rurik Ashgrave is transformed into the clan's new leader mid-conversation, and Widow Karse carves his name into the standing stones — and Warden Kael's sanctuary choice similarly reshapes how Quartz, his sanctuary healer, greets you afterward (grateful if you defended it, gone entirely — `effect: "departs"`, which also permanently suppresses her own signature choice — if you sold it out). A seventh runs entirely through new content: trading a Frayedge trader a live Moonshard costs him his own name, and the Hollow-Singer commune mourns losing one of their own to it alone. Verified live: recruiting is one thing, but resolving Corvin's death and then walking straight to Rurik produces his transformed "They call me Thane now" greeting before you've said a word about what happened.

### Companions

Up to **two** NPCs can travel with you at once (`MAX_COMPANIONS` in `packages/shared/src/types.ts`). A `recruits: true` option on a signature choice adds that NPC's id to `CharacterState.companionIds`, and the Room spawns a real, simulated companion entity per slot, each independently: it follows you (closing distance once you're more than a few units away), crosses zones with you instantly when you travel, and fights — it picks the nearest live enemy within its aggro radius, closes in, and attacks on a cooldown, with kill credit (XP/loot) going to you. The HUD shows "Traveling with `<name>` and `<name>`" while active, and a dedicated Companions panel (`P`) lists everyone currently traveling with you with a Dismiss button per slot — dismiss one to free the slot for a swap. The recruiting NPC themselves always stays put at their original location as a separate, talkable entity; the companion is a second, following copy, not a relocation.

Companions can now be hurt and can die — and enemies target them the same way they target players. Enemy AI's aggro pick (`Room.findNearestTarget`) scans every live player *and* companion in range and locks onto whichever is nearest, so a companion standing between its owner and a wolf can pull the wolf off the player entirely, get telegraphed at, and take a real attack on the enemy's own attack cooldown — not just a reflexive counter-hit. Landing the companion's own attack on an enemy with no current target pulls aggro onto the companion itself (`companionAttack`), the same threat pickup a player's first hit already gets in `damageEnemy`; from there the enemy's normal targeting AI decides whether it keeps swinging at the companion or peels off toward the owner once someone else is closer. Companions have real HP (100, tracked and broadcast for real in `CompanionSnapshot`) and can be worn down and killed in a prolonged fight; a dead companion goes still, is hidden from the world, and gets back up on its own after `COMPANION_REVIVE_MS` (25s), full health, at its owner's side — no dismiss/re-recruit needed. Verified directly against the live `Room` targeting/attack code: with a player and companion standing on the exact same tile as a Moonlit Wolf, the wolf locks onto the companion over the player and damages only the companion over several attack cycles; with the companion pulled far out of aggro range, the same wolf falls back to targeting the player exactly as before — and a companion's own hit on a targetless enemy pulls its aggro onto the companion, not the owner.

Sixty NPCs are fully wired end-to-end today, each with a **signature choice** — a real decision with real faction-loyalty consequences. Four of them (marked below) can be recruited as a companion instead of just answering a faction-flavored choice:

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
| Bran Fieldhand *(companion)* | Threadhold | Independent | Recruit him, tell him to stay and mind the fields, or dismiss him outright. |
| Thorn Ash-Debt *(companion)* | Ashmire | Independent | Hire him, decline for now, or exploit his mercenary debt instead. |
| Solace Stillwater *(companion)* | The Frayedge | Pale Choir | Promise not to make her watch you kill the helpless and recruit her, decline, or mock her principles. |
| Nix Fray *(companion)* | The Frayedge | Independent | Recruit her, ask her to prove herself first, or turn her in to Warden Kael for thieving. |
| Garrow Thistlewood | Threadhold | Independent | Take the Chainwrights' steel for the militia, refuse and stay self-armed, or take it and never report a shard fall. |
| Sera Quill | Threadhold | Luminari | Publish her shardfall data openly, sell it to the Chainwrights, or destroy it. |
| Old Tam Hollis | Threadhold | Independent | Dig a new well that drains a shard-touched creek, refuse, or dig elsewhere at higher cost. |
| Wick | Threadhold | Independent | Fold his crew into Elder Maeve's care, hand them to Warden Oris, or pit them against Nix Fray's crew. |
| Quartermaster Dross | Ashmire | Chainwrights | Report Forge-Mother Breca's smuggling, buy from her quietly, or cut a deal that pays everyone. |
| Ember-Widow Yssa | Ashmire | Pale Choir | Give a Hollowed mass grave the Chainwright rite, the Choir's rite, or leave it unmourned. |
| Cinder | Ashmire | Independent | Talk a half-Hollowed woman back from the edge, mercy-kill her, or send her to the Frayedge commune. |
| Rook Ashvane | Ashmire | Independent | Partner with Rook against Slag, warn Slag of the claim-jump, or sell Rook out. |
| Nerissa Thal | Sunken Llyr | Luminari | Help raise a sample from the drowned city, side with Oren to let it sleep, or loot it first. |
| "Hook" Dallow | Sunken Llyr | Independent | Help Sera Voss's first mate retire, help him raise a new flag, or help him betray her for one last score. |
| The Drowned Choir | Sunken Llyr | Pale Choir | Let them keep tide-singing, silence them for the fisherfolk, or join the ritual yourself. |
| Fisher-Marshal Coll | Sunken Llyr | Chainwrights | Help requisition Old Finn's lighthouse, warn him, or broker a neutrality-preserving compromise. |
| Widow Karse | Mourncrown | Independent | Perform a banned death-rite openly, perform it in secret, or follow the Order's ban. |
| Wraith-Binder Tessamet | Mourncrown | Luminari | Bind a truth-holding wraith for Luminari study, free it with Brother Ink, or sell the memory. |
| Rurik Ashgrave | Mourncrown | Independent | Help Thane Corvin's second hold the clan together, tell him to step aside, or convince him to leave. |
| Fenwick | Mourncrown | Pale Choir | Help a Choir-boy search for his erased sister, tell him gently to stop, or take him to Brother Ink's archive. |
| Archivist Sela Wynne | Spirechain | Independent | Smuggle dissenting testimony out, hand it to Chancellor Irin, or publish it immediately. |
| Construct-warden Iyo | Spirechain | Chainwrights | Let Magistrate Thorne repurpose a construct, report him, or quietly sabotage it. |
| The Unbound Cipher | Spirechain | Unknown | Petition the Chainwrights for personhood, disappear into the Frayedge, or report its own awakening. |
| Notary Ysolde Fenn | Spirechain | Luminari | Leak the ledger of every political pact, sell it back for protection, or burn it. |
| The Herald of the Tear | The Frayedge | Unknown | Widen the Tear, seal it, or just listen and record. |
| Quartz | The Frayedge | Independent | Expand Warden Kael's sanctuary, keep it small and hidden, or turn it into a real settlement. |
| Grask the Unmade | The Frayedge | Independent | Buy "safe" Hollowed-touched wares, refuse, or trade him a live Moonshard in return. |
| Founder Iss | The Frayedge | Independent | Back Warden Kael's sanctuary, stay neutral, or sell the settlements' support to a faction. |
| The Moonthread Warden | The Moonthread | Unknown | **The scripted finale** — Bind, Balance, or Sever the Moonthread itself, for real. |
| Echo of Selen | The Moonthread | Unknown | Let Selen's memory overwrite more of you, fight to stay entirely yourself, or search for a self that holds both. |
| Archmagister Thessaly Vane | The Moonthread | Chainwrights | Defend the binding mechanism to the last, step aside and let the choice be yours, or beg you to sever it. |

### Fate: a real scripted finale

The Character panel's "Fate" section still computes and shows a live **trending ending** from your current faction loyalty and Moon-Touched stage (`trendingEnding` in `packages/shared/src/lore/endings.ts`) for as long as your story is still open — but it's no longer a preview with nothing to actually branch into. Reach the Moonthread zone (see "The Moonthread" above — it's gated behind trusting The Cartographer) and resolve the Moonthread Warden's signature choice, and the story ends for real:

- **The Moonthread**: Bind (repair it) / Balance (weaken but maintain) / Sever (break it and let Selen drift) — this is now the Warden's actual choice, not a loyalty-score reading.
- **The Moon-Touched**: Cure / Accept / Embrace — still read from the `lunarResonance` stage you earned over the whole playthrough, at the moment you make the Moonthread choice.

Those two axes combine into nine possible "major endings" (The Silver Chain, The Gilded Cage, The Lullaby, The Dim Light, The Shared Sky, The Bridge, The Long Fall, The Drift, The Becoming) — see `endings.ts` for the full table. Resolving the Warden's choice sets `CharacterState.endingId` permanently (`DialogueOption.locksEndingThread`, applied in `Room.handleDialogueChoice`); once set, the Fate panel switches from "Trending toward…" to "Your ending: …" and stops recomputing it. Verified live over the wire: choosing Sever with a fresh, `touched`-stage character correctly locked in **The Long Fall** (sever + cure), matching the axis table exactly.

### Secret endings and epilogue variants

Two things the original design called for and the vertical slice didn't have until now: endings beyond the nine-way axis grid, and endings that read back what happened to specific NPCs instead of only your own faction/Moon-Touched numbers.

**Two secret endings** (`SECRET_ENDINGS` in `endings.ts`) sit outside `MAJOR_ENDINGS` entirely, so they never show up in the Fate panel's live "trending" preview — the only way to ever see one is to actually earn it. `secretEndingFor` is consulted once, at the exact moment `Room.handleDialogueChoice` would otherwise lock in a normal major ending, and only overrides that lookup for a genuine loyalty extreme: **The Threadkeeper's Peace** requires choosing Balance while "exalted" (factions.ts's top loyalty rung, 80+) with *all three* factions simultaneously — trusted by everyone who should by rights distrust each other, precisely because you never picked a side. **The Unmaking** is its dark mirror: choosing Sever while "hunted" (the bottom rung, -80 or lower) by all three *and* Hollowed, the deepest Moon-Touched stage — an outcast with nothing left on Aethon to lose. Both conditions are checked against loyalty as it stood walking into the Warden's chamber, not after that final choice's own (often faction-nudging) delta lands — a Balance or Sever pick that happens to bump a faction's score by a few points can't accidentally push you into or out of the secret condition. A locked secret ending shows a "(a secret ending)" tag in the Fate panel so it reads as the rarity it is.

**Key-fate epilogue lines** (`keyFateEpilogue` in the new `packages/shared/src/lore/epilogue.ts`) are a small, curated table of pivotal signature-choice outcomes — Thane Corvin's hall, Warden Kael's sanctuary, Grask's fate, Aldric Vane's reckoning — each keyed off a memory tag `Room.handleDialogueChoice` was already writing the moment you resolved that choice, the same "derive it live, never store it redundantly" discipline `computeRelationship` and `cascadeFor` already use elsewhere in the lore layer. No new state, no new server logic: the Fate panel now reads `CharacterState.npcMemory` (already sent to the client on every update) straight through this table and lists "Threads that shaped your story" underneath your ending, growing as you resolve more of the roster — visible from the moment you make your first pivotal choice, not just at the finale.

Verified directly against the real `Room.handleDialogueChoice` path (not just the standalone helper): resolving the Warden's Balance option with all-exalted loyalty locks `threadkeepers_peace`; resolving Sever while Hollowed and hunted by all three locks `the_unmaking`; an ordinary loyalty spread resolving Bind still locks a normal major ending (`silver_chain`) completely unaffected by the new check; and re-resolving an already-locked finale doesn't overwrite it. `keyFateEpilogue` was checked against both an empty memory (no lines) and a memory carrying two resolved pivotal tags (exactly those two lines, worded correctly).

### What's designed but not yet built

Being explicit about scope, because it matters: the original narrative design for this game specifies a roster of **60+ named recurring characters** across seven planned regions, a full NPC relationship web, an 8-chapter story, and a much richer ending system with secret endings and NPC-survival variants beyond the single scripted choice built here. All seven regions — the six standard zones plus the Moonthread endgame — are real, working zones today, and all 60 named characters from the "immediate roster" are wired end-to-end, including a formalized relationship graph (rivalries, alliances, and seven working death cascades — see above), two-companion support with a dismiss/swap panel, companion damage and death, and a scripted finale that actually locks an ending instead of just previewing one. Still unbuilt, and out of scope for this pass: the full 8-chapter story structure (today's finale is a single climactic choice, not a multi-chapter branching campaign); secret/hidden endings and NPC-survival ending variants beyond the nine major endings; and the four separate pre-existing roadmap items below (a fourth class, dungeons, player trading, and mounts), plus audio, none of which this pass touched. Building further roster depth beyond the 60 is now genuinely just content authoring against systems already proven twice over (33 characters, then 27 more) — the relationship-graph, companion, zone-gating, and finale-locking engineering is done.

A handful of the original brief's "immediate decisions" are also still genuinely open and worth answering: how many playable origins (all Moon-Touched the same way, vs. class-based, vs. region/race-based, vs. player-authored background); whether more than three factions should exist or players can belong to more than one at once; overall tone (hopeful-gothic vs. cosmic horror vs. high fantasy adventure); whether the moon's true nature is revealed at launch or stays ambiguous for years; how deep companion romance/loyalty arcs should go versus staying functional; and voice acting scope (full, partial, or text+whisper-audio only).

## Architecture notes (for whoever picks this up next)

- `@moon/shared` is the single source of truth for game data (classes/abilities/items/recipes/enemies, zones, factions/memory/NPC dialogue/endings) and the WebSocket protocol types. Client and server both import it, so balance and protocol changes can't silently drift apart.
- The server is authoritative for all gameplay state (position, HP, combat resolution, loot, faction loyalty, NPC memory); the client renders and predicts local movement for responsiveness, softly reconciling against the server snapshot rather than hard-snapping.
- The tick loop runs at ~15 Hz; the client interpolates/animates at full frame rate between snapshots.
- Narrative/lore code lives under `packages/shared/src/lore/`: `factions.ts` (loyalty scores + ladder), `memory.ts` (per-NPC memory tags + relationship derivation), `relationships.ts` (the rivalry/alliance graph + death cascades), `npc.ts` (the NPC roster + dialogue resolution, including cascade overrides and the finale's `locksEndingThread`), `moonTouched.ts` (Moon-Touched stage progression), `endings.ts` (the ending-axis model, now actually locked by the finale rather than only previewed).
- Companions are keyed by a composite `${ownerId}:${defId}` id server-side (`Room.companions`, `companionEntityId` in `room.ts`) so one owner can have `MAX_COMPANIONS` (2) active at once; `CharacterState.companionIds` is the persisted source of truth, migrated in `db.ts` from the old single-`companionId` column for any pre-existing saves.
- **Automated tests**: `packages/server/test/` and `packages/shared/test/`, run via `npm run test` (Node's built-in test runner via `tsx --test`, no new test-framework dependency). Every feature added across this project's later passes — companion AI targeting, persistent world events, secret endings, player trading, mounts, and the second specialization tier — had a scratch verification script written against the real `Room`/`inventory`/`endings` code before shipping, then thrown away once the feature was confirmed working; these files are that same verification made permanent instead of one-off, so a future change that breaks one of those invariants fails a test instead of shipping silently. Server tests share fixtures from `test/helpers.ts` (`makePlayer`/`makeCompanion`, a fake WebSocket that just records sent messages) and run against an isolated SQLite file (`MOON_DB_PATH` set only for the test script, gitignored, torn down between runs) so they never touch a real dev database. `--test-concurrency=1` is required — every test file transitively imports `db.ts` through `Room`/`character.ts`, and `better-sqlite3`'s `WAL` pragma throws `SQLITE_BUSY` if multiple test-runner subprocesses race to open the same file at once.
- **CI**: `.github/workflows/ci.yml` runs typecheck, build, and the full test suite on every push to `main` and every pull request — a test suite nobody runs automatically catches far less than one wired into the merge path. The README's CI badge reflects its live status.

## Roadmap ideas (not yet built)

Roughly in the order they'd most improve the game:

1. **Deeper story structure** — partially built: two secret endings and a key-fate epilogue reader now sit on top of the nine major endings (see "Secret endings and epilogue variants" above), but the finale is still one climactic choice (the Moonthread Warden's Bind/Balance/Sever), not the full 8-chapter branching campaign the original brief calls for. The relationship graph, death-cascade mechanism, companion system, zone-gating, and ending-lock are all built and proven (see "Rivalries, alliances, and death cascades," "Companions," and "Fate" above) — the remaining gap is chapter/branch content authoring against those systems, not new core engineering.
2. ~~**A second specialization tier**~~ — built: a third elite-spec option per class (Sentinel, Windwalker, Wardweaver, Ashwalker — see "Classes & combat" above), proving the weapon-kit/specialization system generalizes a third time (new class, and now a third option per existing class) with zero changes to the choosing/rendering code, only new data and mechanic hooks.
3. ~~**Dungeons**~~ — built: The Hollow Vault (see "Dungeons" above). Worth adding more of once there's a second one to compare against — right now there's exactly one boss-gated example proving the pattern (level-gated zone + a long-respawn boss + exclusive loot), not a library of them.
4. ~~**Player trading**~~ — built: a two-player trade window, gated by proximity and mutual confirmation (see "Player trading" above). A full shared economy (an auction house, currency, NPC vendors) is still open — this is direct player-to-player trading only.
5. ~~**Mounts / faster traversal**~~ — built: press `M` to mount up for a flat speed multiplier, auto-dismounted by combat or gathering (see "Mounts" above).
6. ~~**Persistent world events**~~ — built: a roaming rare spawn, The Wandering Moonstag, appears every few minutes in a randomly chosen zone and is announced to the whole room over chat (see "Persistent world events" above), giving solo and party play a reason to cross paths without forcing grouping.
7. ~~**Full independent enemy-vs-companion AI targeting**~~ — built: enemy AI now picks the nearest live player *or* companion as its aggro target and attacks it directly (see "Companions" above), rather than only ever damaging a companion via retaliation on its own attacks.
8. ~~**Audio**~~ — built: procedurally synthesized ambient per-zone drones and combat/loot/travel SFX, no asset files needed (see "Audio" above). Voice for the dialogue system is still open — that needs actual recorded or generated speech, not something proceduralizable the way tones and noise bursts are.
