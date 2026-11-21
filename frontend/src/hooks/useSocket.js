import { useEffect } from 'react';
import { socketService } from '../services/socket.js';
import { useAuthStore } from '../store/authStore.js';
import { useRoomStore } from '../store/roomStore.js';
import { useGameStore } from '../store/gameStore.js';
import { soundManager } from '../services/sound/soundManager.js';

export function useSocket() {
  const { user, token } = useAuthStore();
  const { setRoom } = useRoomStore();
  const {
    setGameState,
    setLastPlayedCard,
    setLastResolution,
    setDonkeyAnnouncement,
    setGamePaused,
    resetGame
  } = useGameStore();

  useEffect(() => {
    const socket = socketService.connect(user, token);

    if (socketService.hasListeners) {
      return;
    }
    socketService.hasListeners = true;

    socket.on('room_created', (room) => setRoom(room));
    socket.on('room_updated', (room) => setRoom(room));

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

    socket.on('game_cancelled', (data) => {
      alert(`Game cancelled: ${data.reason}`);
      resetGame();
    });

    socket.on('game_finished', (data) => {
      setDonkeyAnnouncement(data);
      soundManager.playDonkeyDeclared();
    });

    return () => {
      // Keep socket connected across routes
    };
  }, [user, token]);

  return socketService.getSocket();
}
