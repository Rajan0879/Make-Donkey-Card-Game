import React from 'react';
import styled, { css } from 'styled-components';
import { Crown, Trophy } from 'lucide-react';
import { getPlayerAvatar } from '../../utils/avatarUtils.js';

const SeatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  gap: 3px;
  user-select: none;
  min-width: 60px;
  max-width: 80px;
  flex-shrink: 0;
`;

const AvatarRing = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ $bg, theme }) => $bg || theme.colors.surface};
  border: 2px solid ${({ theme, $isTurn, $isWinner }) =>
    $isWinner ? theme.colors.success : $isTurn ? theme.colors.gold : 'rgba(255, 255, 255, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  position: relative;
  box-shadow: ${({ theme, $isTurn }) =>
    $isTurn ? '0 0 16px rgba(229, 184, 66, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3)' : '0 2px 8px rgba(0,0,0,0.5)'};
  transition: all 0.3s ease;
  transform: ${({ $isTurn }) => ($isTurn ? 'scale(1.08)' : 'scale(1)')};

  ${({ $isDisconnected }) =>
    $isDisconnected &&
    css`
      opacity: 0.45;
      filter: grayscale(100%);
    `}

  @media (max-width: 600px) {
    width: 38px;
    height: 38px;
    font-size: 19px;
  }
`;

const HostBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${({ theme }) => theme.colors.gold};
  color: #000;
  border-radius: 50%;
  width: 17px;
  height: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.4);
`;

const WinnerBadge = styled.div`
  position: absolute;
  bottom: -5px;
  background: ${({ theme }) => theme.colors.success};
  color: #fff;
  padding: 1px 5px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.4);
`;

const PlayerName = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme, $isTurn }) => ($isTurn ? theme.colors.goldLight : theme.colors.text)};
  max-width: 72px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
`;

const CardCountPill = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
`;

export function PlayerSeat({ player, isTurn, isStarter, seatIndex = 0 }) {
  const isWinner = player.status === 'winner';
  const isDisconnected = !player.connected;
  const avatarInfo = getPlayerAvatar(seatIndex);

  return (
    <SeatContainer>
      <AvatarRing
        $bg={avatarInfo.bg}
        $isTurn={isTurn}
        $isWinner={isWinner}
        $isDisconnected={isDisconnected}
      >
        <span role="img" aria-label={avatarInfo.name}>
          {avatarInfo.emoji}
        </span>

        {player.isHost && (
          <HostBadge title="Room Host">
            <Crown size={10} />
          </HostBadge>
        )}

        {isWinner && (
          <WinnerBadge>
            <Trophy size={9} /> WIN
          </WinnerBadge>
        )}
      </AvatarRing>

      <PlayerName $isTurn={isTurn}>
        {player.username} {isStarter && '⭐'}
      </PlayerName>

      <CardCountPill>
        🂠 {player.cardCount}
      </CardCountPill>
    </SeatContainer>
  );
}
