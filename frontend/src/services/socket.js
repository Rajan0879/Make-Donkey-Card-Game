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
    this.heartbeatTimer = null;
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
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('Connected to Make Donkey game server:', this.socket.id);
      this._startHeartbeat();
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this._stopHeartbeat();
    });

    return this.socket;
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.connected) {
        let roomCode = null;
        try {
          const raw = localStorage.getItem('donkey_room');
          if (raw) roomCode = JSON.parse(raw)?.code;
        } catch (e) {}
        this.socket.emit('heartbeat', { roomCode, timestamp: Date.now() });
      }
    }, 20000); // Send heartbeat every 20s to prevent mobile proxy sleep
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    this._stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
