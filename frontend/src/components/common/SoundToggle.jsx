import React from 'react';
import styled from 'styled-components';
import { Volume2, VolumeX } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore.js';

const SoundBtn = styled.button`
  background: ${({ $muted, theme }) =>
    $muted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)'};
  border: 1px solid
    ${({ $muted, theme }) =>
      $muted ? theme.colors.danger : 'rgba(255, 255, 255, 0.15)'};
  color: ${({ $muted, theme }) =>
    $muted ? theme.colors.danger : theme.colors.goldLight};
  padding: ${({ $compact }) => ($compact ? '4px 6px' : '5px 9px')};
  border-radius: ${({ $compact }) => ($compact ? '6px' : '8px')};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-1px);
    background: ${({ $muted }) =>
      $muted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.16)'};
  }

  @media (max-width: 480px) {
    padding: ${({ $compact }) => ($compact ? '3px 4px' : '4px 6px')};
    font-size: 10px;
  }
`;

export function SoundToggle({ compact = false }) {
  const { soundEnabled, toggleSound } = useSettingsStore();

  return (
    <SoundBtn
      $compact={compact}
      $muted={!soundEnabled}
      onClick={toggleSound}
      title={soundEnabled ? 'Mute Game FX (Card clicks, turns, game alerts)' : 'Unmute Game FX'}
    >
      {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
      {!compact && <span>{soundEnabled ? 'FX: On' : 'FX: Off'}</span>}
    </SoundBtn>
  );
}
