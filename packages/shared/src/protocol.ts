import type { CharacterState, EquipmentSlot, PlayerClassId } from "./types.js";
import type { Vec3 } from "./vec.js";

// ---------------- Client -> Server ----------------

export interface JoinMessage {
  t: "join";
  token: string; // persistent per-browser identity (localStorage uuid)
  name: string;
  classId: PlayerClassId;
  room: "solo" | "new" | string; // "solo" = private instance, "new" = create shareable party, else join code
}

export interface InputMessage {
  t: "input";
  move: Vec3; // normalized movement intent in world space (y unused)
  facing: number; // radians
  seq: number;
}

export interface UseAbilityMessage {
  t: "useAbility";
  abilityId: string;
  targetPos?: Vec3;
  targetEntityId?: string;
}

export interface DodgeMessage {
  t: "dodge";
  dir: Vec3;
}

export interface InteractNodeMessage {
  t: "interactNode";
  nodeId: string;
}

export interface CraftMessage {
  t: "craft";
  recipeId: string;
}

export interface EquipMessage {
  t: "equip";
  itemIndex: number;
}

export interface UnequipMessage {
  t: "unequip";
  slot: EquipmentSlot;
}

export interface UseItemMessage {
  t: "useItem";
  itemIndex: number;
}

export interface AllocateSkillPointMessage {
  t: "allocateSkillPoint";
  abilityId: string;
}

export interface ChooseSpecializationMessage {
  t: "chooseSpecialization";
  specializationId: string;
}

export interface ChooseSubclassMessage {
  t: "chooseSubclass";
  subclassId: string;
}

export interface ChatMessage {
  t: "chat";
  message: string;
}

export interface LeaveMessage {
  t: "leave";
}

export interface TalkMessage {
  t: "talk";
  npcId: string;
}

export interface ChooseDialogueOptionMessage {
  t: "chooseDialogueOption";
  npcId: string;
  optionId: string;
}

export type ClientMessage =
  | JoinMessage
  | InputMessage
  | UseAbilityMessage
  | DodgeMessage
  | InteractNodeMessage
  | CraftMessage
  | EquipMessage
  | UnequipMessage
  | UseItemMessage
  | AllocateSkillPointMessage
  | ChooseSpecializationMessage
  | ChooseSubclassMessage
  | ChatMessage
  | LeaveMessage
  | TalkMessage
  | ChooseDialogueOptionMessage;

// ---------------- Server -> Client ----------------

export type EntityState = "idle" | "run" | "cast" | "dodge" | "dead" | "gather" | "stunned" | "attack" | "chase";

export interface PlayerSnapshot {
  id: string;
  name: string;
  classId: PlayerClassId;
  level: number;
  position: Vec3;
  facing: number;
  hp: number;
  maxHp: number;
  resource: number;
  maxResource: number;
  state: EntityState;
  shield: number;
}

export interface EnemyTelegraph {
  abilityRadius: number;
  endAt: number;
  pos: Vec3;
}

export interface EnemySnapshot {
  id: string;
  defId: string;
  position: Vec3;
  facing: number;
  hp: number;
  maxHp: number;
  state: EntityState;
  telegraph?: EnemyTelegraph;
}

export interface NodeSnapshot {
  id: string;
  defId: string;
  position: Vec3;
  depleted: boolean;
}

export interface NpcSnapshot {
  id: string;
  defId: string;
  name: string;
  title: string;
  position: Vec3;
}

export interface CompanionSnapshot {
  id: string;
  defId: string;
  name: string;
  ownerId: string;
  position: Vec3;
  facing: number;
  hp: number;
  maxHp: number;
  state: EntityState;
}

// Every event carries the zoneId it happened in, so a room hosting players split across
// multiple zones can hand each player only the events relevant to the zone they're standing in
// (see Room.broadcastSnapshot on the server) — the same "who can see what" boundary a zone copy
// or channel enforces in a real MMO, just scoped to a single room instance here.
export type GameEvent =
  | { type: "damage"; targetId: string; amount: number; crit: boolean; sourceId: string; pos: Vec3; zoneId: string }
  | { type: "heal"; targetId: string; amount: number; sourceId: string; pos: Vec3; zoneId: string }
  | { type: "death"; entityId: string; isPlayer: boolean; zoneId: string }
  | { type: "levelUp"; playerId: string; level: number; zoneId: string }
  | { type: "loot"; playerId: string; itemId: string; quantity: number; rarity: string; zoneId: string }
  | { type: "abilityCast"; casterId: string; abilityId: string; zoneId: string }
  | { type: "craft"; playerId: string; itemId: string; quantity: number; zoneId: string }
  | { type: "skillPoint"; playerId: string; abilityId: string; rank: number; zoneId: string }
  | { type: "zoneChange"; playerId: string; toZoneId: string; zoneId: string };

export interface SnapshotMessage {
  t: "snapshot";
  tick: number;
  serverTime: number;
  players: PlayerSnapshot[];
  enemies: EnemySnapshot[];
  nodes: NodeSnapshot[];
  npcs: NpcSnapshot[];
  companions: CompanionSnapshot[];
  events: GameEvent[];
}

export interface WelcomeMessage {
  t: "welcome";
  selfId: string;
  roomCode: string;
  character: CharacterState;
}

export interface CharacterUpdateMessage {
  t: "characterUpdate";
  character: CharacterState;
}

export interface PartyRosterMessage {
  t: "partyRoster";
  members: { id: string; name: string; classId: PlayerClassId; level: number }[];
}

export interface ChatBroadcastMessage {
  t: "chat";
  from: string;
  message: string;
}

export interface ErrorMessage {
  t: "error";
  message: string;
}

export interface DialogueChoiceOption {
  id: string;
  label: string;
}

export interface NpcDialogueMessage {
  t: "npcDialogue";
  npcId: string;
  speaker: string;
  line: string;
  choices?: DialogueChoiceOption[];
}

export type ServerMessage =
  | SnapshotMessage
  | WelcomeMessage
  | CharacterUpdateMessage
  | PartyRosterMessage
  | ChatBroadcastMessage
  | ErrorMessage
  | NpcDialogueMessage;
