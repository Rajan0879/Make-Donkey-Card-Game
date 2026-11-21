import React from 'react';
import styled from 'styled-components';
import { PlayerSeat } from './PlayerSeat.jsx';
import { ChaalArea } from './ChaalArea.jsx';
import { PlayerHand } from './PlayerHand.jsx';
import { GameTimer } from './GameTimer.jsx';
import { GameResults } from './GameResults.jsx';
import { VoiceControls } from './VoiceControls.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useGameStore } from '../../store/gameStore.js';
import { useSocket } from '../../hooks/useSocket.js';
import { LogOut } from 'lucide-react';

const TableContainer = styled.div`
  width: 100vw;
  height: 100vh;
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.feltGradiant};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 12px;
  position: relative;
  overflow: hidden;

  @media (max-width: 600px) {
    padding: 8px 6px;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  z-index: 10;
  gap: 8px;
`;

const RoomInfo = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.goldLight};
  white-space: nowrap;
`;

const OpponentsRow = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  z-index: 5;
  gap: 6px;
  overflow-x: auto;
  padding: 4px 0;

  @media (max-width: 600px) {
    justify-content: center;
    gap: 8px;
  }
`;

const CenterArena = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 110px;
`;

const LeaveButton = styled.button`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 5px 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;

export function GameTable({ onLeave }) {
  const socket = useSocket();
  const { user } = useAuthStore();
  const {
    gameState,
    selectedCardId,
    setSelectedCardId,
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
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RoomInfo>Room: {roomId}</RoomInfo>
          <VoiceControls
            socket={socket}
            roomCode={roomId}
            players={players}
            myUserId={user.id}
          />
        </div>
        <GameTimer deadline={turnDeadline} isMyTurn={isMyTurn} />
        <LeaveButton onClick={handleLeave}>
          <LogOut size={13} /> Leave
        </LeaveButton>
      </TopBar>

      {/* Opponents seated at top */}
      <OpponentsRow>
        {opponents.map(opp => (
          <PlayerSeat
            key={opp.id}
            player={opp}
            isTurn={currentTurnId === opp.id}
            isStarter={currentStarterId === opp.id}
          />
        ))}
      </OpponentsRow>

      {/* Chaal Center Play Area */}
      <CenterArena>
        <ChaalArea chaal={chaal} players={players} />
      </CenterArena>

      {/* Player's Hand and Controls */}
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
