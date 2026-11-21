import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuthStore } from '../store/authStore.js';
import { useRoomStore } from '../store/roomStore.js';
import { useSocket } from '../hooks/useSocket.js';
import { PlayingCard } from '../components/cards/PlayingCard.jsx';
import { SoundToggle } from '../components/common/SoundToggle.jsx';
import { PlusCircle, LogIn, Check, Save, Loader2 } from 'lucide-react';

const Container = styled.div`
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: max(24px, calc(16px + env(safe-area-inset-top, 0px))) 16px max(24px, calc(16px + env(safe-area-inset-bottom, 0px))) 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-sizing: border-box;
`;

const TopNav = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: flex-end;
`;

const Title = styled.h1`
  font-size: 50px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.goldLight};
  text-shadow: 0 0 25px rgba(229, 184, 66, 0.4);
  letter-spacing: 2px;
  text-align: center;

  @media (max-width: 600px) {
    font-size: 38px;
  }
`;

const Tagline = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  max-width: 550px;
`;

const PreviewRow = styled.div`
  display: flex;
  gap: 12px;
  margin: 4px 0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const ActionCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
  width: 100%;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 8px;
  padding: 12px 14px;
  color: #fff;
  font-size: 15px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
  }
`;

const NameBox = styled.div`
  width: 100%;
  max-width: 600px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  overflow: hidden;
`;

const NameInputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: stretch;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const NameInput = styled(Input)`
  flex: 1;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
`;

const SaveButton = styled.button`
  background: ${({ $saved, theme }) =>
    $saved ? theme.colors.success : theme.colors.gold};
  color: ${({ $saved }) => ($saved ? '#fff' : '#000')};
  font-weight: 800;
  font-size: 13px;
  padding: 11px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px;
  }
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.gold};
  color: #000;
  font-weight: 800;
  font-size: 15px;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${({ theme }) => theme.colors.goldLight};
    transform: translateY(-2px);
  }
`;

export function LandingPage({ onEnterLobby }) {
  const socket = useSocket();
  const { user, setUsername } = useAuthStore();
  const { setRoom } = useRoomStore();
  const [nameInput, setNameInput] = useState(user.username || '');
  const [isSaved, setIsSaved] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCreate = () => {
    if (isCreating) return;
    setIsCreating(true);
    setError('');

    const finalName = nameInput.trim() || user.username;
    setUsername(finalName);

    // Timeout safety fallback: if server is waking up or not responding within 8 seconds
    const timeoutTimer = setTimeout(() => {
      setIsCreating(false);
      setError('Connection timeout. Please ensure the backend server is running or wait for Render to wake up.');
    }, 8000);

    const doEmit = (s) => {
      s.emit('create_room', { username: finalName }, (res) => {
        clearTimeout(timeoutTimer);
        setIsCreating(false);
        if (res && res.success) {
          setRoom(res.room);
          onEnterLobby();
        } else {
          setError(res?.error || 'Failed to create room');
        }
      });
    };

    if (socket.connected) {
      doEmit(socket);
    } else {
      socket.connect();
      socket.once('connect', () => {
        doEmit(socket);
      });
    }
  };

  const handleJoin = () => {
    if (isJoining) return;
    if (!roomCodeInput.trim()) {
      setError('Please enter a room code.');
      return;
    }
    setIsJoining(true);
    setError('');

    const finalName = nameInput.trim() || user.username;
    setUsername(finalName);

    // Timeout safety fallback
    const timeoutTimer = setTimeout(() => {
      setIsJoining(false);
      setError('Connection timeout. Please check the room code or server status.');
    }, 8000);

    const doJoin = (s) => {
      s.emit(
        'join_room',
        { roomCode: roomCodeInput.trim(), username: finalName },
        (res) => {
          clearTimeout(timeoutTimer);
          setIsJoining(false);
          if (res && res.success) {
            setRoom(res.room);
            onEnterLobby();
          } else {
            setError(res?.error || 'Failed to join room');
          }
        }
      );
    };

    if (socket.connected) {
      doJoin(socket);
    } else {
      socket.connect();
      socket.once('connect', () => {
        doJoin(socket);
      });
    }
  };

  return (
    <Container>
      <TopNav>
        <SoundToggle />
      </TopNav>

      <Title>MAKE DONKEY</Title>
      <Tagline>
        The classic multiplayer card game. Follow the starting suit, avoid off-suit penalties, and don't be the last player holding cards!
      </Tagline>

      <PreviewRow>
        <PlayingCard card={{ id: 'spades-A', suit: 'spades', rank: 'A', value: 14 }} />
        <PlayingCard card={{ id: 'hearts-K', suit: 'hearts', rank: 'K', value: 13 }} />
        <PlayingCard card={{ id: 'clubs-Q', suit: 'clubs', rank: 'Q', value: 12 }} />
      </PreviewRow>

      {/* Player Name Box with Save Button */}
      <NameBox>
        <label style={{ fontSize: 13, color: '#96a89f', fontWeight: 600 }}>
          Your Player Name (saved to your browser):
        </label>
        <NameInputRow>
          <NameInput
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Enter player name"
            maxLength={18}
          />
          <SaveButton $saved={isSaved} onClick={handleSaveName}>
            {isSaved ? (
              <>
                <Check size={14} /> Saved
              </>
            ) : (
              <>
                <Save size={14} /> Save Name
              </>
            )}
          </SaveButton>
        </NameInputRow>
      </NameBox>

      {error && <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>}

      <CardGrid>
        <ActionCard>
          <h3 style={{ color: '#e5b842', fontSize: 18 }}>Host a Game</h3>
          <p style={{ color: '#888', fontSize: 13 }}>
            Create a private game room and share the room code with 2 to 5 friends.
          </p>
          <PrimaryButton onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Creating Room...
              </>
            ) : (
              <>
                <PlusCircle size={18} /> Create Room
              </>
            )}
          </PrimaryButton>
        </ActionCard>

        <ActionCard>
          <h3 style={{ color: '#e5b842', fontSize: 18 }}>Join a Game</h3>
          <p style={{ color: '#888', fontSize: 13 }}>
            Enter a 6-character room code from your friend to join their lobby.
          </p>
          <Input
            placeholder="Room code (e.g. 7X8K2M)"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
            disabled={isJoining}
          />
          <PrimaryButton onClick={handleJoin} disabled={isJoining}>
            {isJoining ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Joining Room...
              </>
            ) : (
              <>
                <LogIn size={18} /> Join Room
              </>
            )}
          </PrimaryButton>
        </ActionCard>
      </CardGrid>
    </Container>
  );
}
