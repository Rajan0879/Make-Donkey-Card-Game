import { create } from 'zustand';

const storedRoom = (() => {
  try {
    const raw = localStorage.getItem('donkey_room');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
})();

export const useRoomStore = create((set) => ({
  room: storedRoom,
  error: null,

  setRoom: (room) => {
    try {
      if (room) {
        localStorage.setItem('donkey_room', JSON.stringify(room));
      } else {
        localStorage.removeItem('donkey_room');
      }
    } catch (e) {}
    set({ room, error: null });
  },

  setError: (error) => set({ error }),

  clearRoom: () => {
    try {
      localStorage.removeItem('donkey_room');
    } catch (e) {}
    set({ room: null, error: null });
  }
}));
