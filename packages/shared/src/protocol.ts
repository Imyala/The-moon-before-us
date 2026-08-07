import type { CharacterState, EquipmentSlot, ItemRarity, PlayerClassId } from "./types.js";
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

/** Dismisses one active companion by NPC id, freeing a slot for a swap (see MAX_COMPANIONS). */
export interface DismissCompanionMessage {
  t: "dismissCompanion";
  npcId: string;
}

/** Opens a trade window with another player in the same zone and within range (see Room.proposeTrade). */
export interface ProposeTradeMessage {
  t: "proposeTrade";
  targetPlayerId: string;
}

/** Accepts or declines an incoming TradeRequestMessage. */
export interface RespondTradeMessage {
  t: "respondTrade";
  tradeId: string;
  accept: boolean;
}

/** Sets (or, at quantity 0, clears) how much of one item/rarity you're offering in an active trade. */
export interface SetTradeOfferMessage {
  t: "setTradeOffer";
  tradeId: string;
  itemId: string;
  rarity: ItemRarity;
  quantity: number;
}

/** Locks in your current offer as ready. The trade completes once both sides have confirmed. */
export interface ConfirmTradeMessage {
  t: "confirmTrade";
  tradeId: string;
}

export interface CancelTradeMessage {
  t: "cancelTrade";
  tradeId: string;
}

/** Toggles mounted state (see Room.toggleMount) — faster movement, auto-dismounted by combat or gathering. */
export interface ToggleMountMessage {
  t: "toggleMount";
}

/** Buys `quantity` of one item off a nearby vendor's catalog (see Room.tryBuyItem). */
export interface BuyItemMessage {
  t: "buyItem";
  vendorId: string;
  itemId: string;
  quantity: number;
}

/** Sells `quantity` of one inventory stack to any nearby vendor, at that item's formulaic
 *  sellValue (see items.ts) — a vendor's catalog only governs what it *sells*, not what it'll buy. */
export interface SellItemMessage {
  t: "sellItem";
  vendorId: string;
  itemId: string;
  rarity: ItemRarity;
  quantity: number;
}

/** Lists an inventory stack on the auction house for `price` gold total, minus the flat
 *  AUCTION_LISTING_FEE charged immediately (see Room.tryListAuction). Accessible from anywhere —
 *  unlike vendors, the auction house isn't tied to a physical location. */
export interface ListAuctionMessage {
  t: "listAuction";
  itemId: string;
  rarity: ItemRarity;
  quantity: number;
  price: number;
}

/** Pulls back your own unsold listing — the item returns to your inventory, the listing fee is not refunded. */
export interface CancelAuctionMessage {
  t: "cancelAuction";
  listingId: string;
}

/** Buys someone else's listing outright at its listed price. */
export interface BuyAuctionMessage {
  t: "buyAuction";
  listingId: string;
}

/** Asks for the current full listing board (see Room.sendAuctionListings) — listings aren't part
 *  of the per-tick zone snapshot since the auction house is global, not zone- or room-scoped. */
export interface RequestAuctionsMessage {
  t: "requestAuctions";
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
  | ChooseDialogueOptionMessage
  | DismissCompanionMessage
  | ProposeTradeMessage
  | RespondTradeMessage
  | SetTradeOfferMessage
  | ConfirmTradeMessage
  | CancelTradeMessage
  | ToggleMountMessage
  | BuyItemMessage
  | SellItemMessage
  | ListAuctionMessage
  | CancelAuctionMessage
  | BuyAuctionMessage
  | RequestAuctionsMessage;

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
  mounted: boolean;
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

/** A stationary NPC merchant (see vendors.ts) — id and defId are always equal, one instance per
 *  room per catalog entry, the same convention NpcSnapshot uses for the narrative roster. */
export interface VendorSnapshot {
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
  | { type: "gold"; playerId: string; amount: number; zoneId: string }
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
  vendors: VendorSnapshot[];
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

/** Sent to the target only, when another player proposes a trade — an accept/decline prompt. */
export interface TradeRequestMessage {
  t: "tradeRequest";
  tradeId: string;
  fromPlayerId: string;
  fromName: string;
}

export interface TradeOfferEntry {
  itemId: string;
  rarity: ItemRarity;
  quantity: number;
}

/**
 * The full live state of an active trade, sent individually to each of the two participants
 * (so "self"/"other" is always framed from that recipient's point of view) whenever either side's
 * offer or confirmed flag changes.
 */
export interface TradeStateMessage {
  t: "tradeState";
  tradeId: string;
  otherPlayerId: string;
  otherName: string;
  selfOffer: TradeOfferEntry[];
  otherOffer: TradeOfferEntry[];
  selfConfirmed: boolean;
  otherConfirmed: boolean;
}

export interface TradeClosedMessage {
  t: "tradeClosed";
  tradeId: string;
  reason: "completed" | "cancelled" | "declined";
}

/** One live auction house listing, as seen by a specific recipient — `isMine` is computed
 *  server-side per request rather than exposing the seller's token to any client (see
 *  Room.sendAuctionListings). */
export interface AuctionListing {
  id: string;
  sellerName: string;
  itemId: string;
  rarity: ItemRarity;
  quantity: number;
  price: number;
  listedAt: number;
  isMine: boolean;
}

export interface AuctionListingsMessage {
  t: "auctionListings";
  listings: AuctionListing[];
}

export type ServerMessage =
  | SnapshotMessage
  | WelcomeMessage
  | CharacterUpdateMessage
  | PartyRosterMessage
  | ChatBroadcastMessage
  | ErrorMessage
  | NpcDialogueMessage
  | TradeRequestMessage
  | TradeStateMessage
  | TradeClosedMessage
  | AuctionListingsMessage;
