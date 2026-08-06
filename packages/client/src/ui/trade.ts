import { getItem, type CharacterState, type ItemRarity, type TradeClosedMessage, type TradeOfferEntry, type TradeRequestMessage, type TradeStateMessage } from "@moon/shared";
import type { NetClient } from "../net.js";
import { ICONS, rarityColor } from "./panels.js";

/**
 * Player trading (docs/GDD.md's "Player trading"): a two-column offer window driven entirely by
 * server-pushed TradeStateMessages, plus a small non-blocking accept/decline prompt for incoming
 * requests. Like every other panel, it never pauses movement — only the ability/interact hotkeys
 * are gated while it's open (see `trade.isOpen()` in main.ts).
 */
export class TradePanel {
  private requestEl: HTMLDivElement;
  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private activeTradeId: string | null = null;
  private lastState: TradeStateMessage | null = null;

  constructor(
    root: HTMLElement,
    private net: NetClient,
    private getCharacter: () => CharacterState
  ) {
    this.requestEl = document.createElement("div");
    this.requestEl.className = "trade-request interactive";
    this.requestEl.style.display = "none";
    root.appendChild(this.requestEl);

    this.overlay = document.createElement("div");
    this.overlay.className = "panel-overlay interactive";
    this.overlay.style.display = "none";
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.cancel();
    });
    this.panel = document.createElement("div");
    this.panel.className = "panel trade-panel";
    this.overlay.appendChild(this.panel);
    root.appendChild(this.overlay);
  }

  isOpen(): boolean {
    return this.activeTradeId !== null;
  }

  handleRequest(msg: TradeRequestMessage) {
    this.requestEl.style.display = "flex";
    this.requestEl.innerHTML = `
      <span>${escapeHtml(msg.fromName || "Someone")} wants to trade.</span>
      <button class="interactive" data-accept>Accept</button>
      <button class="interactive" data-decline>Decline</button>
    `;
    this.requestEl.querySelector("[data-accept]")!.addEventListener("click", () => {
      this.net.send({ t: "respondTrade", tradeId: msg.tradeId, accept: true });
      this.requestEl.style.display = "none";
    });
    this.requestEl.querySelector("[data-decline]")!.addEventListener("click", () => {
      this.net.send({ t: "respondTrade", tradeId: msg.tradeId, accept: false });
      this.requestEl.style.display = "none";
    });
  }

  handleState(msg: TradeStateMessage) {
    this.activeTradeId = msg.tradeId;
    this.lastState = msg;
    this.requestEl.style.display = "none";
    this.overlay.style.display = "flex";
    this.render();
  }

  handleClosed(msg: TradeClosedMessage) {
    if (this.activeTradeId !== msg.tradeId) return;
    this.activeTradeId = null;
    this.lastState = null;
    this.overlay.style.display = "none";
  }

  private cancel() {
    if (this.activeTradeId) this.net.send({ t: "cancelTrade", tradeId: this.activeTradeId });
  }

  private render() {
    const state = this.lastState;
    if (!state) return;
    const c = this.getCharacter();

    const offeredRow = (entries: TradeOfferEntry[], removable: boolean) =>
      entries.length === 0
        ? '<p style="opacity:0.6;font-size:12px">Nothing offered yet.</p>'
        : entries
            .map((e) => {
              const def = getItem(e.itemId);
              if (!def) return "";
              return `
              <div class="trade-item${removable ? " interactive" : ""}" ${removable ? `data-remove="${e.itemId}:${e.rarity}"` : ""} title="${def.name}">
                <span class="rarity-tag" style="background:${rarityColor(e.rarity)}"></span>
                <span class="icon">${ICONS[def.icon] ?? "❔"}</span>
                <span>${def.name}${e.quantity > 1 ? ` x${e.quantity}` : ""}</span>
              </div>`;
            })
            .join("");

    const offeredKeys = new Set(state.selfOffer.map((e) => `${e.itemId}:${e.rarity}`));
    const available = c.inventory.filter((s) => !offeredKeys.has(`${s.itemId}:${s.rarity}`));
    const availableRow = available
      .map((s) => {
        const def = getItem(s.itemId);
        if (!def) return "";
        return `
        <div class="trade-item interactive" data-add="${s.itemId}:${s.rarity}" title="Offer all ${s.quantity} ${def.name}">
          <span class="rarity-tag" style="background:${rarityColor(s.rarity)}"></span>
          <span class="icon">${ICONS[def.icon] ?? "❔"}</span>
          <span>${def.name}${s.quantity > 1 ? ` x${s.quantity}` : ""}</span>
        </div>`;
      })
      .join("");

    this.panel.innerHTML = `
      <button class="close-btn">✕</button>
      <h2 class="title-font">Trading with ${escapeHtml(state.otherName || "someone")}</h2>
      <div class="trade-columns">
        <div class="trade-col">
          <h3>Your offer ${state.selfConfirmed ? "✅" : ""}</h3>
          <div class="trade-list">${offeredRow(state.selfOffer, true)}</div>
        </div>
        <div class="trade-col">
          <h3>Their offer ${state.otherConfirmed ? "✅" : ""}</h3>
          <div class="trade-list">${offeredRow(state.otherOffer, false)}</div>
        </div>
      </div>
      <h3 style="margin-top:14px;font-size:14px">Your inventory <span style="font-weight:400;color:#9aa3c9;font-size:11px">(click to offer all of a stack)</span></h3>
      <div class="trade-list">${available.length ? availableRow : '<p style="opacity:0.6;font-size:12px">Nothing left to offer.</p>'}</div>
      <div class="trade-actions">
        <button class="interactive" data-confirm ${state.selfConfirmed ? "disabled" : ""}>${state.selfConfirmed ? "Waiting on them…" : "Confirm offer"}</button>
        <button class="interactive" data-cancel>Cancel trade</button>
      </div>
    `;

    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.cancel());
    this.panel.querySelector("[data-cancel]")!.addEventListener("click", () => this.cancel());
    this.panel.querySelector("[data-confirm]")!.addEventListener("click", () => {
      if (this.activeTradeId && !state.selfConfirmed) this.net.send({ t: "confirmTrade", tradeId: this.activeTradeId });
    });
    this.panel.querySelectorAll<HTMLDivElement>("[data-add]").forEach((el) => {
      el.addEventListener("click", () => {
        const [itemId, rarity] = el.dataset.add!.split(":");
        const stack = c.inventory.find((s) => s.itemId === itemId && s.rarity === rarity);
        if (stack && this.activeTradeId) {
          this.net.send({ t: "setTradeOffer", tradeId: this.activeTradeId, itemId, rarity: rarity as ItemRarity, quantity: stack.quantity });
        }
      });
    });
    this.panel.querySelectorAll<HTMLDivElement>("[data-remove]").forEach((el) => {
      el.addEventListener("click", () => {
        const [itemId, rarity] = el.dataset.remove!.split(":");
        if (this.activeTradeId) {
          this.net.send({ t: "setTradeOffer", tradeId: this.activeTradeId, itemId, rarity: rarity as ItemRarity, quantity: 0 });
        }
      });
    });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
