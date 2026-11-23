import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Clock } from 'lucide-react';
import { soundManager } from '../../services/sound/soundManager.js';

const TimerBox = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(10, 13, 12, 0.75);
  border: 1px solid ${({ $isWarning, theme }) =>
    $isWarning ? theme.colors.danger : theme.colors.surfaceBorder};
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 4px 10px;
  font-weight: 700;
  font-size: 12px;
  color: ${({ $isWarning, theme }) =>
    $isWarning ? theme.colors.danger : theme.colors.goldLight};
  box-shadow: ${({ $isWarning }) =>
    $isWarning ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none'};
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 480px) {
    padding: 3px 8px;
    font-size: 11px;
    gap: 4px;
  }
`;

export function GameTimer({ deadline, isMyTurn }) {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (!deadline) return;

    const updateTime = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);

      // Warning sound at 5s remaining on player's turn
      if (remaining === 5 && isMyTurn) {
        soundManager.playTurnWarning();
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 500);
    return () => clearInterval(interval);
  }, [deadline, isMyTurn]);

  const isWarning = secondsLeft <= 10;

  return (
    <TimerBox $isWarning={isWarning}>
      <Clock size={16} />
      <span>{secondsLeft}s</span>
    </TimerBox>
  );
}
