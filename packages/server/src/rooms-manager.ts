import type { CharacterState } from "@moon/shared";
import { Room } from "./room.js";
import { saveCharacter } from "./db.js";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

const persist = (token: string, character: CharacterState) => saveCharacter(token, character);

export class RoomManager {
  private partyRooms = new Map<string, Room>();

  createPartyRoom(): Room {
    const code = this.generateCode();
    const room = new Room({
      code,
      isSolo: false,
      persist,
      onEmpty: (r) => {
        if (r.code) this.partyRooms.delete(r.code);
      }
    });
    this.partyRooms.set(code, room);
    return room;
  }

  createSoloRoom(): Room {
    return new Room({ isSolo: true, persist, onEmpty: () => {} });
  }

  joinPartyRoom(code: string): Room | undefined {
    return this.partyRooms.get(code.toUpperCase().trim());
  }

  private generateCode(): string {
    let code: string;
    do {
      code = Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
    } while (this.partyRooms.has(code));
    return code;
  }
}
