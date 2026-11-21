import React from 'react';
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
import { LogOut, History, RotateCw } from 'lucide-react';

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
  padding: 8px 10px 24px 10px; margin-bottom: 12px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 6px 8px 20px 8px; margin-bottom: 12px;
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
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 5px 8px;
  gap: 6px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    padding: 4px 6px;
    gap: 4px;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
`;

const RoomBadge = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.goldLight};
  letter-spacing: 0.5px;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 4px 7px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
  }

  &.danger:hover {
    color: ${({ theme }) => theme.colors.danger};
    border-color: ${({ theme }) => theme.colors.danger};
  }

  @media (max-width: 480px) {
    padding: 3px 5px;
  }
`;

/* Dedicated opponents gallery with clean spacing and top margin */
const OpponentsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 650px;
  margin: 14px auto 6px;
  z-index: 10;
  gap: 14px;
  overflow-x: auto;
  padding: 6px 8px;

  @media (max-width: 600px) {
    margin: 10px auto 4px;
    gap: 10px;
    padding: 4px 6px;
  }

  /* Hide scrollbar for slick look */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
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

export function GameTable({ onLeave }) {
  const socket = useSocket();
  const { user } = useAuthStore();
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
    resetGame
  } = useGameStore();

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

  const isMyTurn = currentTurnId === user.id;
  const isStarter = currentTurnId === chaal.starterId;
  const opponents = players.filter(p => p.id !== user.id);
  const me = players.find(p => p.id === user.id);

  // Map opponent seats to consistent indices for stable avatars
  const seatIndexMap = new Map();
  players.forEach((p, idx) => seatIndexMap.set(p.id, idx));

  const handlePlayCard = (cardId) => {
    socket.emit('play_card', { roomCode: roomId, cardId }, (res) => {
      if (res && res.success) {
        setSelectedCardId(null);
      }
    });
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
            myUserId={user.id}
          />
        </NavLeft>

        <GameTimer deadline={turnDeadline} isMyTurn={isMyTurn} />

        <NavRight>
          <SoundToggle />
          <IconButton onClick={() => setIsHistoryOpen(true)} title="View Chaal History">
            <History size={13} />
            <span style={{ display: 'none', '@media (min-width: 540px)': { display: 'inline' } }}>History</span>
          </IconButton>
          <IconButton className="danger" onClick={handleLeave} title="Leave Game">
            <LogOut size={13} />
          </IconButton>
        </NavRight>
      </TopBar>

      {/* Opponents Row with Distinct Avatars */}
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

      {/* Center Table Area with 4-second Completed Chaal Preview */}
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
    </TableContainer>
  );
}
