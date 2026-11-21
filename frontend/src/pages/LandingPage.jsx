import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuthStore } from '../store/authStore.js';
import { useRoomStore } from '../store/roomStore.js';
import { useSocket } from '../hooks/useSocket.js';
import { PlayingCard } from '../components/cards/PlayingCard.jsx';
import { PlusCircle, LogIn, BookOpen } from 'lucide-react';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;

const Title = styled.h1`
  font-size: 52px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.goldLight};
  text-shadow: 0 0 25px rgba(229, 184, 66, 0.4);
  letter-spacing: 2px;
  text-align: center;
`;

const Tagline = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  max-width: 550px;
`;

const PreviewRow = styled.div`
  display: flex;
  gap: 12px;
  margin: 10px 0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: 600px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
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
  const [nameInput, setNameInput] = useState(user.username);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (nameInput.trim()) setUsername(nameInput.trim());
    socket.emit('create_room', {}, (res) => {
      if (res && res.success) {
        setRoom(res.room);
        onEnterLobby();
      } else {
        setError(res?.error || 'Failed to create room');
      }
    });
  };

  const handleJoin = () => {
    if (!roomCodeInput.trim()) {
      setError('Please enter a room code.');
      return;
    }
    if (nameInput.trim()) setUsername(nameInput.trim());
    socket.emit('join_room', { roomCode: roomCodeInput.trim() }, (res) => {
      if (res && res.success) {
        setRoom(res.room);
        onEnterLobby();
      } else {
        setError(res?.error || 'Failed to join room');
      }
    });
  };

  return (
    <Container>
      <Title>MAKE DONKEY</Title>
      <Tagline>
        The classic multiplayer card game. Follow the starting suit, avoid off-suit penalties, and don't be the last player holding cards!
      </Tagline>

      <PreviewRow>
        <PlayingCard card={{ id: 'spades-A', suit: 'spades', rank: 'A', value: 14 }} />
        <PlayingCard card={{ id: 'hearts-K', suit: 'hearts', rank: 'K', value: 13 }} />
        <PlayingCard card={{ id: 'clubs-Q', suit: 'clubs', rank: 'Q', value: 12 }} />
      </PreviewRow>

      <div style={{ width: '100%', maxWidth: 600 }}>
        <label style={{ fontSize: 13, color: '#96a89f', display: 'block', marginBottom: 6 }}>
          Your Player Name:
        </label>
        <Input
          style={{ width: '100%' }}
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter username"
        />
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>}

      <CardGrid>
        <ActionCard>
          <h3 style={{ color: '#e5b842', fontSize: 18 }}>Host a Game</h3>
          <p style={{ color: '#888', fontSize: 13 }}>
            Create a private game room and share the room code with 2 to 5 friends.
          </p>
          <PrimaryButton onClick={handleCreate}>
            <PlusCircle size={18} /> Create Room
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
          />
          <PrimaryButton onClick={handleJoin}>
            <LogIn size={18} /> Join Room
          </PrimaryButton>
        </ActionCard>
      </CardGrid>
    </Container>
  );
}
