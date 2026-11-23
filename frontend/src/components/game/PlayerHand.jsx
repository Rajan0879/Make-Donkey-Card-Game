import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { PlayingCard } from '../cards/PlayingCard.jsx';
import { soundManager } from '../../services/sound/soundManager.js';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
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

const HintBanner = styled.div`
  background: rgba(239, 68, 68, 0.22);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  padding: 3px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: shake 0.3s ease;
  width: 100%;
  justify-content: center;
  box-sizing: border-box;

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }
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
  padding: 7px 22px;
  border-radius: ${({ theme }) => theme.radii.full};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  box-shadow: ${({ theme, disabled }) => (disabled ? 'none' : theme.shadows.glowGold)};
  transition: all 0.2s ease;
  margin-top: 4px;
  margin-bottom: 4px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.goldLight};
  }

  @media (max-width: 600px) {
    font-size: 11px;
    padding: 6px 18px;
    min-height: 34px;
    margin-bottom: 2px;
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
  startingSuit,
  isPlaying = false,
  playError = null
}) {
  const isHandEmpty = hand.length === 0;
  const [hint, setHint] = useState(null);
  const hintTimerRef = useRef(null);

  const showHint = (msg) => {
    soundManager.playTurnWarning();
    setHint(msg);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setHint(null), 3500);
  };

  useEffect(() => {
    if (playError) {
      showHint(playError);
    }
  }, [playError]);

  // Sort hand by suit and value for clean player experience
  const sortedHand = [...hand].sort((a, b) => {
    if (a.suit === b.suit) return b.value - a.value;
    return a.suit.localeCompare(b.suit);
  });

  const hasStartingSuit = startingSuit ? hand.some(c => c.suit === startingSuit) : false;

  const handleCardClick = (card, disabled, disabledReason) => {
    if (isPlaying) return; // Prevent double-triggering while a play action is in flight

    if (!isMyTurn) {
      showHint("Wait for your turn to play!");
      return;
    }

    if (disabled) {
      showHint(disabledReason || "Illegal move! You cannot play this card.");
      return;
    }

    // Direct play on second tap of already selected card!
    if (card.id === selectedCardId) {
      onPlayCard(card.id);
    } else {
      soundManager.playCardSelect();
      onSelectCard(card.id);
      setHint(null);
    }
  };

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

      {hint && (
        <HintBanner>
          <AlertCircle size={14} />
          <span>{hint}</span>
        </HintBanner>
      )}

      <CardsGrid>
        {sortedHand.map((card) => {
          let disabled = !isMyTurn;
          let disabledReason = !isMyTurn ? "Wait for your turn to play!" : null;

          // Legal play checks on frontend
          if (isMyTurn) {
            if (isFirstChaalEver && isStarter) {
              if (card.id !== 'spades-A') {
                disabled = true;
                disabledReason = "First card of the game must be the Ace of Spades (♠A)!";
              }
            } else if (!isStarter && startingSuit && hasStartingSuit) {
              if (card.suit !== startingSuit) {
                disabled = true;
                disabledReason = `Must follow starting suit: ${startingSuit.toUpperCase()}!`;
              }
            }
          }

          return (
            <PlayingCard
              key={card.id}
              card={card}
              selected={card.id === selectedCardId}
              disabled={disabled}
              compact={true}
              onClick={() => handleCardClick(card, disabled, disabledReason)}
            />
          );
        })}
      </CardsGrid>

      {/* When player cards end, show safe status */}
      {isHandEmpty ? (
        <EmptiedCardsBox>
          <CheckCircle2 size={16} />
          You emptied all your cards! You are SAFE 🎉
        </EmptiedCardsBox>
      ) : (
        <PlayButton
          disabled={!isMyTurn || !selectedCardId || isPlaying}
          onClick={() => isMyTurn && selectedCardId && !isPlaying && onPlayCard(selectedCardId)}
        >
          {isPlaying
            ? "Playing..."
            : !isMyTurn
            ? "Wait for your turn"
            : !selectedCardId
            ? "Select a Card"
            : "Play Card (or tap card again)"}
        </PlayButton>
      )}
    </HandContainer>
  );
}
