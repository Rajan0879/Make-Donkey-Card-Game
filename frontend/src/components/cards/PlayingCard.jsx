import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const SUIT_ICONS = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣'
};

const CardContainer = styled(motion.div)`
  width: ${({ $compact }) => ($compact ? '52px' : '72px')};
  height: ${({ $compact }) => ($compact ? '76px' : '105px')};
  background: #ffffff;
  border-radius: 8px;
  position: relative;
  user-select: none;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  box-shadow: ${({ theme, $selected }) =>
    $selected ? theme.shadows.cardSelected : theme.shadows.card};
  border: 1px solid rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  flex-shrink: 0;

  color: ${({ $isRed }) => ($isRed ? '#e63946' : '#1d232a')};

  ${({ $selected }) =>
    $selected &&
    css`
      transform: translateY(-16px);
      border: 2.5px solid ${({ theme }) => theme.colors.gold};
      z-index: 50 !important;
    `}

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.42;
      filter: grayscale(80%) brightness(0.7);
    `}

  ${({ $isAceOfSpades }) =>
    $isAceOfSpades &&
    css`
      border: 2px solid #e5b842;
      background: linear-gradient(135deg, #ffffff 70%, #fef3c7 100%);
    `}

  @media (max-width: 600px) {
    width: ${({ $compact }) => ($compact ? '38px' : '48px')};
    height: ${({ $compact }) => ($compact ? '56px' : '70px')};
    padding: 3px;
    border-radius: 6px;
  }
`;

const CornerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 800;
  font-size: ${({ $compact }) => ($compact ? '11px' : '14px')};
  line-height: 1;

  span:last-child {
    font-size: ${({ $compact }) => ($compact ? '10px' : '12px')};
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

const CenterSuit = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${({ $compact }) => ($compact ? '22px' : '30px')};
  opacity: 0.9;

  @media (max-width: 600px) {
    font-size: 18px;
  }
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

  return (
    <CardContainer
      $isRed={isRed}
      $selected={selected}
      $disabled={disabled}
      $compact={compact}
      $isAceOfSpades={isAceOfSpades}
      onClick={!disabled && onClick ? onClick : undefined}
      whileHover={!disabled ? { y: selected ? -18 : -8, scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
    >
      <CornerInfo $compact={compact}>
        <span>{card.rank}</span>
        <span>{suitIcon}</span>
      </CornerInfo>

      <CenterSuit $compact={compact}>{suitIcon}</CenterSuit>

      <CornerInfo $compact={compact} $bottom>
        <span>{card.rank}</span>
        <span>{suitIcon}</span>
      </CornerInfo>
    </CardContainer>
  );
}
