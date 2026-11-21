import { create } from 'zustand';

export const useGameStore = create((set) => ({
  gameState: null,
  selectedCardId: null,
  lastPlayedCard: null,
  lastResolution: null,
  winnerAnnouncement: null,
  donkeyAnnouncement: null,
  isPaused: false,
  pauseReason: null,

  setGameState: (state) => set({
    gameState: state,
    isPaused: state?.paused || false
  }),

  setSelectedCardId: (id) => set({ selectedCardId: id }),

  setLastPlayedCard: (record) => set({ lastPlayedCard: record }),

  setLastResolution: (resolution) => set({ lastResolution: resolution }),

  setWinnerAnnouncement: (data) => set({ winnerAnnouncement: data }),

  setDonkeyAnnouncement: (data) => set({ donkeyAnnouncement: data }),

  setGamePaused: (paused, reason = null) => set({ isPaused: paused, pauseReason: reason }),

  resetGame: () => set({
    gameState: null,
    selectedCardId: null,
    lastPlayedCard: null,
    lastResolution: null,
    winnerAnnouncement: null,
    donkeyAnnouncement: null,
    isPaused: false
  })
}));
