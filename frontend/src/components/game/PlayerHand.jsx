import React from 'react';
import styled from 'styled-components';
import { PlayingCard } from '../cards/PlayingCard.jsx';
import { soundManager } from '../../services/sound/soundManager.js';
import { CheckCircle2 } from 'lucide-react';

const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  position: relative;
  z-index: 20;
  flex-shrink: 0;
`;

const ControlBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 4px;
`;

const SuitSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const SuitBadge = styled.span`
  background: rgba(0, 0, 0, 0.55);
  padding: 2px 6px;
  border-radius: 4px;
  color: ${({ $isRed }) => ($isRed ? '#e63946' : '#f0f5f2')};
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

/* Pure Grid Layout: responsive multi-column grid showing all cards clearly without scrolling */
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
  gap: 6px;
  width: 100%;
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 2px;
  justify-items: center;

  @media (min-width: 500px) {
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: 8px;
    max-height: 200px;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 8px;
    max-height: 220px;
  }
`;

const PlayButton = styled.button`
  background: ${({ theme, disabled }) =>
    disabled ? 'rgba(35, 45, 40, 0.9)' : theme.colors.gold};
  color: ${({ disabled }) => (disabled ? '#718096' : '#000')};
  border: 1px solid ${({ theme, disabled }) => (disabled ? 'rgba(255, 255, 255, 0.08)' : theme.colors.gold)};
  font-weight: 800;
  font-size: 13px;
  padding: 8px 24px;
  border-radius: ${({ theme }) => theme.radii.full};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  box-shadow: ${({ theme, disabled }) => (disabled ? 'none' : theme.shadows.glowGold)};
  transition: all 0.2s ease;
  margin-top: 4px;
  margin-bottom: 6px;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.goldLight};
  }

  @media (max-width: 600px) {
    font-size: 12px;
    padding: 7px 20px;
    min-height: 36px;
    margin-bottom: 4px;
  }
`;

const EmptiedCardsBox = styled.div`
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  padding: 10px 20px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  margin-top: 4px;
  margin-bottom: 6px;
  animation: pulse 2s infinite ease-in-out;

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.95; }
    50% { transform: scale(1.02); opacity: 1; }
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
  const isHandEmpty = hand.length === 0;

  // Sort hand by suit and value for clean player experience
  const sortedHand = [...hand].sort((a, b) => {
    if (a.suit === b.suit) return b.value - a.value;
    return a.suit.localeCompare(b.suit);
  });

  const handleCardClick = (cardId) => {
    soundManager.playCardSelect();
    onSelectCard(cardId === selectedCardId ? null : cardId);
  };

  const hasStartingSuit = startingSuit ? hand.some(c => c.suit === startingSuit) : false;

  // Suit distribution stats for quick glance
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
      </ControlBar>

      <CardsGrid>
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
              compact={true}
              onClick={() => handleCardClick(card.id)}
            />
          );
        })}
      </CardsGrid>

      {/* When player cards end, show efficient safe status instead of Play Card button */}
      {isHandEmpty ? (
        <EmptiedCardsBox>
          <CheckCircle2 size={16} />
          You emptied all your cards! You are SAFE 🎉
        </EmptiedCardsBox>
      ) : (
        <PlayButton
          disabled={!isMyTurn || !selectedCardId}
          onClick={() => isMyTurn && selectedCardId && onPlayCard(selectedCardId)}
        >
          {!isMyTurn ? "Wait for your turn" : !selectedCardId ? "Select a Card" : "Play Card"}
        </PlayButton>
      )}
    </HandContainer>
  );
}
