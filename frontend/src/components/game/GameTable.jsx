import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { PlayerSeat } from './PlayerSeat.jsx';
import { ChaalArea } from './ChaalArea.jsx';
import { PlayerHand } from './PlayerHand.jsx';
import { GameTimer } from './GameTimer.jsx';
import { GameResults } from './GameResults.jsx';
import { VoiceControls } from './VoiceControls.jsx';
import { ChaalHistoryModal } from './ChaalHistoryModal.jsx';
import { SoundToggle } from '../common/SoundToggle.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useGameStore } from '../../store/gameStore.js';
import { useSocket } from '../../hooks/useSocket.js';
import { soundManager } from '../../services/sound/soundManager.js';
import { LogOut, History, RotateCw, Pause } from 'lucide-react';

/* Fixed viewport container with exact screen lock and comfortable bottom spacing */
const TableContainer = styled.div`
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  background: ${({ theme }) => theme.colors.feltGradiant};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: max(8px, env(safe-area-inset-top, 8px)) max(8px, env(safe-area-inset-right, 8px)) max(18px, env(safe-area-inset-bottom, 18px)) max(8px, env(safe-area-inset-left, 8px));
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: max(6px, env(safe-area-inset-top, 6px)) max(6px, env(safe-area-inset-right, 6px)) max(14px, env(safe-area-inset-bottom, 14px)) max(6px, env(safe-area-inset-left, 6px));
  }
`;

/* Clean, uncongested upper navbar with responsive wrapping */
const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  z-index: 25;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 6px;
  border-radius: 12px;
  gap: 4px;
  overflow: hidden;

  @media (max-width: 500px) {
    padding: 3px 4px;
    gap: 3px;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 1;
  min-width: 0;

  @media (max-width: 500px) {
    gap: 3px;
  }
`;

const RoomBadge = styled.span`
  font-size: 11px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.goldLight};
  letter-spacing: 0.5px;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 4px 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
  }

  &.danger:hover {
    color: ${({ theme }) => theme.colors.danger};
    border-color: ${({ theme }) => theme.colors.danger};
  }

  @media (max-width: 480px) {
    padding: 3px 4px;
  }
`;

/* Dedicated opponents gallery with clean spacing and top margin */
const OpponentsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 8px;
  margin-top: 14px;
  margin-bottom: 2px;
  position: relative;
  z-index: 10;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 4px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 600px) {
    gap: 6px;
    margin-top: 10px;
    margin-bottom: 2px;
  }
`;

const CenterArena = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 110px;
  width: 100%;
`;

const PauseOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 100;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  padding: 20px;
`;

const PauseIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(229, 184, 66, 0.2);
  border: 2px solid rgba(229, 184, 66, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite ease-in-out;

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.08); opacity: 1; }
  }
