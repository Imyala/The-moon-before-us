import type { WebSocket } from "ws";
import {
  getAbility,
  getEnemy,
  getResourceNode,
  add,
  distance,
  normalize,
  scale,
  type CharacterState,
  type ClientMessage,
  type EnemySnapshot,
  type EntityState,
  type GameEvent,
  type NodeSnapshot,
  type PlayerSnapshot,
  type ServerMessage,
  type Vec3
} from "@moon/shared";
import { randomUUID } from "node:crypto";
import { grantXp } from "./character.js";
import { addItem, craft as craftRecipe, equipItem, unequipItem, useConsumable } from "./inventory.js";
import {
  DODGE_COOLDOWN_MS,
  DODGE_DURATION_MS,
  DODGE_SPEED,
  ENEMY_SPAWNS,
  NODE_SPAWNS,
  PLAYER_SPAWN,
  PLAYER_SPEED,
  clampToWorld
} from "./world.js";

const TICK_MS = 66;
const RESPAWN_ENEMY_MS = 20000;
const PLAYER_RESPAWN_MS = 4000;
const DAMAGE_CONTRIBUTION_WINDOW_MS = 15000;

interface Casting {
  abilityId: string;
  endAt: number;
  targetPos?: Vec3;
  targetEntityId?: string;
}

interface Gathering {
  nodeId: string;
  endAt: number;
}

export interface PlayerEntity {
  id: string;
  token: string;
  ws: WebSocket;
  character: CharacterState;
  position: Vec3;
  facing: number;
  moveIntent: Vec3;
  state: EntityState;
  cooldowns: Map<string, number>;
  casting: Casting | null;
  dodgeUntil: number;
  dodgeDir: Vec3;
  dodgeReadyAt: number;
  shield: number;
  shieldUntil: number;
  gathering: Gathering | null;
  connected: boolean;
  resourceAccum: number;
}

interface EnemyEntity {
  id: string;
  defId: string;
  spawnPos: Vec3;
  patrolRadius: number;
  position: Vec3;
  facing: number;
  hp: number;
  maxHp: number;
  state: EntityState;
  targetId: string | null;
  attackReadyAt: number;
  telegraphEndAt: number | null;
  telegraphPos: Vec3 | null;
  deadAt: number | null;
  respawnAt: number | null;
  patrolTarget: Vec3 | null;
  nextDecisionAt: number;
  markedUntil: number;
  markedBonus: number;
  ccUntil: number;
  damagers: Map<string, number>; // playerId -> last damage timestamp
}

interface NodeEntity {
  id: string;
  defId: string;
  position: Vec3;
  depleted: boolean;
  respawnAt: number | null;
  gatheringBy: string | null;
}

export class Room {
  readonly id = randomUUID();
  readonly code: string | undefined;
  readonly isSolo: boolean;
  players = new Map<string, PlayerEntity>();
  private enemies = new Map<string, EnemyEntity>();
  private nodes = new Map<string, NodeEntity>();
  private events: GameEvent[] = [];
  private tick = 0;
  private interval: ReturnType<typeof setInterval> | null = null;
  private onEmpty: (room: Room) => void;
  private persist: (token: string, character: CharacterState) => void;
  private lastLoopAt = Date.now();
  private lastAutosaveAt = Date.now();

  constructor(opts: {
    code?: string;
    isSolo: boolean;
    onEmpty: (room: Room) => void;
    persist: (token: string, character: CharacterState) => void;
  }) {
    this.code = opts.code;
    this.isSolo = opts.isSolo;
    this.onEmpty = opts.onEmpty;
    this.persist = opts.persist;
    this.seedWorld();
    this.interval = setInterval(() => this.runTick(), TICK_MS);
  }

