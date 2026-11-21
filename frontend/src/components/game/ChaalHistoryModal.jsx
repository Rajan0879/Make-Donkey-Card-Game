import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, AlertCircle } from 'lucide-react';
import { PlayingCard } from '../cards/PlayingCard.jsx';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: ${({ theme }) => theme.colors.surfaceLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.goldLight};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: 50%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const HistoryList = styled.div`
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const HistoryCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
`;

const TypeBadge = styled.span`
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  background: ${({ $isOffSuit }) => ($isOffSuit ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)')};
  color: ${({ $isOffSuit, theme }) => ($isOffSuit ? theme.colors.danger : theme.colors.success)};
  border: 1px solid ${({ $isOffSuit, theme }) => ($isOffSuit ? theme.colors.danger : theme.colors.success)};
`;

const CardsPreviewRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 6px 0;
`;

const CardItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const PlayerTag = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OutcomeText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 10px;
  border-radius: 6px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 40px 20px;
  font-size: 14px;
`;

export function ChaalHistoryModal({ isOpen, onClose, history = [], players = [] }) {
  if (!isOpen) return null;

  const playerMap = new Map((players || []).map(p => [p.id, p.username]));

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <Header>
            <Title>
              <History size={18} /> Chaal History
            </Title>
            <CloseButton onClick={onClose}>
              <X size={18} />
            </CloseButton>
          </Header>

          <HistoryList>
            {history.length === 0 ? (
              <EmptyState>No Chaals completed yet in this match.</EmptyState>
            ) : (
              history.map((item, idx) => {
                const res = item.resolution;
                const chaal = item.chaal;
                const isOffSuit = res.type === 'off-suit';
                const starterName = playerMap.get(res.starterId) || 'Starter';
                const nextStarterName = playerMap.get(res.nextStarterId) || 'Next Player';

                return (
                  <HistoryCard key={item.id || idx}>
                    <HistoryHeader>
                      <span>Chaal #{history.length - idx} • {item.timestamp}</span>
                      <TypeBadge $isOffSuit={isOffSuit}>
                        {isOffSuit ? 'Off-Suit Penalty' : 'All-Follow Round'}
                      </TypeBadge>
                    </HistoryHeader>

                    {chaal && chaal.playedCards && (
                      <CardsPreviewRow>
                        {chaal.playedCards.map((play, cIdx) => (
                          <CardItem key={cIdx}>
                            <PlayingCard card={play.card} compact={true} />
                            <PlayerTag>{playerMap.get(play.playerId) || 'P'}</PlayerTag>
                          </CardItem>
                        ))}
                      </CardsPreviewRow>
                    )}

                    <OutcomeText>
                      {isOffSuit ? (
                        <>
                          ⚠️ <strong>{starterName}</strong> took all cards back. Next turn: <strong>{nextStarterName}</strong>.
                        </>
                      ) : (
                        <>
                          ✨ All cards permanently discarded. Highest card holder <strong>{nextStarterName}</strong> leads next Chaal.
                        </>
                      )}
                    </OutcomeText>
                  </HistoryCard>
                );
              })
            )}
          </HistoryList>
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}
