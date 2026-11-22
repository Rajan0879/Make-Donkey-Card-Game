import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from '../cards/PlayingCard.jsx';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatPlayerName } from '../../utils/nameUtils.js';

const ChaalBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 5;
  width: 100%;
`;

const BannerSlot = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const StartingSuitIndicator = styled.div`
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid ${({ theme }) => theme.colors.goldDark};
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.goldLight};
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
`;

const PlayedCardsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 105px;
  flex-wrap: wrap;
`;

const CardSlot = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
`;

const PlayerTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  background: rgba(0, 0, 0, 0.55);
  padding: 1px 6px;
  border-radius: 4px;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* 5-Second Chaal Resolution Banner with zero layout shift */
const ResolutionBanner = styled(motion.div)`
  background: ${({ $isOffSuit }) =>
    $isOffSuit ? 'rgba(220, 38, 38, 0.95)' : 'rgba(16, 185, 129, 0.95)'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
  backdrop-filter: blur(4px);
`;

export function ChaalArea({ chaal, players, recentCompletedChaal, lastResolution }) {
  const playerMap = new Map((players || []).map(p => [p.id, p.username]));

  // If a Chaal just ended within 5 seconds, show completed cards and the resolution banner
  const isPreviewingCompleted = Boolean(recentCompletedChaal && recentCompletedChaal.playedCards?.length > 0);
  const displayChaal = isPreviewingCompleted ? recentCompletedChaal : chaal;
  const isOffSuit = lastResolution?.type === 'off-suit';

  // Get penalty player's 5-char name
  const rawPenaltyName = lastResolution?.penaltyPlayerId
    ? playerMap.get(lastResolution.penaltyPlayerId) || 'Player'
    : 'Highest Player';
  const penaltyPlayerName = formatPlayerName(rawPenaltyName, 5);

  return (
    <ChaalBox>
      <BannerSlot>
        <AnimatePresence>
          {isPreviewingCompleted && lastResolution && (
            <ResolutionBanner
              $isOffSuit={isOffSuit}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {isOffSuit ? (
                <>
                  <AlertTriangle size={15} />
                  <span>Off-Suit Penalty! {penaltyPlayerName} took all cards</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>All Followed Suit! Cards Discarded</span>
                </>
              )}
            </ResolutionBanner>
          )}
        </AnimatePresence>
      </BannerSlot>

      {displayChaal.startingSuit && (
        <StartingSuitIndicator>
          Starting Suit: <span style={{ textTransform: 'capitalize' }}>{displayChaal.startingSuit}</span>
        </StartingSuitIndicator>
      )}

      <PlayedCardsRow>
        <AnimatePresence>
          {displayChaal.playedCards.map((play, index) => {
            const rawName = playerMap.get(play.playerId) || 'Player';
            const shortName = formatPlayerName(rawName, 5);
            return (
              <CardSlot
                key={`${play.card.id}-${index}`}
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                <PlayingCard card={play.card} compact={false} />
                <PlayerTag title={rawName}>{shortName}</PlayerTag>
              </CardSlot>
            );
          })}
        </AnimatePresence>
      </PlayedCardsRow>
    </ChaalBox>
  );
}
