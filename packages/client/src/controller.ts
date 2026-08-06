import * as THREE from "three";

export interface CameraOrbit {
  yaw: number;
  pitch: number;
  distance: number;
}

export class InputController {
  private keys = new Set<string>();
  orbit: CameraOrbit = { yaw: 0, pitch: 0.55, distance: 9 };
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  mouseNdc = new THREE.Vector2(0, 0);
  leftClick = false;

  onAbility: ((slot: number) => void) | null = null;
  onDodge: (() => void) | null = null;
  onInteract: (() => void) | null = null;
  onTargetClick: (() => void) | null = null;
  onToggleInventory: (() => void) | null = null;
  onToggleCrafting: (() => void) | null = null;
  onToggleCharacter: (() => void) | null = null;
  onToggleCompanions: (() => void) | null = null;

  private inputLocked = false;

  constructor(private domElement: HTMLElement) {
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    domElement.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    window.addEventListener("mouseup", (e) => {
      if (e.button === 2) this.dragging = false;
      if (e.button === 0) this.leftClick = false;
    });
    window.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    domElement.addEventListener("wheel", (e) => this.handleWheel(e), { passive: true });
    domElement.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  setInputLocked(locked: boolean) {
    this.inputLocked = locked;
    if (locked) this.keys.clear();
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (this.isTypingTarget(e.target)) return;
    this.keys.add(e.code);
    if (this.inputLocked) return;
    if (e.code === "Space") this.onDodge?.();
    else if (e.code === "KeyE") this.onInteract?.();
    else if (e.code === "Digit1") this.onAbility?.(1);
    else if (e.code === "Digit2") this.onAbility?.(2);
    else if (e.code === "Digit3") this.onAbility?.(3);
    else if (e.code === "Digit4") this.onAbility?.(4);
    else if (e.code === "Digit5") this.onAbility?.(5);
    else if (e.code === "Digit6") this.onAbility?.(6);
    else if (e.code === "KeyI") this.onToggleInventory?.();
    else if (e.code === "KeyC") this.onToggleCharacter?.();
    else if (e.code === "KeyR") this.onToggleCrafting?.();
    else if (e.code === "KeyP") this.onToggleCompanions?.();
  }

  private isTypingTarget(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
  }

  private handleMouseDown(e: MouseEvent) {
    if (e.button === 2) {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
    if (e.button === 0) {
      this.leftClick = true;
      this.onTargetClick?.();
    }
  }

  private handleMouseMove(e: MouseEvent) {
    this.mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if (this.dragging) {
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.orbit.yaw -= dx * 0.006;
      this.orbit.pitch = THREE.MathUtils.clamp(this.orbit.pitch - dy * 0.005, 0.15, 1.35);
    }
  }

  private handleWheel(e: WheelEvent) {
    this.orbit.distance = THREE.MathUtils.clamp(this.orbit.distance + e.deltaY * 0.01, 4, 18);
  }

  /** Movement intent in world XZ space, relative to camera yaw. */
  getMoveIntent(): { x: number; z: number } {
    if (this.inputLocked) return { x: 0, z: 0 };
    let forward = 0;
    let strafe = 0;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) forward += 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) forward -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) strafe += 1;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) strafe -= 1;
    if (forward === 0 && strafe === 0) return { x: 0, z: 0 };

    const yaw = this.orbit.yaw;
    const fx = Math.sin(yaw);
    const fz = Math.cos(yaw);
    const rx = Math.sin(yaw + Math.PI / 2);
    const rz = Math.cos(yaw + Math.PI / 2);

    const x = fx * forward + rx * strafe;
    const z = fz * forward + rz * strafe;
    const len = Math.hypot(x, z) || 1;
    return { x: x / len, z: z / len };
  }
}
