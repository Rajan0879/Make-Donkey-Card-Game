import { useEffect, useRef } from 'react';
import { socketService } from '../services/socket.js';
import { useAuthStore } from '../store/authStore.js';
import { useRoomStore } from '../store/roomStore.js';
import { useGameStore } from '../store/gameStore.js';
import { soundManager } from '../services/sound/soundManager.js';

export function useSocket() {
  const { user, token } = useAuthStore();
  const { room, setRoom, setError } = useRoomStore();
  const {
    gameState,
    setGameState,
    setLastPlayedCard,
    setLastResolution,
    setDonkeyAnnouncement,
    setGamePaused,
    resetGame
  } = useGameStore();

  const roomRef = useRef(room);
  roomRef.current = room;

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  useEffect(() => {
    const socket = socketService.connect(user, token);

    // Function to re-sync state on tab focus or reconnect
    const requestSync = () => {
      const currentRoomCode = roomRef.current?.code || roomRef.current?.id;
      if (currentRoomCode && socket.connected) {
        socket.emit('request_game_state', { roomCode: currentRoomCode });
      }
    };

    if (!socketService.hasListeners) {
      socketService.hasListeners = true;

      socket.on('connect', () => {
        // Automatically rejoin room if user was already in a room
        const storedCode = roomRef.current?.code || roomRef.current?.id;
        if (storedCode && user) {
          socket.emit('join_room', { roomCode: storedCode, username: user.username }, (res) => {
            if (res && res.success) {
              setRoom(res.room);
              requestSync();
            } else if (res && !res.success) {
              // Room was closed or player removed while offline
              setRoom(null);
              resetGame();
              window.history.pushState(null, '', '/');
            }
          });
        }
      });

      socket.on('room_created', (r) => setRoom(r));
      socket.on('room_updated', (r) => setRoom(r));

      socket.on('host_changed', ({ newHostId }) => {
        const currentRoom = roomRef.current;
        if (currentRoom) {
          const updatedPlayers = (currentRoom.players || []).map(p => ({
            ...p,
            isHost: p.id === newHostId,
            ready: p.id === newHostId ? true : p.ready
          }));
          setRoom({
            ...currentRoom,
            hostId: newHostId,
            players: updatedPlayers
          });
        }
      });

      socket.on('game_started', () => {
        soundManager.playButtonClick();
      });

      socket.on('game_state_updated', (state) => {
        setGameState(state);
      });

      socket.on('card_played', (data) => {
        setLastPlayedCard(data.playRecord);
        soundManager.playCardPlay();
      });

      socket.on('chaal_resolved', (data) => {
        setLastResolution(data.resolution, data.completedChaal);
        soundManager.playChaalResolved();
      });

      socket.on('turn_timed_out', () => {
        soundManager.playTurnWarning();
      });

      socket.on('game_paused', (data) => {
        setGamePaused(true, `A player disconnected. Paused for ${data.graceSeconds}s`);
      });

      socket.on('game_resumed', () => {
        setGamePaused(false, null);
      });

      socket.on('game_cancelled', (data) => {
        soundManager.playTurnWarning();
        if (setError) setError(`Game cancelled: ${data.reason}`);
        resetGame();
      });

      socket.on('player_kicked', (data) => {
        soundManager.playTurnWarning();
        if (setError) setError(data.reason || 'You were removed from the room by the host.');
        setRoom(null);
        resetGame();
        window.history.pushState(null, '', '/');
      });

      socket.on('game_finished', (data) => {
        setDonkeyAnnouncement(data);
        soundManager.playDonkeyDeclared();
      });
    }

    // Auto-sync on screen wake up or tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentRoomCode = roomRef.current?.code || roomRef.current?.id;
        if (currentRoomCode) {
          if (socket.connected) {
            socket.emit('join_room', { roomCode: currentRoomCode, username: user?.username }, (res) => {
              if (res && res.success) {
                setRoom(res.room);
                requestSync();
              } else if (res && !res.success) {
                setRoom(null);
                resetGame();
                window.history.pushState(null, '', '/');
              }
            });
          } else {
            socket.connect();
          }
        }
      }
    };

    const handleWindowFocus = () => {
      requestSync();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [user, token, setRoom, setGameState, setLastPlayedCard, setLastResolution, setDonkeyAnnouncement, setGamePaused, resetGame]);

  return socketService.getSocket();
}
