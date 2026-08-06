import * as THREE from "three";
import {
  CLASSES,
  activeAbilities,
  getAbility,
  getEnemy,
  getResourceNode,
  getZone,
  START_ZONE_ID,
  add,
  sub,
  scale,
  normalize,
  distance,
  clampToRadius,
  xpForLevel,
  type CharacterState,
  type EnemySnapshot,
  type GameEvent,
  type NodeSnapshot,
  type NpcSnapshot,
  type PlayerClassId,
  type PlayerSnapshot,
  type ServerMessage,
  type Vec3
} from "@moon/shared";
import { createWorld } from "./scene/world.js";
import { buildPlayerAvatar, buildEnemyAvatar, buildNpcAvatar, animateAvatar, type Avatar } from "./scene/avatars.js";
import { buildNodeMesh } from "./scene/nodes.js";
import { EffectsManager } from "./scene/effects.js";
import { InputController } from "./controller.js";
import { NetClient } from "./net.js";
import { Hud } from "./ui/hud.js";
import { Panels } from "./ui/panels.js";
import type { PanelKind } from "./ui/panels.js";
import { NameplateManager } from "./ui/nameplates.js";
import { DialoguePanel } from "./ui/dialogue.js";
import { renderLanding } from "./ui/landing.js";
import { getOrCreateToken, getSavedProfile, saveProfile } from "./identity.js";

const uiRoot = document.getElementById("ui-root") as HTMLDivElement;
const canvas = document.getElementById("scene") as HTMLCanvasElement;
const token = getOrCreateToken();
const saved = getSavedProfile();

const landing = renderLanding(uiRoot, { name: saved?.name ?? "", classId: (saved?.classId as PlayerClassId) ?? "warden" }, (result) => {
  saveProfile({ name: result.name, classId: result.classId });
  landing.setBusy(true);
  landing.setStatus("");
  connectAndPlay(result);
});

function connectAndPlay(join: { name: string; classId: PlayerClassId; room: string }) {
  const net = new NetClient();
  let started = false;

  const stopEarly = net.on((msg) => {
    if (msg.t === "welcome") {
      started = true;
      stopEarly();
      landing.destroy();
      runGame(net, msg.selfId, msg.roomCode, msg.character);
    } else if (msg.t === "error") {
      landing.setStatus(msg.message);
      landing.setBusy(false);
      net.close();
    }
  });

  net.onStatusChange = (status) => {
    if (status === "closed" && !started) {
      landing.setStatus("Could not reach the server. Check your connection and try again.");
      landing.setBusy(false);
    }
  };

  net.connect({ token, name: join.name, classId: join.classId, room: join.room });
}

// =====================================================================================

interface PlayerVisual {
  avatar: Avatar;
  renderPos: Vec3;
  renderFacing: number;
  targetFacing: number;
}

interface EnemyVisual {
  avatar: Avatar;
  renderPos: Vec3;
  renderFacing: number;
  targetFacing: number;
  defId: string;
}

interface NodeVisual {
  mesh: THREE.Group;
  defId: string;
}

interface NpcVisual {
  avatar: Avatar;
  name: string;
  title: string;
  position: Vec3;
}

