import { create } from 'zustand';

export const useRoomStore = create((set) => ({
  room: null,
  error: null,

  setRoom: (room) => set({ room, error: null }),
  setError: (error) => set({ error }),
  clearRoom: () => set({ room: null, error: null })
}));
