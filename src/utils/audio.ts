/**
 * Web Audio API synthesizer for traditional Taiwanese Shadow Puppetry percussion:
 * - 鑼 (Large/Small Brass Gong)
 * - 堂鼓 (Chinese Membrane Drum)
 * - 鈸 (Cymbals)
 * - 梆子 (Hardwood Clapper)
 * - 關節皮扣聲 (Leather/Bone joint articulation sound)
 */

class ShadowPuppetAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // 1. 鑼 (Chinese Gong)
  playGong(pitch = 280, duration = 1.6) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Gong initial high strike dropping to resonant low
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch * 1.5, t);
    osc.frequency.exponentialRampToValueAtTime(pitch, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.92, t + duration);

    // Overtones via FM-like sub-oscillator
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(pitch * 2.37, t);
    subOsc.frequency.exponentialRampToValueAtTime(pitch * 2.05, t + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(pitch * 1.8, t);
    filter.Q.setValueAtTime(3.5, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    subGain.gain.setValueAtTime(0.2, t);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.7);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + duration);
    subOsc.stop(t + duration);
  }

  // 2. 堂鼓 / 扁鼓 (Chinese Drum)
  playDrum(pitch = 85, duration = 0.5) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch * 2.2, t);
    osc.frequency.exponentialRampToValueAtTime(pitch, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.65, t + duration);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    // Noise snap for the drum mallet strike
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(800, t);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  // 3. 鈸 / 碰鐘 (Cymbal / Bells)
  playCymbal(duration = 0.8) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  // 4. 梆子 (Hardwood Clapper)
  playBangzi() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1150, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.04);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(6.0, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // 5. Joint Click (皮偶關節牽引微音)
  playJointClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700 + Math.random() * 150, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  // 6. 喝采鑼鼓齊鳴 (Victory Fanfare Roll)
  playCelebration() {
    this.playDrum(120, 0.4);
    setTimeout(() => this.playDrum(100, 0.4), 120);
    setTimeout(() => this.playDrum(90, 0.4), 240);
    setTimeout(() => {
      this.playGong(320, 2.0);
      this.playCymbal(1.2);
    }, 360);
  }
}

export const puppetAudio = new ShadowPuppetAudio();
