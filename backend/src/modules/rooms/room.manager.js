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

    // Reconnection to active game or lobby
    const existingPlayer = room.players.find(p => p.id === user.id);
    if (existingPlayer) {
      existingPlayer.connected = true;
      existingPlayer.socketId = user.socketId;
      if (user.username) {
        existingPlayer.username = user.username;
      }
      this.userToRoom.set(user.id, room.id);

      // If rejoining an active game, update game engine representation
      if (room.gameEngine) {
        const enginePlayer = room.gameEngine.players.find(p => p.id === user.id);
        if (enginePlayer) {
          enginePlayer.connected = true;
          enginePlayer.socketId = user.socketId;
        }
      }

      return { success: true, room, reconnected: true };
    }

    if (room.status !== GAME_STATUS.WAITING) {
      return { success: false, error: 'Game has already started in this room.' };
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
    player.connected = true; // marking ready confirms player is connected
    return room;
  }

  canStartGame(roomCode, hostUserId) {
    const room = this.getRoom(roomCode);
    if (!room) return { canStart: false, error: 'Room not found.' };
    if (room.hostId !== hostUserId) return { canStart: false, error: 'Only the room host can start the game.' };
    if (room.status !== GAME_STATUS.WAITING) return { canStart: false, error: 'Game is already active.' };
    if (room.players.length < room.minPlayers) {
      return { canStart: false, error: `Minimum ${room.minPlayers} players required to play Make Donkey (currently ${room.players.length}).` };
    }

    // Identify which players are not ready or disconnected
    const unreadyPlayers = room.players.filter(p => !p.ready);
    if (unreadyPlayers.length > 0) {
      const names = unreadyPlayers.map(p => p.username).join(', ');
      return { canStart: false, error: `Waiting for: ${names} to mark Ready.` };
    }

    return { canStart: true };
  }

  startGame(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    room.status = GAME_STATUS.PLAYING;
    // Ensure all players are marked connected upon game start
    room.players.forEach(p => { p.connected = true; });
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
    if (wasHost || room.hostId === userId) {
      const nextHost = room.players.find(p => p.connected) || room.players[0];
      if (nextHost) {
        room.players.forEach(p => { p.isHost = (p.id === nextHost.id); });
        nextHost.isHost = true;
        nextHost.ready = true;
        room.hostId = nextHost.id;
        if (room.gameEngine && room.gameEngine.players) {
          room.gameEngine.players.forEach(p => { p.isHost = (p.id === nextHost.id); });
        }
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
