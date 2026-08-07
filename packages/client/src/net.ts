import type { ClientMessage, PlayerClassId, PlayerRaceId, ServerMessage } from "@moon/shared";

export type ServerMessageHandler = (msg: ServerMessage) => void;

function serverUrl(): string {
  const override = import.meta.env.VITE_SERVER_URL as string | undefined;
  if (override) return override;
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${location.hostname}:8787`;
}

export class NetClient {
  private ws: WebSocket | null = null;
  private handlers = new Set<ServerMessageHandler>();
  private queue: ClientMessage[] = [];
  status: "idle" | "connecting" | "open" | "closed" = "idle";
  onStatusChange: ((status: NetClient["status"]) => void) | null = null;

  connect(join: { token: string; name: string; classId: PlayerClassId; raceId: PlayerRaceId; room: string }) {
    this.status = "connecting";
    this.onStatusChange?.(this.status);
    const ws = new WebSocket(serverUrl());
    this.ws = ws;

    ws.addEventListener("open", () => {
      this.status = "open";
      this.onStatusChange?.(this.status);
      this.send({ t: "join", token: join.token, name: join.name, classId: join.classId, raceId: join.raceId, room: join.room as any });
      for (const msg of this.queue) this.rawSend(msg);
      this.queue = [];
    });

    ws.addEventListener("message", (ev) => {
      try {
        const msg = JSON.parse(ev.data) as ServerMessage;
        for (const h of this.handlers) h(msg);
      } catch {
        // ignore malformed frames
      }
    });

    ws.addEventListener("close", () => {
      this.status = "closed";
      this.onStatusChange?.(this.status);
    });

    ws.addEventListener("error", () => {
      this.status = "closed";
      this.onStatusChange?.(this.status);
    });
  }

  on(handler: ServerMessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(msg: ClientMessage) {
    if (this.status === "open") this.rawSend(msg);
    else this.queue.push(msg);
  }

  private rawSend(msg: ClientMessage) {
    this.ws?.send(JSON.stringify(msg));
  }

  close() {
    this.ws?.close();
    this.ws = null;
    this.status = "closed";
  }
}
