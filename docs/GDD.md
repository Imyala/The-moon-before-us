# The Moon Before Us — Game Design Document

## Vision

A coop action-RPG with an MMO *feel* — the moment-to-moment combat and character-building depth of Guild Wars 2 or WoW, the social ease of Fellowship, without the friction of scheduling raids or committing hours you don't have. You can:

- **Play entirely solo**, at your own pace, in the same living world.
- **Start a party** and get a 5-character code to text to friends.
- **Join a friend's party** and be standing next to them in seconds — no character wipe, no separate solo/multiplayer progress, no queue.
- **Leave anytime.** Nothing blocks you from quitting mid-session; your character and the party simply continue without you.

Everything in the current build is built around that pillar: quick jump in, quick jump out, and full character depth either way.

## Design pillars

1. **Drop-in, drop-out first.** Every system (loot, XP, respawn, party membership) is designed so a player joining or leaving mid-session never blocks or punishes anyone.
2. **Deep enough to matter, light enough to onboard in a minute.** Three classes, five abilities each, a 3-rank upgrade per ability, real itemization — but no 40-hour tutorial.
3. **Coop-friendly, not coop-required.** XP and loot are rolled per-player (not shared/contested), so a full party never feels worse than soloing.
4. **Beautiful without needing an art team.** Stylized, toon-shaded low-poly geometry + moonlit lighting reads as intentional and charming without hand-authored art assets.

## Current scope: the vertical slice

This build is a **foundation**, not the finished game. It implements one zone ("the glade") with the full gameplay loop working end-to-end — movement, combat, AI, gathering, crafting, itemization, leveling, and real-time coop — so every future feature (more zones, more classes, dungeons, PvP, mounts, a real economy) has a proven spine to build on rather than a prototype that needs rearchitecting.

### World

A single moonlit glade (a circular zone, ~58-unit radius) shared by every instance of the game — solo and party sessions are two live copies of the *same place*, not different content. It's stocked with:

- 12 enemy spawns across 5 enemy types (3 common "minion" types, 1 "elite," 1 zone "boss")
- 13 resource nodes across 4 gathering types (ore, timber, herbs, Aether crystals)

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

- A **Room** is a live server-side simulation of the glade — either a private **solo** instance or a **party** instance identified by a shareable code.
- Joining or leaving a room never pauses or resets it for anyone else.
- Enemy kills and gathering award XP/loot **per player**, independently — no kill-stealing, no ninja looting, no reason a bigger party ever feels worse than soloing.
- Characters persist per-browser (a local token), independent of which room they're played in — the *character* is the persistent unit, not the session.

## Architecture notes (for whoever picks this up next)

- `@moon/shared` is the single source of truth for game data (classes/abilities/items/recipes/enemies) and the WebSocket protocol types. Client and server both import it, so balance changes and protocol changes can't silently drift apart.
- The server is authoritative for all gameplay state (position, HP, combat resolution, loot); the client renders and predicts local movement for responsiveness, softly reconciling against the server snapshot rather than hard-snapping.
- The tick loop runs at ~15 Hz; the client interpolates/animates at full frame rate between snapshots.

## Roadmap ideas (not yet built)

Roughly in the order they'd most improve the game:

1. **More zones** — the world/room system already supports it; needs new spawn layouts + a travel point.
2. **A fourth combat class, and/or a second specialization tier** (à la GW2's multiple elite specs) — the weapon-kit/specialization system generalizes cleanly to more of both.
3. **Dungeons**: an instanced room variant with a boss-gated multi-enemy encounter and its own loot table.
4. **Player trading / a shared economy** — deliberately deferred; per-player loot avoids needing it for the vertical slice, but a real game wants it.
5. **Mounts / faster traversal** for a bigger world.
6. **Persistent world events** (e.g., a roaming rare spawn) to give solo and party play a reason to cross paths without forcing grouping.
7. **Audio** — currently silent; ambient moonlit-glade audio + combat SFX would be the single highest-impact next pass on "amazing and fun."
