import { activeAbilities, CLASSES, type CharacterState, type PlayerClassId, xpForLevel } from "@moon/shared";

const ABILITY_GLYPHS: Record<string, string> = {
  warden_strike: "⚔️",
  warden_shieldbash: "🛡️",
  warden_shieldwall: "🚧",
  warden_cleave: "🪓",
  warden_rendingswing: "💢",
  warden_whirlwind: "🌀",
  warden_bulwark: "🧱",
  warden_secondwind: "❤️",
  warden_unbreakable: "🗿",
  warden_bloodrage: "🩸",
  ranger_quickshot: "🏹",
  ranger_volley: "➶",
  ranger_barrage: "🌧️",
  ranger_twinshot: "🔫",
  ranger_scatterblast: "🎆",
  ranger_evasive: "💨",
  ranger_trap: "🪤",
  ranger_mark: "🎯",
  ranger_windrunners_volley: "🌬️",
  ranger_callthepack: "🐺",
  mystic_moonbolt: "🌙",
  mystic_nova: "💥",
  mystic_arcanesurge: "✨",
  mystic_reap: "🌾",
  mystic_darkharvest: "🖤",
  mystic_gravitywell: "🌌",
  mystic_healingtide: "💧",
  mystic_barrier: "🔷",
  mystic_lunarsanctuary: "🌕",
  mystic_eclipse: "🌑",
  duskblade_twinstrike: "🗡️",
  duskblade_shadowstepslash: "🔪",
  duskblade_umbralflurry: "🌀",
  duskblade_glaivethrow: "🪃",
  duskblade_returningedge: "↩️",
  duskblade_umbralpull: "🪝",
  duskblade_vanish: "🌫️",
  duskblade_umbralmend: "🩹",
  duskblade_vanishingstrike: "🌘",
  duskblade_crimsoneclipse: "🌚",
  warden_ironcladstand: "🛡️",
  ranger_tempestvolley: "🌪️",
  mystic_aegispulse: "💠",
  duskblade_cinderreap: "🔥"
};

export class Hud {
  private root: HTMLDivElement;
  private hpFill: HTMLDivElement;
  private hpLabel: HTMLDivElement;
  private resourceFill: HTMLDivElement;
  private resourceLabel: HTMLDivElement;
  private shieldFill: HTMLDivElement;
  private xpFill: HTMLDivElement;
  private levelBadge: HTMLSpanElement;
  private goldBadge: HTMLSpanElement;
  private nameLabel: HTMLSpanElement;
  private abilityBarEl: HTMLDivElement;
  private abilitySlots = new Map<string, { root: HTMLDivElement; overlay: HTMLDivElement }>();
  private kitSignature = "";
  private rosterEl: HTMLDivElement;
  private roomCodeEl: HTMLDivElement;
  private zoneBadgeEl: HTMLDivElement;
  private companionBadgeEl: HTMLDivElement;
  private toastsEl: HTMLDivElement;
  private chatLogEl: HTMLDivElement;
  private chatInput: HTMLInputElement;
  private deathOverlay: HTMLDivElement;
  private gatherBar: HTMLDivElement;
  private gatherFill: HTMLDivElement;
  private muteBtn: HTMLButtonElement;

  onChatSend: ((msg: string) => void) | null = null;
  onProposeTrade: ((targetPlayerId: string) => void) | null = null;
  onToggleMute: (() => void) | null = null;

