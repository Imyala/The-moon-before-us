import { AUCTION_LISTING_FEE, getItem, type AuctionListing, type CharacterState, type ItemRarity } from "@moon/shared";
import type { NetClient } from "../net.js";
import { ICONS, rarityColor } from "./panels.js";

/**
 * The auction house (docs/GDD.md's "Auction house" section) — global and cross-room, so unlike
 * Trade/Shop it isn't gated by proximity to a player or an NPC; it's toggled from anywhere (`H`)
 * the same way Inventory/Crafting/Character/Companions are. Its own panel class, like Trade/Shop,
 * because listing data arrives over the wire (`auctionListings`) rather than living on the
 * `character` object already available to every render.
 */
export class AuctionPanel {
  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private open = false;
  private listings: AuctionListing[] = [];

  constructor(
    root: HTMLElement,
    private net: NetClient,
    private getCharacter: () => CharacterState
  ) {
    this.overlay = document.createElement("div");
    this.overlay.className = "panel-overlay interactive";
    this.overlay.style.display = "none";
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
    this.panel = document.createElement("div");
    this.panel.className = "panel trade-panel";
    this.overlay.appendChild(this.panel);
    root.appendChild(this.overlay);
  }

  isOpen(): boolean {
    return this.open;
  }

  toggle() {
    if (this.open) this.close();
    else {
      this.open = true;
      this.overlay.style.display = "flex";
      this.net.send({ t: "requestAuctions" });
      this.render();
    }
  }

  close() {
    this.open = false;
    this.overlay.style.display = "none";
  }

  handleListings(listings: AuctionListing[]) {
    this.listings = listings;
    if (this.open) this.render();
  }

  refresh() {
    if (this.open) this.render();
  }

  private render() {
    const c = this.getCharacter();
    const mine = this.listings.filter((l) => l.isMine);
    const others = this.listings.filter((l) => !l.isMine);

    const listingRow = (l: AuctionListing, action: "buy" | "cancel") => {
      const def = getItem(l.itemId);
      if (!def) return "";
      const afford = action === "buy" && c.gold < l.price;
      return `
      <div class="recipe-card ${afford ? "locked" : ""}">
        <div class="info">
          <h4>
            <span class="rarity-tag" style="background:${rarityColor(l.rarity)}"></span>
            ${ICONS[def.icon] ?? "❔"} ${def.name}${l.quantity > 1 ? ` x${l.quantity}` : ""}
            <span style="font-weight:400;color:#9aa3c9">— ${l.price}g${action === "buy" ? ` from ${escapeHtml(l.sellerName)}` : ""}</span>
          </h4>
        </div>
        <button class="interactive" data-${action}="${l.id}" ${afford ? "disabled" : ""}>${action === "buy" ? "Buy" : "Cancel"}</button>
      </div>`;
    };

    const listableRows = c.inventory
      .map((stack, index) => {
        const def = getItem(stack.itemId);
        if (!def) return "";
        return `
        <div class="recipe-card">
          <div class="info">
            <h4>
              <span class="rarity-tag" style="background:${rarityColor(stack.rarity)}"></span>
              ${ICONS[def.icon] ?? "❔"} ${def.name}${stack.quantity > 1 ? ` x${stack.quantity}` : ""}
            </h4>
            <div class="inputs">
              Qty <input class="ah-input" type="number" min="1" max="${stack.quantity}" value="1" data-qty="${index}" />
              Price <input class="ah-input" type="number" min="1" value="10" data-price="${index}" />
            </div>
          </div>
          <button class="interactive" data-list="${index}">List</button>
        </div>`;
      })
      .join("");

    this.panel.innerHTML = `
      <button class="close-btn">✕</button>
      <h2 class="title-font">Auction House</h2>
      <p style="color:#9aa3c9;font-size:12.5px">
        Listing costs ${AUCTION_LISTING_FEE}g, non-refundable if you cancel.
        <span style="float:right;color:#ffd77a">💰 ${Math.floor(c.gold)}</span>
      </p>
      <h3 style="margin-top:14px;font-size:14px">Browse</h3>
      <div class="recipe-list">${others.length ? others.map((l) => listingRow(l, "buy")).join("") : '<p style="opacity:0.6;font-size:12px">No listings right now.</p>'}</div>
      <h3 style="margin-top:20px;font-size:14px">My listings</h3>
      <div class="recipe-list">${mine.length ? mine.map((l) => listingRow(l, "cancel")).join("") : '<p style="opacity:0.6;font-size:12px">You have nothing listed.</p>'}</div>
      <h3 style="margin-top:20px;font-size:14px">List an item</h3>
      <div class="recipe-list">${listableRows || '<p style="opacity:0.6;font-size:12px">Nothing in your inventory to list.</p>'}</div>
    `;

    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    this.panel.querySelectorAll<HTMLButtonElement>("[data-buy]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "buyAuction", listingId: btn.dataset.buy! }));
    });
    this.panel.querySelectorAll<HTMLButtonElement>("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "cancelAuction", listingId: btn.dataset.cancel! }));
    });
    this.panel.querySelectorAll<HTMLButtonElement>("[data-list]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.list);
        const stack = c.inventory[index];
        if (!stack) return;
        const qtyInput = this.panel.querySelector<HTMLInputElement>(`[data-qty="${index}"]`);
        const priceInput = this.panel.querySelector<HTMLInputElement>(`[data-price="${index}"]`);
        const quantity = Math.max(1, Math.min(stack.quantity, Math.floor(Number(qtyInput?.value) || 1)));
        const price = Math.max(1, Math.floor(Number(priceInput?.value) || 1));
        this.net.send({ t: "listAuction", itemId: stack.itemId, rarity: stack.rarity as ItemRarity, quantity, price });
      });
    });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
