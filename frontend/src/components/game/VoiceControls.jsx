import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Mic, MicOff } from 'lucide-react';
import { voiceChatService } from '../../services/voiceChatService.js';

const MicButton = styled.button`
  background: ${({ $isMuted, $active, theme }) =>
    !$active
      ? 'rgba(0, 0, 0, 0.45)'
      : $isMuted
      ? 'rgba(239, 68, 68, 0.25)'
      : 'rgba(16, 185, 129, 0.25)'};
  border: 1px solid
    ${({ $isMuted, $active, theme }) =>
      !$active
        ? 'rgba(255, 255, 255, 0.15)'
        : $isMuted
        ? theme.colors.danger
        : theme.colors.success};
  color: ${({ $isMuted, $active, theme }) =>
    !$active
      ? theme.colors.textMuted
      : $isMuted
      ? theme.colors.danger
      : theme.colors.success};
  padding: ${({ $compact }) => ($compact ? '4px 6px' : '5px 12px')};
  border-radius: ${({ $compact, theme }) => ($compact ? '6px' : theme.radii.full)};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 600px) {
    padding: ${({ $compact }) => ($compact ? '3px 5px' : '4px 8px')};
    font-size: 10px;
  }
`;

export function VoiceControls({ socket, roomCode, players, myUserId, compact = false }) {
  // Sync initial state with voiceChatService singleton
  const [isActive, setIsActive] = useState(voiceChatService.isEnabled);
  const [isMuted, setIsMuted] = useState(voiceChatService.isMuted);

  useEffect(() => {
    if (socket) {
      voiceChatService.init(socket, () => {
        setIsActive(voiceChatService.isEnabled);
        setIsMuted(voiceChatService.isMuted);
      });
    }

    // Sync state in case voice is already active from lobby
    if (voiceChatService.isEnabled) {
      setIsActive(true);
      setIsMuted(voiceChatService.isMuted);
      if (players && players.length > 0) {
        voiceChatService.syncPeers(players, myUserId);
      }
    }
  }, [socket, players, myUserId]);

  const handleToggleVoice = async () => {
    if (!isActive) {
      const res = await voiceChatService.startVoice(players, myUserId);
      if (res.success) {
        setIsActive(true);
        setIsMuted(false);
      } else {
        alert('Could not access microphone: ' + res.error);
      }
    } else {
      const nowMuted = voiceChatService.toggleMute(roomCode);
      setIsMuted(nowMuted);
    }
  };

  return (
    <MicButton
      $compact={compact}
      $active={isActive}
      $isMuted={isMuted}
      onClick={handleToggleVoice}
      title={!isActive ? 'Click to enable Voice Chat' : isMuted ? 'Unmute Mic' : 'Mute Mic'}
    >
      {!isActive ? (
        <>
          <MicOff size={13} />
          {!compact && <span>Join Voice</span>}
        </>
      ) : isMuted ? (
        <>
          <MicOff size={13} />
          {!compact && <span>Muted</span>}
        </>
      ) : (
        <>
          <Mic size={13} />
          {!compact && <span>Mic On</span>}
        </>
      )}
    </MicButton>
  );
}
