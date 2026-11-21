import React from 'react';
import styled, { css } from 'styled-components';
import { CardBack } from '../cards/CardBack.jsx';
import { Crown, Trophy } from 'lucide-react';

const SeatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  gap: 6px;
  user-select: none;
`;

const AvatarRing = styled.div`
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme, $isTurn, $isWinner }) =>
    $isWinner ? theme.colors.success : $isTurn ? theme.colors.gold : theme.colors.surfaceBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
  position: relative;
  box-shadow: ${({ theme, $isTurn }) => ($isTurn ? theme.shadows.glowGold : 'none')};
  transition: all 0.3s ease;

  ${({ $isDisconnected }) =>
    $isDisconnected &&
    css`
      opacity: 0.5;
      filter: grayscale(100%);
    `}
`;

const HostBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -6px;
  background: ${({ theme }) => theme.colors.gold};
  color: #000;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WinnerBadge = styled.div`
  position: absolute;
  bottom: -6px;
  background: ${({ theme }) => theme.colors.success};
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 3px;
`;

const PlayerName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme, $isTurn }) => ($isTurn ? theme.colors.goldLight : theme.colors.text)};
  max-width: 90px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const CardCountPill = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export function PlayerSeat({ player, isTurn, isStarter }) {
  const isWinner = player.status === 'winner';
  const isDisconnected = !player.connected;

  return (
    <SeatContainer>
      <AvatarRing $isTurn={isTurn} $isWinner={isWinner} $isDisconnected={isDisconnected}>
        {player.username.charAt(0).toUpperCase()}

        {player.isHost && (
          <HostBadge title="Room Host">
            <Crown size={12} />
          </HostBadge>
        )}

        {isWinner && (
          <WinnerBadge>
            <Trophy size={10} /> WIN
          </WinnerBadge>
        )}
      </AvatarRing>

      <PlayerName $isTurn={isTurn}>
        {player.username} {isStarter && '⭐'}
      </PlayerName>

      <CardCountPill>
        🂠 {player.cardCount} cards
      </CardCountPill>
    </SeatContainer>
  );
}
