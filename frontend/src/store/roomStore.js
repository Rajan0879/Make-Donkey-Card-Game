import { create } from 'zustand';

const ROOM_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes

const storedRoom = (() => {
  try {
    const raw = localStorage.getItem('donkey_room');
    if (!raw) return null;
    const savedAt = localStorage.getItem('donkey_room_saved_at');
    // If the room was cached over 15 minutes ago, consider it expired
    if (savedAt && Date.now() - Number(savedAt) > ROOM_MAX_AGE_MS) {
      localStorage.removeItem('donkey_room');
      localStorage.removeItem('donkey_room_saved_at');
      return null;
    }
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
})();

let lastLeaveTime = 0;

export const useRoomStore = create((set, get) => ({
  room: storedRoom,
  error: null,

  setRoom: (room) => {
    if (!room) {
      get().clearRoom();
      return;
    }
    // Prevent in-flight join callbacks or reconnect events from resurrecting room if intentionally left
    if (Date.now() - lastLeaveTime < 3000) {
      return;
    }
    try {
      localStorage.setItem('donkey_room', JSON.stringify(room));
      localStorage.setItem('donkey_room_saved_at', String(Date.now()));
    } catch (e) {}
    set({ room, error: null });
  },

  setError: (error) => set({ error }),

  clearRoom: () => {
    lastLeaveTime = Date.now();
    try {
      localStorage.removeItem('donkey_room');
      localStorage.removeItem('donkey_room_saved_at');
    } catch (e) {}
    set({ room: null, error: null });
  }
}));
