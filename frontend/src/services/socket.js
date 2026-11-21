import { io } from 'socket.io-client';

// Ensure local development always talks to localhost:5000 directly
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (!isLocal ? 'https://make-donkey-backend.onrender.com' : 'http://localhost:5000');

class SocketService {
  constructor() {
    this.socket = null;
    this.hasListeners = false;
  }

  connect(user, token = null) {
    if (this.socket) {
      if (user && this.socket.auth) {
        this.socket.auth.guestUser = user;
      }
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
        guestUser: user
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to Make Donkey game server:', this.socket.id);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
