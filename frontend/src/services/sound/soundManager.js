/**
 * Sound Manager for Make Donkey.
 * Uses Web Audio API synthesizers as resilient, instant, dependency-free audio fallbacks,
 * ensuring rich audio feedback even if static MP3 assets are offline or blocked.
 */
class SoundService {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.volume = 0.7;

    // Load user preferences from localStorage
    try {
      const saved = localStorage.getItem('donkey_sound_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.soundEnabled = parsed.soundEnabled ?? true;
        this.volume = parsed.volume ?? 0.7;
      }
    } catch (e) {
      // ignore
    }
  }

  _initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playBeep(freq = 440, type = 'sine', duration = 0.1, gainVal = 0.2) {
    if (!this.soundEnabled) return;
    try {
      this._initCtx();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal * this.volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (err) {
      // ignore audio errors
    }
  }

  // Synthesized Game Sound Effects
  playButtonClick() {
    this.playBeep(600, 'sine', 0.05, 0.15);
  }

  playCardSelect() {
    this.playBeep(880, 'sine', 0.08, 0.2);
  }

  playCardPlay() {
    this.playBeep(320, 'triangle', 0.12, 0.25);
  }

  playTurnWarning() {
    this.playBeep(440, 'square', 0.15, 0.3);
  }

  playChaalResolved() {
    this.playBeep(523.25, 'sine', 0.1, 0.2);
    setTimeout(() => this.playBeep(659.25, 'sine', 0.15, 0.2), 100);
  }

  playPlayerWon() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 'triangle', 0.2, 0.3), i * 120);
    });
  }

  playDonkeyDeclared() {
    const notes = [400, 350, 300, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 'sawtooth', 0.3, 0.35), i * 150);
    });
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    this._save();
  }

  setVolume(vol) {
    this.volume = vol;
    this._save();
  }

  _save() {
    try {
      localStorage.setItem('donkey_sound_settings', JSON.stringify({
        soundEnabled: this.soundEnabled,
        volume: this.volume
      }));
    } catch (e) {}
  }
}

export const soundManager = new SoundService();
