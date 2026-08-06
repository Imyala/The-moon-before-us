import { createServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import type { ClientMessage, JoinMessage } from "@moon/shared";
import { getOrCreateCharacter, sanitizeName } from "./character.js";
import { RoomManager } from "./rooms-manager.js";
import type { Room } from "./room.js";

const PORT = Number(process.env.PORT ?? 8787);

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: httpServer });
const manager = new RoomManager();

interface Connection {
  room: Room;
  playerId: string;
}

wss.on("connection", (ws: WebSocket) => {
  let conn: Connection | null = null;

  ws.on("message", (raw) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (!conn) {
      if (msg.t !== "join") return;
      handleJoin(ws, msg, (c) => (conn = c));
      return;
    }

    conn.room.handleMessage(conn.playerId, msg);
  });

  ws.on("close", () => {
    if (conn) conn.room.removePlayer(conn.playerId);
  });

  ws.on("error", () => {
    if (conn) conn.room.removePlayer(conn.playerId);
  });
});

function handleJoin(ws: WebSocket, msg: JoinMessage, setConn: (c: Connection) => void) {
  if (!msg.token || typeof msg.token !== "string") {
    ws.send(JSON.stringify({ t: "error", message: "Missing session token." }));
    ws.close();
    return;
  }

  let room: Room | undefined;
  if (msg.room === "solo") {
    room = manager.createSoloRoom();
  } else if (msg.room === "new") {
    room = manager.createPartyRoom();
  } else {
    room = manager.joinPartyRoom(msg.room);
    if (!room) {
      ws.send(JSON.stringify({ t: "error", message: `No party found with code "${msg.room}".` }));
      ws.close();
      return;
    }
  }

  const character = getOrCreateCharacter(msg.token, sanitizeName(msg.name), msg.classId);
  const player = room.addPlayer(ws, msg.token, character);
  setConn({ room, playerId: player.id });
}

httpServer.listen(PORT, () => {
  console.log(`[moon] server listening on :${PORT}`);
});
