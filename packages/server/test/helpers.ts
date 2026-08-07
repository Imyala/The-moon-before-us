/**
 * Shared test fixtures for driving the real `Room` class directly — no WebSocket, no network
 * layer, just the actual server-authoritative game logic. This is the same technique used to
 * verify every feature in this codebase before it shipped; these files just make that
 * verification permanent instead of throwaway.
 */

export function fakeWs() {
  const sent: any[] = [];
  return {
    readyState: 1,
    OPEN: 1,
    send: (raw: string) => sent.push(JSON.parse(raw)),
    sent
  };
}

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function makePlayer(opts: {
  id?: string;
  classId?: string;
  weaponItemId?: string;
  specializationId?: string | null;
  zoneId?: string;
  position?: { x: number; y: number; z: number };
  hp?: number;
  maxHp?: number;
  resource?: number;
  power?: number;
  inventory?: any[];
  npcMemory?: Record<string, any>;
  factionLoyalty?: Record<string, number>;
  lunarResonance?: number;
}): any {
  const id = opts.id ?? nextId("player");
  return {
    id,
    ws: fakeWs(),
    token: `token-${id}`,
    character: {
      id: `char-${id}`,
      hp: opts.hp ?? 100,
      maxHp: opts.maxHp ?? 100,
      zoneId: opts.zoneId ?? "threadhold",
      classId: opts.classId ?? "warden",
      specializationId: opts.specializationId ?? null,
      name: id,
      resource: opts.resource ?? 999,
      maxResource: 999,
      stats: { power: opts.power ?? 20, vitality: 10, critChance: 0, critDamage: 1.5, haste: 0 },
      equipment: { weapon: { itemId: opts.weaponItemId ?? "weapon_warden_blade", quantity: 1, rarity: "common" } },
      abilityRanks: {},
      inventory: opts.inventory ?? [],
      npcMemory: opts.npcMemory ?? {},
      factionLoyalty: opts.factionLoyalty ?? { chainwrights: 0, luminari: 0, paleChoir: 0, independent: 0 },
      lunarResonance: opts.lunarResonance ?? 0,
      companionIds: [],
      endingId: undefined
    },
    position: { ...(opts.position ?? { x: 0, y: 0, z: 0 }) },
    moveIntent: { x: 0, y: 0, z: 0 },
    facing: 0,
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
    forcedCritUntil: 0,
    mounted: false,
    specStacks: 0,
    specStacksUntil: 0
  };
}

export function makeCompanion(opts: { ownerId: string; defId?: string; zoneId?: string; position?: { x: number; y: number; z: number } }): any {
  const defId = opts.defId ?? "test_companion";
  return {
    id: `${opts.ownerId}:${defId}`,
    ownerId: opts.ownerId,
    defId,
    zoneId: opts.zoneId ?? "threadhold",
    position: { ...(opts.position ?? { x: 0, y: 0, z: 0 }) },
    facing: 0,
    state: "idle",
    attackReadyAt: 0,
    hp: 100,
    maxHp: 100,
    deadAt: null,
    reviveAt: null
  };
}
