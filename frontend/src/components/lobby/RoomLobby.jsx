import React, { useState } from 'react';
import styled from 'styled-components';
import { useSocket } from '../../hooks/useSocket.js';
import { useAuthStore } from '../../store/authStore.js';
import { useRoomStore } from '../../store/roomStore.js';
import { VoiceControls } from '../game/VoiceControls.jsx';
import { Copy, Check, Users, Play, Crown, LogOut } from 'lucide-react';

const LobbyCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  margin: 40px auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.goldLight};
`;

const CodeBadge = styled.div`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.gold};
  cursor: pointer;
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0;
`;

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.surfaceLight};
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const PlayerMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ReadyBadge = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $ready, theme }) =>
    $ready ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
  color: ${({ $ready, theme }) =>
    $ready ? theme.colors.success : theme.colors.danger};
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  background: ${({ $primary, theme }) =>
    $primary ? theme.colors.gold : theme.colors.surfaceLight};
  color: ${({ $primary }) => ($primary ? '#000' : '#fff')};
  border: 1px solid
    ${({ $primary, theme }) => ($primary ? theme.colors.gold : theme.colors.surfaceBorder)};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function RoomLobby({ onLeave }) {
  const socket = useSocket();
  const { user } = useAuthStore();
  const { room } = useRoomStore();
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const me = room.players.find(p => p.id === user.id);
  const isHost = me?.isHost;
  const isReady = me?.ready;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleReady = () => {
    socket.emit('player_ready', { roomCode: room.code, ready: !isReady });
  };

  const handleStart = () => {
    socket.emit('start_game', { roomCode: room.code }, (res) => {
      if (res && !res.success) {
        alert(res.error);
      }
    });
  };

  const handleLeave = () => {
    socket.emit('leave_room', { roomCode: room.code });
    if (onLeave) onLeave();
  };

  const canStart = isHost && room.players.length >= 3 && room.players.every(p => p.ready);

  return (
    <LobbyCard>
      <Header>
        <div>
          <Title>Game Lobby</Title>
          <div style={{ color: '#888', fontSize: '13px', marginTop: 4 }}>
            Waiting for players ({room.players.length}/6)
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <VoiceControls
            socket={socket}
            roomCode={room.code}
            players={room.players}
            myUserId={user.id}
          />
          <CodeBadge onClick={copyCode} title="Click to copy room code">
            {room.code}
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </CodeBadge>
        </div>
      </Header>

      <PlayerList>
        {room.players.map((p) => (
          <PlayerRow key={p.id}>
            <PlayerMeta>
              <strong>{p.username}</strong>
              {p.isHost && (
                <span title="Host" style={{ color: '#e5b842', display: 'flex' }}>
                  <Crown size={15} />
                </span>
              )}
            </PlayerMeta>
            <ReadyBadge $ready={p.ready}>
              {p.ready ? 'Ready' : 'Not Ready'}
            </ReadyBadge>
          </PlayerRow>
        ))}
      </PlayerList>

      <ActionRow>
        <Button onClick={toggleReady}>
          {isReady ? 'Mark Not Ready' : 'Mark Ready'}
        </Button>

        {isHost && (
          <Button $primary disabled={!canStart} onClick={handleStart}>
            <Play size={16} /> Start Game
          </Button>
        )}

        <Button onClick={handleLeave}>
          <LogOut size={16} /> Leave
        </Button>
      </ActionRow>
    </LobbyCard>
  );
}
