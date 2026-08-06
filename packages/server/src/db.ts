import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { START_ZONE_ID, type CharacterState } from "@moon/shared";

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
    updatedAt INTEGER NOT NULL
  );
`);
try {
  db.exec("ALTER TABLE characters ADD COLUMN zoneId TEXT");
} catch {
  // column already exists on databases created before zones were added
}

const getStmt = db.prepare("SELECT * FROM characters WHERE token = ?");
const upsertStmt = db.prepare(`
  INSERT INTO characters (token, id, name, classId, level, xp, hp, maxHp, resource, maxResource, statsJson, skillPoints, abilityRanksJson, inventoryJson, equipmentJson, positionJson, zoneId, updatedAt)
  VALUES (@token, @id, @name, @classId, @level, @xp, @hp, @maxHp, @resource, @maxResource, @statsJson, @skillPoints, @abilityRanksJson, @inventoryJson, @equipmentJson, @positionJson, @zoneId, @updatedAt)
  ON CONFLICT(token) DO UPDATE SET
    name=excluded.name, classId=excluded.classId, level=excluded.level, xp=excluded.xp,
    hp=excluded.hp, maxHp=excluded.maxHp, resource=excluded.resource, maxResource=excluded.maxResource,
    statsJson=excluded.statsJson, skillPoints=excluded.skillPoints, abilityRanksJson=excluded.abilityRanksJson,
    inventoryJson=excluded.inventoryJson, equipmentJson=excluded.equipmentJson, positionJson=excluded.positionJson,
    zoneId=excluded.zoneId, updatedAt=excluded.updatedAt;
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
    zoneId: row.zoneId ?? START_ZONE_ID
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
    updatedAt: Date.now()
  });
}
