import { GUILD_ALIGNMENTS, GUILD_CREATION_COST, type CharacterState, type GuildAlignment, type GuildStateMessage } from "@moon/shared";
import type { NetClient } from "../net.js";

const STATUS_LABEL: Record<string, string> = {
  true_member: "True Member",
  cross_faction_member: "Cross-Faction",
  free_agent: "Free Agent"
};

const STATUS_COLOR: Record<string, string> = {
  true_member: "#8fd39a",
  cross_faction_member: "#e0b25c",
  free_agent: "#9aa3c9"
};

/**
 * Cross-faction guilds (docs/GDD.md's "Guilds" section) — global and cross-room like the auction
 * house, so it's its own panel toggled from anywhere (`G`), fed by the pulled-on-demand
 * `guildState` message rather than anything already on `character`.
 */
export class GuildPanel {
  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private open = false;
  private guild: GuildStateMessage["guild"] = null;
  private invites: GuildStateMessage["invites"] = [];

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
      this.net.send({ t: "requestGuild" });
      this.render();
    }
  }

  close() {
    this.open = false;
    this.overlay.style.display = "none";
  }

  handleGuildState(msg: GuildStateMessage) {
    this.guild = msg.guild;
    this.invites = msg.invites;
    if (this.open) this.render();
  }

  refresh() {
    if (this.open) this.render();
  }

  private render() {
    if (this.guild) this.renderGuild(this.guild);
    else this.renderNoGuild();
  }

  private renderNoGuild() {
    const c = this.getCharacter();
    const alignmentOptions = GUILD_ALIGNMENTS.map((a) => `<option value="${a.id}">${a.name}</option>`).join("");

    const inviteRows = this.invites
      .map(
        (inv) => `
      <div class="recipe-card">
        <div class="info">
          <h4>${escapeHtml(inv.name)} <span style="font-weight:400;color:#9aa3c9">[${escapeHtml(inv.tag)}] — invited by ${escapeHtml(inv.invitedByName)}</span></h4>
        </div>
        <button class="interactive" data-accept="${inv.guildId}">Accept</button>
        <button class="interactive" data-decline="${inv.guildId}">Decline</button>
      </div>`
      )
      .join("");

    this.panel.innerHTML = `
      <button class="close-btn">✕</button>
      <h2 class="title-font">Guild</h2>
      ${
        this.invites.length
          ? `<h3 style="margin-top:14px;font-size:14px">Pending invites</h3><div class="recipe-list">${inviteRows}</div>`
          : ""
      }
      <h3 style="margin-top:20px;font-size:14px">Found a guild</h3>
      <p style="color:#9aa3c9;font-size:12.5px">
        Costs ${GUILD_CREATION_COST}g. <span style="float:right;color:#ffd77a">💰 ${Math.floor(c.gold)}</span>
      </p>
      <div class="recipe-card">
        <div class="info">
          <div class="inputs">
            Name <input class="ah-input" type="text" maxlength="32" id="guildNameInput" placeholder="Guild name" />
            Tag <input class="ah-input" type="text" maxlength="4" id="guildTagInput" placeholder="TAG" style="width:60px" />
            <select id="guildAlignmentInput">${alignmentOptions}</select>
          </div>
        </div>
        <button class="interactive" id="createGuildBtn">Found</button>
      </div>
    `;

    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    this.panel.querySelectorAll<HTMLButtonElement>("[data-accept]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "respondGuildInvite", guildId: btn.dataset.accept!, accept: true }));
    });
    this.panel.querySelectorAll<HTMLButtonElement>("[data-decline]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "respondGuildInvite", guildId: btn.dataset.decline!, accept: false }));
    });
    this.panel.querySelector("#createGuildBtn")!.addEventListener("click", () => {
      const name = (this.panel.querySelector<HTMLInputElement>("#guildNameInput")!.value ?? "").trim();
      const tag = (this.panel.querySelector<HTMLInputElement>("#guildTagInput")!.value ?? "").trim();
      const alignment = this.panel.querySelector<HTMLSelectElement>("#guildAlignmentInput")!.value as GuildAlignment;
      if (!name || !tag) return;
      this.net.send({ t: "createGuild", name, tag, alignment });
    });
  }

  private renderGuild(guild: NonNullable<GuildStateMessage["guild"]>) {
    const c = this.getCharacter();
    const self = guild.members.find((m) => m.memberId === c.id);
    const selfRank = self?.rank ?? "member";
    const canManage = selfRank === "leader" || selfRank === "officer";
    const alignmentName = GUILD_ALIGNMENTS.find((a) => a.id === guild.alignment)?.name ?? guild.alignment;

    const memberRows = guild.members
      .slice()
      .sort((a, b) => (a.rank === b.rank ? b.contributionGold - a.contributionGold : rankOrder(a.rank) - rankOrder(b.rank)))
      .map((m) => {
        const isSelf = m.memberId === c.id;
        const canKick = !isSelf && m.rank !== "leader" && (selfRank === "leader" || (selfRank === "officer" && m.rank === "member"));
        const canPromote = selfRank === "leader" && !isSelf && m.rank === "member";
        const canDemote = selfRank === "leader" && !isSelf && m.rank === "officer";
        return `
        <div class="recipe-card">
          <div class="info">
            <h4>
              ${escapeHtml(m.name)}${isSelf ? " (you)" : ""}
              <span style="font-weight:400;color:#9aa3c9"> — ${capitalize(m.rank)} · <span style="color:${STATUS_COLOR[m.status]}">${STATUS_LABEL[m.status]}</span> · ${m.contributionGold}g donated</span>
            </h4>
          </div>
          ${canPromote ? `<button class="interactive" data-promote="${m.memberId}">Promote</button>` : ""}
          ${canDemote ? `<button class="interactive" data-demote="${m.memberId}">Demote</button>` : ""}
          ${canKick ? `<button class="interactive" data-kick="${m.memberId}">Remove</button>` : ""}
        </div>`;
      })
      .join("");

    this.panel.innerHTML = `
      <button class="close-btn">✕</button>
      <h2 class="title-font">${escapeHtml(guild.name)} <span style="font-size:14px;color:#9aa3c9">[${escapeHtml(guild.tag)}]</span></h2>
      <p style="color:#9aa3c9;font-size:12.5px">${alignmentName} · Treasury: ${guild.treasuryGold}g</p>
      <h3 style="margin-top:14px;font-size:14px">Members (${guild.members.length})</h3>
      <div class="recipe-list">${memberRows}</div>
      ${
        canManage
          ? `<h3 style="margin-top:20px;font-size:14px">Invite</h3>
      <div class="recipe-card">
        <div class="info"><div class="inputs">Name <input class="ah-input" type="text" id="inviteNameInput" placeholder="Character name" /></div></div>
        <button class="interactive" id="inviteBtn">Invite</button>
      </div>`
          : ""
      }
      <h3 style="margin-top:20px;font-size:14px">Donate to treasury</h3>
      <p style="color:#9aa3c9;font-size:12.5px"><span style="color:#ffd77a">💰 ${Math.floor(c.gold)}</span></p>
      <div class="recipe-card">
        <div class="info"><div class="inputs">Amount <input class="ah-input" type="number" min="1" value="10" id="donateAmountInput" /></div></div>
        <button class="interactive" id="donateBtn">Donate</button>
      </div>
      <div style="margin-top:20px">
        <button class="interactive" id="leaveGuildBtn">Leave Guild</button>
      </div>
    `;

    this.panel.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    this.panel.querySelectorAll<HTMLButtonElement>("[data-kick]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "kickGuildMember", targetMemberId: btn.dataset.kick! }));
    });
    this.panel.querySelectorAll<HTMLButtonElement>("[data-promote]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "setGuildMemberRank", targetMemberId: btn.dataset.promote!, rank: "officer" }));
    });
    this.panel.querySelectorAll<HTMLButtonElement>("[data-demote]").forEach((btn) => {
      btn.addEventListener("click", () => this.net.send({ t: "setGuildMemberRank", targetMemberId: btn.dataset.demote!, rank: "member" }));
    });
    const inviteBtn = this.panel.querySelector("#inviteBtn");
    inviteBtn?.addEventListener("click", () => {
      const name = (this.panel.querySelector<HTMLInputElement>("#inviteNameInput")!.value ?? "").trim();
      if (!name) return;
      this.net.send({ t: "inviteToGuild", playerName: name });
    });
    this.panel.querySelector("#donateBtn")!.addEventListener("click", () => {
      const amount = Math.max(1, Math.floor(Number(this.panel.querySelector<HTMLInputElement>("#donateAmountInput")!.value) || 0));
      this.net.send({ t: "donateToGuild", amount });
    });
    this.panel.querySelector("#leaveGuildBtn")!.addEventListener("click", () => this.net.send({ t: "leaveGuild" }));
  }
}

function rankOrder(rank: string): number {
  return rank === "leader" ? 0 : rank === "officer" ? 1 : 2;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
