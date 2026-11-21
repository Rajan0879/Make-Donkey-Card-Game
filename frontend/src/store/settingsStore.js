import { create } from 'zustand';
import { soundManager } from '../services/sound/soundManager.js';

export const useSettingsStore = create((set) => ({
  soundEnabled: soundManager.soundEnabled,
  volume: soundManager.volume,

  toggleSound: () => {
    const next = !soundManager.soundEnabled;
    soundManager.setSoundEnabled(next);
    set({ soundEnabled: next });
  },

  setVolume: (val) => {
    soundManager.setVolume(val);
    set({ volume: val });
  }
}));
