import { roomManager } from '../modules/rooms/room.manager.js';
import { serializeGameStateForPlayer } from '../modules/game/game.serializer.js';
import { saveCompletedMatch } from '../services/history.service.js';
import { ROOM_LIMITS, GAME_STATUS } from '../modules/game/game.constants.js';
import { logger } from '../utils/logger.js';

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    const user = socket.user;
    logger.info({ userId: user.id, socketId: socket.id }, 'Player connected via Socket.IO');

    // Helper: update socket ID mapping when user connects/reconnects
    const updatePlayerSocketId = (room) => {
      if (!room) return;
      const player = room.players.find(p => p.id === user.id);
      if (player) {
        player.socketId = socket.id;
        player.connected = true;
      }
      if (room.gameEngine) {
        const enginePlayer = room.gameEngine.players.find(p => p.id === user.id);
        if (enginePlayer) {
          enginePlayer.socketId = socket.id;
          enginePlayer.connected = true;
        }
      }
    };

    // Helper: broadcast private hands to all players in a room
    const broadcastPrivateGameState = (room) => {
      if (!room || !room.gameEngine) return;
      for (const player of room.players) {
        if (player.socketId) {
          const privateState = serializeGameStateForPlayer(room.gameEngine, player.id);
          io.to(player.socketId).emit('game_state_updated', privateState);
        }
      }
    };

    // Helper: start server authoritative turn timer
    const startTurnTimer = (room) => {
      if (room.turnTimer) {
        clearTimeout(room.turnTimer);
        room.turnTimer = null;
      }

      if (!room.gameEngine || room.gameEngine.status !== GAME_STATUS.PLAYING || room.gameEngine.paused) {
        return;
      }

      const durationMs = Math.max(500, room.gameEngine.turnDeadline - Date.now());

      room.turnTimer = setTimeout(() => {
        logger.info({ roomId: room.id, turnPlayerId: room.gameEngine.currentTurnId }, 'Turn timed out on server');
        const timeoutResult = room.gameEngine.processTurnTimeout();

        io.to(room.id).emit('turn_timed_out', timeoutResult);

        if (timeoutResult.resolution) {
          io.to(room.id).emit('chaal_resolved', {
            resolution: timeoutResult.resolution,
            currentStarterId: room.gameEngine.currentStarterId,
            completedChaal: { ...room.gameEngine.chaal }
          });
        }

        if (room.gameEngine.status === GAME_STATUS.FINISHED) {
          handleGameOver(room);
        } else {
          broadcastPrivateGameState(room);
          startTurnTimer(room);
        }
      }, durationMs);
    };

    const handleGameOver = async (room) => {
      room.status = GAME_STATUS.FINISHED;
      if (room.turnTimer) {
        clearTimeout(room.turnTimer);
        room.turnTimer = null;
      }

      const donkeyId = room.gameEngine.donkeyId;
      const donkeyPlayer = room.players.find(p => p.id === donkeyId);

      logger.info({ roomId: room.id, donkeyId }, 'Game finished! Donkey declared.');

      io.to(room.id).emit('game_finished', {
        donkeyId,
        donkeyPlayer,
        winners: room.gameEngine.winners
      });

      broadcastPrivateGameState(room);

      // Save match to history
      await saveCompletedMatch({
        roomId: room.id,
        players: room.players,
        donkeyId
      });
    };

    // 0. HEARTBEAT / PING (Keeps mobile WebSockets warm)
    socket.on('heartbeat', (data) => {
      if (data?.roomCode) {
        const room = roomManager.getRoom(data.roomCode);
        if (room) {
          updatePlayerSocketId(room);
        }
      }
      socket.emit('heartbeat_ack', { timestamp: Date.now() });
    });

    // 1. CREATE ROOM
    socket.on('create_room', (data, callback) => {
      try {
        if (data && data.username) {
          user.username = data.username.trim();
        }
        const room = roomManager.createRoom(user);
        socket.join(room.id);
        logger.info({ roomId: room.id, hostId: user.id, username: user.username }, 'Room created');

        if (typeof callback === 'function') {
          callback({ success: true, room });
        }
        socket.emit('room_created', room);
      } catch (err) {
        logger.error({ err }, 'Error creating room');
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 2. JOIN ROOM (Handles new joins and mobile reconnects)
    socket.on('join_room', ({ roomCode, username }, callback) => {
      try {
        if (username) {
          user.username = username.trim();
        }
        const result = roomManager.joinRoom(roomCode, user);
        if (!result.success) {
          if (typeof callback === 'function') callback(result);
          socket.emit('error', { message: result.error });
          return;
        }

        const room = result.room;
        socket.join(room.id);
        updatePlayerSocketId(room);

        // Cancel any pending disconnect cancellation timer for this user
        if (room.disconnectTimers.has(user.id)) {
          clearTimeout(room.disconnectTimers.get(user.id));
          room.disconnectTimers.delete(user.id);
        }

        // If game was paused waiting for this user, resume
        if (room.gameEngine && room.gameEngine.paused && room.disconnectTimers.size === 0) {
          room.gameEngine.resumeGame();
          io.to(room.id).emit('game_resumed');
          startTurnTimer(room);
        }

        logger.info({ roomId: room.id, userId: user.id, username: user.username, reconnected: result.reconnected }, 'Player joined/reconnected to room');

        if (typeof callback === 'function') {
          callback({ success: true, room, isGamePlaying: room.status === GAME_STATUS.PLAYING });
        }

        io.to(room.id).emit('room_updated', room);
        io.to(room.id).emit('player_joined', { player: user, room });

        // If game is in progress, immediately deliver their current hand
        if (room.gameEngine) {
          const privateState = serializeGameStateForPlayer(room.gameEngine, user.id);
          socket.emit('game_state_updated', privateState);
        }
      } catch (err) {
        logger.error({ err }, 'Error joining room');
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 3. READY / NOT READY
    socket.on('player_ready', ({ roomCode, ready }, callback) => {
      const room = roomManager.setPlayerReady(roomCode, user.id, ready);
      if (!room) {
        if (typeof callback === 'function') callback({ success: false, error: 'Room not found or in-game' });
        return;
      }
      updatePlayerSocketId(room);

      io.to(room.id).emit('room_updated', room);
      io.to(room.id).emit('player_ready_updated', { userId: user.id, ready });
      if (typeof callback === 'function') callback({ success: true, room });
    });

    // 4. START GAME
    socket.on('start_game', ({ roomCode }, callback) => {
      const check = roomManager.canStartGame(roomCode, user.id);
      if (!check.canStart) {
        if (typeof callback === 'function') callback({ success: false, error: check.error });
        socket.emit('error', { message: check.error });
        return;
      }

      const room = roomManager.startGame(roomCode);
      logger.info({ roomId: room.id }, 'Game started! Cards distributed.');

      io.to(room.id).emit('game_started', {
        roomId: room.id,
        starterId: room.gameEngine.currentStarterId
      });

      broadcastPrivateGameState(room);
      startTurnTimer(room);

      if (typeof callback === 'function') callback({ success: true });
    });

    // 5. PLAY CARD
    socket.on('play_card', ({ roomCode, cardId }, callback) => {
      const room = roomManager.getRoom(roomCode);
      if (!room || !room.gameEngine) {
        if (typeof callback === 'function') callback({ success: false, error: 'Active game not found' });
        return;
      }
      updatePlayerSocketId(room);

      const result = room.gameEngine.playCard(user.id, cardId);
      if (!result.success) {
        if (typeof callback === 'function') callback(result);
        socket.emit('error', { message: result.error });
        return;
      }

      // Notify entire room channel about the card play so all phones see it immediately
      io.to(room.id).emit('card_played', {
        playerId: user.id,
        playRecord: result.playRecord
      });

      if (result.chaalEnded) {
        io.to(room.id).emit('chaal_resolved', {
          resolution: result.resolution,
          currentStarterId: room.gameEngine.currentStarterId,
          completedChaal: result.completedChaalSnapshot
        });

        if (result.resolution.isGameOver) {
          handleGameOver(room);
          if (typeof callback === 'function') callback({ success: true, gameOver: true });
          return;
        }
      }

      broadcastPrivateGameState(room);
      startTurnTimer(room);

      if (typeof callback === 'function') callback({ success: true });
    });

    // 6. REQUEST GAME STATE (On Screen Unlock, Reconnection, or Tab Focus)
    socket.on('request_game_state', ({ roomCode }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      socket.join(room.id);
      updatePlayerSocketId(room);

      // Cancel disconnect grace if player was marked away
      if (room.disconnectTimers.has(user.id)) {
        clearTimeout(room.disconnectTimers.get(user.id));
        room.disconnectTimers.delete(user.id);
      }

      if (room.gameEngine) {
        const privateState = serializeGameStateForPlayer(room.gameEngine, user.id);
        socket.emit('game_state_updated', privateState);
      } else {
        socket.emit('room_updated', room);
      }
    });

    // 7. LEAVE ROOM (Intentional)
    socket.on('leave_room', ({ roomCode }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const player = room.players.find(p => p.id === user.id);
      const isHost = player?.isHost;

      if (room.status === GAME_STATUS.PLAYING) {
        if (isHost) {
          roomManager.removePlayer(room.id, user.id);
          socket.leave(room.id);
          io.to(room.id).emit('host_changed', { newHostId: room.hostId });
          io.to(room.id).emit('player_left', { userId: user.id });
          broadcastPrivateGameState(room);
        } else {
          room.gameEngine.cancelGame();
          roomManager.clearRoomTimers(room);
          room.status = GAME_STATUS.CANCELLED;
          io.to(room.id).emit('game_cancelled', { reason: `${user.username} left the game.` });
          roomManager.removePlayer(room.id, user.id);
          socket.leave(room.id);
          io.to(room.id).emit('room_updated', room);
        }
      } else {
        const updated = roomManager.removePlayer(room.id, user.id);
        socket.leave(room.id);
        if (updated) {
          io.to(updated.id).emit('player_left', { userId: user.id });
          io.to(updated.id).emit('room_updated', updated);
        }
      }
    });

    // 7.1 KICK / REMOVE PLAYER (Host Privilege in Lobby)
    socket.on('kick_player', ({ roomCode, targetUserId }, callback) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        if (typeof callback === 'function') callback({ success: false, error: 'Room not found' });
        return;
      }

      // Verify request is from room host
      if (room.hostId !== user.id) {
        if (typeof callback === 'function') callback({ success: false, error: 'Only the room host can remove players' });
        return;
      }

      if (room.status !== GAME_STATUS.WAITING) {
        if (typeof callback === 'function') callback({ success: false, error: 'Cannot remove players once game has started' });
        return;
      }

      if (targetUserId === user.id) {
        if (typeof callback === 'function') callback({ success: false, error: 'Host cannot kick themselves' });
        return;
      }

      const targetPlayer = room.players.find(p => p.id === targetUserId);
      if (!targetPlayer) {
        if (typeof callback === 'function') callback({ success: false, error: 'Player not found in room' });
        return;
      }

      // Remove target from room
      const updated = roomManager.removePlayer(room.id, targetUserId);

      // Notify the kicked player specifically
      if (targetPlayer.socketId) {
        io.to(targetPlayer.socketId).emit('player_kicked', {
          reason: 'You were removed from the room by the host.'
        });
      }

      // Notify remaining room members
      io.to(room.id).emit('player_left', { userId: targetUserId, username: targetPlayer.username });
      if (updated) {
        io.to(room.id).emit('room_updated', updated);
      }

      if (typeof callback === 'function') callback({ success: true });
    });

    // 8. VOICE CHAT SIGNALING (WebRTC Mesh)
    socket.on('voice_signal', ({ toSocketId, signal }) => {
      io.to(toSocketId).emit('voice_signal', {
        fromSocketId: socket.id,
        fromUserId: user.id,
        signal
      });
    });

    socket.on('voice_status', ({ roomCode, isMuted }) => {
      io.to(roomCode).emit('player_voice_status', {
        userId: user.id,
        isMuted
      });
    });

    // 9. DISCONNECT (Mobile screen lock or temporary drop)
    socket.on('disconnect', () => {
      const room = roomManager.getRoomByUser(user.id);
      if (!room) return;

      const player = room.players.find(p => p.id === user.id);
      if (player) {
        player.connected = false;
        // CRITICAL FIX: DO NOT wipe player.ready on momentary disconnect!
      }

      logger.info({ userId: user.id, roomId: room.id }, 'Player disconnected');

      if (room.status === GAME_STATUS.PLAYING && room.gameEngine) {
        room.gameEngine.pauseGame();
        if (room.turnTimer) {
          clearTimeout(room.turnTimer);
          room.turnTimer = null;
        }

        io.to(room.id).emit('game_paused', {
          disconnectedPlayerId: user.id,
          graceSeconds: ROOM_LIMITS.RECONNECT_GRACE_SECONDS
        });
        broadcastPrivateGameState(room);

        // Schedule 60-second grace cancellation
        const graceTimer = setTimeout(() => {
          if (!player.connected && room.status === GAME_STATUS.PLAYING) {
            logger.info({ roomId: room.id, userId: user.id }, 'Reconnect grace period expired. Cancelling game.');
            room.gameEngine.cancelGame();
            room.status = GAME_STATUS.CANCELLED;
            io.to(room.id).emit('game_cancelled', {
              reason: `${user.username} failed to reconnect within 60 seconds.`
            });
          }
        }, ROOM_LIMITS.RECONNECT_GRACE_SECONDS * 1000);

        room.disconnectTimers.set(user.id, graceTimer);
      } else {
        io.to(room.id).emit('room_updated', room);
      }
    });
  });
}