function runGame(net: NetClient, selfId: string, roomCode: string, initialCharacter: CharacterState) {
  const world = createWorld(canvas);
  let currentZoneId = initialCharacter.zoneId ?? START_ZONE_ID;
  let currentZoneRadius = getZone(currentZoneId).radius;
  world.loadZone(getZone(currentZoneId));
  const effects = new EffectsManager(world.scene, world.camera, uiRoot);
  const nameplates = new NameplateManager(uiRoot, world.camera);
  const controller = new InputController(canvas);
  const hud = new Hud(uiRoot, initialCharacter.classId);
  const panels = new Panels(uiRoot, net, () => character);
  const dialogue = new DialoguePanel(uiRoot);
  const dmgContainer = uiRoot;

  dialogue.onChoose = (npcId, optionId) => net.send({ t: "chooseDialogueOption", npcId, optionId });

  hud.setRoomCode(roomCode === "solo" ? null : roomCode);
  hud.setZoneName(getZone(currentZoneId).name);
  hud.onChatSend = (msg) => net.send({ t: "chat", message: msg });
  controller.onAbility = (slot) => useAbility(slot);
  controller.onDodge = () => sendDodge();
  controller.onInteract = () => tryInteract();
  controller.onTargetClick = () => tryTargetClick();
  controller.onToggleInventory = () => panels.toggle("inventory");
  controller.onToggleCrafting = () => panels.toggle("crafting");
  controller.onToggleCharacter = () => panels.toggle("character");

  let character: CharacterState = initialCharacter;
  let selfPos: Vec3 = { ...initialCharacter.position };
  if (selfPos.x === 0 && selfPos.y === 0 && selfPos.z === 0) selfPos = { ...getZone(currentZoneId).spawnPoint };
  let selfFacing = 0;
  let lastServerSelfPos: Vec3 = { ...selfPos };
  let selfState: string = "idle";
  let selfShield = 0;

  const selfAvatar = buildPlayerAvatar(character.classId, CLASSES[character.classId].color);
  world.scene.add(selfAvatar.group);

  const players = new Map<string, PlayerVisual>();
  const enemies = new Map<string, EnemyVisual>();
  const nodes = new Map<string, NodeVisual>();
  const npcs = new Map<string, NpcVisual>();
  const cooldownReadyAt = new Map<string, number>();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const raycaster = new THREE.Raycaster();

  let selectedTargetId: string | null = null;
  let gathering: { nodeId: string; startedAt: number; durationMs: number } | null = null;
  let nearestNodeId: string | null = null;
  let nearestNpcId: string | null = null;
  let lastInputSentAt = 0;
  let lastSentMove: Vec3 = { x: 0, y: 0, z: 0 };
  let latestRoster: { id: string; name: string; classId: PlayerClassId; level: number }[] = [{ id: selfId, name: character.name, classId: character.classId, level: character.level }];

  net.on((msg) => handleServerMessage(msg));

  function handleServerMessage(msg: ServerMessage) {
    switch (msg.t) {
      case "snapshot":
        applySnapshot(msg.players, msg.enemies, msg.nodes, msg.npcs);
        for (const ev of msg.events) handleEvent(ev);
        break;
      case "npcDialogue":
        dialogue.show(msg.npcId, msg.speaker, msg.line, msg.choices);
        break;
      case "characterUpdate":
        character = msg.character;
        panels.refresh();
        break;
      case "partyRoster":
        latestRoster = msg.members;
        hud.setRoster(latestRoster, selfId);
        break;
      case "chat":
        hud.addChatLine(msg.from, msg.message);
        break;
      case "error":
        hud.pushToast(msg.message, "info");
        break;
    }
  }

  function handleEvent(ev: GameEvent) {
    if (ev.type === "damage") {
      effects.spawnDamageNumber(ev.pos, ev.amount, ev.crit ? "crit" : "damage");
      effects.spawnHitBurst(ev.pos, ev.crit ? "#ffcf5c" : "#ffffff");
      const casterAvatar = players.get(ev.sourceId)?.avatar;
      if (casterAvatar) casterAvatar.attackPulse = 1;
      const targetAvatar = players.get(ev.targetId)?.avatar ?? enemies.get(ev.targetId)?.avatar;
      if (targetAvatar) targetAvatar.flashUntil = performance.now() + 140;
      if (ev.targetId === selfId) shakeCamera();
    } else if (ev.type === "heal") {
      effects.spawnDamageNumber(ev.pos, ev.amount, "heal");
    } else if (ev.type === "levelUp") {
      if (ev.playerId === selfId) hud.pushToast(`Level up! You are now level ${ev.level}.`, "levelup");
    } else if (ev.type === "loot") {
      if (ev.playerId === selfId) {
        const def = getEnemy(ev.itemId); // not an enemy but harmless lookup miss
        hud.pushToast(`+${ev.quantity} ${itemName(ev.itemId)}`, "loot");
      }
    } else if (ev.type === "craft") {
      if (ev.playerId === selfId) hud.pushToast(`Crafted ${itemName(ev.itemId)} x${ev.quantity}`, "loot");
    } else if (ev.type === "skillPoint") {
      // handled visually via panel refresh
    } else if (ev.type === "abilityCast") {
      const avatar = players.get(ev.casterId)?.avatar ?? (ev.casterId === selfId ? selfAvatar : undefined);
      if (avatar) avatar.attackPulse = 1;
    } else if (ev.type === "death") {
      if (!ev.isPlayer) {
        effects.clearTelegraph(ev.entityId);
      }
    } else if (ev.type === "zoneChange") {
      if (ev.playerId === selfId) enterZone(ev.toZoneId);
    }
  }

  function enterZone(zoneId: string) {
    currentZoneId = zoneId;
    const zone = getZone(zoneId);
    currentZoneRadius = zone.radius;
    world.loadZone(zone);
    selfPos = { ...character.position };
    lastServerSelfPos = { ...selfPos };
    hud.setZoneName(zone.name);
    hud.pushToast(`Entering ${zone.name}`, "info");
  }

  function itemName(itemId: string): string {
    return itemId.replace(/^(mat_|weapon_|armor_|trinket_|potion_)/, "").replace(/_/g, " ");
  }

  let shakeUntil = 0;
  function shakeCamera() {
    shakeUntil = performance.now() + 160;
  }

  function applySnapshot(playerSnaps: PlayerSnapshot[], enemySnaps: EnemySnapshot[], nodeSnaps: NodeSnapshot[], npcSnaps: NpcSnapshot[]) {
    const seenPlayers = new Set<string>();
    for (const p of playerSnaps) {
      seenPlayers.add(p.id);
      if (p.id === selfId) {
        lastServerSelfPos = p.position;
        character.hp = p.hp;
        character.maxHp = p.maxHp;
        character.resource = p.resource;
        character.maxResource = p.maxResource;
        selfState = p.state;
        selfShield = p.shield;
        continue;
      }
      let vis = players.get(p.id);
      if (!vis) {
        const avatar = buildPlayerAvatar(p.classId, CLASSES[p.classId].color);
        world.scene.add(avatar.group);
        vis = { avatar, renderPos: { ...p.position }, renderFacing: p.facing, targetFacing: p.facing };
        players.set(p.id, vis);
      }
      (vis as any).targetPos = p.position;
      vis.targetFacing = p.facing;
      (vis as any).hp = p.hp;
      (vis as any).maxHp = p.maxHp;
      (vis as any).name = p.name;
      (vis as any).state = p.state;
    }
    for (const id of [...players.keys()]) {
      if (!seenPlayers.has(id)) {
        world.scene.remove(players.get(id)!.avatar.group);
        players.delete(id);
        nameplates.remove(id);
      }
    }

    const seenEnemies = new Set<string>();
    for (const e of enemySnaps) {
      seenEnemies.add(e.id);
      let vis = enemies.get(e.id);
      const def = getEnemy(e.defId)!;
      if (!vis) {
        const avatar = buildEnemyAvatar(e.defId, def.color, def.scale);
        world.scene.add(avatar.group);
        vis = { avatar, renderPos: { ...e.position }, renderFacing: e.facing, targetFacing: e.facing, defId: e.defId };
        enemies.set(e.id, vis);
      }
      (vis as any).targetPos = e.position;
      vis.targetFacing = e.facing;
      (vis as any).hp = e.hp;
      (vis as any).maxHp = e.maxHp;
      (vis as any).state = e.state;
      vis.avatar.group.visible = e.state !== "dead";
      if (e.telegraph) {
        effects.setTelegraph(e.id, e.telegraph.pos, e.telegraph.abilityRadius, e.telegraph.endAt);
      } else {
        effects.clearTelegraph(e.id);
      }
      if (e.state === "attack") vis.avatar.attackPulse = Math.max(vis.avatar.attackPulse, 0.5);
    }
    for (const id of [...enemies.keys()]) {
      if (!seenEnemies.has(id)) {
        world.scene.remove(enemies.get(id)!.avatar.group);
        enemies.delete(id);
        nameplates.remove(id);
        effects.clearTelegraph(id);
      }
    }
    if (selectedTargetId && !enemies.has(selectedTargetId)) selectedTargetId = null;

    const seenNodes = new Set<string>();
    for (const n of nodeSnaps) {
      seenNodes.add(n.id);
      let vis = nodes.get(n.id);
      if (!vis) {
        const def = getResourceNode(n.defId)!;
        const mesh = buildNodeMesh(def.type, def.color);
        mesh.position.set(n.position.x, n.position.y, n.position.z);
        world.scene.add(mesh);
        vis = { mesh, defId: n.defId };
        nodes.set(n.id, vis);
      }
      vis.mesh.visible = !n.depleted;
    }
    for (const id of [...nodes.keys()]) {
      if (!seenNodes.has(id)) {
        world.scene.remove(nodes.get(id)!.mesh);
        nodes.delete(id);
      }
    }

    const seenNpcs = new Set<string>();
    for (const n of npcSnaps) {
      seenNpcs.add(n.id);
      let vis = npcs.get(n.id);
      if (!vis) {
        const avatar = buildNpcAvatar("#8f8474");
        world.scene.add(avatar.group);
        vis = { avatar, name: n.name, title: n.title, position: { ...n.position } };
        npcs.set(n.id, vis);
      }
      vis.position = n.position;
      vis.avatar.group.position.set(n.position.x, 0, n.position.z);
    }
    for (const id of [...npcs.keys()]) {
      if (!seenNpcs.has(id)) {
        world.scene.remove(npcs.get(id)!.avatar.group);
        npcs.delete(id);
        nameplates.remove(id);
      }
    }

    updateNearestNode();
    updateNearestNpc();
  }

  function updateNearestNode() {
    let best: string | null = null;
    let bestDist = 4.2;
    for (const [id, vis] of nodes) {
      if (!vis.mesh.visible) continue;
      const d = Math.hypot(vis.mesh.position.x - selfPos.x, vis.mesh.position.z - selfPos.z);
      if (d < bestDist) {
        bestDist = d;
        best = id;
      }
    }
    nearestNodeId = best;
  }

  function updateNearestNpc() {
    let best: string | null = null;
    let bestDist = 4;
    for (const [id, vis] of npcs) {
      const d = Math.hypot(vis.position.x - selfPos.x, vis.position.z - selfPos.z);
      if (d < bestDist) {
        bestDist = d;
        best = id;
      }
    }
    nearestNpcId = best;
  }

  // ---------------- Input handling ----------------

  function useAbility(slot: number) {
    if (panels.isOpen() || hud.isChatFocused()) return;
    const ability = activeAbilities(character).find((a) => a.slot === slot);
    if (!ability) return;
    const readyAt = cooldownReadyAt.get(ability.id) ?? 0;
    if (performance.now() < readyAt) return;

    let targetPos: Vec3 | undefined;
    let targetEntityId: string | undefined;

    const needsGroundTarget = ability.radius > 0 && ability.range > 0;
    if (needsGroundTarget) {
      const point = raycastGround();
      if (point) {
        const offset = clampToRadius(sub(point, selfPos), ability.range);
        targetPos = add(selfPos, offset);
      }
    } else if (ability.radius === 0 && (ability.effect === "damage" || ability.effect === "cc" || ability.effect === "debuff")) {
      targetEntityId = selectedTargetId ?? undefined;
    }

    net.send({ t: "useAbility", abilityId: ability.id, targetPos, targetEntityId });
    cooldownReadyAt.set(ability.id, performance.now() + ability.cooldownMs * (1 - character.stats.haste));
  }

  function raycastGround(): Vec3 | null {
    raycaster.setFromCamera(controller.mouseNdc, world.camera);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, hit)) return { x: hit.x, y: 0, z: hit.z };
    return null;
  }

  function sendDodge() {
    if (panels.isOpen() || hud.isChatFocused()) return;
    const intent = controller.getMoveIntent();
    let dir = { x: intent.x, y: 0, z: intent.z };
    if (dir.x === 0 && dir.z === 0) {
      dir = { x: Math.sin(selfFacing), y: 0, z: Math.cos(selfFacing) };
    }
    net.send({ t: "dodge", dir });
  }

  function tryInteract() {
    if (panels.isOpen() || hud.isChatFocused()) return;

    const npcDist = nearestNpcId ? Math.hypot(npcs.get(nearestNpcId)!.position.x - selfPos.x, npcs.get(nearestNpcId)!.position.z - selfPos.z) : Infinity;
    const nodeDist = nearestNodeId ? Math.hypot(nodes.get(nearestNodeId)!.mesh.position.x - selfPos.x, nodes.get(nearestNodeId)!.mesh.position.z - selfPos.z) : Infinity;

    if (nearestNpcId && npcDist <= nodeDist) {
      net.send({ t: "talk", npcId: nearestNpcId });
      return;
    }
    if (nearestNodeId) {
      const vis = nodes.get(nearestNodeId);
      if (!vis) return;
      const def = getResourceNode(vis.defId)!;
      gathering = { nodeId: nearestNodeId, startedAt: performance.now(), durationMs: def.gatherTimeMs };
      net.send({ t: "interactNode", nodeId: nearestNodeId });
    }
  }

  function tryTargetClick() {
    if (panels.isOpen() || hud.isChatFocused()) return;
    raycaster.setFromCamera(controller.mouseNdc, world.camera);
    const meshes: { id: string; obj: THREE.Object3D }[] = [];
    for (const [id, vis] of enemies) {
      if (vis.avatar.group.visible) meshes.push({ id, obj: vis.avatar.group });
    }
    const hits = raycaster.intersectObjects(meshes.map((m) => m.obj), true);
    if (hits.length === 0) {
      return;
    }
    const hitObj = hits[0].object;
    for (const m of meshes) {
      if (isDescendant(m.obj, hitObj)) {
        selectedTargetId = m.id;
        break;
      }
    }
  }

  function isDescendant(root: THREE.Object3D, node: THREE.Object3D): boolean {
    let cur: THREE.Object3D | null = node;
    while (cur) {
      if (cur === root) return true;
      cur = cur.parent;
    }
    return false;
  }

  // ---------------- Game loop ----------------

  let lastFrame = performance.now();

  function frame() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastFrame) / 1000);
    lastFrame = now;

    if (!panels.isOpen() && !hud.isChatFocused()) {
      const intent = controller.getMoveIntent();
      const moving = intent.x !== 0 || intent.z !== 0;
      const canMove = character.hp > 0 && selfState !== "cast" && selfState !== "gather";
      if (moving && canMove) {
        selfFacing = Math.atan2(intent.x, intent.z);
        const next = add(selfPos, scale({ x: intent.x, y: 0, z: intent.z }, 5.2 * dt));
        selfPos = clampToRadius(next, currentZoneRadius - 0.5);
        if (gathering) gathering = null;
      }
      maybeSendInput(intent);
    }

    // reconcile self position softly toward server truth
    const drift = distance(selfPos, lastServerSelfPos);
    if (drift > 2.2) {
      selfPos = { ...lastServerSelfPos };
    }

    if (gathering) {
      const frac = Math.min(1, (now - gathering.startedAt) / gathering.durationMs);
      hud.showGather(true, frac);
      if (frac >= 1) gathering = null;
    } else {
      hud.showGather(false);
    }

    updateNearestNode();

    // avatars
    selfAvatar.group.position.set(selfPos.x, 0, selfPos.z);
    selfAvatar.group.rotation.y = selfFacing;
    animateAvatar(selfAvatar, now / 1000, selfState === "run", now);

    for (const [id, vis] of players) {
      const target = (vis as any).targetPos as Vec3;
      vis.renderPos = lerpVec(vis.renderPos, target, 1 - Math.pow(0.0005, dt));
      vis.avatar.group.position.set(vis.renderPos.x, 0, vis.renderPos.z);
      vis.renderFacing = lerpAngle(vis.renderFacing, vis.targetFacing, 1 - Math.pow(0.001, dt));
      vis.avatar.group.rotation.y = vis.renderFacing;
      const moving = (vis as any).state === "run";
      animateAvatar(vis.avatar, now / 1000 + id.length, moving, now);
      const hp = (vis as any).hp as number;
      const maxHp = (vis as any).maxHp as number;
      const name = (vis as any).name as string;
      nameplates.ensure(id, name, "ally");
      nameplates.update(id, add(vis.renderPos, { x: 0, y: 2.05, z: 0 }), hp / maxHp, hp > 0);
    }

    for (const [id, vis] of enemies) {
      const target = (vis as any).targetPos as Vec3;
      vis.renderPos = lerpVec(vis.renderPos, target, 1 - Math.pow(0.0003, dt));
      vis.avatar.group.position.set(vis.renderPos.x, 0, vis.renderPos.z);
      vis.renderFacing = lerpAngle(vis.renderFacing, vis.targetFacing, 1 - Math.pow(0.001, dt));
      vis.avatar.group.rotation.y = vis.renderFacing;
      const moving = (vis as any).state === "run" || (vis as any).state === "chase";
      animateAvatar(vis.avatar, now / 1000 + id.length, moving, now);
      const def = getEnemy(vis.defId)!;
      const hp = (vis as any).hp as number;
      const tone = def.tier === "boss" ? "boss" : def.tier === "elite" ? "boss" : "enemy";
      nameplates.ensure(id, def.name, tone as any);
      nameplates.update(id, add(vis.renderPos, { x: 0, y: 1.4 * def.scale + 0.6, z: 0 }), hp / def.maxHp, vis.avatar.group.visible);
      if (id === selectedTargetId && vis.avatar.group.visible) {
        vis.avatar.group.scale.setScalar(def.scale * (1 + 0.03 * Math.sin(now / 120)));
      } else {
        vis.avatar.group.scale.setScalar(def.scale);
      }
    }

    for (const [, vis] of nodes) {
      const spin = vis.mesh.userData.spin as THREE.Object3D | undefined;
      if (spin) spin.rotation.y += dt * 0.6;
    }

    for (const [id, vis] of npcs) {
      animateAvatar(vis.avatar, now / 1000 + id.length, false, now);
      nameplates.ensure(id, vis.name, "npc", vis.title);
      nameplates.update(id, add(vis.position, { x: 0, y: 2.05, z: 0 }), 1, true);
    }

    // camera
    const { yaw, pitch, distance: dist } = controller.orbit;
    const offset = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(dist);
    let camPos = new THREE.Vector3(selfPos.x, 1.4, selfPos.z).add(offset);
    if (now < shakeUntil) {
      camPos.x += (Math.random() - 0.5) * 0.12;
      camPos.y += (Math.random() - 0.5) * 0.12;
    }
    world.camera.position.copy(camPos);
    world.camera.lookAt(selfPos.x, 1.4, selfPos.z);

    hud.syncAbilityBar(character);
    hud.updateVitals(character);
    hud.updateShield((selfShield / Math.max(1, character.maxHp)) * 100);
    hud.showDeath(character.hp <= 0);

    const cds: Record<string, number> = {};
    for (const ab of activeAbilities(character)) {
      const readyAt = cooldownReadyAt.get(ab.id) ?? 0;
      const remaining = readyAt - now;
      const total = ab.cooldownMs * (1 - character.stats.haste);
      cds[ab.id] = remaining > 0 ? Math.min(1, remaining / total) : 0;
    }
    hud.updateCooldowns(cds);

    effects.update(now);
    world.renderer.render(world.scene, world.camera);
    requestAnimationFrame(frame);
  }

  function maybeSendInput(intent: { x: number; z: number }) {
    const now = performance.now();
    const moveVec: Vec3 = { x: intent.x, y: 0, z: intent.z };
    const changed = moveVec.x !== lastSentMove.x || moveVec.z !== lastSentMove.z;
    if (changed || now - lastInputSentAt > 250) {
      net.send({ t: "input", move: moveVec, facing: selfFacing, seq: Math.floor(now) });
      lastSentMove = moveVec;
      lastInputSentAt = now;
    }
  }

  hud.setRoster(latestRoster, selfId);
  requestAnimationFrame(frame);
}

function lerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
