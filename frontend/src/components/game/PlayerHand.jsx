import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { PlayingCard } from '../cards/PlayingCard.jsx';
import { soundManager } from '../../services/sound/soundManager.js';
import { Layers, AlignJustify } from 'lucide-react';

const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  position: relative;
  z-index: 20;
`;

const ControlBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
  gap: 8px;
`;

const SuitSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const SuitBadge = styled.span`
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 4px;
  color: ${({ $isRed }) => ($isRed ? '#e63946' : '#f0f5f2')};
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const ToggleViewButton = styled.button`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: ${({ theme }) => theme.colors.goldLight};
  border-radius: 6px;
  padding: 3px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

/* Adaptive card area: switches between dynamic fan overlap and multi-row compact grid */
const CardsArea = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  padding: 16px 8px 8px;
  min-height: 115px;

  ${({ $mode, $cardCount }) =>
    $mode === 'grid'
      ? css`
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          max-height: 160px;
          overflow-y: auto;
          overflow-x: hidden;
        `
      : css`
          /* Dynamic responsive fan: overlap scales automatically with card count */
          display: flex;
          flex-wrap: nowrap;
          overflow-x: visible;

          & > * {
            margin-left: ${$cardCount > 12 ? '-26px' : $cardCount > 8 ? '-20px' : '-14px'};
            &:first-child {
              margin-left: 0;
            }
          }

          @media (max-width: 600px) {
            & > * {
              margin-left: ${$cardCount > 12 ? '-25px' : $cardCount > 8 ? '-18px' : '-12px'};
              &:first-child {
                margin-left: 0;
              }
            }
          }
        `}
`;

const PlayButton = styled.button`
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.surfaceBorder : theme.colors.gold};
  color: ${({ disabled }) => (disabled ? '#777' : '#000')};
  font-weight: 800;
  font-size: 14px;
  padding: 8px 24px;
  border-radius: ${({ theme }) => theme.radii.full};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  box-shadow: ${({ theme, disabled }) => (disabled ? 'none' : theme.shadows.glowGold)};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.goldLight};
  }

  @media (max-width: 600px) {
    font-size: 13px;
    padding: 7px 20px;
  }
`;

export function PlayerHand({
  hand = [],
  selectedCardId,
  onSelectCard,
  onPlayCard,
  isMyTurn,
  isFirstChaalEver,
  isStarter,
  startingSuit
}) {
  // Mobile users can toggle between smart fanned view and compact 2-row grid view
  const [viewMode, setViewMode] = useState('fan'); // 'fan' | 'grid'

  // Sort hand by suit and value for clear readability
  const sortedHand = [...hand].sort((a, b) => {
    if (a.suit === b.suit) return b.value - a.value;
    return a.suit.localeCompare(b.suit);
  });

  const handleCardClick = (cardId) => {
    soundManager.playCardSelect();
    onSelectCard(cardId === selectedCardId ? null : cardId);
  };

  const hasStartingSuit = startingSuit ? hand.some(c => c.suit === startingSuit) : false;

  // Suit distribution stats for quick glance on mobile
  const suitCounts = {
    spades: hand.filter(c => c.suit === 'spades').length,
    hearts: hand.filter(c => c.suit === 'hearts').length,
    diamonds: hand.filter(c => c.suit === 'diamonds').length,
    clubs: hand.filter(c => c.suit === 'clubs').length
  };

  return (
    <HandContainer>
      <ControlBar>
        <SuitSummary>
          <span>Hand ({hand.length}):</span>
          {suitCounts.spades > 0 && <SuitBadge $isRed={false}>♠ {suitCounts.spades}</SuitBadge>}
          {suitCounts.hearts > 0 && <SuitBadge $isRed={true}>♥ {suitCounts.hearts}</SuitBadge>}
          {suitCounts.diamonds > 0 && <SuitBadge $isRed={true}>♦ {suitCounts.diamonds}</SuitBadge>}
          {suitCounts.clubs > 0 && <SuitBadge $isRed={false}>♣ {suitCounts.clubs}</SuitBadge>}
        </SuitSummary>

        <ToggleViewButton
          onClick={() => setViewMode(viewMode === 'fan' ? 'grid' : 'fan')}
          title="Toggle Hand View (Fanned / Grid)"
        >
          {viewMode === 'fan' ? (
            <>
              <Layers size={13} /> Grid
            </>
          ) : (
            <>
              <AlignJustify size={13} /> Fan
            </>
          )}
        </ToggleViewButton>
      </ControlBar>

      <CardsArea $mode={viewMode} $cardCount={hand.length}>
        {sortedHand.map((card) => {
          let disabled = !isMyTurn;

          // Legal play checks on frontend
          if (isMyTurn) {
            if (isFirstChaalEver && isStarter) {
              disabled = card.id !== 'spades-A';
            } else if (!isStarter && startingSuit && hasStartingSuit) {
              disabled = card.suit !== startingSuit;
            }
          }

          return (
            <PlayingCard
              key={card.id}
              card={card}
              selected={card.id === selectedCardId}
              disabled={disabled}
              compact={hand.length > 10 || viewMode === 'grid'}
              onClick={() => handleCardClick(card.id)}
            />
          );
        })}
      </CardsArea>

      {isMyTurn && (
        <PlayButton
          disabled={!selectedCardId}
          onClick={() => selectedCardId && onPlayCard(selectedCardId)}
        >
          Play Card
        </PlayButton>
      )}
    </HandContainer>
  );
}
