import { getRomanceDef, type DialogueChoiceOption, type FlirtType } from "@moon/shared";

const FLIRT_LABELS: Record<FlirtType, string> = {
  friendly: "💬 Friendly",
  bold: "😏 Bold",
  intellectual: "🧠 Clever",
  protective: "🛡️ Protective",
  vulnerable: "💔 Open up",
  dark: "🌑 Dark"
};
const FLIRT_TYPES = Object.keys(FLIRT_LABELS) as FlirtType[];

/**
 * A non-blocking dialogue box (section 4.3: no camera lock, no paused world). It sits at the
 * bottom of the screen like a subtitle; movement, combat and gathering all keep working while
 * it's open. Choosing a response — or walking away — closes it.
 *
 * Universal romance (see lore/romance.ts): whenever the NPC being talked to has a RomanceDef, a
 * row of flirt options appears alongside whatever signature-choice options the server sent — a
 * client-side addition, not part of the branching dialogue tree itself, since flirting doesn't
 * follow the same one-time resolved-tag structure a signature choice does.
 */
export class DialoguePanel {
  private root: HTMLDivElement;
  private speakerEl: HTMLDivElement;
  private lineEl: HTMLDivElement;
  private choicesEl: HTMLDivElement;
  private activeNpcId: string | null = null;
  private autoHideTimer: ReturnType<typeof setTimeout> | null = null;

  onChoose: ((npcId: string, optionId: string) => void) | null = null;
  onFlirt: ((npcId: string, flirtType: FlirtType) => void) | null = null;

  constructor(root: HTMLElement) {
    this.root = document.createElement("div");
    this.root.className = "dialogue-panel";
    this.root.style.display = "none";
    this.root.innerHTML = `
      <div class="dialogue-speaker" id="dialogueSpeaker"></div>
      <div class="dialogue-line" id="dialogueLine"></div>
      <div class="dialogue-choices" id="dialogueChoices"></div>
      <div class="dialogue-flirt-row" id="dialogueFlirtRow"></div>
    `;
    root.appendChild(this.root);
    this.speakerEl = this.root.querySelector("#dialogueSpeaker")!;
    this.lineEl = this.root.querySelector("#dialogueLine")!;
    this.choicesEl = this.root.querySelector("#dialogueChoices")!;
  }

  isOpen(): boolean {
    return this.root.style.display !== "none";
  }

  show(npcId: string, speaker: string, line: string, choices?: DialogueChoiceOption[]) {
    if (this.autoHideTimer) clearTimeout(this.autoHideTimer);
    this.activeNpcId = npcId;
    this.root.style.display = "block";
    this.speakerEl.textContent = speaker;
    this.lineEl.textContent = line;
    this.choicesEl.innerHTML = "";
    for (const choice of choices ?? []) {
      const btn = document.createElement("button");
      btn.className = "dialogue-choice interactive";
      btn.textContent = choice.label;
      btn.addEventListener("click", () => {
        if (this.activeNpcId) this.onChoose?.(this.activeNpcId, choice.id);
      });
      this.choicesEl.appendChild(btn);
    }

    const flirtRow = this.root.querySelector<HTMLDivElement>("#dialogueFlirtRow")!;
    const romanceDef = getRomanceDef(npcId);
    flirtRow.innerHTML = "";
    flirtRow.style.display = romanceDef ? "flex" : "none";
    if (romanceDef) {
      for (const type of FLIRT_TYPES) {
        const btn = document.createElement("button");
        btn.className = "dialogue-flirt-btn interactive";
        btn.textContent = FLIRT_LABELS[type];
        btn.addEventListener("click", () => {
          if (this.activeNpcId) this.onFlirt?.(this.activeNpcId, type);
        });
        flirtRow.appendChild(btn);
      }
    }

    // A plain greeting (no choices to make) fades on its own; a real decision waits for you.
    // Talking to someone romanceable gets extra time — reading and picking a flirt tone takes
    // longer than reading a line and walking off.
    if (!choices || choices.length === 0) {
      this.autoHideTimer = setTimeout(() => this.hide(), romanceDef ? 12000 : 6000);
    }
  }

  hide() {
    if (this.autoHideTimer) clearTimeout(this.autoHideTimer);
    this.autoHideTimer = null;
    this.activeNpcId = null;
    this.root.style.display = "none";
  }
}
