import { getItem, sellValue, type CharacterState, type ItemRarity, type VendorDef } from "@moon/shared";
import type { NetClient } from "../net.js";
import { ICONS, rarityColor } from "./panels.js";

/**
 * Vendors & currency (docs/GDD.md's "Vendors & currency" section): a two-column buy/sell window,
 * opened directly by walking up to a vendor and pressing E (see main.ts's tryInteract) rather than
 * through the narrative dialogue system — vendors are commerce, not story. Buying is limited to
 * that vendor's own curated catalog; selling accepts anything in your inventory, priced by the
 * same formulaic sellValue every vendor uses.
 */
export class ShopPanel {
  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private activeVendorId: string | null = null;
  private activeVendor: VendorDef | null = null;

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
    return this.activeVendorId !== null;
  }

  open(vendorId: string, vendor: VendorDef) {
    this.activeVendorId = vendorId;
    this.activeVendor = vendor;
    this.overlay.style.display = "flex";
    this.render();
  }

  close() {
    this.activeVendorId = null;
    this.activeVendor = null;
    this.overlay.style.display = "none";
  }

  refresh() {
    if (this.isOpen()) this.render();
  }

  private render() {
    const vendor = this.activeVendor;
    if (!vendor) return;
    const c = this.getCharacter();

    const buyRows = vendor.sells
      .map((listing) => {
        const def = getItem(listing.itemId);
        if (!def) return "";
        const afford = c.gold >= listing.price;
        return `
        <div class="recipe-card ${afford ? "" : "locked"}">
          <div class="info">
            <h4>${ICONS[def.icon] ?? "❔"} ${def.name} <span style="font-weight:400;color:#9aa3c9">— ${listing.price}g</span></h4>
            <div class="inputs">${def.description}</div>
          </div>
          <button class="interactive" data-buy="${listing.itemId}" ${afford ? "" : "disabled"}>Buy</button>
        </div>`;
      })
      .join("");

    const sellRows = c.inventory
      .map((stack) => {
        const def = getItem(stack.itemId);
        if (!def) return "";
        const value = sellValue(def, stack.rarity);
        return `
        <div class="recipe-card">
          <div class="info">
            <h4>
              <span class="rarity-tag" style="background:${rarityColor(stack.rarity)}"></span>
              ${ICONS[def.icon] ?? "❔"} ${def.name}${stack.quantity > 1 ? ` x${stack.quantity}` : ""}
              <span style="font-weight:400;color:#9aa3c9">— ${value}g each</span>
            </h4>
          </div>
          <button class="interactive" data-sell="${stack.itemId}:${stack.rarity}:${stack.quantity}">Sell${stack.quantity > 1 ? ` x${stack.quantity}` : ""}</button>
        </div>`;
      })
      .join("");

    this.panel.innerHTML = `
      <button class="close-btn">✕</button>
      <h2 class="title-font">${escapeHtml(vendor.name)}</h2>
      <p style="color:#9aa3c9;font-size:12.5px">"${escapeHtml(vendor.greeting)}" <span style="float:right;color:#ffd77a">💰 ${Math.floor(c.gold)}</span></p>
      <div class="trade-columns">
        <div class="trade-col">
          <h3>Buy</h3>
          <div class="recipe-list">${buyRows || '<p style="opacity:0.6;font-size:12px">Nothing for sale.</p>'}</div>
        </div>
        <div class="trade-col">
          <h3>Sell</h3>
          <div class="recipe-list">${sellRows || '<p style="opacity:0.6;font-size:12px">Nothing to sell.</p>'}</div>
        </div>
      </div>
    `;

    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    this.panel.querySelectorAll<HTMLButtonElement>("[data-buy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!this.activeVendorId) return;
        this.net.send({ t: "buyItem", vendorId: this.activeVendorId, itemId: btn.dataset.buy!, quantity: 1 });
      });
    });
    this.panel.querySelectorAll<HTMLButtonElement>("[data-sell]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!this.activeVendorId) return;
        const [itemId, rarity, quantity] = btn.dataset.sell!.split(":");
        this.net.send({ t: "sellItem", vendorId: this.activeVendorId, itemId, rarity: rarity as ItemRarity, quantity: Number(quantity) });
      });
    });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
