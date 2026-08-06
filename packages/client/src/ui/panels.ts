import {
  ITEMS,
  RECIPES,
  abilitiesForClass,
  getItem,
  type CharacterState,
  type EquipmentSlot
} from "@moon/shared";
import type { NetClient } from "../net.js";

const ICONS: Record<string, string> = {
  sword: "⚔️",
  bow: "🏹",
  orb: "🔮",
  armor: "🥋",
  charm: "🍀",
  ore: "🪨",
  wood: "🪵",
  herb: "🌿",
  essence: "✨",
  potion_red: "🧪",
  potion_blue: "🧉"
};

export type PanelKind = "inventory" | "crafting" | "character" | null;

export class Panels {
  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private open: PanelKind = null;

  constructor(
    private root: HTMLElement,
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
    this.panel.className = "panel";
    this.overlay.appendChild(this.panel);
    root.appendChild(this.overlay);

    const toggles = document.createElement("div");
    toggles.className = "panel-toggle-row interactive";
    toggles.innerHTML = `
      <button data-panel="inventory">🎒 Inventory (I)</button>
      <button data-panel="crafting">🛠️ Crafting (R)</button>
      <button data-panel="character">📜 Character (C)</button>
    `;
    toggles.querySelectorAll<HTMLButtonElement>("button").forEach((btn) => {
      btn.addEventListener("click", () => this.toggle(btn.dataset.panel as PanelKind));
    });
    root.appendChild(toggles);
  }

  isOpen(): boolean {
    return this.open !== null;
  }

  toggle(kind: PanelKind) {
    if (this.open === kind) {
      this.close();
    } else {
      this.open = kind;
      this.overlay.style.display = "flex";
      this.render();
    }
  }

  close() {
    this.open = null;
    this.overlay.style.display = "none";
  }

  refresh() {
    if (this.open) this.render();
  }

  private render() {
    const c = this.getCharacter();
    if (this.open === "inventory") this.renderInventory(c);
    else if (this.open === "crafting") this.renderCrafting(c);
    else if (this.open === "character") this.renderCharacter(c);
  }

  private renderInventory(c: CharacterState) {
    const slots = c.inventory
      .map((stack, index) => {
        const def = getItem(stack.itemId);
        if (!def) return "";
        return `
        <div class="inv-slot" data-index="${index}" title="${def.name}: ${def.description}">
          <span class="rarity-tag" style="background:${rarityColor(stack.rarity)}"></span>
          <span class="icon">${ICONS[def.icon] ?? "❔"}</span>
          <span>${def.name}</span>
          ${stack.quantity > 1 ? `<span class="qty">x${stack.quantity}</span>` : ""}
        </div>`;
      })
      .join("");

    const equipRow = (["weapon", "armor", "trinket"] as EquipmentSlot[])
      .map((slot) => {
        const eq = c.equipment[slot];
        const def = eq ? getItem(eq.itemId) : null;
        return `
        <div class="equip-slot" data-unequip="${slot}">
          <div class="label">${slot}</div>
          <div>${def ? `${ICONS[def.icon] ?? "❔"} ${def.name}` : "— empty —"}</div>
        </div>`;
      })
      .join("");

    this.panel.innerHTML = `
      <button class="close-btn">✕</button>
      <h2 class="title-font">Inventory</h2>
      <div class="equip-row">${equipRow}</div>
      <div class="inv-grid">${slots || '<p style="opacity:0.6">Empty. Go gather some materials!</p>'}</div>
    `;
    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    this.panel.querySelectorAll<HTMLDivElement>(".inv-slot").forEach((el) => {
      el.addEventListener("click", () => {
        const index = Number(el.dataset.index);
        const stack = c.inventory[index];
        const def = stack && getItem(stack.itemId);
        if (!def) return;
        if (def.kind === "consumable") this.net.send({ t: "useItem", itemIndex: index });
        else if (def.slot) this.net.send({ t: "equip", itemIndex: index });
      });
    });
    this.panel.querySelectorAll<HTMLDivElement>("[data-unequip]").forEach((el) => {
      el.addEventListener("click", () => {
        const slot = el.dataset.unequip as EquipmentSlot;
        if (c.equipment[slot]) this.net.send({ t: "unequip", slot });
      });
    });
  }

