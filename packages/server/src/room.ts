import type { WebSocket } from "ws";
import {
  getAbility,
  getEnemy,
  getItem,
  getResourceNode,
  getSpecialization,
  getSubclass,
  getZone,
  clampToZone,
  START_ZONE_ID,
  activeAbilities,
  add,
  distance,
  normalize,
  scale,
  getNpc,
  npcsInZone,
  resolveDialogue,
  resolveFollowUp,
  applyLoyaltyDelta,
  markMet,
  memoryFor,
  withTag,
  moonTouchedStageFor,
  touchedAxisFor,
  secretEndingFor,
  MAJOR_ENDINGS,
  MAX_COMPANIONS,
  type CharacterState,
  type ClientMessage,
  type CompanionSnapshot,
  type EnemySnapshot,
  type EntityState,
  type GameEvent,
  type ItemRarity,
  type NodeSnapshot,
  type NpcSnapshot,
  type PlayerSnapshot,
  type ServerMessage,
  type TradeOfferEntry,
  type TravelPoint,
  type Vec3
} from "@moon/shared";
import { randomUUID } from "node:crypto";
import { grantXp } from "./character.js";
import { addItem, countItemRarity, craft as craftRecipe, equipItem, removeItemsByIdAndRarity, unequipItem, useConsumable } from "./inventory.js";
import {
  COMPANION_AGGRO_RADIUS,
  COMPANION_ATTACK_COOLDOWN_MS,
  COMPANION_ATTACK_RANGE,
  COMPANION_BASE_DAMAGE,
  COMPANION_FOLLOW_DISTANCE,
  COMPANION_MAX_HP,
  COMPANION_REVIVE_MS,
  COMPANION_SPEED,
  DODGE_COOLDOWN_MS,
  DODGE_DURATION_MS,
  DODGE_SPEED,
  PLAYER_SPEED,
  TRADE_RANGE,
  TRAVEL_COOLDOWN_MS,
  WORLD_EVENT_COOLDOWN_MS,
  WORLD_EVENT_DURATION_MS,
  WORLD_EVENT_ENEMY_ID,
  WORLD_EVENT_INITIAL_DELAY_MS,
  WORLD_EVENT_ZONE_IDS,
  ZONE_ENEMY_SPAWNS,
  ZONE_NODE_SPAWNS,
  allZoneIds
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
  travelCooldownUntil: number;
  // specialization mechanic state
  momentum: number; // Strider: 0-5 stacking crit
  momentumAccum: number;
  voidStacks: number; // Voidblade: 0-5 stacking power
  voidStacksUntil: number;
  nextHawkTickAt: number; // Beastcaller periodic pulse
  packUntil: number; // Call the Pack: shortens hawk interval
  powerBuffUntil: number; // Bloodrage
  powerBuffPct: number;
  lifestealUntil: number; // Bloodrage
  lifestealPct: number;
  damageReductionUntil: number; // Unbreakable, Vanish
  damageReductionPct: number;
  umbralStacks: number; // Nightstalker: 0-5 stacking crit chance, built by landing crits
  umbralStacksUntil: number;
  forcedCritUntil: number; // Vanishing Strike: guarantees the next hit crits
}

interface EnemyEntity {
  id: string;
  defId: string;
  zoneId: string;
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
  forcedTargetId: string | null; // taunt (Unbreakable)
  forcedTargetUntil: number;
  /** Marks the single active persistent-world-event spawn (see Room.tickWorldEvent) so killEnemy
   *  can clean it up and schedule the next one instead of letting it respawn like a normal enemy. */
  isWorldEvent?: boolean;
}

interface NodeEntity {
  id: string;
  defId: string;
  zoneId: string;
  position: Vec3;
  depleted: boolean;
  respawnAt: number | null;
  gatheringBy: string | null;
}

interface HealZoneEntity {
  id: string;
  ownerId: string;
  zoneId: string;
  pos: Vec3;
  radius: number;
  endAt: number;
  nextTickAt: number;
  tickAmount: number;
}

interface NpcEntity {
  id: string;
  zoneId: string;
  position: Vec3;
}

/**
 * A recruited companion. Keyed by a composite id (`${ownerId}:${defId}`, see Room.companions) so
 * one owner can have up to MAX_COMPANIONS active at once. Companions are full aggro targets:
 * enemy AI can pick a companion the same way it picks a player (see `findNearestTarget` and
 * `tickEnemy`), telegraph an attack at it, and land real damage on its own HP pool.
 */
interface CompanionEntity {
  id: string; // `${ownerId}:${defId}`
  ownerId: string;
  defId: string; // NpcDef id
  zoneId: string;
  position: Vec3;
  facing: number;
  state: EntityState;
  attackReadyAt: number;
  hp: number;
  maxHp: number;
  deadAt: number | null;
  reviveAt: number | null;
}

function companionEntityId(ownerId: string, defId: string): string {
  return `${ownerId}:${defId}`;
}

function tradeOfferKey(itemId: string, rarity: ItemRarity): string {
  return `${itemId}:${rarity}`;
}

/**
 * A two-player trade window (see docs/GDD.md's "Player trading"). `accepted` gates everything
 * past the initial request — no offers can be set, and no `tradeState` goes out, until the target
 * accepts. Either side changing their offer clears BOTH confirmed flags (standard trade-window
 * safety against "I changed what I'm giving you after you'd already agreed").
 */
interface TradeSession {
  id: string;
  aId: string;
  bId: string;
  accepted: boolean;
  aOffer: Map<string, TradeOfferEntry>;
  bOffer: Map<string, TradeOfferEntry>;
  aConfirmed: boolean;
  bConfirmed: boolean;
}

