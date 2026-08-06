import * as THREE from "three";
import type { Vec3 } from "@moon/shared";

interface Plate {
  el: HTMLDivElement;
  fill: HTMLDivElement;
  label: HTMLDivElement;
}

export class NameplateManager {
  private plates = new Map<string, Plate>();

  constructor(private container: HTMLElement, private camera: THREE.PerspectiveCamera) {}

  ensure(id: string, name: string, tone: "ally" | "enemy" | "boss"): Plate {
    let plate = this.plates.get(id);
    if (!plate) {
      const el = document.createElement("div");
      el.className = `nameplate nameplate--${tone}`;
      el.innerHTML = `<div class="nameplate-name">${escapeHtml(name)}</div><div class="nameplate-track"><div class="nameplate-fill"></div></div>`;
      this.container.appendChild(el);
      plate = { el, fill: el.querySelector(".nameplate-fill")!, label: el.querySelector(".nameplate-name")! };
      this.plates.set(id, plate);
    }
    return plate;
  }

  update(id: string, worldPos: Vec3, hpFrac: number, visible: boolean) {
    const plate = this.plates.get(id);
    if (!plate) return;
    if (!visible) {
      plate.el.style.display = "none";
      return;
    }
    const v = new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z).project(this.camera);
    if (v.z > 1) {
      plate.el.style.display = "none";
      return;
    }
    plate.el.style.display = "block";
    const x = (v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (1 - (v.y * 0.5 + 0.5)) * window.innerHeight;
    plate.el.style.transform = `translate(${x}px, ${y}px)`;
    plate.fill.style.width = `${Math.max(0, Math.min(1, hpFrac)) * 100}%`;
  }

  remove(id: string) {
    const plate = this.plates.get(id);
    if (!plate) return;
    plate.el.remove();
    this.plates.delete(id);
  }

  pruneExcept(ids: Set<string>) {
    for (const id of [...this.plates.keys()]) {
      if (!ids.has(id)) this.remove(id);
    }
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