`;

export function GameTable({ onLeave }) {
  const socket = useSocket();
  const { user } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [playError, setPlayError] = useState(null);
  const [isPlayingCard, setIsPlayingCard] = useState(false);
  const playingRef = useRef(false); // ref-based guard against double submission
  const playTimeoutRef = useRef(null);
  const {
    gameState,
    selectedCardId,
    setSelectedCardId,
    recentCompletedChaal,
    lastResolution,
    chaalHistory,
    isHistoryOpen,
    setIsHistoryOpen,
    donkeyAnnouncement,
    isPaused,
    pauseReason,
    resetGame
  } = useGameStore();

  // Auto-unlock "Playing..." button if socket disconnects
  useEffect(() => {
    if (!socket) return;
    const handleDisconnect = () => {
      if (playingRef.current) {
        playingRef.current = false;
        setIsPlayingCard(false);
        setPlayError('Connection lost. Try again.');
      }
    };
    socket.on('disconnect', handleDisconnect);
    return () => {
      socket.off('disconnect', handleDisconnect);
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    };
  }, [socket]);

  if (!gameState) {
    return <div style={{ color: '#fff', padding: 40 }}>Loading game table...</div>;
  }

  const {
    roomId,
    players,
    myHand,
    currentTurnId,
    currentStarterId,
    turnDeadline,
    chaal,
    isFirstChaalEver
  } = gameState;

  const myPlayerId = gameState.myPlayerId || user.id;
  const isMyTurn = currentTurnId === myPlayerId;
  const isStarter = currentTurnId === chaal.starterId && isMyTurn;
  const opponents = players.filter(p => p.id !== myPlayerId);
  const me = players.find(p => p.id === myPlayerId);

  // Map opponent seats to consistent indices for stable avatars
  const seatIndexMap = new Map();
  players.forEach((p, idx) => seatIndexMap.set(p.id, idx));

  const handlePlayCard = (cardId) => {
    if (playingRef.current || isPlayingCard) return;
    playingRef.current = true;
    setIsPlayingCard(true);
    setPlayError(null);

    // 5-second safety timeout: if the server doesn't respond, unlock the button
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    playTimeoutRef.current = setTimeout(() => {
      if (playingRef.current) {
        playingRef.current = false;
        setIsPlayingCard(false);
        setPlayError('Server timed out. Tap again to retry.');
        soundManager.playTurnWarning();
        // Re-sync game state from server
        socket.emit('request_game_state', { roomCode: roomId });
      }
    }, 5000);

    socket.emit('play_card', { roomCode: roomId, cardId, userId: myPlayerId }, (res) => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      playingRef.current = false;
      setIsPlayingCard(false);
      if (res && res.success) {
        setSelectedCardId(null);
      } else if (res && !res.success) {
        setPlayError(res.error || 'Failed to play card');
        soundManager.playTurnWarning();
        // Re-sync game state from server to resolve any desync
        socket.emit('request_game_state', { roomCode: roomId });
      }
    });
  };

  const handleManualSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    soundManager.playButtonClick();
    socket.emit('request_game_state', { roomCode: roomId });
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  const handleLeave = () => {
    socket.emit('leave_room', { roomCode: roomId });
    resetGame();
    if (onLeave) onLeave();
  };

  const handlePlayAgain = () => {
    socket.emit('start_game', { roomCode: roomId });
  };

  return (
    <TableContainer>
      {/* Upper Navigation Bar */}
      <TopBar>
        <NavLeft>
          <RoomBadge>{roomId}</RoomBadge>
          <VoiceControls
            socket={socket}
            roomCode={roomId}
            players={players}
            myUserId={myPlayerId}
            compact={true}
          />
        </NavLeft>

        <GameTimer deadline={turnDeadline} isMyTurn={isMyTurn} />

        <NavRight>
          {/* In-game quick sync / refresh button (zero page reload, seamless socket state fetch) */}
          <IconButton onClick={handleManualSync} title="Sync cards / Refresh Chaal">
            <RotateCw size={12} className={isSyncing ? 'animate-spin' : ''} />
          </IconButton>

          <SoundToggle compact={true} />
          <IconButton onClick={() => setIsHistoryOpen(true)} title="View Chaal History">
            <History size={12} />
          </IconButton>
          <IconButton className="danger" onClick={handleLeave} title="Leave Game">
            <LogOut size={12} />
          </IconButton>
        </NavRight>
      </TopBar>

      {/* Opponents Row with Distinct Avatars and Online Status */}
      <OpponentsRow>
        {opponents.map(opp => (
          <PlayerSeat
            key={opp.id}
            player={opp}
            isTurn={currentTurnId === opp.id}
            isStarter={currentStarterId === opp.id}
            seatIndex={seatIndexMap.get(opp.id) || 0}
          />
        ))}
      </OpponentsRow>

      {/* Center Table Area with Completed Chaal Preview */}
      <CenterArena>
        <ChaalArea
          chaal={chaal}
          players={players}
          recentCompletedChaal={recentCompletedChaal}
          lastResolution={lastResolution}
        />
      </CenterArena>

      {/* Player's Hand - Pure Grid View */}
      <PlayerHand
        hand={myHand}
        selectedCardId={selectedCardId}
        onSelectCard={setSelectedCardId}
        onPlayCard={handlePlayCard}
        isMyTurn={isMyTurn}
        isFirstChaalEver={isFirstChaalEver}
        isStarter={isStarter}
        startingSuit={chaal.startingSuit}
        isPlaying={isPlayingCard}
        playError={playError}
      />

      {/* Chaal History Modal */}
      <ChaalHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={chaalHistory}
        players={players}
      />

      {/* Donkey Game Over Modal */}
      {donkeyAnnouncement && (
        <GameResults
          donkeyPlayer={donkeyAnnouncement.donkeyPlayer}
          isHost={me?.isHost}
          onPlayAgain={handlePlayAgain}
          onLeave={handleLeave}
        />
      )}

      {/* Game Paused Overlay */}
      {isPaused && (
        <PauseOverlay>
          <PauseIcon>
            <Pause size={28} color="#e5b842" />
          </PauseIcon>
          <div>{pauseReason || 'Game is paused — waiting for player to reconnect...'}</div>
          <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>
            The match will resume automatically once the player returns.
          </div>
        </PauseOverlay>
      )}
    </TableContainer>
  );
}
