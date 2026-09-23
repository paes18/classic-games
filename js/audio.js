/* Nokia Retro Audio Synthesizer (Web Audio API) */

class NokiaAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playTone(freq, type = 'square', duration = 0.1, gainVal = 0.2) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playKeyBeep() { this.playTone(1200, 'square', 0.03, 0.1); }
  playSelectBeep() { this.playTone(1600, 'square', 0.06, 0.15); }
  playBackBeep() { this.playTone(800, 'square', 0.05, 0.12); }

  playNokiaTune() {
    if (!this.enabled) return;
    this.init();
    
    const notes = [
      { f: 1318.51, d: 0.12 }, { f: 1174.66, d: 0.12 }, { f: 739.99,  d: 0.25 }, { f: 830.61,  d: 0.25 },
      { f: 1108.73, d: 0.12 }, { f: 987.77,  d: 0.12 }, { f: 554.37,  d: 0.25 }, { f: 659.25,  d: 0.25 },
      { f: 987.77,  d: 0.12 }, { f: 880.00,  d: 0.12 }, { f: 493.88,  d: 0.25 }, { f: 659.25,  d: 0.25 },
      { f: 880.00,  d: 0.50 }
    ];

    let delay = 0;
    notes.forEach(note => {
      setTimeout(() => {
        this.playTone(note.f, 'square', note.d, 0.2);
      }, delay);
      delay += note.d * 1050;
    });
  }

  playEatSFX() {
    this.playTone(600, 'square', 0.04, 0.2);
    setTimeout(() => this.playTone(900, 'square', 0.06, 0.25), 40);
  }

  playDieSFX() {
    this.playTone(300, 'sawtooth', 0.15, 0.3);
    setTimeout(() => this.playTone(150, 'sawtooth', 0.25, 0.3), 120);
  }

  playShootSFX() { this.playTone(1400, 'square', 0.04, 0.15); }
  playHitSFX() { this.playTone(200, 'triangle', 0.08, 0.25); }

  playBounceSFX() {
    this.playTone(400, 'sine', 0.08, 0.25);
    setTimeout(() => this.playTone(700, 'sine', 0.08, 0.25), 50);
  }

  playPointSFX() {
    this.playTone(1000, 'square', 0.05, 0.2);
    setTimeout(() => this.playTone(1500, 'square', 0.08, 0.2), 60);
  }

  playRotateSFX() { this.playTone(800, 'square', 0.03, 0.12); }
}

window.nokiaAudio = new NokiaAudio();
