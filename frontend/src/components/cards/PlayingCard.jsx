import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

// Crisp Unicode suit symbols with high-legibility geometry
const SUIT_ICONS = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣'
};

const CardContainer = styled(motion.div)`
  /* Standard 2.5 x 3.5 aspect ratio for genuine casino cards */
  width: ${({ $compact }) => ($compact ? '48px' : '68px')};
  height: ${({ $compact }) => ($compact ? '68px' : '96px')};
  background: #ffffff;
  border-radius: 7px;
  position: relative;
  user-select: none;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  box-shadow: ${({ theme, $selected }) =>
    $selected ? '0 0 16px rgba(229, 184, 66, 0.9), 0 8px 16px rgba(0,0,0,0.6)' : '0 2px 7px rgba(0, 0, 0, 0.45)'};
  border: 1px solid rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px;
  flex-shrink: 0;
  transition: opacity 0.25s ease, transform 0.2s ease, filter 0.25s ease;

  /* Rich casino colors: Crisp Crimson Red and Onyx Black */
  color: ${({ $isRed }) => ($isRed ? '#dc2626' : '#111827')};

  /* When card is selected */
  ${({ $selected }) =>
    $selected &&
    css`
      transform: translateY(-12px);
      border: 2px solid ${({ theme }) => theme.colors.gold};
      z-index: 40 !important;
    `}

  /*
   * When not player's turn or disabled:
   * Keep RED as RED and BLACK as BLACK! Only apply subtle dullness (opacity) without grayscale filter.
   */
  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.55;
      background: #f1f5f9;
      border-color: rgba(0, 0, 0, 0.12);
    `}

  /* Ace of Spades distinctive golden aura */
  ${({ $isAceOfSpades }) =>
    $isAceOfSpades &&
    css`
      border: 1.5px solid #d97706;
      background: linear-gradient(145deg, #ffffff 65%, #fef3c7 100%);
    `}

  @media (max-width: 600px) {
    width: ${({ $compact }) => ($compact ? '42px' : '52px')};
    height: ${({ $compact }) => ($compact ? '60px' : '74px')};
    padding: 3px;
    border-radius: 6px;
  }
`;

const CornerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 900;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: ${({ $compact }) => ($compact ? '12px' : '15px')};
  line-height: 1;

  span:first-child {
    letter-spacing: -0.5px;
  }

  span:last-child {
    font-size: ${({ $compact }) => ($compact ? '10px' : '12px')};
    margin-top: 1px;
  }

  ${({ $bottom }) =>
    $bottom &&
    css`
      transform: rotate(180deg);
      align-self: flex-end;
    `}

  @media (max-width: 600px) {
    font-size: 11px;
    span:last-child {
      font-size: 9px;
    }
  }
`;

const CenterContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CenterSuit = styled.div`
  font-size: ${({ $compact }) => ($compact ? '20px' : '28px')};
  opacity: 0.88;
  line-height: 1;

  @media (max-width: 600px) {
    font-size: 17px;
  }
`;

// Face cards (K, Q, J) crown/royal subtle watermark badge
const FaceBadge = styled.div`
  font-size: ${({ $compact }) => ($compact ? '14px' : '18px')};
  font-weight: 900;
  opacity: 0.25;
  position: absolute;
`;

export function PlayingCard({
  card,
  selected = false,
  disabled = false,
  compact = false,
  onClick
}) {
  if (!card) return null;

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitIcon = SUIT_ICONS[card.suit] || '♠';
  const isAceOfSpades = card.id === 'spades-A';
  const isFaceCard = ['K', 'Q', 'J'].includes(card.rank);

  return (
    <CardContainer
      $isRed={isRed}
      $selected={selected}
      $disabled={disabled}
      $compact={compact}
      $isAceOfSpades={isAceOfSpades}
      onClick={onClick}
      whileHover={!disabled ? { y: selected ? -14 : -6, scale: 1.04 } : {}}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <CornerInfo $compact={compact}>
        <span>{card.rank}</span>
        <span>{suitIcon}</span>
      </CornerInfo>

      <CenterContent>
        {isFaceCard && <FaceBadge $compact={compact}>{card.rank}</FaceBadge>}
        <CenterSuit $compact={compact}>{suitIcon}</CenterSuit>
      </CenterContent>

      <CornerInfo $compact={compact} $bottom>
        <span>{card.rank}</span>
        <span>{suitIcon}</span>
      </CornerInfo>
    </CardContainer>
  );
}
