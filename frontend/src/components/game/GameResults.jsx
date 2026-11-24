import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RefreshCw, LogOut, Clock } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.gold};
  border-radius: 24px;
  padding: 32px 24px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  position: relative;
`;

const EmojisRow = styled.div`
  font-size: 38px;
  display: flex;
  gap: 8px;
  justify-content: center;
  animation: shake 1.5s infinite ease-in-out;

  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-6deg) scale(1.1); }
    75% { transform: rotate(6deg) scale(1.1); }
  }
`;

const DonkeyAvatar = styled.div`
  font-size: 80px;
  line-height: 1;
  animation: bounce 1.8s infinite ease-in-out;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-14px); }
  }
`;

const DonkeyTitle = styled.h1`
  font-size: 40px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.goldLight};
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 20px rgba(229, 184, 66, 0.6);
`;

const LoserBox = styled.div`
  background: rgba(239, 68, 68, 0.18);
  border: 2px solid rgba(239, 68, 68, 0.5);
  border-radius: 14px;
  padding: 12px 20px;
  width: 100%;
  box-sizing: border-box;
`;

const LoserText = styled.div`
  font-size: 22px;
  font-weight: 900;
  color: #ff6b6b;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.4);
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 380px;
  line-height: 1.4;
`;

const CountdownBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(229, 184, 66, 0.15);
  border: 1px solid rgba(229, 184, 66, 0.35);
  color: ${({ theme }) => theme.colors.gold};
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 6px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 13px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  background: ${({ $primary, theme, disabled }) =>
    disabled ? 'rgba(50, 50, 50, 0.6)' : $primary ? theme.colors.gold : theme.colors.surfaceLight};
  color: ${({ $primary, disabled }) => (disabled ? '#888' : $primary ? '#000' : '#fff')};
  border: 1px solid
    ${({ $primary, theme, disabled }) => (disabled ? 'transparent' : $primary ? theme.colors.gold : theme.colors.surfaceBorder)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  }
`;

export function GameResults({ donkeyPlayer, isHost, onPlayAgain, onLeave }) {
  const [secondsRemaining, setSecondsRemaining] = useState(10);

  useEffect(() => {
    // Confetti celebration for the winners!
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loserName = donkeyPlayer?.username || 'Player';
  const isLocked = secondsRemaining > 0;

  return (
    <Overlay
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ModalContent>
        {/* Laughing emojis row */}
        <EmojisRow>
          😂 🤣 🫏 🤣 😂
        </EmojisRow>

        <DonkeyAvatar>🫏</DonkeyAvatar>

        <DonkeyTitle>GAME OVER!</DonkeyTitle>

        {/* Clear loser highlight */}
        <LoserBox>
          <LoserText>
            {loserName} LOST THE GAME!
          </LoserText>
          <div style={{ color: '#ffd166', fontSize: 15, marginTop: 6, fontWeight: 800 }}>
            👑 DONKEY TITLE: {loserName} 🫏
          </div>
          <div style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>
            Last player remaining with cards in hand
          </div>
        </LoserBox>

        <Subtitle>
          All other players successfully emptied their cards and won!
        </Subtitle>

        {/* 10 second minimum showcase countdown */}
        {isLocked ? (
          <CountdownBadge>
            <Clock size={14} />
            Showcasing Donkey: {secondsRemaining}s remaining...
          </CountdownBadge>
        ) : (
          <CountdownBadge style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}>
            Results showcase finished. Ready for next match!
          </CountdownBadge>
        )}

        <ButtonRow>
          {isHost ? (
            <ActionButton
              $primary
              disabled={isLocked}
              onClick={() => !isLocked && onPlayAgain()}
              title={isLocked ? `Showcasing results... (${secondsRemaining}s remaining)` : 'Start a new match'}
            >
              <RefreshCw size={17} /> Play Again {isLocked ? `(${secondsRemaining}s)` : ''}
            </ActionButton>
          ) : (
            <Subtitle style={{ fontSize: '13px', margin: 'auto' }}>
              {isLocked ? `Showcasing Donkey for ${secondsRemaining}s...` : 'Waiting for host to restart match...'}
            </Subtitle>
          )}
          <ActionButton
            disabled={isLocked}
            onClick={() => !isLocked && onLeave()}
            title={isLocked ? `Showcasing results... (${secondsRemaining}s remaining)` : 'Leave Room'}
          >
            <LogOut size={17} /> Leave Room {isLocked ? `(${secondsRemaining}s)` : ''}
          </ActionButton>
        </ButtonRow>
      </ModalContent>
    </Overlay>
  );
}
