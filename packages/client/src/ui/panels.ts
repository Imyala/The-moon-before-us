import {
  FACTIONS,
  ITEMS,
  MAJOR_ENDINGS,
  MAX_COMPANIONS,
  RECIPES,
  SECRET_ENDINGS,
  SUBCLASSES,
  activeAbilities,
  dominantFaction,
  getItem,
  getNpc,
  getSubclass,
  keyFateEpilogue,
  loyaltyState,
  moonTouchedStageFor,
  specializationsForClass,
  trendingEnding,
  type CharacterState,
  type EquipmentSlot,
  type LoyaltyKey
} from "@moon/shared";
import type { NetClient } from "../net.js";

const ICONS: Record<string, string> = {
  sword: "⚔️",
  bow: "🏹",
  orb: "🔮",
  dagger: "🗡️",
  armor: "🥋",
  charm: "🍀",
  ore: "🪨",
  wood: "🪵",
  herb: "🌿",
  essence: "✨",
  potion_red: "🧪",
  potion_blue: "🧉"
};

export type PanelKind = "inventory" | "crafting" | "character" | "companions" | null;

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
      <button data-panel="companions">🐾 Companions (P)</button>
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
    else if (this.open === "companions") this.renderCompanions(c);
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
    const subclass = c.subclassId ? getSubclass(c.subclassId) : undefined;
    const discountPct = subclass ? Math.round(subclass.craftMaterialDiscountPct * 100) : 0;

    const tradeCards = SUBCLASSES.map((sub) => {
      const selected = c.subclassId === sub.id;
      return `
        <div class="recipe-card ${selected ? "" : ""}" style="${selected ? "border-color:#ffd77a" : ""}">
          <div class="info">
            <h4>${sub.name}${selected ? " (active)" : ""} <span style="font-weight:400;color:#9aa3c9">— ${sub.tagline}</span></h4>
            <div class="inputs">${sub.description}</div>
          </div>
          <button data-trade="${sub.id}" ${selected ? "disabled" : ""}>${selected ? "Active" : "Take up"}</button>
        </div>`;
    }).join("");

    const cards = RECIPES.map((r) => {
      const levelLocked = c.level < r.requiredLevel;
      const tradeLocked = !!r.requiredSubclass && r.requiredSubclass !== c.subclassId;
      const locked = levelLocked || tradeLocked;
      const discount = r.requiredSubclass === c.subclassId ? 0 : discountPct > 0 ? discountPct : 0;
      const neededQty = (qty: number) => Math.max(1, Math.ceil(qty * (1 - (subclass?.craftMaterialDiscountPct ?? 0))));
      const canAfford = r.inputs.every((inp) => countItem(c, inp.itemId) >= neededQty(inp.quantity));
      const inputsText = r.inputs
        .map((inp) => `${getItem(inp.itemId)?.name ?? inp.itemId} x${neededQty(inp.quantity)} (have ${countItem(c, inp.itemId)})`)
        .join(", ");
      const lockReason = tradeLocked
        ? ` (req. ${getSubclass(r.requiredSubclass!)?.name ?? r.requiredSubclass} trade)`
        : levelLocked
          ? ` (req. Lv${r.requiredLevel})`
          : "";
      return `
        <div class="recipe-card ${locked ? "locked" : ""}">
          <div class="info">
            <h4>${r.name}${lockReason}</h4>
            <div class="inputs">${inputsText}${discount > 0 ? ` · ${discount}% cheaper as a ${subclass?.name}` : ""}</div>
          </div>
          <button data-recipe="${r.id}" ${locked || !canAfford ? "disabled" : ""}>Craft</button>
        </div>`;
    }).join("");

    this.panel.innerHTML = `
      <button class="close-btn">✕</button>
      <h2 class="title-font">Crafting</h2>
      <p style="color:#9aa3c9;font-size:12.5px">Gather materials from nodes in the world, then craft gear and draughts here.</p>
      <h3 style="margin-top:16px;font-size:15px">Trade${subclass ? ` — ${subclass.name}` : ""}</h3>
      <div class="recipe-list">${tradeCards}</div>
      <h3 style="margin-top:20px;font-size:15px">Recipes</h3>
      <div class="recipe-list">${cards}</div>
    `;
    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    this.panel.querySelectorAll<HTMLButtonElement>("[data-recipe]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "craft", recipeId: btn.dataset.recipe! }));
    });
    this.panel.querySelectorAll<HTMLButtonElement>("[data-trade]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "chooseSubclass", subclassId: btn.dataset.trade! }));
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

    const abilities = activeAbilities(c);
    const skillCards = abilities
      .map((ab) => {
        const rank = (c.abilityRanks[ab.id] ?? 0) + 1;
        const dots = Array.from({ length: ab.maxRanks }, (_, i) => `<span class="rank-dot ${i < rank ? "filled" : ""}"></span>`).join("");
        const canUpgrade = c.skillPoints > 0 && rank < ab.maxRanks;
        const tierTag = ab.tier === "elite" ? " ⭐" : "";
        return `
        <div class="skill-card">
          <div>
            <h4>${ab.name}${tierTag} <span style="font-weight:400;color:#9aa3c9">Rank ${rank}/${ab.maxRanks}</span></h4>
            <div class="desc">${ab.description}</div>
            <div class="ranks">${dots}</div>
          </div>
          <button data-ability="${ab.id}" ${canUpgrade ? "" : "disabled"}>Upgrade</button>
        </div>`;
      })
      .join("");

    const specs = specializationsForClass(c.classId);
    const specLocked = c.level < (specs[0]?.unlockLevel ?? 5);
    const specCards = specs
      .map((spec) => {
        const selected = c.specializationId === spec.id;
        return `
        <div class="skill-card" style="${selected ? "border-color:" + spec.color : ""}">
          <div>
            <h4>${spec.name}${selected ? " (active)" : ""} <span style="font-weight:400;color:#9aa3c9">— ${spec.tagline}</span></h4>
            <div class="desc">${spec.description}</div>
            <div class="desc" style="color:${spec.color};margin-top:4px">${spec.mechanicDescription}</div>
          </div>
          <button data-spec="${spec.id}" ${selected ? "disabled" : ""}>${selected ? "Active" : "Choose"}</button>
        </div>`;
      })
      .join("");

    const stage = moonTouchedStageFor(c.lunarResonance);
    const lockedEnding = c.endingId
      ? MAJOR_ENDINGS.find((e) => e.id === c.endingId) ?? SECRET_ENDINGS.find((e) => e.id === c.endingId)
      : undefined;
    const ending = lockedEnding ?? trendingEnding(c.factionLoyalty, stage.stage);
    const dominant = dominantFaction(c.factionLoyalty);
    const fateLines = keyFateEpilogue(c.npcMemory);
    const loyaltyRows = (["chainwrights", "luminari", "paleChoir", "independent"] as LoyaltyKey[])
      .map((key) => {
        const score = c.factionLoyalty[key];
        const label = key === "independent" ? "Independent" : FACTIONS[key].name;
        const state = loyaltyState(score);
        const pct = Math.round(((score + 100) / 200) * 100);
        return `
        <div class="loyalty-row">
          <div class="loyalty-label">${label}<span class="loyalty-state">${state}</span></div>
          <div class="bar-track"><div class="bar-fill loyalty" style="width:${pct}%"></div></div>
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
      <h3 style="margin-top:20px;font-size:15px">Specialization${specLocked ? ` (unlocks at Lv${specs[0]?.unlockLevel})` : ""}</h3>
      <div class="skill-list">${specLocked ? '<p style="opacity:0.6;font-size:12px">Keep leveling to unlock a specialization.</p>' : specCards}</div>
      <h3 style="margin-top:20px;font-size:15px">Fate</h3>
      <p style="color:#9aa3c9;font-size:12.5px">Moon-Touched stage: <strong style="color:#cfe0ff">${stage.stage}</strong> — ${stage.description}</p>
      <div class="loyalty-list">${loyaltyRows}</div>
      <p style="color:#9aa3c9;font-size:12.5px;margin-top:10px">${
        lockedEnding
          ? `Your ending: <strong style="color:#ffe9a8">${ending.name}</strong>${
              lockedEnding.secret ? ' <span style="color:#a8ddff">(a secret ending)</span>' : ""
            }. ${ending.tone}`
          : `Trending toward <strong style="color:#ffe9a8">${ending.name}</strong> (leaning ${dominant === "independent" ? "Independent" : FACTIONS[dominant].name}). ${ending.tone}`
      }</p>
      ${
        fateLines.length
          ? `<p style="color:#9aa3c9;font-size:12.5px;margin-top:10px">Threads that shaped your story:</p>
      <ul style="margin:4px 0 0;padding-left:18px;font-size:12px;color:#b8c2e0;line-height:1.5">${fateLines
        .map((line) => `<li>${line}</li>`)
        .join("")}</ul>`
          : ""
      }
    `;
    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    this.panel.querySelectorAll<HTMLButtonElement>("[data-ability]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "allocateSkillPoint", abilityId: btn.dataset.ability! }));
    });
    this.panel.querySelectorAll<HTMLButtonElement>("[data-spec]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "chooseSpecialization", specializationId: btn.dataset.spec! }));
    });
  }

  private renderCompanions(c: CharacterState) {
    const cards = c.companionIds
      .map((npcId) => {
        const def = getNpc(npcId);
        if (!def) return "";
        return `
        <div class="recipe-card">
          <div class="info">
            <h4>${def.name} <span style="font-weight:400;color:#9aa3c9">— ${def.title}</span></h4>
            <div class="inputs">Traveling with you. Fights alongside you, can draw enemy attacks and take real damage, and revives a while after falling.</div>
          </div>
          <button data-dismiss="${npcId}">Dismiss</button>
        </div>`;
      })
      .join("");

    const emptySlots = MAX_COMPANIONS - c.companionIds.length;

    this.panel.innerHTML = `
      <button class="close-btn">✕</button>
      <h2 class="title-font">Companions</h2>
      <p style="color:#9aa3c9;font-size:12.5px">Up to ${MAX_COMPANIONS} at once. Recruit more from their signature choice in dialogue; dismiss one here to free a slot for a swap.</p>
      <div class="recipe-list">${cards || '<p style="opacity:0.6">No companions yet. Recruit one through a signature choice in dialogue.</p>'}</div>
      ${emptySlots > 0 && c.companionIds.length > 0 ? `<p style="color:#9aa3c9;font-size:12.5px;margin-top:10px">${emptySlots} open slot${emptySlots > 1 ? "s" : ""} remaining.</p>` : ""}
    `;
    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    this.panel.querySelectorAll<HTMLButtonElement>("[data-dismiss]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "dismissCompanion", npcId: btn.dataset.dismiss! }));
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
