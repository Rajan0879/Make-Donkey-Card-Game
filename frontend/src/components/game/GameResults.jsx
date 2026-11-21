import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, LogOut } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.gold};
  border-radius: 20px;
  padding: 36px 30px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
`;

const DonkeyTitle = styled.h1`
  font-size: 42px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.goldLight};
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 20px rgba(229, 184, 66, 0.6);
`;

const DonkeyAvatar = styled.div`
  font-size: 72px;
  line-height: 1;
  animation: bounce 2s infinite ease-in-out;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }
`;

const DonkeyName = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.cardRed};
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 380px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  background: ${({ $primary, theme }) =>
    $primary ? theme.colors.gold : theme.colors.surfaceLight};
  color: ${({ $primary }) => ($primary ? '#000' : '#fff')};
  border: 1px solid
    ${({ $primary, theme }) => ($primary ? theme.colors.gold : theme.colors.surfaceBorder)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  }
`;

export function GameResults({ donkeyPlayer, isHost, onPlayAgain, onLeave }) {
  useEffect(() => {
    // Confetti celebration for the winners!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <Overlay
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ModalContent>
        <DonkeyTitle>DONKEY!</DonkeyTitle>
        <DonkeyAvatar>🫏</DonkeyAvatar>

        <DonkeyName>{donkeyPlayer?.username || 'Player'} is the Donkey!</DonkeyName>

        <Subtitle>
          All other players successfully emptied their hands. Better luck next game!
        </Subtitle>

        <ButtonRow>
          {isHost ? (
            <ActionButton $primary onClick={onPlayAgain}>
              <RefreshCw size={18} /> Play Again
            </ActionButton>
          ) : (
            <Subtitle style={{ fontSize: '13px' }}>
              Waiting for host to restart match...
            </Subtitle>
          )}
          <ActionButton onClick={onLeave}>
            <LogOut size={18} /> Leave Room
          </ActionButton>
        </ButtonRow>
      </ModalContent>
    </Overlay>
  );
}
