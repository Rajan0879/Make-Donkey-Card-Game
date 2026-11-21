import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  gameState: null,
  selectedCardId: null,
  lastPlayedCard: null,
  lastResolution: null,
  recentCompletedChaal: null, // Holds last completed Chaal for 4-second preview
  chaalHistory: [],           // Stores all completed Chaals for the history view modal
  isHistoryOpen: false,       // Modal open/close state
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

  setLastResolution: (resolution, completedChaal) => {
    const historyItem = {
      id: Date.now(),
      resolution,
      chaal: completedChaal || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    set((state) => ({
      lastResolution: resolution,
      recentCompletedChaal: completedChaal || null,
      chaalHistory: [historyItem, ...state.chaalHistory]
    }));

    // Auto clear the 5-second overlay preview
    setTimeout(() => {
      set({ recentCompletedChaal: null });
    }, 5000);
  },

  setIsHistoryOpen: (isOpen) => set({ isHistoryOpen: isOpen }),

  setWinnerAnnouncement: (data) => set({ winnerAnnouncement: data }),

  setDonkeyAnnouncement: (data) => set({ donkeyAnnouncement: data }),

  setGamePaused: (paused, reason = null) => set({ isPaused: paused, pauseReason: reason }),

  resetGame: () => set({
    gameState: null,
    selectedCardId: null,
    lastPlayedCard: null,
    lastResolution: null,
    recentCompletedChaal: null,
    chaalHistory: [],
    isHistoryOpen: false,
    winnerAnnouncement: null,
    donkeyAnnouncement: null,
    isPaused: false
  })
}));
