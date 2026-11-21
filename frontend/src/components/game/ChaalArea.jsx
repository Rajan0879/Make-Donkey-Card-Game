import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from '../cards/PlayingCard.jsx';

const ChaalBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 5;
`;

const StartingSuitIndicator = styled.div`
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid ${({ theme }) => theme.colors.goldDark};
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 4px 14px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.goldLight};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PlayedCardsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 120px;
  flex-wrap: wrap;
`;

const CardSlot = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const PlayerTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  background: rgba(0, 0, 0, 0.4);
  padding: 1px 6px;
  border-radius: 4px;
`;

export function ChaalArea({ chaal, players }) {
  const playerMap = new Map((players || []).map(p => [p.id, p.username]));

  return (
    <ChaalBox>
      {chaal.startingSuit && (
        <StartingSuitIndicator>
          Starting Suit: <span style={{ textTransform: 'capitalize' }}>{chaal.startingSuit}</span>
        </StartingSuitIndicator>
      )}

      <PlayedCardsRow>
        <AnimatePresence>
          {chaal.playedCards.map((play, index) => {
            const playerName = playerMap.get(play.playerId) || 'Player';
            return (
              <CardSlot
                key={`${play.card.id}-${index}`}
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                <PlayingCard card={play.card} compact={false} />
                <PlayerTag>{playerName}</PlayerTag>
              </CardSlot>
            );
          })}
        </AnimatePresence>
      </PlayedCardsRow>
    </ChaalBox>
  );
}
