import { create } from 'zustand';

// Generate consistent local user profile if not signed in via Firebase
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('donkey_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
})();

const defaultUser = (() => {
  if (storedUser) return storedUser;
  const user = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    username: 'Player_' + Math.floor(1000 + Math.random() * 9000),
    avatar: null,
    isGuest: true
  };
  try {
    localStorage.setItem('donkey_user', JSON.stringify(user));
  } catch (e) {}
  return user;
})();

export const useAuthStore = create((set) => ({
  user: defaultUser,
  token: null,
  isAuthenticated: true,

  setUser: (user) => {
    try {
      localStorage.setItem('donkey_user', JSON.stringify(user));
    } catch (e) {}
    set({ user, isAuthenticated: !!user });
  },

  setUsername: (name) => {
    set((state) => {
      const updated = { ...state.user, username: name };
      try {
        localStorage.setItem('donkey_user', JSON.stringify(updated));
      } catch (e) {}
      return { user: updated };
    });
  },

  setToken: (token) => set({ token })
}));
