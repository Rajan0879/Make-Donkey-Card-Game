import { ROOM_LIMITS, GAME_STATUS } from '../game/game.constants.js';
import { GameEngine } from '../game/game.engine.js';
import { generateRoomCode } from '../../utils/generateRoomCode.js';

export class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
    this.userToRoom = new Map(); // userId -> roomId
  }

  createRoom(user) {
    // Generate unique 6-character room code
    let roomCode = generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const hostPlayer = {
      id: user.id,
      username: user.username,
      avatar: user.avatar || null,
      isHost: true,
      ready: true, // host is ready by default
      connected: true,
      socketId: user.socketId
    };

    const room = {
      id: roomCode,
      code: roomCode,
      hostId: user.id,
      status: GAME_STATUS.WAITING,
      players: [hostPlayer],
      minPlayers: ROOM_LIMITS.MIN_PLAYERS,
      maxPlayers: ROOM_LIMITS.MAX_PLAYERS,
      gameEngine: null,
      turnTimer: null,
      disconnectTimers: new Map(), // userId -> timer
      createdAt: Date.now()
    };

    this.rooms.set(roomCode, room);
    this.userToRoom.set(user.id, roomCode);

    return room;
  }

  getRoom(roomCode) {
    if (!roomCode) return null;
    return this.rooms.get(roomCode.toUpperCase().trim()) || null;
  }

  getRoomByUser(userId) {
    const code = this.userToRoom.get(userId);
    return code ? this.getRoom(code) : null;
  }

  joinRoom(roomCode, user) {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { success: false, error: 'Room not found.' };
    }

    if (room.status !== GAME_STATUS.WAITING) {
      return { success: false, error: 'Game has already started in this room.' };
    }

    const existingPlayer = room.players.find(p => p.id === user.id);
    if (existingPlayer) {
      existingPlayer.connected = true;
      existingPlayer.socketId = user.socketId;
      return { success: true, room, reconnected: true };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: 'Room is full (maximum 6 players).' };
    }

    const newPlayer = {
      id: user.id,
      username: user.username,
      avatar: user.avatar || null,
      isHost: false,
      ready: false,
      connected: true,
      socketId: user.socketId
    };

    room.players.push(newPlayer);
    this.userToRoom.set(user.id, room.id);

    return { success: true, room };
  }

  setPlayerReady(roomCode, userId, ready) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== GAME_STATUS.WAITING) return null;

    const player = room.players.find(p => p.id === userId);
    if (!player) return null;

    player.ready = Boolean(ready);
    return room;
  }

  canStartGame(roomCode, hostUserId) {
    const room = this.getRoom(roomCode);
    if (!room) return { canStart: false, error: 'Room not found.' };
    if (room.hostId !== hostUserId) return { canStart: false, error: 'Only the room host can start the game.' };
    if (room.status !== GAME_STATUS.WAITING) return { canStart: false, error: 'Game is already active.' };
    if (room.players.length < room.minPlayers) {
      return { canStart: false, error: `Minimum ${room.minPlayers} players required to play Make Donkey.` };
    }
    const hasDisconnected = room.players.some(p => !p.connected);
    if (hasDisconnected) {
      return { canStart: false, error: 'Cannot start while some players are disconnected.' };
    }
    const allReady = room.players.every(p => p.ready);
    if (!allReady) {
      return { canStart: false, error: 'All players must mark themselves Ready before starting.' };
    }

    return { canStart: true };
  }

  startGame(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    room.status = GAME_STATUS.PLAYING;
    room.gameEngine = new GameEngine(room.id, room.players);
    return room;
  }

  removePlayer(roomCode, userId) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    this.userToRoom.delete(userId);

    const playerIndex = room.players.findIndex(p => p.id === userId);
    if (playerIndex === -1) return room;

    const wasHost = room.players[playerIndex].isHost;
    room.players.splice(playerIndex, 1);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.clearRoomTimers(room);
      this.rooms.delete(room.id);
      return null;
    }

    // If host left, transfer host privileges to remaining connected player
    if (wasHost) {
      const nextHost = room.players.find(p => p.connected) || room.players[0];
      if (nextHost) {
        nextHost.isHost = true;
        room.hostId = nextHost.id;
      }
    }

    return room;
  }

  clearRoomTimers(room) {
    if (room.turnTimer) {
      clearTimeout(room.turnTimer);
      room.turnTimer = null;
    }
    for (const [, timer] of room.disconnectTimers) {
      clearTimeout(timer);
    }
    room.disconnectTimers.clear();
  }
}

export const roomManager = new RoomManager();
