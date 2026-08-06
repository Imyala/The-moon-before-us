import * as THREE from "three";
import type { Vec3 } from "@moon/shared";

interface FloatingNumber {
  el: HTMLDivElement;
  pos: Vec3;
  born: number;
}

interface Burst {
  points: THREE.Points;
  born: number;
}

interface Telegraph {
  mesh: THREE.Mesh;
  endAt: number;
}

const NUMBER_LIFETIME = 900;
const BURST_LIFETIME = 380;

export class EffectsManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private numbers: FloatingNumber[] = [];
  private bursts: Burst[] = [];
  private telegraphs = new Map<string, Telegraph>();

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, container: HTMLElement) {
    this.scene = scene;
    this.camera = camera;
    this.container = container;
  }

  spawnDamageNumber(pos: Vec3, amount: number, kind: "damage" | "heal" | "crit") {
    const el = document.createElement("div");
    el.className = `floatnum floatnum--${kind}`;
    el.textContent = kind === "heal" ? `+${amount}` : `${amount}`;
    this.container.appendChild(el);
    this.numbers.push({ el, pos: { x: pos.x, y: pos.y + 1.8, z: pos.z }, born: performance.now() });
  }

  spawnHitBurst(pos: Vec3, color: string) {
    const count = 10;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y + 1.1;
      positions[i * 3 + 2] = pos.z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.16, transparent: true, opacity: 1 });
    const points = new THREE.Points(geo, mat);
    (points as any)._velocities = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 3,
      y: Math.random() * 3,
      z: (Math.random() - 0.5) * 3
    }));
    this.scene.add(points);
    this.bursts.push({ points, born: performance.now() });
  }

  setTelegraph(id: string, pos: Vec3, radius: number, endAt: number) {
    let tele = this.telegraphs.get(id);
    if (!tele) {
      const geo = new THREE.RingGeometry(radius * 0.85, radius, 32);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ color: "#ff5c5c", transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos.x, 0.05, pos.z);
      this.scene.add(mesh);
      tele = { mesh, endAt };
      this.telegraphs.set(id, tele);
    }
    tele.endAt = endAt;
    tele.mesh.position.set(pos.x, 0.05, pos.z);
  }

  clearTelegraph(id: string) {
    const tele = this.telegraphs.get(id);
    if (!tele) return;
    this.scene.remove(tele.mesh);
    tele.mesh.geometry.dispose();
    (tele.mesh.material as THREE.Material).dispose();
    this.telegraphs.delete(id);
  }

  update(now: number) {
    for (let i = this.numbers.length - 1; i >= 0; i--) {
      const n = this.numbers[i];
      const age = now - n.born;
      if (age > NUMBER_LIFETIME) {
        n.el.remove();
        this.numbers.splice(i, 1);
        continue;
      }
      const t = age / NUMBER_LIFETIME;
      const worldPos = new THREE.Vector3(n.pos.x, n.pos.y + t * 1.3, n.pos.z);
      const screen = worldPos.project(this.camera);
      if (screen.z > 1) {
        n.el.style.display = "none";
        continue;
      }
      const x = (screen.x * 0.5 + 0.5) * window.innerWidth;
      const y = (1 - (screen.y * 0.5 + 0.5)) * window.innerHeight;
      n.el.style.display = "block";
      n.el.style.transform = `translate(${x}px, ${y}px)`;
      n.el.style.opacity = String(1 - t);
    }

    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      const age = now - b.born;
      if (age > BURST_LIFETIME) {
        this.scene.remove(b.points);
        b.points.geometry.dispose();
        (b.points.material as THREE.Material).dispose();
        this.bursts.splice(i, 1);
        continue;
      }
      const t = age / BURST_LIFETIME;
      const pos = b.points.geometry.attributes.position as THREE.BufferAttribute;
      const vel: { x: number; y: number; z: number }[] = (b.points as any)._velocities;
      for (let j = 0; j < vel.length; j++) {
        pos.setXYZ(j, pos.getX(j) + vel[j].x * 0.016, pos.getY(j) + vel[j].y * 0.016, pos.getZ(j) + vel[j].z * 0.016);
      }
      pos.needsUpdate = true;
      (b.points.material as THREE.PointsMaterial).opacity = 1 - t;
    }

    for (const [id, tele] of this.telegraphs) {
      if (now >= tele.endAt) {
        this.clearTelegraph(id);
        continue;
      }
      const remaining = tele.endAt - now;
      const scale = 0.7 + 0.3 * (1 - Math.min(1, remaining / 600));
      tele.mesh.scale.setScalar(scale);
    }
  }
}
