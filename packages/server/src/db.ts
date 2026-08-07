import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_LOYALTY, START_ZONE_ID, getRace, type CharacterState, type ItemRarity, type PlayerRaceId } from "@moon/shared";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.MOON_DB_PATH ?? path.join(__dirname, "..", "moon.sqlite");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS characters (
    token TEXT PRIMARY KEY,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    classId TEXT NOT NULL,
    level INTEGER NOT NULL,
    xp INTEGER NOT NULL,
    hp REAL NOT NULL,
    maxHp REAL NOT NULL,
    resource REAL NOT NULL,
    maxResource REAL NOT NULL,
    statsJson TEXT NOT NULL,
    skillPoints INTEGER NOT NULL,
    abilityRanksJson TEXT NOT NULL,
    inventoryJson TEXT NOT NULL,
    equipmentJson TEXT NOT NULL,
    positionJson TEXT NOT NULL,
    zoneId TEXT,
    factionLoyaltyJson TEXT,
    npcMemoryJson TEXT,
    lunarResonance REAL,
    companionId TEXT,
    companionIdsJson TEXT,
    endingId TEXT,
    gold REAL,
    raceId TEXT,
    romanceJson TEXT,
    updatedAt INTEGER NOT NULL
  );
`);
for (const migration of [
  "ALTER TABLE characters ADD COLUMN zoneId TEXT",
  "ALTER TABLE characters ADD COLUMN factionLoyaltyJson TEXT",
  "ALTER TABLE characters ADD COLUMN npcMemoryJson TEXT",
  "ALTER TABLE characters ADD COLUMN lunarResonance REAL",
  "ALTER TABLE characters ADD COLUMN companionId TEXT", // superseded by companionIdsJson (multi-companion); kept for old rows
  "ALTER TABLE characters ADD COLUMN companionIdsJson TEXT",
  "ALTER TABLE characters ADD COLUMN endingId TEXT",
  "ALTER TABLE characters ADD COLUMN gold REAL",
  "ALTER TABLE characters ADD COLUMN raceId TEXT",
  "ALTER TABLE characters ADD COLUMN romanceJson TEXT"
]) {
  try {
    db.exec(migration);
  } catch {
    // column already exists on databases created before this migration was added
  }
}

// The auction house (see docs/GDD.md's "Auction house" section) — global and cross-room, unlike
// a Room's in-memory state, since a listing must outlive the seller's session and be visible to
// buyers in any other room. Kept in its own table rather than folded into `characters` because a
// listing's lifecycle (created, bought, cancelled) is independent of any one character row.
db.exec(`
  CREATE TABLE IF NOT EXISTS auctions (
    id TEXT PRIMARY KEY,
    sellerToken TEXT NOT NULL,
    sellerName TEXT NOT NULL,
    itemId TEXT NOT NULL,
    rarity TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    listedAt INTEGER NOT NULL
  );
`);

const getStmt = db.prepare("SELECT * FROM characters WHERE token = ?");
const upsertStmt = db.prepare(`
  INSERT INTO characters (token, id, name, classId, level, xp, hp, maxHp, resource, maxResource, statsJson, skillPoints, abilityRanksJson, inventoryJson, equipmentJson, positionJson, zoneId, factionLoyaltyJson, npcMemoryJson, lunarResonance, companionIdsJson, endingId, gold, raceId, romanceJson, updatedAt)
  VALUES (@token, @id, @name, @classId, @level, @xp, @hp, @maxHp, @resource, @maxResource, @statsJson, @skillPoints, @abilityRanksJson, @inventoryJson, @equipmentJson, @positionJson, @zoneId, @factionLoyaltyJson, @npcMemoryJson, @lunarResonance, @companionIdsJson, @endingId, @gold, @raceId, @romanceJson, @updatedAt)
  ON CONFLICT(token) DO UPDATE SET
    name=excluded.name, classId=excluded.classId, level=excluded.level, xp=excluded.xp,
    hp=excluded.hp, maxHp=excluded.maxHp, resource=excluded.resource, maxResource=excluded.maxResource,
    statsJson=excluded.statsJson, skillPoints=excluded.skillPoints, abilityRanksJson=excluded.abilityRanksJson,
    inventoryJson=excluded.inventoryJson, equipmentJson=excluded.equipmentJson, positionJson=excluded.positionJson,
    zoneId=excluded.zoneId, factionLoyaltyJson=excluded.factionLoyaltyJson, npcMemoryJson=excluded.npcMemoryJson,
    lunarResonance=excluded.lunarResonance, companionIdsJson=excluded.companionIdsJson, endingId=excluded.endingId,
    gold=excluded.gold, raceId=excluded.raceId, romanceJson=excluded.romanceJson, updatedAt=excluded.updatedAt;
