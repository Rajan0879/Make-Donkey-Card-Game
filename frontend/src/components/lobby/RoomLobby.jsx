import React, { useState } from 'react';
import styled from 'styled-components';
import { useSocket } from '../../hooks/useSocket.js';
import { useAuthStore } from '../../store/authStore.js';
import { useRoomStore } from '../../store/roomStore.js';
import { VoiceControls } from '../game/VoiceControls.jsx';
import { SoundToggle } from '../common/SoundToggle.jsx';
import { getPlayerAvatar } from '../../utils/avatarUtils.js';
import { Copy, Check, Users, Play, Crown, LogOut, RotateCw, Loader2, AlertCircle, Wifi, WifiOff, UserX } from 'lucide-react';

const LobbyWrapper = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: max(16px, env(safe-area-inset-top, 16px));
  padding-bottom: max(20px, env(safe-area-inset-bottom, 20px));
  padding-left: max(8px, env(safe-area-inset-left, 8px));
  padding-right: max(8px, env(safe-area-inset-right, 8px));
  box-sizing: border-box;
`;

const LobbyCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 16px;
  padding: 24px;
  max-width: 600px;
  width: calc(100% - 32px);
  margin: 12px auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

  @media (max-width: 600px) {
    padding: 16px;
    width: 100%;
    margin: 8px auto;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 500px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 500px) {
    justify-content: space-between;
    width: 100%;
  }
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

const RefreshButton = styled.button`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 8px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    border-color: ${({ theme }) => theme.colors.gold};
    transform: translateY(-1px);
  }
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

const PlayerNameCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OnlineIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $online }) => ($online ? '#10b981' : '#ef4444')};
`;

const OnlineDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $online }) => ($online ? '#10b981' : '#ef4444')};
  box-shadow: 0 0 6px ${({ $online }) => ($online ? '#10b981' : '#ef4444')};
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

const KickButton = styled.button`
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #ef4444;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ef4444;
    color: #fff;
    transform: translateY(-1px);
  }
`;

const StatusBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
  background: rgba(229, 184, 66, 0.12);
  border: 1px solid rgba(229, 184, 66, 0.3);
  color: ${({ theme }) => theme.colors.gold};
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 500px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  box-sizing: border-box;
  width: 100%;

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
  const { room, setRoom } = useRoomStore();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!room) return null;

  const me = room.players.find(p => p.id === user.id);
  const isHost = me?.isHost || room.hostId === user.id;
  const isReady = me?.ready;

  const copyCode = () => {
    // Only copies the 6-character room code
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    // 1. Force reconnect socket if offline or waking from sleep
    if (socket && !socket.connected) {
      socket.connect();
    }

    // 2. Re-sync lobby room state from server
    socket.emit('request_game_state', { roomCode: room.code });
    socket.emit('join_room', { roomCode: room.code, username: user?.username }, (res) => {
      if (res && res.success) {
        setRoom(res.room);
      } else if (res && !res.success) {
        if (onLeave) onLeave();
      }
    });
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const toggleReady = () => {
    socket.emit('player_ready', { roomCode: room.code, ready: !isReady });
  };

  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    socket.emit('start_game', { roomCode: room.code }, (res) => {
      setIsStarting(false);
      if (res && !res.success) {
        alert(res.error);
      }
    });
  };

  const handleLeave = () => {
    if (room?.code && socket) {
      socket.emit('leave_room', { roomCode: room.code });
    }
    if (onLeave) onLeave();
  };

  const handleKickPlayer = (targetUserId, targetName) => {
    if (!isHost) return;
    if (window.confirm(`Are you sure you want to remove ${targetName} from the room?`)) {
      socket.emit('kick_player', { roomCode: room.code, targetUserId }, (res) => {
        if (res && !res.success) {
          alert(res.error || 'Failed to remove player');
        }
      });
    }
  };

  const unreadyPlayers = room.players.filter(p => !p.ready);
  const notEnoughPlayers = room.players.length < 3;
  const canStart = isHost && !notEnoughPlayers && unreadyPlayers.length === 0;

  return (
    <LobbyWrapper>
      <LobbyCard>
        <Header>
          <div>
            <Title>Game Lobby</Title>
            <div style={{ color: '#888', fontSize: '13px', marginTop: 4 }}>
              Players in room: {room.players.length}/6 (Min 3 required)
            </div>
          </div>

        <HeaderControls>
          <RefreshButton onClick={handleManualRefresh} title="Sync / Refresh Lobby">
            <RotateCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          </RefreshButton>
          <SoundToggle />
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
        </HeaderControls>
      </Header>

      {/* Helpful Status Banner for Players & Host */}
      {notEnoughPlayers ? (
        <StatusBanner>
          <AlertCircle size={16} />
          Waiting for at least 3 players to join ({room.players.length}/3 joined)
        </StatusBanner>
      ) : unreadyPlayers.length > 0 ? (
        <StatusBanner>
          <AlertCircle size={16} />
          Waiting for: {unreadyPlayers.map(p => p.username).join(', ')} to mark Ready
        </StatusBanner>
      ) : (
        <StatusBanner style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}>
          <Check size={16} />
          All players ready! Host can start the game now.
        </StatusBanner>
      )}

      <PlayerList>
        {room.players.map((p, idx) => {
          const avatar = getPlayerAvatar(idx);
          const isOnline = p.connected !== false;
          return (
            <PlayerRow key={p.id}>
              <PlayerMeta>
                <span
                  style={{
                    background: avatar.bg,
                    borderRadius: '50%',
                    width: 34,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    position: 'relative'
                  }}
                >
                  {avatar.emoji}
                </span>

                <PlayerNameCol>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong>{p.username}</strong>
                    {(p.isHost || p.id === room.hostId) && (
                      <span title="Host" style={{ color: '#e5b842', display: 'flex' }}>
                        <Crown size={14} />
                      </span>
                    )}
                  </div>
                  {/* Online/Offline status indicator */}
                  <OnlineIndicator $online={isOnline}>
                    <OnlineDot $online={isOnline} />
                    {isOnline ? 'Online' : 'Reconnecting...'}
                  </OnlineIndicator>
                </PlayerNameCol>
              </PlayerMeta>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ReadyBadge $ready={p.ready}>
                  {p.ready ? 'Ready' : 'Not Ready'}
                </ReadyBadge>

                {/* Host kick/remove button for other players in lobby */}
                {isHost && p.id !== user.id && (
                  <KickButton
                    onClick={() => handleKickPlayer(p.id, p.username)}
                    title={`Remove ${p.username} from room`}
                  >
                    <UserX size={13} />
                    <span>Remove</span>
                  </KickButton>
                )}
              </div>
            </PlayerRow>
          );
        })}
      </PlayerList>

      <ActionRow>
        <Button onClick={toggleReady}>
          {isReady ? 'Mark Not Ready' : 'Mark Ready'}
        </Button>

        {isHost && (
          <Button $primary disabled={!canStart || isStarting} onClick={handleStart}>
            {isStarting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Starting...
              </>
            ) : (
              <>
                <Play size={16} /> Start Game
              </>
            )}
          </Button>
        )}

        <Button onClick={handleLeave}>
          <LogOut size={16} /> Leave
        </Button>
      </ActionRow>
    </LobbyCard>
  </LobbyWrapper>
  );
}
