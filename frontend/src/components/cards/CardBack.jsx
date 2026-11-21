import React from 'react';
import styled from 'styled-components';

const BackContainer = styled.div`
  width: ${({ $compact }) => ($compact ? '60px' : '78px')};
  height: ${({ $compact }) => ($compact ? '88px' : '114px')};
  background: linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%);
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.gold};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  user-select: none;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border: 1px dashed rgba(229, 184, 66, 0.4);
    border-radius: 4px;
  }

  @media (max-width: 600px) {
    width: ${({ $compact }) => ($compact ? '48px' : '58px')};
    height: ${({ $compact }) => ($compact ? '72px' : '86px')};
  }
`;

const Emblem = styled.div`
  font-size: ${({ $compact }) => ($compact ? '18px' : '26px')};
  color: ${({ theme }) => theme.colors.goldLight};
  font-weight: 900;
  text-shadow: 0 0 10px rgba(229, 184, 66, 0.5);
`;

export function CardBack({ compact = false }) {
  return (
    <BackContainer $compact={compact}>
      <Emblem $compact={compact}>🫏</Emblem>
    </BackContainer>
  );
}
