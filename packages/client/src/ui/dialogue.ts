import type { DialogueChoiceOption } from "@moon/shared";

/**
 * A non-blocking dialogue box (section 4.3: no camera lock, no paused world). It sits at the
 * bottom of the screen like a subtitle; movement, combat and gathering all keep working while
 * it's open. Choosing a response — or walking away — closes it.
 */
export class DialoguePanel {
  private root: HTMLDivElement;
  private speakerEl: HTMLDivElement;
  private lineEl: HTMLDivElement;
  private choicesEl: HTMLDivElement;
  private activeNpcId: string | null = null;
  private autoHideTimer: ReturnType<typeof setTimeout> | null = null;

  onChoose: ((npcId: string, optionId: string) => void) | null = null;

  constructor(root: HTMLElement) {
    this.root = document.createElement("div");
    this.root.className = "dialogue-panel";
    this.root.style.display = "none";
    this.root.innerHTML = `
      <div class="dialogue-speaker" id="dialogueSpeaker"></div>
      <div class="dialogue-line" id="dialogueLine"></div>
      <div class="dialogue-choices" id="dialogueChoices"></div>
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
    // A plain greeting (no choices to make) fades on its own; a real decision waits for you.
    if (!choices || choices.length === 0) {
      this.autoHideTimer = setTimeout(() => this.hide(), 6000);
    }
  }

  hide() {
    if (this.autoHideTimer) clearTimeout(this.autoHideTimer);
    this.autoHideTimer = null;
    this.activeNpcId = null;
    this.root.style.display = "none";
  }
}
