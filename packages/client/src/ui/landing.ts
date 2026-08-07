import { listClasses, RACES } from "@moon/shared";
import type { PlayerClassId, PlayerRaceId, RaceCategory } from "@moon/shared";

export interface LandingResult {
  name: string;
  classId: PlayerClassId;
  raceId: PlayerRaceId;
  room: "solo" | "new" | string;
}

const RACE_CATEGORY_COLOR: Record<RaceCategory, string> = {
  aethonian: "#8fae6b",
  "selenian-touched": "#b98fe0",
  unbound: "#e0708f"
};

export interface LandingHandle {
  setStatus(message: string): void;
  setBusy(busy: boolean): void;
  destroy(): void;
}

export function renderLanding(
  root: HTMLElement,
  defaults: { name: string; classId: PlayerClassId; raceId: PlayerRaceId },
  onStart: (result: LandingResult) => void
): LandingHandle {
  const wrap = document.createElement("div");
  wrap.className = "landing interactive";

  let selectedClass: PlayerClassId = defaults.classId;
  let selectedRace: PlayerRaceId = defaults.raceId;
  let selectedMode: "solo" | "new" | "join" = "solo";

  const classCards = listClasses()
    .map(
      (c) => `
    <div class="class-card" data-class="${c.id}" style="--accent:${c.color}">
      <div class="swatch" style="background:${c.color}"></div>
      <h3>${c.name}</h3>
      <p class="tagline">${c.tagline}</p>
      <p class="desc">${c.description}</p>
    </div>`
    )
    .join("");

  const raceCards = RACES.map(
    (r) => `
    <div class="class-card" data-race="${r.id}" style="--accent:${RACE_CATEGORY_COLOR[r.category]}" title="${escapeAttr(r.identity)}">
      <div class="swatch" style="background:${RACE_CATEGORY_COLOR[r.category]}"></div>
      <h3>${r.name}</h3>
      <p class="tagline">${r.passiveDescription}</p>
    </div>`
  ).join("");

  wrap.innerHTML = `
    <div class="landing-card">
      <h1 class="title-font">The Moon Before Us</h1>
      <p class="subtitle">A drop-in, drop-out coop action-RPG. Play solo, or bring friends — jump in anytime.</p>

      <label for="nameInput">Your name</label>
      <input id="nameInput" type="text" maxlength="16" placeholder="Wanderer" value="${escapeAttr(defaults.name)}" />

      <label>Choose your race</label>
      <div class="class-grid race-grid">${raceCards}</div>

      <label>Choose your path</label>
      <div class="class-grid">${classCards}</div>

      <label>How will you play?</label>
      <div class="mode-grid">
        <div class="mode-card" data-mode="solo"><div class="icon">🌙</div><div class="label">Solo</div></div>
        <div class="mode-card" data-mode="new"><div class="icon">✨</div><div class="label">Start a Party</div></div>
        <div class="mode-card" data-mode="join"><div class="icon">🔑</div><div class="label">Join a Party</div></div>
      </div>
      <div class="party-code-row" style="display:none">
        <input id="codeInput" type="text" maxlength="5" placeholder="CODE" />
      </div>

      <button class="primary-btn" id="startBtn">Enter the Glade</button>
      <div class="landing-status" id="statusEl"></div>
    </div>
  `;
  root.appendChild(wrap);

  const nameInput = wrap.querySelector<HTMLInputElement>("#nameInput")!;
  const codeRow = wrap.querySelector<HTMLDivElement>(".party-code-row")!;
  const codeInput = wrap.querySelector<HTMLInputElement>("#codeInput")!;
  const startBtn = wrap.querySelector<HTMLButtonElement>("#startBtn")!;
  const statusEl = wrap.querySelector<HTMLDivElement>("#statusEl")!;

  function refreshSelection() {
    wrap.querySelectorAll<HTMLDivElement>(".class-card[data-class]").forEach((el) => {
      el.classList.toggle("selected", el.dataset.class === selectedClass);
    });
    wrap.querySelectorAll<HTMLDivElement>(".class-card[data-race]").forEach((el) => {
      el.classList.toggle("selected", el.dataset.race === selectedRace);
    });
    wrap.querySelectorAll<HTMLDivElement>(".mode-card").forEach((el) => {
      el.classList.toggle("selected", el.dataset.mode === selectedMode);
    });
    codeRow.style.display = selectedMode === "join" ? "flex" : "none";
  }

  wrap.querySelectorAll<HTMLDivElement>(".class-card[data-class]").forEach((el) => {
    el.addEventListener("click", () => {
      selectedClass = el.dataset.class as PlayerClassId;
      refreshSelection();
    });
  });
  wrap.querySelectorAll<HTMLDivElement>(".class-card[data-race]").forEach((el) => {
    el.addEventListener("click", () => {
      selectedRace = el.dataset.race as PlayerRaceId;
      refreshSelection();
    });
  });
  wrap.querySelectorAll<HTMLDivElement>(".mode-card").forEach((el) => {
    el.addEventListener("click", () => {
      selectedMode = el.dataset.mode as "solo" | "new" | "join";
      refreshSelection();
    });
  });
  refreshSelection();

  startBtn.addEventListener("click", () => {
    const name = nameInput.value.trim() || "Wanderer";
    let room: LandingResult["room"] = "solo";
    if (selectedMode === "new") room = "new";
    else if (selectedMode === "join") {
      const code = codeInput.value.trim();
      if (!code) {
        statusEl.textContent = "Enter a party code to join.";
        return;
      }
      room = code;
    }
    onStart({ name, classId: selectedClass, raceId: selectedRace, room });
  });

  return {
    setStatus(message: string) {
      statusEl.textContent = message;
    },
    setBusy(busy: boolean) {
      startBtn.disabled = busy;
      startBtn.textContent = busy ? "Connecting…" : "Enter the Glade";
    },
    destroy() {
      wrap.remove();
    }
  };
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