export class Room {
  readonly id = randomUUID();
  readonly code: string | undefined;
  readonly isSolo: boolean;
  players = new Map<string, PlayerEntity>();
  private enemies = new Map<string, EnemyEntity>();
  private nodes = new Map<string, NodeEntity>();
  private healZones = new Map<string, HealZoneEntity>();
  private npcs = new Map<string, NpcEntity>();
  private companions = new Map<string, CompanionEntity>();
  private events: GameEvent[] = [];
  private tick = 0;
  private interval: ReturnType<typeof setInterval> | null = null;
  private onEmpty: (room: Room) => void;
  private persist: (token: string, character: CharacterState) => void;
  private lastLoopAt = Date.now();
  private lastAutosaveAt = Date.now();
  private worldEventEnemyId: string | null = null;
  private worldEventExpiresAt = 0;
  private nextWorldEventAt = Date.now() + WORLD_EVENT_INITIAL_DELAY_MS;
  private trades = new Map<string, TradeSession>();
  private tradeIdByPlayer = new Map<string, string>();

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
    for (const zoneId of allZoneIds()) {
      for (const spawn of ZONE_ENEMY_SPAWNS[zoneId] ?? []) {
        const def = getEnemy(spawn.defId)!;
        const id = randomUUID();
        this.enemies.set(id, {
          id,
          defId: spawn.defId,
          zoneId,
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
          damagers: new Map(),
          forcedTargetId: null,
          forcedTargetUntil: 0
        });
      }
      for (const spawn of ZONE_NODE_SPAWNS[zoneId] ?? []) {
        const id = randomUUID();
        this.nodes.set(id, {
          id,
          defId: spawn.defId,
          zoneId,
          position: { ...spawn.pos },
          depleted: false,
          respawnAt: null,
          gatheringBy: null
        });
      }
      for (const npc of npcsInZone(zoneId)) {
        this.npcs.set(npc.id, { id: npc.id, zoneId, position: { ...npc.position } });
      }
    }
  }

  addPlayer(ws: WebSocket, token: string, character: CharacterState) {
    const zoneId = character.zoneId && ZONE_ENEMY_SPAWNS[character.zoneId] ? character.zoneId : START_ZONE_ID;
    character.zoneId = zoneId;
    const zone = getZone(zoneId);

    const entity: PlayerEntity = {
      id: character.id,
      token,
      ws,
      character,
      position: character.position && (character.position.x || character.position.z) ? character.position : { ...zone.spawnPoint },
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
      resourceAccum: 0,
      travelCooldownUntil: 0,
      momentum: 0,
      momentumAccum: 0,
      voidStacks: 0,
      voidStacksUntil: 0,
      nextHawkTickAt: 0,
      packUntil: 0,
      powerBuffUntil: 0,
      powerBuffPct: 0,
      lifestealUntil: 0,
      lifestealPct: 0,
      damageReductionUntil: 0,
      damageReductionPct: 0,
      umbralStacks: 0,
      umbralStacksUntil: 0,
      forcedCritUntil: 0
    };
    if (character.hp <= 0) {
      entity.position = { ...zone.spawnPoint };
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
    for (const [id, companion] of this.companions) {
      if (companion.ownerId === playerId) this.companions.delete(id);
    }
    const tradeId = this.tradeIdByPlayer.get(playerId);
    if (tradeId) this.cancelTrade(playerId, tradeId);
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
      case "talk": {
        this.tryTalk(player, msg.npcId);
        break;
      }
      case "chooseDialogueOption": {
        this.handleDialogueChoice(player, msg.npcId, msg.optionId);
        break;
      }
      case "dismissCompanion": {
        this.dismissCompanion(player, msg.npcId);
        break;
      }
      case "craft": {
        const result = craftRecipe(player.character, msg.recipeId);
        if (result.ok) {
          this.events.push({ type: "craft", playerId: player.id, itemId: result.itemId, quantity: result.quantity, zoneId: player.character.zoneId });
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
      case "chooseSpecialization": {
        this.chooseSpecialization(player, msg.specializationId);
        break;
      }
      case "chooseSubclass": {
        this.chooseSubclass(player, msg.subclassId);
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
      case "proposeTrade": {
        this.proposeTrade(player, msg.targetPlayerId);
        break;
      }
      case "respondTrade": {
        this.respondTrade(player, msg.tradeId, msg.accept);
        break;
      }
      case "setTradeOffer": {
        this.setTradeOffer(player, msg.tradeId, msg.itemId, msg.rarity, msg.quantity);
        break;
      }
      case "confirmTrade": {
        this.confirmTradeSide(player, msg.tradeId);
        break;
      }
      case "cancelTrade": {
        this.cancelTrade(player.id, msg.tradeId);
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
    if (ability.tier === "elite" && ability.specializationId !== player.character.specializationId) {
      this.send(player.ws, { t: "error", message: "Choose this specialization first." });
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
    this.events.push({ type: "skillPoint", playerId: player.id, abilityId, rank: current + 2, zoneId: player.character.zoneId });
    this.sendCharacterUpdate(player);
  }

  private chooseSpecialization(player: PlayerEntity, specializationId: string) {
    const spec = getSpecialization(specializationId);
    if (!spec || spec.classId !== player.character.classId) {
      this.send(player.ws, { t: "error", message: "Invalid specialization." });
      return;
    }
    if (player.character.level < spec.unlockLevel) {
      this.send(player.ws, { t: "error", message: `Requires level ${spec.unlockLevel}.` });
      return;
    }
    player.character.specializationId = specializationId;
    this.sendCharacterUpdate(player);
  }

  private chooseSubclass(player: PlayerEntity, subclassId: string) {
    const sub = getSubclass(subclassId);
    if (!sub) {
      this.send(player.ws, { t: "error", message: "Invalid trade." });
      return;
    }
    player.character.subclassId = subclassId;
    this.sendCharacterUpdate(player);
  }

  private tryUseAbility(player: PlayerEntity, abilityId: string, targetPos: Vec3 | undefined, targetEntityId: string | undefined, now: number) {
    if (player.character.hp <= 0) return;
    const ability = activeAbilities(player.character).find((a) => a.id === abilityId);
    if (!ability) return;
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

    if (
      player.character.specializationId === "mystic_voidblade" &&
      ability.tier === "weapon" &&
      (ability.effect === "damage" || ability.effect === "aoe_damage")
    ) {
      player.voidStacks = Math.min(5, (now < player.voidStacksUntil ? player.voidStacks : 0) + 1);
      player.voidStacksUntil = now + 6000;
    }

    const cast: Casting = { abilityId, endAt: now + ability.castTimeMs, targetPos, targetEntityId };
    if (ability.castTimeMs <= 0) {
      this.resolveAbility(player, ability, rankMult, targetPos, targetEntityId, now);
    } else {
      player.casting = cast;
      player.state = "cast";
    }
    this.events.push({ type: "abilityCast", casterId: player.id, abilityId, zoneId: player.character.zoneId });
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
    const spec = player.character.specializationId;
    const zoneId = player.character.zoneId;
    let effectivePower = player.character.stats.power;
    if (spec === "mystic_voidblade" && player.voidStacksUntil > now) {
      effectivePower *= 1 + player.voidStacks * 0.03;
    }
    if (player.powerBuffUntil > now) {
      effectivePower *= 1 + player.powerBuffPct;
    }
    let rawAmount = (ability.basePower + effectivePower * ability.powerScale) * rankMult;
    if (
      spec === "warden_berserker" &&
      ability.tier === "weapon" &&
      player.character.hp < player.character.maxHp * 0.5
    ) {
      rawAmount *= 1.25;
    }

    switch (ability.effect) {
      case "damage": {
        const enemy = targetEntityId ? this.enemies.get(targetEntityId) : this.nearestEnemyInRange(player, ability.range);
        if (!enemy || enemy.hp <= 0 || enemy.zoneId !== zoneId) return;
        if (distance(player.position, enemy.position) > ability.range + 1.5) return;
        if (ability.special === "duskblade_vanishingstrike") player.forcedCritUntil = now + 50;
        const dealt = this.damageEnemy(enemy, rawAmount, player, now);
        if (ability.special === "mystic_reap" && dealt > 0) {
          const healAmt = Math.round(dealt * 0.4);
          player.character.hp = Math.min(player.character.maxHp, player.character.hp + healAmt);
          this.events.push({ type: "heal", targetId: player.id, amount: healAmt, sourceId: player.id, pos: player.position, zoneId });
        }
        break;
      }
      case "aoe_damage": {
        const origin = ability.range === 0 ? player.position : targetPos ?? player.position;
        let totalDealt = 0;
        for (const enemy of this.enemies.values()) {
          if (enemy.hp <= 0 || enemy.zoneId !== zoneId) continue;
          if (distance(origin, enemy.position) <= ability.radius) {
            totalDealt += this.damageEnemy(enemy, rawAmount, player, now);
          }
        }
        if (ability.special === "duskblade_crimsoneclipse" && totalDealt > 0) {
          const healAmt = Math.round(totalDealt * 0.3);
          player.character.hp = Math.min(player.character.maxHp, player.character.hp + healAmt);
          this.events.push({ type: "heal", targetId: player.id, amount: healAmt, sourceId: player.id, pos: player.position, zoneId });
        }
        break;
      }
      case "cc": {
        const origin = ability.radius > 0 ? targetPos ?? player.position : undefined;
        if (origin) {
          for (const enemy of this.enemies.values()) {
            if (enemy.hp <= 0 || enemy.zoneId !== zoneId) continue;
            if (distance(origin, enemy.position) <= ability.radius) {
              this.damageEnemy(enemy, rawAmount, player, now);
              enemy.ccUntil = now + (ability.ccDurationMs ?? 1000);
            }
          }
        } else {
          const enemy = targetEntityId ? this.enemies.get(targetEntityId) : this.nearestEnemyInRange(player, ability.range);
          if (enemy && enemy.hp > 0 && enemy.zoneId === zoneId && distance(player.position, enemy.position) <= ability.range + 1.5) {
            this.damageEnemy(enemy, rawAmount, player, now);
            enemy.ccUntil = now + (ability.ccDurationMs ?? 1000);
          }
        }
        break;
      }
      case "debuff": {
        const enemy = targetEntityId ? this.enemies.get(targetEntityId) : this.nearestEnemyInRange(player, ability.range);
        if (!enemy || enemy.hp <= 0 || enemy.zoneId !== zoneId) return;
        enemy.markedUntil = now + (ability.ccDurationMs ?? 5000);
        enemy.markedBonus = ability.basePower;
        break;
      }
      case "heal": {
        this.healPlayer(player, player, rawAmount, now);
        break;
      }
      case "aoe_heal": {
        if (ability.special === "mystic_lunarsanctuary") {
          const id = randomUUID();
          this.healZones.set(id, {
            id,
            ownerId: player.id,
            zoneId,
            pos: { ...player.position },
            radius: ability.radius,
            endAt: now + (ability.ccDurationMs ?? 6000),
            nextTickAt: now + 1000,
            tickAmount: rawAmount
          });
          break;
        }
        for (const other of this.players.values()) {
          if (other.character.hp <= 0 || other.character.zoneId !== zoneId) continue;
          if (distance(player.position, other.position) <= ability.radius) {
            this.healPlayer(player, other, rawAmount, now);
          }
        }
        break;
      }
      case "buff": {
        if (ability.special === "warden_unbreakable") {
          player.damageReductionUntil = now + (ability.ccDurationMs ?? 4000);
          player.damageReductionPct = ability.basePower;
          for (const enemy of this.enemies.values()) {
            if (enemy.hp <= 0 || enemy.zoneId !== zoneId) continue;
            if (distance(player.position, enemy.position) <= ability.radius) {
              enemy.forcedTargetId = player.id;
              enemy.forcedTargetUntil = now + (ability.ccDurationMs ?? 4000);
            }
          }
        } else if (ability.special === "warden_bloodrage") {
          player.powerBuffUntil = now + (ability.ccDurationMs ?? 5000);
          player.powerBuffPct = ability.basePower;
          player.lifestealUntil = now + (ability.ccDurationMs ?? 5000);
          player.lifestealPct = 0.15;
        } else if (ability.special === "ranger_callthepack") {
          player.packUntil = now + (ability.ccDurationMs ?? 8000);
        } else if (ability.special === "duskblade_vanish") {
          player.damageReductionUntil = now + (ability.ccDurationMs ?? 2500);
          player.damageReductionPct = ability.basePower;
        } else {
          player.shield = rawAmount;
          player.shieldUntil = now + (ability.ccDurationMs ?? 5000);
        }
        break;
      }
    }
  }

  private healPlayer(caster: PlayerEntity, target: PlayerEntity, rawAmount: number, now: number) {
    const amount = Math.round(rawAmount);
    target.character.hp = Math.min(target.character.maxHp, target.character.hp + amount);
    this.events.push({ type: "heal", targetId: target.id, amount, sourceId: caster.id, pos: target.position, zoneId: caster.character.zoneId });
    if (caster.character.specializationId === "mystic_tidecaller") {
      const shieldAmt = Math.round(amount * 0.25);
      target.shield = Math.max(target.shield, shieldAmt);
      target.shieldUntil = now + 4000;
    }
  }

  private nearestEnemyInRange(player: PlayerEntity, range: number): EnemyEntity | undefined {
    let best: EnemyEntity | undefined;
    let bestDist = Infinity;
    for (const enemy of this.enemies.values()) {
      if (enemy.hp <= 0 || enemy.zoneId !== player.character.zoneId) continue;
      const d = distance(player.position, enemy.position);
      if (d <= range + 1.5 && d < bestDist) {
        best = enemy;
        bestDist = d;
      }
    }
    return best;
  }

  private damageEnemy(enemy: EnemyEntity, rawAmount: number, source: PlayerEntity, now: number): number {
    const spec = source.character.specializationId;
    let critChance = source.character.stats.critChance;
    if (spec === "ranger_strider") {
      critChance += source.momentum * 0.02;
    } else if (spec === "duskblade_nightstalker" && now < source.umbralStacksUntil) {
      critChance += source.umbralStacks * 0.03;
    }
    const forcedCrit = now < source.forcedCritUntil;
    const crit = forcedCrit || Math.random() < critChance;
    if (forcedCrit) source.forcedCritUntil = 0;
    if (crit && spec === "duskblade_nightstalker") {
      source.umbralStacks = Math.min(5, (now < source.umbralStacksUntil ? source.umbralStacks : 0) + 1);
      source.umbralStacksUntil = now + 6000;
    }
    let amount = rawAmount * (crit ? source.character.stats.critDamage : 1);
    if (enemy.markedUntil > now) amount *= 1 + enemy.markedBonus;
    amount = Math.round(amount);
    enemy.hp = Math.max(0, enemy.hp - amount);
    enemy.damagers.set(source.id, now);
    enemy.state = enemy.hp > 0 ? enemy.state : "dead";
    if (!enemy.targetId) enemy.targetId = source.id;
    this.events.push({ type: "damage", targetId: enemy.id, amount, crit, sourceId: source.id, pos: enemy.position, zoneId: enemy.zoneId });
    if (spec === "duskblade_bloodmoon") {
      const healAmt = Math.round(amount * 0.12);
      if (healAmt > 0) {
        source.character.hp = Math.min(source.character.maxHp, source.character.hp + healAmt);
        this.events.push({ type: "heal", targetId: source.id, amount: healAmt, sourceId: source.id, pos: source.position, zoneId: source.character.zoneId });
      }
    }
    if (source.lifestealUntil > now) {
      const healAmt = Math.round(amount * source.lifestealPct);
      if (healAmt > 0) {
        source.character.hp = Math.min(source.character.maxHp, source.character.hp + healAmt);
        this.events.push({ type: "heal", targetId: source.id, amount: healAmt, sourceId: source.id, pos: source.position, zoneId: source.character.zoneId });
      }
    }
    if (enemy.hp <= 0 && enemy.deadAt === null) {
      this.killEnemy(enemy, now);
    }
    return amount;
  }

  private killEnemy(enemy: EnemyEntity, now: number) {
    const def = getEnemy(enemy.defId)!;
    enemy.deadAt = now;
    enemy.respawnAt = now + (def.respawnMs ?? RESPAWN_ENEMY_MS);
    enemy.state = "dead";
    this.events.push({ type: "death", entityId: enemy.id, isPlayer: false, zoneId: enemy.zoneId });
    for (const [playerId, ts] of enemy.damagers) {
      if (now - ts > DAMAGE_CONTRIBUTION_WINDOW_MS) continue;
      const player = this.players.get(playerId);
      if (!player || player.character.hp <= 0) continue;
      const levels = grantXp(player.character, def.xpReward);
      if (levels > 0) this.events.push({ type: "levelUp", playerId: player.id, level: player.character.level, zoneId: player.character.zoneId });
      for (const entry of def.loot) {
        if (Math.random() < entry.chance) {
          const qty = randInt(entry.minQty, entry.maxQty);
          addItem(player.character, entry.itemId, qty);
          const rarity = getItem(entry.itemId)?.rarity ?? "common";
          this.events.push({ type: "loot", playerId: player.id, itemId: entry.itemId, quantity: qty, rarity, zoneId: player.character.zoneId });
        }
      }
      this.sendCharacterUpdate(player);
    }
    if (enemy.isWorldEvent) this.endWorldEvent(enemy, now, "slain");
  }

  // ---------------- Persistent world events ----------------

  /** A single roaming rare spawn, active at a time, in a randomly chosen standard zone. */
  private startWorldEvent(now: number) {
    const zoneId = WORLD_EVENT_ZONE_IDS[Math.floor(Math.random() * WORLD_EVENT_ZONE_IDS.length)];
    const zone = getZone(zoneId);
    const def = getEnemy(WORLD_EVENT_ENEMY_ID)!;
    const id = randomUUID();
    this.enemies.set(id, {
      id,
      defId: WORLD_EVENT_ENEMY_ID,
      zoneId,
      spawnPos: { x: 0, y: 0, z: 0 },
      patrolRadius: zone.radius * 0.85,
      position: { x: 0, y: 0, z: 0 },
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
      damagers: new Map(),
      forcedTargetId: null,
      forcedTargetUntil: 0,
      isWorldEvent: true
    });
    this.worldEventEnemyId = id;
    this.worldEventExpiresAt = now + WORLD_EVENT_DURATION_MS;
    this.broadcast({ t: "chat", from: "World", message: `${def.name} has been sighted roaming ${zone.name}. Hunt it before it moves on.` });
  }

  private endWorldEvent(enemy: EnemyEntity, now: number, reason: "slain" | "faded") {
    this.enemies.delete(enemy.id);
    this.worldEventEnemyId = null;
    this.nextWorldEventAt = now + WORLD_EVENT_COOLDOWN_MS;
    const def = getEnemy(enemy.defId)!;
    const zone = getZone(enemy.zoneId);
    const message =
      reason === "slain" ? `${def.name} has been slain in ${zone.name}!` : `${def.name} has faded from ${zone.name}, unclaimed.`;
    this.broadcast({ t: "chat", from: "World", message });
  }

  private tickWorldEvent(now: number) {
    if (this.worldEventEnemyId) {
      const enemy = this.enemies.get(this.worldEventEnemyId);
      if (!enemy) {
        this.worldEventEnemyId = null;
      } else if (enemy.hp > 0 && now >= this.worldEventExpiresAt) {
        this.endWorldEvent(enemy, now, "faded");
      }
      return;
    }
    if (now >= this.nextWorldEventAt) this.startWorldEvent(now);
  }

  private damagePlayer(player: PlayerEntity, amount: number, now: number) {
    if (player.character.hp <= 0) return;
    if (now < player.dodgeUntil) return; // i-frames
    let remaining = amount;
    if (player.character.specializationId === "warden_bulwark") {
      const dr = Math.min(0.3, Math.floor(player.character.resource / 25) * 0.08);
      remaining *= 1 - dr;
    }
    if (player.damageReductionUntil > now) {
      remaining *= 1 - player.damageReductionPct;
    }
    if (player.shield > 0 && now < player.shieldUntil) {
      const absorbed = Math.min(player.shield, remaining);
      player.shield -= absorbed;
      remaining -= absorbed;
    }
    if (remaining <= 0) return;
    player.character.hp = Math.max(0, player.character.hp - remaining);
    this.events.push({
      type: "damage",
      targetId: player.id,
      amount: Math.round(remaining),
      crit: false,
      sourceId: "enemy",
      pos: player.position,
      zoneId: player.character.zoneId
    });
    if (player.character.hp <= 0) {
      this.events.push({ type: "death", entityId: player.id, isPlayer: true, zoneId: player.character.zoneId });
      player.state = "dead";
    }
  }

  // ---------------- Gathering ----------------

  private tryGather(player: PlayerEntity, nodeId: string, now: number) {
    const node = this.nodes.get(nodeId);
    if (!node || node.depleted || player.gathering || player.character.hp <= 0) return;
    if (node.zoneId !== player.character.zoneId) return;
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
    const subclass = player.character.subclassId ? getSubclass(player.character.subclassId) : undefined;
    const gatherBonus = subclass?.gatherBonusQty ?? 0;
    for (const entry of def.loot) {
      if (Math.random() < entry.chance) {
        const qty = randInt(entry.minQty, entry.maxQty) + gatherBonus;
        addItem(player.character, entry.itemId, qty);
        const rarity = getItem(entry.itemId)?.rarity ?? "common";
        this.events.push({ type: "loot", playerId: player.id, itemId: entry.itemId, quantity: qty, rarity, zoneId: player.character.zoneId });
      }
    }
    // Aether crystals are, narratively, fragments of Selen herself — handling them deepens the
    // Moon-Touched condition (see lore/moonTouched.ts).
    if (node.defId === "node_crystal") {
      player.character.lunarResonance += 1;
    }
    this.sendCharacterUpdate(player);
  }

  // ---------------- Dialogue ----------------

  private tryTalk(player: PlayerEntity, npcId: string) {
    const npcEntity = this.npcs.get(npcId);
    const npc = getNpc(npcId);
    if (!npcEntity || !npc || player.character.hp <= 0) return;
    if (npcEntity.zoneId !== player.character.zoneId) return;
    if (distance(player.position, npcEntity.position) > 4) return;

    const resolved = resolveDialogue(npc, player.character.npcMemory, player.character.factionLoyalty);
    player.character.npcMemory = markMet(player.character.npcMemory, npc.id);
    this.send(player.ws, { t: "npcDialogue", npcId: npc.id, speaker: resolved.speaker, line: resolved.line, choices: resolved.choices });
    this.sendCharacterUpdate(player);
  }

  private handleDialogueChoice(player: PlayerEntity, npcId: string, optionId: string) {
    const npc = getNpc(npcId);
    const choice = npc?.signatureChoice;
    if (!npc || !choice) return;
    const memory = player.character.npcMemory[npc.id];
    if (memory?.tags.includes(choice.resolvedTag)) return; // already answered
    const option = choice.options.find((o) => o.id === optionId);
    if (!option) return;

    // Snapshotted before this choice's own delta lands: a secret ending reads whether the
    // character was already at that loyalty extreme walking in, not whether this one choice's
    // (often faction-boosting) delta happens to push them there — which for a thread choice that
    // itself raises a faction's standing would otherwise make some secret conditions unreachable.
    const loyaltyBeforeChoice = player.character.factionLoyalty;
    player.character.factionLoyalty = applyLoyaltyDelta(player.character.factionLoyalty, option.delta);
    player.character.npcMemory = withTag(player.character.npcMemory, npc.id, option.tag);
    player.character.npcMemory = withTag(player.character.npcMemory, npc.id, choice.resolvedTag);

    if (option.recruits) {
      if (!player.character.companionIds.includes(npc.id)) {
        if (player.character.companionIds.length >= MAX_COMPANIONS) {
          this.send(player.ws, { t: "error", message: `You can only travel with ${MAX_COMPANIONS} companions at once. Dismiss one first.` });
        } else {
          player.character.companionIds = [...player.character.companionIds, npc.id];
          this.syncCompanions(player);
        }
      }
    }

    // The scripted finale: this permanently locks the character's real ending, rather than the
    // Character panel's live "trending" preview (see endings.ts).
    if (option.locksEndingThread && !player.character.endingId) {
      const stage = moonTouchedStageFor(player.character.lunarResonance);
      const touched = touchedAxisFor(stage.stage);
      const ending =
        secretEndingFor(option.locksEndingThread, loyaltyBeforeChoice, stage.stage) ??
        MAJOR_ENDINGS.find((e) => e.thread === option.locksEndingThread && e.touched === touched);
      if (ending) player.character.endingId = ending.id;
    }

    const followUp = resolveFollowUp(npc, optionId);
    if (followUp) {
      this.send(player.ws, { t: "npcDialogue", npcId: npc.id, speaker: followUp.speaker, line: followUp.line });
    }
    this.sendCharacterUpdate(player);
  }

  // ---------------- Trading ----------------

  private proposeTrade(player: PlayerEntity, targetPlayerId: string) {
    if (this.tradeIdByPlayer.has(player.id)) {
      this.send(player.ws, { t: "error", message: "You're already in a trade." });
      return;
    }
    const target = this.players.get(targetPlayerId);
    if (!target || target.id === player.id) return;
    if (this.tradeIdByPlayer.has(target.id)) {
      this.send(player.ws, { t: "error", message: `${target.character.name} is already trading with someone else.` });
      return;
    }
    if (player.character.hp <= 0 || target.character.hp <= 0) {
      this.send(player.ws, { t: "error", message: "Can't trade while either of you is down." });
      return;
    }
    if (target.character.zoneId !== player.character.zoneId || distance(player.position, target.position) > TRADE_RANGE) {
      this.send(player.ws, { t: "error", message: `Move closer to ${target.character.name} to trade.` });
      return;
    }

    const id = randomUUID();
    this.trades.set(id, { id, aId: player.id, bId: target.id, accepted: false, aOffer: new Map(), bOffer: new Map(), aConfirmed: false, bConfirmed: false });
    this.tradeIdByPlayer.set(player.id, id);
    this.tradeIdByPlayer.set(target.id, id);
    this.send(target.ws, { t: "tradeRequest", tradeId: id, fromPlayerId: player.id, fromName: player.character.name });
  }

  private respondTrade(player: PlayerEntity, tradeId: string, accept: boolean) {
    const session = this.trades.get(tradeId);
    if (!session || session.bId !== player.id) return;
    if (!accept) {
      this.closeTrade(session, "declined");
      return;
    }
    session.accepted = true;
    this.sendTradeState(session);
  }

  private setTradeOffer(player: PlayerEntity, tradeId: string, itemId: string, rarity: ItemRarity, quantity: number) {
    const session = this.trades.get(tradeId);
    if (!session || !session.accepted) return;
    const isA = session.aId === player.id;
    if (!isA && session.bId !== player.id) return;
    if (!getItem(itemId)) return;

    const offer = isA ? session.aOffer : session.bOffer;
    const key = tradeOfferKey(itemId, rarity);
    const owned = countItemRarity(player.character, itemId, rarity);
    const clamped = Math.max(0, Math.min(quantity, owned));
    if (clamped <= 0) offer.delete(key);
    else offer.set(key, { itemId, rarity, quantity: clamped });

    // Either side changing their offer means the other side hasn't agreed to THIS offer yet.
    session.aConfirmed = false;
    session.bConfirmed = false;
    this.sendTradeState(session);
  }

  private confirmTradeSide(player: PlayerEntity, tradeId: string) {
    const session = this.trades.get(tradeId);
    if (!session || !session.accepted) return;
    if (session.aId === player.id) session.aConfirmed = true;
    else if (session.bId === player.id) session.bConfirmed = true;
    else return;

    if (session.aConfirmed && session.bConfirmed) {
      this.executeTrade(session);
    } else {
      this.sendTradeState(session);
    }
  }

  private executeTrade(session: TradeSession) {
    const playerA = this.players.get(session.aId);
    const playerB = this.players.get(session.bId);
    if (!playerA || !playerB) {
      this.closeTrade(session, "cancelled");
      return;
    }
    // Re-validated against current inventories, not trusted from when each offer was set — an
    // item could have been crafted away, equipped, or spent on a consumable since then.
    const stillValid = (side: PlayerEntity, offer: Map<string, TradeOfferEntry>) =>
      [...offer.values()].every((entry) => countItemRarity(side.character, entry.itemId, entry.rarity) >= entry.quantity);
    if (!stillValid(playerA, session.aOffer) || !stillValid(playerB, session.bOffer)) {
      this.send(playerA.ws, { t: "error", message: "Trade cancelled — one of the offered items is no longer available." });
      this.send(playerB.ws, { t: "error", message: "Trade cancelled — one of the offered items is no longer available." });
      this.closeTrade(session, "cancelled");
      return;
    }

    for (const entry of session.aOffer.values()) {
      removeItemsByIdAndRarity(playerA.character, entry.itemId, entry.rarity, entry.quantity);
      addItem(playerB.character, entry.itemId, entry.quantity, entry.rarity);
    }
    for (const entry of session.bOffer.values()) {
      removeItemsByIdAndRarity(playerB.character, entry.itemId, entry.rarity, entry.quantity);
      addItem(playerA.character, entry.itemId, entry.quantity, entry.rarity);
    }
    this.sendCharacterUpdate(playerA);
    this.sendCharacterUpdate(playerB);
    this.closeTrade(session, "completed");
  }

  private cancelTrade(playerId: string, tradeId: string) {
    const session = this.trades.get(tradeId);
    if (!session || (session.aId !== playerId && session.bId !== playerId)) return;
    this.closeTrade(session, "cancelled");
  }

  private closeTrade(session: TradeSession, reason: "completed" | "cancelled" | "declined") {
    this.trades.delete(session.id);
    this.tradeIdByPlayer.delete(session.aId);
    this.tradeIdByPlayer.delete(session.bId);
    const a = this.players.get(session.aId);
    const b = this.players.get(session.bId);
    if (a) this.send(a.ws, { t: "tradeClosed", tradeId: session.id, reason });
    if (b) this.send(b.ws, { t: "tradeClosed", tradeId: session.id, reason });
  }

  private sendTradeState(session: TradeSession) {
    const a = this.players.get(session.aId);
    const b = this.players.get(session.bId);
    if (a) {
      this.send(a.ws, {
        t: "tradeState",
        tradeId: session.id,
        otherPlayerId: session.bId,
        otherName: b?.character.name ?? "",
        selfOffer: [...session.aOffer.values()],
        otherOffer: [...session.bOffer.values()],
        selfConfirmed: session.aConfirmed,
        otherConfirmed: session.bConfirmed
      });
    }
    if (b) {
      this.send(b.ws, {
        t: "tradeState",
        tradeId: session.id,
        otherPlayerId: session.aId,
        otherName: a?.character.name ?? "",
        selfOffer: [...session.bOffer.values()],
        otherOffer: [...session.aOffer.values()],
        selfConfirmed: session.bConfirmed,
        otherConfirmed: session.aConfirmed
      });
    }
  }

  // ---------------- Travel ----------------

  private tryTravel(player: PlayerEntity, now: number) {
    if (player.character.hp <= 0 || player.casting || now < player.travelCooldownUntil) return;
    const zone = getZone(player.character.zoneId);
    for (const tp of zone.travelPoints) {
      if (distance(player.position, tp.pos) > tp.radius) continue;
      if (tp.requiresTag && !memoryFor(player.character.npcMemory, tp.requiresTag.npcId).tags.includes(tp.requiresTag.tag)) {
        this.send(player.ws, { t: "error", message: tp.requiresTag.deniedMessage });
        player.travelCooldownUntil = now + 3000; // avoid spamming the denial every tick while standing here
        return;
      }
      if (tp.requiresLevel && player.character.level < tp.requiresLevel) {
        this.send(player.ws, { t: "error", message: `${tp.label} requires level ${tp.requiresLevel}.` });
        player.travelCooldownUntil = now + 3000;
        return;
      }
      this.travelPlayer(player, tp, now);
      return;
    }
  }

  private travelPlayer(player: PlayerEntity, tp: TravelPoint, now: number) {
    player.character.zoneId = tp.toZoneId;
    player.position = { ...tp.toPos };
    player.character.position = player.position;
    player.travelCooldownUntil = now + TRAVEL_COOLDOWN_MS;
    player.casting = null;
    player.gathering = null;
    player.state = "idle";
    player.cooldowns.clear();
    this.events.push({ type: "zoneChange", playerId: player.id, toZoneId: tp.toZoneId, zoneId: tp.toZoneId });
    this.sendCharacterUpdate(player);
  }

  // ---------------- Companion ----------------

  /** Reconciles the owner's companionIds (up to MAX_COMPANIONS) against live companion entities, and follows zone travel. */
  private syncCompanions(owner: PlayerEntity) {
    const wanted = new Set(owner.character.companionIds);
    for (const [id, companion] of this.companions) {
      if (companion.ownerId === owner.id && !wanted.has(companion.defId)) this.companions.delete(id);
    }
    for (const defId of owner.character.companionIds) {
      const id = companionEntityId(owner.id, defId);
      let companion = this.companions.get(id);
      if (!companion) {
        companion = {
          id,
          ownerId: owner.id,
          defId,
          zoneId: owner.character.zoneId,
          position: { ...owner.position },
          facing: owner.facing,
          state: "idle",
          attackReadyAt: 0,
          hp: COMPANION_MAX_HP,
          maxHp: COMPANION_MAX_HP,
          deadAt: null,
          reviveAt: null
        };
        this.companions.set(id, companion);
      } else if (companion.zoneId !== owner.character.zoneId) {
        // The owner traveled; the companion follows instantly rather than being left behind.
        companion.zoneId = owner.character.zoneId;
        companion.position = { ...owner.position };
      }
    }
  }

  private dismissCompanion(owner: PlayerEntity, npcId: string) {
    if (!owner.character.companionIds.includes(npcId)) return;
    owner.character.companionIds = owner.character.companionIds.filter((id) => id !== npcId);
    this.companions.delete(companionEntityId(owner.id, npcId));
    this.sendCharacterUpdate(owner);
  }

  private tickCompanion(companion: CompanionEntity, owner: PlayerEntity, dt: number, now: number) {
    if (companion.deadAt !== null) {
      if (companion.reviveAt !== null && now >= companion.reviveAt) {
        companion.hp = companion.maxHp;
        companion.deadAt = null;
        companion.reviveAt = null;
        companion.position = { ...owner.position };
        companion.state = "idle";
      }
      return;
    }

    if (owner.character.hp <= 0) return;

    let target: EnemyEntity | undefined;
    let bestDist = COMPANION_AGGRO_RADIUS;
    for (const enemy of this.enemies.values()) {
      if (enemy.hp <= 0 || enemy.zoneId !== companion.zoneId) continue;
      const d = distance(companion.position, enemy.position);
      if (d < bestDist) {
        bestDist = d;
        target = enemy;
      }
    }

    if (target) {
      const d = distance(companion.position, target.position);
      companion.facing = Math.atan2(target.position.x - companion.position.x, target.position.z - companion.position.z);
      if (d <= COMPANION_ATTACK_RANGE) {
        companion.state = "attack";
        if (now >= companion.attackReadyAt) {
          this.companionAttack(companion, target, owner, now);
          companion.attackReadyAt = now + COMPANION_ATTACK_COOLDOWN_MS;
        }
      } else {
        companion.state = "chase";
        const dir = normalize({ x: target.position.x - companion.position.x, y: 0, z: target.position.z - companion.position.z });
        companion.position = clampToZone(add(companion.position, scale(dir, COMPANION_SPEED * dt)), companion.zoneId);
      }
      return;
    }

    const distToOwner = distance(companion.position, owner.position);
    if (distToOwner > COMPANION_FOLLOW_DISTANCE) {
      companion.state = "run";
      const dir = normalize({ x: owner.position.x - companion.position.x, y: 0, z: owner.position.z - companion.position.z });
      companion.position = clampToZone(add(companion.position, scale(dir, COMPANION_SPEED * dt)), companion.zoneId);
      companion.facing = Math.atan2(dir.x, dir.z);
    } else {
      companion.state = "idle";
    }
  }

  /**
   * Simple, non-crit companion damage; assists are credited to the owner for XP/loot, same as
   * the owner's own hits. If the enemy has no current target, it aggroes onto the companion that
   * just hit it — the same threat pickup a player's first hit gives in `damageEnemy` — rather
   * than always defaulting to the owner; from there `tickEnemy`'s own aggro AI decides whether it
   * keeps swinging at the companion or the companion's owner.
   */
  private companionAttack(companion: CompanionEntity, enemy: EnemyEntity, owner: PlayerEntity, now: number) {
    const amount = COMPANION_BASE_DAMAGE;
    enemy.hp = Math.max(0, enemy.hp - amount);
    enemy.damagers.set(owner.id, now);
    enemy.state = enemy.hp > 0 ? enemy.state : "dead";
    if (!enemy.targetId) enemy.targetId = companion.id;
    this.events.push({ type: "damage", targetId: enemy.id, amount, crit: false, sourceId: companion.id, pos: enemy.position, zoneId: enemy.zoneId });
    if (enemy.hp <= 0 && enemy.deadAt === null) {
      this.killEnemy(enemy, now);
    }
  }

  private hurtCompanion(companion: CompanionEntity, amount: number, now: number, sourceId: string) {
    companion.hp = Math.max(0, companion.hp - amount);
    this.events.push({ type: "damage", targetId: companion.id, amount, crit: false, sourceId, pos: companion.position, zoneId: companion.zoneId });
    if (companion.hp <= 0) this.killCompanion(companion, now);
  }

  private killCompanion(companion: CompanionEntity, now: number) {
    companion.deadAt = now;
    companion.reviveAt = now + COMPANION_REVIVE_MS;
    companion.state = "dead";
    this.events.push({ type: "death", entityId: companion.id, isPlayer: false, zoneId: companion.zoneId });
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
    this.tickHealZones(now);
    this.tickWorldEvent(now);

    for (const player of this.players.values()) this.syncCompanions(player);
    for (const companion of this.companions.values()) {
      const owner = this.players.get(companion.ownerId);
      if (!owner) {
        this.companions.delete(companion.id);
        continue;
      }
      this.tickCompanion(companion, owner, dt, now);
    }

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
      player.position = clampToZone(add(player.position, scale(player.dodgeDir, DODGE_SPEED * dt)), player.character.zoneId);
    } else if (canMove && (player.moveIntent.x !== 0 || player.moveIntent.z !== 0)) {
      player.position = clampToZone(add(player.position, scale(player.moveIntent, PLAYER_SPEED * dt)), player.character.zoneId);
      if (player.state !== "cast" && player.state !== "gather") player.state = "run";
    } else if (player.state === "run") {
      player.state = "idle";
    }

    if (canMove) this.tryTravel(player, now);

    if (player.character.hp <= 0 && player.state === "dead") {
      // handled via respawn timer stored on character death tick; simple auto-respawn:
      if (!(player as any)._respawnAt) (player as any)._respawnAt = now + PLAYER_RESPAWN_MS;
      if (now >= (player as any)._respawnAt) {
        player.character.hp = player.character.maxHp;
        player.character.resource = player.character.maxResource;
        player.position = { ...getZone(player.character.zoneId).spawnPoint };
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

    if (player.character.specializationId === "ranger_strider") {
      const moving = player.moveIntent.x !== 0 || player.moveIntent.z !== 0;
      if (moving && player.character.hp > 0) {
        player.momentumAccum += dt;
        while (player.momentumAccum >= 1) {
          player.momentumAccum -= 1;
          player.momentum = Math.min(5, player.momentum + 1);
        }
      } else {
        player.momentum = Math.max(0, player.momentum - dt * 2);
      }
    }

    if (player.character.specializationId === "ranger_beastcaller" && player.character.hp > 0 && now >= player.nextHawkTickAt) {
      const interval = now < player.packUntil ? 2000 : 4000;
      player.nextHawkTickAt = now + interval;
      const target = this.nearestEnemyInRange(player, 12);
      if (target && target.hp > 0) {
        const amount = 8 + player.character.stats.power * 0.3;
        this.damageEnemy(target, amount, player, now);
      }
    }
  }

  private tickHealZones(now: number) {
    for (const [id, zone] of this.healZones) {
      if (now >= zone.endAt) {
        this.healZones.delete(id);
        continue;
      }
      if (now < zone.nextTickAt) continue;
      zone.nextTickAt = now + 1000;
      const owner = this.players.get(zone.ownerId);
      for (const player of this.players.values()) {
        if (player.character.hp <= 0 || player.character.zoneId !== zone.zoneId) continue;
        if (distance(player.position, zone.pos) > zone.radius) continue;
        const before = player.character.hp;
        player.character.hp = Math.min(player.character.maxHp, player.character.hp + zone.tickAmount);
        if (player.character.hp > before) {
          this.events.push({
            type: "heal",
            targetId: player.id,
            amount: Math.round(player.character.hp - before),
            sourceId: owner?.id ?? zone.ownerId,
            pos: player.position,
            zoneId: zone.zoneId
          });
        }
      }
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
        const target = this.resolveEnemyTarget(enemy.targetId);
        if (target && this.targetZoneId(target) === enemy.zoneId && distance(enemy.position, target.position) <= def.attackRange + 2) {
          if (this.isCompanionEntity(target)) {
            this.hurtCompanion(target, def.attackDamage, now, enemy.id);
          } else {
            this.damagePlayer(target, def.attackDamage, now);
          }
        }
        enemy.telegraphEndAt = null;
        enemy.telegraphPos = null;
        enemy.attackReadyAt = now + def.attackCooldownMs;
        enemy.state = "idle";
      }
      return;
    }

    let target = this.resolveEnemyTarget(enemy.targetId);
    if (enemy.forcedTargetUntil > now && enemy.forcedTargetId) {
      const forced = this.players.get(enemy.forcedTargetId);
      if (forced && forced.character.hp > 0 && forced.character.zoneId === enemy.zoneId) {
        target = forced;
        enemy.targetId = forced.id;
      }
    } else if (
      !target ||
      !this.targetAlive(target) ||
      this.targetZoneId(target) !== enemy.zoneId ||
      distance(enemy.position, target.position) > def.aggroRadius * 1.6
    ) {
      target = this.findNearestTarget(enemy.position, def.aggroRadius, enemy.zoneId);
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

  /** True for a companion, false for a player — the two target kinds an enemy can lock onto. */
  private isCompanionEntity(target: PlayerEntity | CompanionEntity): target is CompanionEntity {
    return "ownerId" in target;
  }

  private resolveEnemyTarget(id: string | null): PlayerEntity | CompanionEntity | undefined {
    if (!id) return undefined;
    return this.players.get(id) ?? this.companions.get(id);
  }

  private targetAlive(target: PlayerEntity | CompanionEntity): boolean {
    return this.isCompanionEntity(target) ? target.deadAt === null : target.character.hp > 0;
  }

  private targetZoneId(target: PlayerEntity | CompanionEntity): string {
    return this.isCompanionEntity(target) ? target.zoneId : target.character.zoneId;
  }

  /**
   * The nearest live player OR companion within range — enemy AI treats both as full aggro
   * targets, the same "closest valid body" pick either kind would get on its own.
   */
  private findNearestTarget(pos: Vec3, radius: number, zoneId: string): PlayerEntity | CompanionEntity | undefined {
    let best: PlayerEntity | CompanionEntity | undefined;
    let bestDist = radius;
    for (const player of this.players.values()) {
      if (player.character.hp <= 0 || player.character.zoneId !== zoneId) continue;
      const d = distance(pos, player.position);
      if (d <= bestDist) {
        best = player;
        bestDist = d;
      }
    }
    for (const companion of this.companions.values()) {
      if (companion.deadAt !== null || companion.zoneId !== zoneId) continue;
      const d = distance(pos, companion.position);
      if (d <= bestDist) {
        best = companion;
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

  /**
   * Sends each player a snapshot scoped to their own zone: other players, enemies, nodes and
   * events from a different zone copy are invisible to them, the same way a channel, shard or
   * instance boundary hides population elsewhere in a real MMO.
   */
  private broadcastSnapshot(now: number) {
    for (const recipient of this.players.values()) {
      const zoneId = recipient.character.zoneId;

      const players: PlayerSnapshot[] = [...this.players.values()]
        .filter((p) => p.character.zoneId === zoneId)
        .map((p) => ({
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

      const enemies: EnemySnapshot[] = [...this.enemies.values()]
        .filter((e) => e.zoneId === zoneId)
        .map((e) => ({
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

      const nodes: NodeSnapshot[] = [...this.nodes.values()]
        .filter((n) => n.zoneId === zoneId)
        .map((n) => ({
          id: n.id,
          defId: n.defId,
          position: n.position,
          depleted: n.depleted
        }));

      const npcs: NpcSnapshot[] = [...this.npcs.values()]
        .filter((n) => n.zoneId === zoneId)
        .map((n) => {
          const def = getNpc(n.id)!;
          return { id: n.id, defId: n.id, name: def.name, title: def.title, position: n.position };
        });

      const companions: CompanionSnapshot[] = [...this.companions.values()]
        .filter((c) => c.zoneId === zoneId)
        .map((c) => {
          const def = getNpc(c.defId)!;
          return {
            id: c.id,
            defId: c.defId,
            name: def.name,
            ownerId: c.ownerId,
            position: c.position,
            facing: c.facing,
            hp: c.hp,
            maxHp: c.maxHp,
            state: c.deadAt !== null ? "dead" : c.state
          };
        });

      const events = this.events.filter((e) => e.zoneId === zoneId);

      this.send(recipient.ws, { t: "snapshot", tick: this.tick, serverTime: now, players, enemies, nodes, npcs, companions, events });
    }
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