  private seedWorld() {
    for (const spawn of ENEMY_SPAWNS) {
      const def = getEnemy(spawn.defId)!;
      const id = randomUUID();
      this.enemies.set(id, {
        id,
        defId: spawn.defId,
        spawnPos: spawn.pos,
        patrolRadius: spawn.patrolRadius,
        position: { ...spawn.pos },
        facing: 0,
        hp: def.maxHp,
        maxHp: def.maxHp,
        state: "idle",
        targetId: null,
        attackReadyAt: 0,
        telegraphEndAt: null,
        telegraphPos: null,
        deadAt: null,
        respawnAt: null,
        patrolTarget: null,
        nextDecisionAt: 0,
        markedUntil: 0,
        markedBonus: 0,
        ccUntil: 0,
        damagers: new Map()
      });
    }
    for (const spawn of NODE_SPAWNS) {
      const id = randomUUID();
      this.nodes.set(id, {
        id,
        defId: spawn.defId,
        position: { ...spawn.pos },
        depleted: false,
        respawnAt: null,
        gatheringBy: null
      });
    }
  }

  addPlayer(ws: WebSocket, token: string, character: CharacterState) {
    const entity: PlayerEntity = {
      id: character.id,
      token,
      ws,
      character,
      position: character.position && (character.position.x || character.position.z) ? character.position : { ...PLAYER_SPAWN },
      facing: 0,
      moveIntent: { x: 0, y: 0, z: 0 },
      state: "idle",
      cooldowns: new Map(),
      casting: null,
      dodgeUntil: 0,
      dodgeDir: { x: 0, y: 0, z: 0 },
      dodgeReadyAt: 0,
      shield: 0,
      shieldUntil: 0,
      gathering: null,
      connected: true,
      resourceAccum: 0
    };
    if (character.hp <= 0) {
      entity.position = { ...PLAYER_SPAWN };
      character.hp = character.maxHp;
    }
    this.players.set(entity.id, entity);
    this.send(ws, { t: "welcome", selfId: entity.id, roomCode: this.code ?? "solo", character });
    this.broadcastRoster();
    return entity;
  }

  removePlayer(playerId: string) {
    const p = this.players.get(playerId);
    if (!p) return;
    p.character.position = p.position;
    this.persist(p.token, p.character);
    this.players.delete(playerId);
    this.broadcastRoster();
    if (this.players.size === 0) {
      this.shutdown();
    }
  }

