import type { ZoneTheme } from "@moon/shared";

/**
 * Procedural audio (docs/GDD.md's "Audio"): every sound here is synthesized at runtime from Web
 * Audio oscillators, noise buffers, and envelopes — no asset files, matching the same "no art
 * team needed" pillar the stylized low-poly visuals already lean on. Browsers block audio until a
 * real user gesture; `unlock()` must be called from one (the landing screen's start button).
 */
const MUTE_KEY = "moon_audio_muted";
const MASTER_GAIN = 0.55;

interface ThemeAmbience {
  baseFreq: number;
  filterFreq: number;
  detune: number;
  type: OscillatorType;
}

const THEME_AMBIENCE: Record<ZoneTheme, ThemeAmbience> = {
  verdant: { baseFreq: 98, filterFreq: 900, detune: 6, type: "sine" },
  ashen: { baseFreq: 73, filterFreq: 500, detune: 14, type: "sawtooth" },
  coastal: { baseFreq: 87, filterFreq: 700, detune: 8, type: "sine" },
  highland: { baseFreq: 65, filterFreq: 450, detune: 10, type: "triangle" },
  arcane: { baseFreq: 110, filterFreq: 1400, detune: 18, type: "sine" },
  fractured: { baseFreq: 61, filterFreq: 380, detune: 26, type: "sawtooth" },
  lunar: { baseFreq: 82, filterFreq: 1600, detune: 4, type: "sine" },
  hollow: { baseFreq: 55, filterFreq: 320, detune: 20, type: "triangle" },
  drowned: { baseFreq: 68, filterFreq: 550, detune: 16, type: "sine" }
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted: boolean;
  private currentTheme: ZoneTheme | null = null;
  private droneGain: GainNode | null = null;
  private droneOscs: OscillatorNode[] = [];

  constructor() {
    this.muted = localStorage.getItem(MUTE_KEY) === "1";
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : MASTER_GAIN;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  /** Call from a real click/keydown handler — autoplay policy blocks audio until then. */
  unlock() {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggleMuted() {
    this.muted = !this.muted;
    localStorage.setItem(MUTE_KEY, this.muted ? "1" : "0");
    const ctx = this.ensureContext();
    if (ctx && this.master) {
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.setTargetAtTime(this.muted ? 0 : MASTER_GAIN, ctx.currentTime, 0.05);
    }
  }

  /** A short, decaying tone — the building block for most one-shot SFX. */
  private tone(freq: number, duration: number, opts: { type?: OscillatorType; peak?: number; glideTo?: number; delay?: number } = {}) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;
    const start = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (opts.glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.glideTo), start + duration);
    const gain = ctx.createGain();
    const peak = opts.peak ?? 0.22;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peak, start + Math.min(0.02, duration * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  /** A short filtered noise burst — hits, dodges, footsteps-in-spirit. */
  private noiseBurst(duration: number, opts: { peak?: number; filterFreq?: number; filterType?: BiquadFilterType } = {}) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = opts.filterType ?? "lowpass";
    filter.frequency.value = opts.filterFreq ?? 2200;
    const gain = ctx.createGain();
    gain.gain.value = opts.peak ?? 0.22;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(now);
  }

  // ---------------- Ambient per-zone drone ----------------

  setZoneAmbience(theme: ZoneTheme) {
    if (this.currentTheme === theme) return;
    this.currentTheme = theme;
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;

    if (this.droneGain) {
      const oldGain = this.droneGain;
      const oldOscs = this.droneOscs;
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.linearRampToValueAtTime(0.0001, now + 2);
      setTimeout(() => oldOscs.forEach((o) => o.stop()), 2200);
    }

    const params = THEME_AMBIENCE[theme] ?? THEME_AMBIENCE.verdant;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = params.filterFreq;
    filter.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 2.5);
    filter.connect(gain);
    gain.connect(this.master);

    const oscs: OscillatorNode[] = [];
    for (const mult of [1, 1.5, 2]) {
      const osc = ctx.createOscillator();
      osc.type = params.type;
      osc.frequency.value = params.baseFreq * mult;
      osc.detune.value = (Math.random() - 0.5) * params.detune;
      osc.connect(filter);
      osc.start(now);
      oscs.push(osc);
    }
    this.droneGain = gain;
    this.droneOscs = oscs;
  }

  // ---------------- One-shot SFX ----------------

  playDamage(crit: boolean) {
    this.noiseBurst(crit ? 0.16 : 0.1, { peak: crit ? 0.3 : 0.2, filterFreq: crit ? 3200 : 1800 });
    if (crit) this.tone(1200, 0.12, { type: "square", peak: 0.08, delay: 0.02 });
  }

  playHeal() {
    this.tone(520, 0.35, { type: "sine", peak: 0.14, glideTo: 900 });
  }

  playLevelUp() {
    [523, 659, 784, 1047].forEach((freq, i) => this.tone(freq, 0.28, { type: "triangle", peak: 0.16, delay: i * 0.09 }));
  }

  playLoot() {
    this.tone(880, 0.1, { type: "sine", peak: 0.12 });
    this.tone(1320, 0.12, { type: "sine", peak: 0.1, delay: 0.05 });
  }

  playCraft() {
    this.noiseBurst(0.06, { peak: 0.15, filterFreq: 1200, filterType: "bandpass" });
    this.tone(660, 0.08, { type: "square", peak: 0.08, delay: 0.03 });
  }

  playCast() {
    this.tone(340, 0.14, { type: "sine", peak: 0.1, glideTo: 560 });
  }

  playDodge() {
    this.noiseBurst(0.18, { peak: 0.16, filterFreq: 1500, filterType: "highpass" });
  }

  playDeath(isSelf: boolean) {
    this.tone(isSelf ? 220 : 180, 0.5, { type: "sawtooth", peak: 0.14, glideTo: 50 });
  }

  playGatherTick() {
    this.tone(700, 0.05, { type: "square", peak: 0.06 });
  }

  playMount(mounted: boolean) {
    this.tone(mounted ? 300 : 500, 0.22, { type: "triangle", peak: 0.12, glideTo: mounted ? 600 : 250 });
  }

  playWorldEvent() {
    [660, 880, 1100].forEach((freq, i) => this.tone(freq, 0.4, { type: "sine", peak: 0.14, delay: i * 0.14 }));
  }

  playDialogue() {
    this.tone(760, 0.08, { type: "sine", peak: 0.07 });
  }

  playTravel() {
    this.tone(400, 0.3, { type: "sine", peak: 0.1, glideTo: 900 });
  }
}
