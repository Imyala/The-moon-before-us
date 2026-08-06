# The Moon Above Our World

A drop-in, drop-out coop action-RPG with an MMO feel — inspired by SWTOR, Guild Wars 2, WoW, and Fellowship. Play solo or bring friends; jump in and out anytime, no commitment required.

The moon **Selen** is chained to the world **Aethon** by a failing celestial engine called the **Moonthread**. Every character is **Moon-Touched** — able to hear the moon's memories — and three factions (the order-bound Chainwrights, the exploit-it Luminari, and the let-it-die Pale Choir) are fighting over what to do when the thread finally breaks.

This repo contains a playable **vertical slice**: a real client/server game with deep-enough combat, crafting, and progression systems, plus a working narrative layer — faction loyalty, NPC memory, and in-world (no-cutscene) dialogue — built as the foundation for a larger game. See [`docs/GDD.md`](docs/GDD.md) for the full design vision, narrative bible, and roadmap.

## Stack

- **Client**: TypeScript + [Three.js](https://threejs.org/) (stylized low-poly/toon 3D) + Vite
- **Server**: Node.js + TypeScript + WebSockets (`ws`), authoritative simulation, SQLite (`better-sqlite3`) for character persistence
- **Shared**: a `@moon/shared` package with game data (classes, abilities, items, recipes, enemies) and the network protocol, imported by both client and server so they can never drift apart

## Running it locally

```bash
npm install

# terminal 1 — game server (ws://localhost:8787)
npm run dev:server

# terminal 2 — client (http://localhost:5173)
npm run dev:client
```

Open `http://localhost:5173` in a browser. To play with friends on the same network, share `http://<your-lan-ip>:5173` — the client auto-connects to the server on the same host.

Run `npm run typecheck` to typecheck all three packages.

## Controls

| Action | Key |
|---|---|
| Move | `WASD` |
| Look / orbit camera | hold right-click + move mouse |
| Abilities 1–6 | `1` `2` `3` `4` `5` `6` |
| Dodge (brief invulnerability) | `Space` |
| Gather a resource node / talk to an NPC | `E` |
| Inventory | `I` |
| Crafting | `R` |
| Character & skill tree | `C` |
| Chat | `Enter` |
| Target an enemy | left-click it |

## Playing together

On the landing screen, choose **Start a Party** to get a shareable 5-character code, or **Join a Party** to enter a friend's code. Choose **Solo** to play the exact same world alone. Characters persist per-browser (via a local token) regardless of which mode you play — level, gear, and inventory carry over whether you're solo or in a party.

## Project layout

```
packages/
  shared/         game data + network protocol, shared by client and server
    src/lore/     factions, NPC memory, dialogue, Moon-Touched progression, endings
  server/   authoritative WebSocket game server, SQLite persistence
  client/   Three.js game client, UI, input, networking
docs/
  GDD.md    game design document
```