  shutdown() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    this.onEmpty(this);
  }

  handleMessage(playerId: string, msg: ClientMessage) {
    const player = this.players.get(playerId);
    if (!player) return;
    const now = Date.now();

    switch (msg.t) {
      case "input": {
        player.moveIntent = clampVec(msg.move);
        player.facing = msg.facing;
        if ((player.moveIntent.x !== 0 || player.moveIntent.z !== 0) && player.gathering) {
          player.gathering = null;
          if (player.state === "gather") player.state = "idle";
        }
        break;
      }
      case "useAbility": {
        this.tryUseAbility(player, msg.abilityId, msg.targetPos, msg.targetEntityId, now);
        break;
      }
      case "dodge": {
        if (now >= player.dodgeReadyAt && !player.casting && player.character.hp > 0) {
          player.dodgeUntil = now + DODGE_DURATION_MS;
          player.dodgeReadyAt = now + DODGE_COOLDOWN_MS;
          player.dodgeDir = normalize(msg.dir);
          player.state = "dodge";
        }
        break;
      }
      case "interactNode": {
        this.tryGather(player, msg.nodeId, now);
        break;
      }
      case "craft": {
        const result = craftRecipe(player.character, msg.recipeId);
        if (result.ok) {
          this.events.push({ type: "craft", playerId: player.id, itemId: result.itemId, quantity: result.quantity });
          this.sendCharacterUpdate(player);
        } else {
          this.send(player.ws, { t: "error", message: result.reason });
        }
        break;
      }
      case "equip": {
        const result = equipItem(player.character, msg.itemIndex);
        if (result.ok) this.sendCharacterUpdate(player);
        else this.send(player.ws, { t: "error", message: result.reason });
        break;
      }
      case "unequip": {
        const result = unequipItem(player.character, msg.slot);
        if (result.ok) this.sendCharacterUpdate(player);
        else this.send(player.ws, { t: "error", message: result.reason });
        break;
      }
      case "useItem": {
        const result = useConsumable(player.character, msg.itemIndex);
        if (result.ok) this.sendCharacterUpdate(player);
        else this.send(player.ws, { t: "error", message: result.reason });
        break;
      }
      case "allocateSkillPoint": {
        this.allocateSkillPoint(player, msg.abilityId);
        break;
      }
      case "chat": {
        const text = (msg.message ?? "").slice(0, 200);
        if (text.trim().length === 0) break;
        this.broadcast({ t: "chat", from: player.character.name, message: text });
        break;
      }
      case "leave": {
        this.removePlayer(player.id);
        break;
      }
    }
  }

  // ---------------- Ability / Combat ----------------

  private effectiveRank(character: CharacterState, abilityId: string): number {
    return 1 + Math.min(character.abilityRanks[abilityId] ?? 0, 2);
  }

  private allocateSkillPoint(player: PlayerEntity, abilityId: string) {
    const ability = getAbility(abilityId);
    if (!ability || ability.classId !== player.character.classId) {
      this.send(player.ws, { t: "error", message: "Invalid ability." });
      return;
    }
    if (player.character.skillPoints <= 0) {
      this.send(player.ws, { t: "error", message: "No skill points available." });
      return;
    }
    const current = player.character.abilityRanks[abilityId] ?? 0;
    if (current >= ability.maxRanks - 1) {
      this.send(player.ws, { t: "error", message: "Ability already at max rank." });
      return;
    }
    player.character.abilityRanks[abilityId] = current + 1;
    player.character.skillPoints -= 1;
    this.events.push({ type: "skillPoint", playerId: player.id, abilityId, rank: current + 2 });
    this.sendCharacterUpdate(player);
  }

  private tryUseAbility(player: PlayerEntity, abilityId: string, targetPos: Vec3 | undefined, targetEntityId: string | undefined, now: number) {
    if (player.character.hp <= 0) return;
    const ability = getAbility(abilityId);
    if (!ability || ability.classId !== player.character.classId) return;
    if (player.casting || now < player.dodgeUntil) return;
    const readyAt = player.cooldowns.get(abilityId) ?? 0;
    if (now < readyAt) return;
    if (player.character.resource < ability.resourceCost) {
      this.send(player.ws, { t: "error", message: "Not enough " + player.character.classId + " resource." });
      return;
    }

    player.character.resource -= ability.resourceCost;
    const rank = this.effectiveRank(player.character, abilityId);
    const rankMult = 1 + (rank - 1) * 0.18;
    const cdMult = Math.max(0.55, 1 - player.character.stats.haste - (rank - 1) * 0.06);
    player.cooldowns.set(abilityId, now + ability.cooldownMs * cdMult);

    const cast: Casting = { abilityId, endAt: now + ability.castTimeMs, targetPos, targetEntityId };
    if (ability.castTimeMs <= 0) {
      this.resolveAbility(player, ability, rankMult, targetPos, targetEntityId, now);
    } else {
      player.casting = cast;
      player.state = "cast";
    }
    this.events.push({ type: "abilityCast", casterId: player.id, abilityId });
  }

  private resolveAbility(
    player: PlayerEntity,
    ability: ReturnType<typeof getAbility>,
    rankMult: number,
    targetPos: Vec3 | undefined,
    targetEntityId: string | undefined,
    now: number
  ) {
    if (!ability) return;
    const power = player.character.stats.power;
    const rawAmount = (ability.basePower + power * ability.powerScale) * rankMult;

    switch (ability.effect) {
      case "damage": {
        const enemy = targetEntityId ? this.enemies.get(targetEntityId) : this.nearestEnemyInRange(player, ability.range);
        if (!enemy || enemy.hp <= 0) return;
        if (distance(player.position, enemy.position) > ability.range + 1.5) return;
        this.damageEnemy(enemy, rawAmount, player, now);
        break;
      }
      case "aoe_damage": {
        const origin = ability.range === 0 ? player.position : targetPos ?? player.position;
        for (const enemy of this.enemies.values()) {
          if (enemy.hp <= 0) continue;
          if (distance(origin, enemy.position) <= ability.radius) {
            this.damageEnemy(enemy, rawAmount, player, now);
          }
        }
        break;
      }
      case "cc": {
        const origin = ability.radius > 0 ? targetPos ?? player.position : undefined;
        if (origin) {
          for (const enemy of this.enemies.values()) {
            if (enemy.hp <= 0) continue;
            if (distance(origin, enemy.position) <= ability.radius) {
              this.damageEnemy(enemy, rawAmount, player, now);
              enemy.ccUntil = now + (ability.ccDurationMs ?? 1000);
            }
          }
        } else {
          const enemy = targetEntityId ? this.enemies.get(targetEntityId) : this.nearestEnemyInRange(player, ability.range);
          if (enemy && enemy.hp > 0 && distance(player.position, enemy.position) <= ability.range + 1.5) {
            this.damageEnemy(enemy, rawAmount, player, now);
            enemy.ccUntil = now + (ability.ccDurationMs ?? 1000);
          }
        }
        break;
      }
      case "debuff": {
        const enemy = targetEntityId ? this.enemies.get(targetEntityId) : this.nearestEnemyInRange(player, ability.range);
        if (!enemy || enemy.hp <= 0) return;
        enemy.markedUntil = now + (ability.ccDurationMs ?? 5000);
        enemy.markedBonus = ability.basePower;
        break;
      }
      case "heal": {
        player.character.hp = Math.min(player.character.maxHp, player.character.hp + rawAmount);
        this.events.push({ type: "heal", targetId: player.id, amount: Math.round(rawAmount), sourceId: player.id, pos: player.position });
        break;
      }
      case "aoe_heal": {
        for (const other of this.players.values()) {
          if (other.character.hp <= 0) continue;
          if (distance(player.position, other.position) <= ability.radius) {
            other.character.hp = Math.min(other.character.maxHp, other.character.hp + rawAmount);
            this.events.push({ type: "heal", targetId: other.id, amount: Math.round(rawAmount), sourceId: player.id, pos: other.position });
          }
        }
        break;
      }
      case "buff": {
        player.shield = rawAmount;
        player.shieldUntil = now + (ability.ccDurationMs ?? 5000);
        break;
      }
    }
  }

  private nearestEnemyInRange(player: PlayerEntity, range: number): EnemyEntity | undefined {
    let best: EnemyEntity | undefined;
    let bestDist = Infinity;
    for (const enemy of this.enemies.values()) {
      if (enemy.hp <= 0) continue;
      const d = distance(player.position, enemy.position);
      if (d <= range + 1.5 && d < bestDist) {
        best = enemy;
        bestDist = d;
      }
    }
    return best;
  }

  private damageEnemy(enemy: EnemyEntity, rawAmount: number, source: PlayerEntity, now: number) {
    const crit = Math.random() < source.character.stats.critChance;
    let amount = rawAmount * (crit ? source.character.stats.critDamage : 1);
    if (enemy.markedUntil > now) amount *= 1 + enemy.markedBonus;
    amount = Math.round(amount);
    enemy.hp = Math.max(0, enemy.hp - amount);
    enemy.damagers.set(source.id, now);
    enemy.state = enemy.hp > 0 ? enemy.state : "dead";
    if (!enemy.targetId) enemy.targetId = source.id;
    this.events.push({ type: "damage", targetId: enemy.id, amount, crit, sourceId: source.id, pos: enemy.position });
    if (enemy.hp <= 0 && enemy.deadAt === null) {
      this.killEnemy(enemy, now);
    }
  }

  private killEnemy(enemy: EnemyEntity, now: number) {
    enemy.deadAt = now;
    enemy.respawnAt = now + RESPAWN_ENEMY_MS;
    enemy.state = "dead";
    this.events.push({ type: "death", entityId: enemy.id, isPlayer: false });
    const def = getEnemy(enemy.defId)!;
    for (const [playerId, ts] of enemy.damagers) {
      if (now - ts > DAMAGE_CONTRIBUTION_WINDOW_MS) continue;
      const player = this.players.get(playerId);
      if (!player || player.character.hp <= 0) continue;
      const levels = grantXp(player.character, def.xpReward);
      if (levels > 0) this.events.push({ type: "levelUp", playerId: player.id, level: player.character.level });
      for (const entry of def.loot) {
        if (Math.random() < entry.chance) {
          const qty = randInt(entry.minQty, entry.maxQty);
          addItem(player.character, entry.itemId, qty, "common");
          this.events.push({ type: "loot", playerId: player.id, itemId: entry.itemId, quantity: qty, rarity: "common" });
        }
      }
      this.sendCharacterUpdate(player);
    }
  }

  private damagePlayer(player: PlayerEntity, amount: number, now: number) {
    if (player.character.hp <= 0) return;
    if (now < player.dodgeUntil) return; // i-frames
    let remaining = amount;
    if (player.shield > 0 && now < player.shieldUntil) {
      const absorbed = Math.min(player.shield, remaining);
      player.shield -= absorbed;
      remaining -= absorbed;
    }
    if (remaining <= 0) return;
    player.character.hp = Math.max(0, player.character.hp - remaining);
    this.events.push({ type: "damage", targetId: player.id, amount: Math.round(remaining), crit: false, sourceId: "enemy", pos: player.position });
    if (player.character.hp <= 0) {
      this.events.push({ type: "death", entityId: player.id, isPlayer: true });
      player.state = "dead";
    }
  }

  // ---------------- Gathering ----------------

  private tryGather(player: PlayerEntity, nodeId: string, now: number) {
    const node = this.nodes.get(nodeId);
    if (!node || node.depleted || player.gathering || player.character.hp <= 0) return;
    if (distance(player.position, node.position) > 3.5) return;
    const def = getResourceNode(node.defId);
    if (!def) return;
    player.gathering = { nodeId, endAt: now + def.gatherTimeMs };
    player.state = "gather";
  }

  private completeGather(player: PlayerEntity, now: number) {
    const g = player.gathering;
    if (!g) return;
    const node = this.nodes.get(g.nodeId);
    player.gathering = null;
    player.state = "idle";
    if (!node || node.depleted) return;
    const def = getResourceNode(node.defId)!;
    node.depleted = true;
    node.respawnAt = now + def.respawnMs;
    for (const entry of def.loot) {
      if (Math.random() < entry.chance) {
        const qty = randInt(entry.minQty, entry.maxQty);
        addItem(player.character, entry.itemId, qty, "common");
        this.events.push({ type: "loot", playerId: player.id, itemId: entry.itemId, quantity: qty, rarity: "common" });
      }
    }
    this.sendCharacterUpdate(player);
  }

  // ---------------- Tick loop ----------------

  private runTick() {
    const now = Date.now();
    const dt = Math.min(0.25, (now - this.lastLoopAt) / 1000);
    this.lastLoopAt = now;
    this.tick += 1;

    for (const player of this.players.values()) this.tickPlayer(player, dt, now);
    for (const enemy of this.enemies.values()) this.tickEnemy(enemy, dt, now);
    for (const node of this.nodes.values()) this.tickNode(node, now);

    this.broadcastSnapshot(now);
    this.events = [];

    for (const player of this.players.values()) {
      player.character.position = player.position;
    }

    if (now - this.lastAutosaveAt > 10000) {
      this.lastAutosaveAt = now;
      for (const player of this.players.values()) this.persist(player.token, player.character);
    }
  }

  private tickPlayer(player: PlayerEntity, dt: number, now: number) {
    if (player.casting && now >= player.casting.endAt) {
      const ability = getAbility(player.casting.abilityId);
      if (ability) {
        const rank = this.effectiveRank(player.character, ability.id);
        const rankMult = 1 + (rank - 1) * 0.18;
        this.resolveAbility(player, ability, rankMult, player.casting.targetPos, player.casting.targetEntityId, now);
      }
      player.casting = null;
      if (player.state === "cast") player.state = "idle";
    }

    if (player.gathering && now >= player.gathering.endAt) {
      this.completeGather(player, now);
    }

    const canMove = player.character.hp > 0 && !player.casting && !player.gathering;
    if (now < player.dodgeUntil) {
      player.position = clampToWorld(add(player.position, scale(player.dodgeDir, DODGE_SPEED * dt)));
    } else if (canMove && (player.moveIntent.x !== 0 || player.moveIntent.z !== 0)) {
      player.position = clampToWorld(add(player.position, scale(player.moveIntent, PLAYER_SPEED * dt)));
      if (player.state !== "cast" && player.state !== "gather") player.state = "run";
    } else if (player.state === "run") {
      player.state = "idle";
    }

    if (player.character.hp <= 0 && player.state === "dead") {
      // handled via respawn timer stored on character death tick; simple auto-respawn:
      if (!(player as any)._respawnAt) (player as any)._respawnAt = now + PLAYER_RESPAWN_MS;
      if (now >= (player as any)._respawnAt) {
        player.character.hp = player.character.maxHp;
        player.character.resource = player.character.maxResource;
        player.position = { ...PLAYER_SPAWN };
        player.state = "idle";
        (player as any)._respawnAt = undefined;
        this.sendCharacterUpdate(player);
      }
    }

    const regenRate = player.character.maxResource * 0.09; // per second
    player.resourceAccum += regenRate * dt;
    if (player.resourceAccum >= 1) {
      const whole = Math.floor(player.resourceAccum);
      player.resourceAccum -= whole;
      player.character.resource = Math.min(player.character.maxResource, player.character.resource + whole);
    }
  }

  private tickEnemy(enemy: EnemyEntity, dt: number, now: number) {
    if (enemy.hp <= 0) {
      if (enemy.respawnAt && now >= enemy.respawnAt) {
        const def = getEnemy(enemy.defId)!;
        enemy.hp = def.maxHp;
        enemy.position = { ...enemy.spawnPos };
        enemy.state = "idle";
        enemy.deadAt = null;
        enemy.respawnAt = null;
        enemy.targetId = null;
        enemy.damagers.clear();
      }
      return;
    }
    const def = getEnemy(enemy.defId)!;

    if (enemy.ccUntil > now) {
      enemy.state = "stunned";
      return;
    }

    if (enemy.telegraphEndAt !== null) {
      if (now >= enemy.telegraphEndAt) {
        const target = enemy.targetId ? this.players.get(enemy.targetId) : undefined;
        if (target && distance(enemy.position, target.position) <= def.attackRange + 2) {
          this.damagePlayer(target, def.attackDamage, now);
        }
        enemy.telegraphEndAt = null;
        enemy.telegraphPos = null;
        enemy.attackReadyAt = now + def.attackCooldownMs;
        enemy.state = "idle";
      }
      return;
    }

    let target = enemy.targetId ? this.players.get(enemy.targetId) : undefined;
    if (!target || target.character.hp <= 0 || distance(enemy.position, target.position) > def.aggroRadius * 1.6) {
      target = this.findNearestPlayer(enemy.position, def.aggroRadius);
      enemy.targetId = target?.id ?? null;
    }

    if (!target) {
      this.patrol(enemy, dt, now);
      return;
    }

    const d = distance(enemy.position, target.position);
    enemy.facing = Math.atan2(target.position.x - enemy.position.x, target.position.z - enemy.position.z);

    if (d <= def.attackRange) {
      enemy.state = "idle";
      if (now >= enemy.attackReadyAt) {
        enemy.telegraphEndAt = now + def.attackTelegraphMs;
        enemy.telegraphPos = { ...target.position };
        enemy.state = "attack";
      }
    } else {
      enemy.state = "chase";
      const dir = normalize({ x: target.position.x - enemy.position.x, y: 0, z: target.position.z - enemy.position.z });
      enemy.position = add(enemy.position, scale(dir, def.moveSpeed * dt));
    }
  }

  private patrol(enemy: EnemyEntity, dt: number, now: number) {
    if (!enemy.patrolTarget || now >= enemy.nextDecisionAt) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * enemy.patrolRadius;
      enemy.patrolTarget = { x: enemy.spawnPos.x + Math.cos(angle) * r, y: 0, z: enemy.spawnPos.z + Math.sin(angle) * r };
      enemy.nextDecisionAt = now + 3000 + Math.random() * 3000;
    }
    const d = distance(enemy.position, enemy.patrolTarget);
    if (d > 0.3) {
      const def = getEnemy(enemy.defId)!;
      const dir = normalize({ x: enemy.patrolTarget.x - enemy.position.x, y: 0, z: enemy.patrolTarget.z - enemy.position.z });
      enemy.position = add(enemy.position, scale(dir, def.moveSpeed * 0.5 * dt));
      enemy.facing = Math.atan2(dir.x, dir.z);
      enemy.state = "run";
    } else {
      enemy.state = "idle";
    }
  }

  private findNearestPlayer(pos: Vec3, radius: number): PlayerEntity | undefined {
    let best: PlayerEntity | undefined;
    let bestDist = radius;
    for (const player of this.players.values()) {
      if (player.character.hp <= 0) continue;
      const d = distance(pos, player.position);
      if (d <= bestDist) {
        best = player;
        bestDist = d;
      }
    }
    return best;
  }

  private tickNode(node: NodeEntity, now: number) {
    if (node.depleted && node.respawnAt && now >= node.respawnAt) {
      node.depleted = false;
      node.respawnAt = null;
    }
  }

  // ---------------- Networking ----------------

  private send(ws: WebSocket, msg: ServerMessage) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
  }

  private broadcast(msg: ServerMessage) {
    for (const p of this.players.values()) this.send(p.ws, msg);
  }

  private sendCharacterUpdate(player: PlayerEntity) {
    this.send(player.ws, { t: "characterUpdate", character: player.character });
  }

  private broadcastRoster() {
    this.broadcast({
      t: "partyRoster",
      members: [...this.players.values()].map((p) => ({
        id: p.id,
        name: p.character.name,
        classId: p.character.classId,
        level: p.character.level
      }))
    });
  }

  private broadcastSnapshot(now: number) {
    const players: PlayerSnapshot[] = [...this.players.values()].map((p) => ({
      id: p.id,
      name: p.character.name,
      classId: p.character.classId,
      level: p.character.level,
      position: p.position,
      facing: p.facing,
      hp: p.character.hp,
      maxHp: p.character.maxHp,
      resource: p.character.resource,
      maxResource: p.character.maxResource,
      state: p.character.hp <= 0 ? "dead" : p.state,
      shield: now < p.shieldUntil ? p.shield : 0
    }));

    const enemies: EnemySnapshot[] = [...this.enemies.values()].map((e) => ({
      id: e.id,
      defId: e.defId,
      position: e.position,
      facing: e.facing,
      hp: e.hp,
      maxHp: e.maxHp,
      state: e.state,
      telegraph:
        e.telegraphEndAt !== null && e.telegraphPos
          ? { abilityRadius: 2.5, endAt: e.telegraphEndAt, pos: e.telegraphPos }
          : undefined
    }));

    const nodes: NodeSnapshot[] = [...this.nodes.values()].map((n) => ({
      id: n.id,
      defId: n.defId,
      position: n.position,
      depleted: n.depleted
    }));

    this.broadcast({ t: "snapshot", tick: this.tick, serverTime: now, players, enemies, nodes, events: this.events });
  }
}

function clampVec(v: Vec3): Vec3 {
  const len = Math.sqrt(v.x * v.x + v.z * v.z);
  if (len <= 1) return { x: v.x, y: 0, z: v.z };
  return { x: v.x / len, y: 0, z: v.z / len };
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