  private renderCrafting(c: CharacterState) {
    const cards = RECIPES.map((r) => {
      const locked = c.level < r.requiredLevel;
      const canAfford = r.inputs.every((inp) => countItem(c, inp.itemId) >= inp.quantity);
      const inputsText = r.inputs
        .map((inp) => `${getItem(inp.itemId)?.name ?? inp.itemId} x${inp.quantity} (have ${countItem(c, inp.itemId)})`)
        .join(", ");
      return `
        <div class="recipe-card ${locked ? "locked" : ""}">
          <div class="info">
            <h4>${r.name}${locked ? ` (req. Lv${r.requiredLevel})` : ""}</h4>
            <div class="inputs">${inputsText}</div>
          </div>
          <button data-recipe="${r.id}" ${locked || !canAfford ? "disabled" : ""}>Craft</button>
        </div>`;
    }).join("");

    this.panel.innerHTML = `
      <button class="close-btn">✕</button>
      <h2 class="title-font">Crafting</h2>
      <p style="color:#9aa3c9;font-size:12.5px">Gather materials from nodes in the world, then craft gear and draughts here.</p>
      <div class="recipe-list">${cards}</div>
    `;
    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    this.panel.querySelectorAll<HTMLButtonElement>("[data-recipe]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "craft", recipeId: btn.dataset.recipe! }));
    });
  }

  private renderCharacter(c: CharacterState) {
    const s = c.stats;
    const statChips = [
      ["Power", Math.round(s.power)],
      ["Vitality", Math.round(s.vitality)],
      ["Haste", `${Math.round(s.haste * 100)}%`],
      ["Crit Chance", `${Math.round(s.critChance * 100)}%`],
      ["Crit Damage", `${s.critDamage.toFixed(2)}x`],
      ["Skill Points", c.skillPoints]
    ]
      .map(([label, value]) => `<div class="stat-chip"><span>${label}</span><strong>${value}</strong></div>`)
      .join("");

    const abilities = abilitiesForClass(c.classId);
    const skillCards = abilities
      .map((ab) => {
        const rank = (c.abilityRanks[ab.id] ?? 0) + 1;
        const dots = Array.from({ length: ab.maxRanks }, (_, i) => `<span class="rank-dot ${i < rank ? "filled" : ""}"></span>`).join("");
        const canUpgrade = c.skillPoints > 0 && rank < ab.maxRanks;
        return `
        <div class="skill-card">
          <div>
            <h4>${ab.name} <span style="font-weight:400;color:#9aa3c9">Rank ${rank}/${ab.maxRanks}</span></h4>
            <div class="desc">${ab.description}</div>
            <div class="ranks">${dots}</div>
          </div>
          <button data-ability="${ab.id}" ${canUpgrade ? "" : "disabled"}>Upgrade</button>
        </div>`;
      })
      .join("");

    this.panel.innerHTML = `
      <button class="close-btn">✕</button>
      <h2 class="title-font">${c.name}</h2>
      <p style="color:#9aa3c9;font-size:12.5px">Level ${c.level} · ${c.xp} XP</p>
      <div class="stat-grid">${statChips}</div>
      <h3 style="margin-top:20px;font-size:15px">Abilities</h3>
      <div class="skill-list">${skillCards}</div>
    `;
    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    this.panel.querySelectorAll<HTMLButtonElement>("[data-ability]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "allocateSkillPoint", abilityId: btn.dataset.ability! }));
    });
  }
}

function countItem(c: CharacterState, itemId: string): number {
  return c.inventory.filter((s) => s.itemId === itemId).reduce((sum, s) => sum + s.quantity, 0);
}

function rarityColor(rarity: string): string {
  switch (rarity) {
    case "uncommon":
      return "#5ea86b";
    case "rare":
      return "#5c9dff";
    case "epic":
      return "#c76bff";
    default:
      return "#9aa3c9";
  }
}