  constructor(root: HTMLElement, classId: PlayerClassId) {
    const cls = CLASSES[classId];

    this.root = document.createElement("div");
    this.root.className = "hud";
    this.root.innerHTML = `
      <div class="hotkeys-hint">
        WASD move · Hold right-click to look · 1-6 abilities · Space dodge<br/>
        E gather · I inventory · R crafting · C character · M mount · H auction
      </div>

      <button class="mute-btn interactive" id="muteBtn" title="Mute/unmute audio">🔊</button>

      <div class="zone-badge" id="zoneBadge"></div>
      <div class="companion-badge" id="companionBadge" style="display:none"></div>

      <div class="player-frame">
        <div class="bar-row">
          <span class="bar-name" id="hudName"></span>
          <span class="level-badge" id="hudLevel"></span>
          <span class="gold-badge" id="hudGold" title="Gold">💰 0</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill hp" id="hpFill"></div>
          <div class="bar-fill shield" id="shieldFill" style="width:0%"></div>
          <div class="bar-label" id="hpLabel"></div>
        </div>
        <div class="bar-track" style="margin-top:6px">
          <div class="bar-fill resource" id="resourceFill" style="background:linear-gradient(90deg, ${cls.color}, #ffffff33)"></div>
          <div class="bar-label" id="resourceLabel"></div>
        </div>
        <div class="xp-track"><div class="xp-fill" id="xpFill" style="width:0%"></div></div>
      </div>

      <div class="ability-bar" id="abilityBar"></div>

      <div class="roster">
        <div class="roster-title">Party</div>
        <div id="rosterList"></div>
        <div class="room-code-badge interactive" id="roomCodeBadge" style="display:none"></div>
      </div>

      <div class="toasts" id="toasts"></div>

      <div class="chat-log" id="chatLog"></div>
      <div class="chat-input-row">
        <input id="chatInput" type="text" maxlength="200" placeholder="Press Enter to chat…" />
      </div>

      <div class="gather-bar" id="gatherBar" style="display:none">
        <div class="bar-track"><div class="bar-fill resource" id="gatherFill" style="width:0%"></div></div>
      </div>

      <div class="death-overlay interactive" id="deathOverlay" style="display:none">
        <div class="msg">
          <h2 class="title-font">You have fallen</h2>
          <p id="deathText">Returning to the glade…</p>
        </div>
      </div>
    `;
    root.appendChild(this.root);

    this.hpFill = this.root.querySelector("#hpFill")!;
    this.hpLabel = this.root.querySelector("#hpLabel")!;
    this.resourceFill = this.root.querySelector("#resourceFill")!;
    this.resourceLabel = this.root.querySelector("#resourceLabel")!;
    this.shieldFill = this.root.querySelector("#shieldFill")!;
    this.xpFill = this.root.querySelector("#xpFill")!;
    this.levelBadge = this.root.querySelector("#hudLevel")!;
    this.goldBadge = this.root.querySelector("#hudGold")!;
    this.nameLabel = this.root.querySelector("#hudName")!;
    this.abilityBarEl = this.root.querySelector("#abilityBar")!;
    this.rosterEl = this.root.querySelector("#rosterList")!;
    this.roomCodeEl = this.root.querySelector("#roomCodeBadge")!;
    this.zoneBadgeEl = this.root.querySelector("#zoneBadge")!;
    this.companionBadgeEl = this.root.querySelector("#companionBadge")!;
    this.toastsEl = this.root.querySelector("#toasts")!;
    this.chatLogEl = this.root.querySelector("#chatLog")!;
    this.chatInput = this.root.querySelector("#chatInput")!;
    this.deathOverlay = this.root.querySelector("#deathOverlay")!;
    this.gatherBar = this.root.querySelector("#gatherBar")!;
    this.gatherFill = this.root.querySelector("#gatherFill")!;
    this.muteBtn = this.root.querySelector("#muteBtn")!;
    this.muteBtn.addEventListener("click", () => this.onToggleMute?.());

    this.chatInput.classList.add("interactive");
    this.chatInput.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        const val = this.chatInput.value.trim();
        if (val) this.onChatSend?.(val);
        this.chatInput.value = "";
        this.chatInput.blur();
      }
    });
  }

  isChatFocused(): boolean {
    return document.activeElement === this.chatInput;
  }

  setMuted(muted: boolean) {
    this.muteBtn.textContent = muted ? "🔇" : "🔊";
    this.muteBtn.classList.toggle("muted", muted);
  }

  /** Rebuilds the ability bar only when the active kit (weapon + specialization) actually changes. */
  syncAbilityBar(character: CharacterState) {
    const signature = `${character.equipment.weapon?.itemId ?? ""}|${character.specializationId ?? ""}`;
    if (signature === this.kitSignature) return;
    this.kitSignature = signature;

    this.abilityBarEl.innerHTML = "";
    this.abilitySlots.clear();
    for (const ab of activeAbilities(character)) {
      const slot = document.createElement("div");
      slot.className = "ability-slot";
      slot.innerHTML = `
        <span class="key">${ab.slot}</span>
        <span class="glyph">${ABILITY_GLYPHS[ab.id] ?? "✦"}</span>
        <span class="cost">${ab.resourceCost || ""}</span>
        <div class="cd-overlay" style="transform:scaleY(0)"></div>
      `;
      slot.title = `${ab.name} — ${ab.description}`;
      this.abilityBarEl.appendChild(slot);
      this.abilitySlots.set(ab.id, { root: slot, overlay: slot.querySelector(".cd-overlay")! });
    }
  }

  updateVitals(c: CharacterState) {
    const hpPct = Math.max(0, (c.hp / c.maxHp) * 100);
    this.hpFill.style.width = `${hpPct}%`;
    this.hpFill.classList.toggle("low", hpPct < 30);
    this.hpLabel.textContent = `${Math.ceil(c.hp)} / ${c.maxHp}`;
    const rPct = Math.max(0, (c.resource / c.maxResource) * 100);
    this.resourceFill.style.width = `${rPct}%`;
    this.resourceLabel.textContent = `${Math.ceil(c.resource)} / ${c.maxResource}`;
    this.nameLabel.textContent = `${c.name} — ${CLASSES[c.classId].name}`;
    this.levelBadge.textContent = `Lv ${c.level}`;
    this.goldBadge.textContent = `💰 ${Math.floor(c.gold)}`;
    const need = xpForLevel(c.level + 1);
    const prev = xpForLevel(c.level);
    const pct = Math.max(0, Math.min(100, ((c.xp - prev) / (need - prev)) * 100));
    this.xpFill.style.width = `${pct}%`;
  }

  updateShield(pct: number) {
    this.shieldFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  }

  updateCooldowns(cooldownFrac: Record<string, number>) {
    for (const [id, { overlay }] of this.abilitySlots) {
      overlay.style.transform = `scaleY(${cooldownFrac[id] ?? 0})`;
    }
  }

  setRoster(members: { id: string; name: string; classId: PlayerClassId; level: number }[], selfId: string) {
    this.rosterEl.innerHTML = members
      .map(
        (m) => `
      <div class="roster-item">
        <span class="dot" style="background:${CLASSES[m.classId].color}"></span>
        <span>${m.name === "" ? "Wanderer" : escapeHtml(m.name)}${m.id === selfId ? " (you)" : ""} · Lv${m.level}</span>
        ${m.id === selfId ? "" : `<button class="roster-trade-btn interactive" data-trade="${m.id}">Trade</button>`}
      </div>`
      )
      .join("");
    this.rosterEl.querySelectorAll<HTMLButtonElement>("[data-trade]").forEach((btn) => {
      btn.addEventListener("click", () => this.onProposeTrade?.(btn.dataset.trade!));
    });
  }

  setCompanionNames(names: string[]) {
    if (names.length === 0) {
      this.companionBadgeEl.style.display = "none";
      return;
    }
    this.companionBadgeEl.style.display = "block";
    this.companionBadgeEl.textContent = `Traveling with ${names.join(" and ")}`;
  }

  setZoneName(name: string) {
    this.zoneBadgeEl.textContent = name;
  }

  setRoomCode(code: string | null) {
    if (!code) {
      this.roomCodeEl.style.display = "none";
      return;
    }
    this.roomCodeEl.style.display = "block";
    this.roomCodeEl.textContent = `Party code: ${code} (share to invite)`;
  }

  pushToast(text: string, kind: "levelup" | "loot" | "info" = "info") {
    const el = document.createElement("div");
    el.className = `toast ${kind}`;
    el.textContent = text;
    this.toastsEl.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  addChatLine(from: string, message: string) {
    const el = document.createElement("div");
    el.className = from === "World" ? "chat-line chat-line--world" : "chat-line";
    el.textContent = from === "World" ? message : `${from}: ${message}`;
    this.chatLogEl.appendChild(el);
    this.chatLogEl.scrollTop = this.chatLogEl.scrollHeight;
    while (this.chatLogEl.children.length > 40) this.chatLogEl.removeChild(this.chatLogEl.firstChild!);
  }

  showDeath(show: boolean) {
    this.deathOverlay.style.display = show ? "flex" : "none";
  }

  showGather(active: boolean, frac = 0) {
    this.gatherBar.style.display = active ? "block" : "none";
    if (active) this.gatherFill.style.width = `${frac * 100}%`;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