`);

interface Row {
  token: string;
  id: string;
  name: string;
  classId: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  resource: number;
  maxResource: number;
  statsJson: string;
  skillPoints: number;
  abilityRanksJson: string;
  inventoryJson: string;
  equipmentJson: string;
  positionJson: string;
  zoneId: string | null;
  factionLoyaltyJson: string | null;
  npcMemoryJson: string | null;
  lunarResonance: number | null;
  companionId: string | null;
  companionIdsJson: string | null;
  endingId: string | null;
  gold: number | null;
  raceId: string | null;
  romanceJson: string | null;
  updatedAt: number;
}

export function loadCharacter(token: string): CharacterState | null {
  const row = getStmt.get(token) as Row | undefined;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    classId: row.classId as CharacterState["classId"],
    level: row.level,
    xp: row.xp,
    hp: row.hp,
    maxHp: row.maxHp,
    resource: row.resource,
    maxResource: row.maxResource,
    stats: JSON.parse(row.statsJson),
    skillPoints: row.skillPoints,
    abilityRanks: JSON.parse(row.abilityRanksJson),
    inventory: JSON.parse(row.inventoryJson),
    equipment: JSON.parse(row.equipmentJson),
    position: JSON.parse(row.positionJson),
    zoneId: row.zoneId ?? START_ZONE_ID,
    factionLoyalty: row.factionLoyaltyJson ? JSON.parse(row.factionLoyaltyJson) : { ...DEFAULT_LOYALTY },
    npcMemory: row.npcMemoryJson ? JSON.parse(row.npcMemoryJson) : {},
    lunarResonance: row.lunarResonance ?? 0,
    // companionIdsJson supersedes the old single-companion column; fall back to it for characters
    // saved before multi-companion support existed.
    companionIds: row.companionIdsJson ? JSON.parse(row.companionIdsJson) : row.companionId ? [row.companionId] : [],
    endingId: row.endingId ?? undefined,
    // Characters saved before vendors existed default to 0, not STARTER_GOLD — that starting purse
    // is only for brand-new characters (see character.ts's getOrCreateCharacter).
    gold: row.gold ?? 0,
    // Characters saved before races existed fall back to the baseline generalist race, the same
    // default character.ts's resolveRaceId gives a missing/unrecognized raceId at creation time.
    raceId: (getRace(row.raceId ?? "") ? row.raceId : "vaelari") as PlayerRaceId,
    romance: row.romanceJson ? JSON.parse(row.romanceJson) : {}
  };
}

export function saveCharacter(token: string, c: CharacterState): void {
  upsertStmt.run({
    token,
    id: c.id,
    name: c.name,
    classId: c.classId,
    level: c.level,
    xp: c.xp,
    hp: c.hp,
    maxHp: c.maxHp,
    resource: c.resource,
    maxResource: c.maxResource,
    statsJson: JSON.stringify(c.stats),
    skillPoints: c.skillPoints,
    abilityRanksJson: JSON.stringify(c.abilityRanks),
    inventoryJson: JSON.stringify(c.inventory),
    equipmentJson: JSON.stringify(c.equipment),
    positionJson: JSON.stringify(c.position),
    zoneId: c.zoneId ?? START_ZONE_ID,
    factionLoyaltyJson: JSON.stringify(c.factionLoyalty ?? DEFAULT_LOYALTY),
    npcMemoryJson: JSON.stringify(c.npcMemory ?? {}),
    lunarResonance: c.lunarResonance ?? 0,
    companionIdsJson: JSON.stringify(c.companionIds ?? []),
    endingId: c.endingId ?? null,
    gold: c.gold ?? 0,
    raceId: c.raceId ?? "vaelari",
    romanceJson: JSON.stringify(c.romance ?? {}),
    updatedAt: Date.now()
  });
}

export interface AuctionRow {
  id: string;
  sellerToken: string;
  sellerName: string;
  itemId: string;
  rarity: ItemRarity;
  quantity: number;
  price: number;
  listedAt: number;
}

const insertAuctionStmt = db.prepare(`
  INSERT INTO auctions (id, sellerToken, sellerName, itemId, rarity, quantity, price, listedAt)
  VALUES (@id, @sellerToken, @sellerName, @itemId, @rarity, @quantity, @price, @listedAt)
`);
const getAuctionStmt = db.prepare("SELECT * FROM auctions WHERE id = ?");
const deleteAuctionStmt = db.prepare("DELETE FROM auctions WHERE id = ?");
const listAuctionsStmt = db.prepare("SELECT * FROM auctions ORDER BY listedAt DESC");
const countAuctionsBySellerStmt = db.prepare("SELECT COUNT(*) AS n FROM auctions WHERE sellerToken = ?");

export function insertAuction(row: AuctionRow): void {
  insertAuctionStmt.run(row);
}

export function getAuction(id: string): AuctionRow | null {
  return (getAuctionStmt.get(id) as AuctionRow | undefined) ?? null;
}

/** Synchronous and called with no `await` between the read and the delete anywhere in this
 *  codebase's call sites — with better-sqlite3's synchronous driver and Node's single-threaded
 *  event loop, that's enough to guarantee two simultaneous buy attempts on the same listing can't
 *  both succeed; the second always finds it already gone. */
export function deleteAuction(id: string): void {
  deleteAuctionStmt.run(id);
}

export function listAuctions(): AuctionRow[] {
  return listAuctionsStmt.all() as AuctionRow[];
}

export function countAuctionsBySeller(sellerToken: string): number {
  return (countAuctionsBySellerStmt.get(sellerToken) as { n: number }).n;
}

/** Credits gold straight to a character's saved row — used only when the seller isn't currently
 *  connected anywhere (see presence.ts's creditGold). Never called for an online seller: their
 *  live in-memory character is the source of truth while connected, and this read-modify-write
 *  would otherwise race the periodic autosave and silently lose the credit. */
export function creditGoldOffline(token: string, amount: number): void {
  const character = loadCharacter(token);
  if (!character) return;
  character.gold += amount;
  saveCharacter(token, character);
}
