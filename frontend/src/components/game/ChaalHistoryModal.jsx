import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History } from 'lucide-react';
import { PlayingCard } from '../cards/PlayingCard.jsx';
import { formatPlayerName } from '../../utils/nameUtils.js';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.gold};
  border-radius: 16px;
  width: 100%;
  max-width: 550px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h3`
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
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalBody = styled.div`
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HistoryEntry = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EntryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EntryResolution = styled.span`
  color: ${({ $isOffSuit, theme }) =>
    $isOffSuit ? theme.colors.danger : theme.colors.success};
  font-weight: 800;
`;

const CardsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: thin;
`;

const CardItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`;

const CardPlayerLabel = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 48px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  font-weight: 600;
`;

export function ChaalHistoryModal({ isOpen, onClose, history = [], players = [] }) {
  const playerMap = new Map((players || []).map(p => [p.id, p.username]));

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <History size={16} /> Chaal History
              </ModalTitle>
              <CloseButton onClick={onClose}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              {history.length === 0 ? (
                <EmptyState>No Chaals completed yet in this match.</EmptyState>
              ) : (
                history.map((item, index) => {
                  const isOffSuit = item.resolution?.type === 'off-suit';
                  return (
                    <HistoryEntry key={item.id || index}>
                      <EntryHeader>
                        <span>Chaal #{history.length - index} • {item.timestamp}</span>
                        <EntryResolution $isOffSuit={isOffSuit}>
                          {isOffSuit ? 'Off-Suit Penalty' : 'All Followed'}
                        </EntryResolution>
                      </EntryHeader>

                      {item.chaal?.playedCards && (
                        <CardsRow>
                          {item.chaal.playedCards.map((play, cIdx) => {
                            const rawName = playerMap.get(play.playerId) || 'Player';
                            const playerName = formatPlayerName(rawName, 5);
                            return (
                              <CardItem key={`${play.card.id}-${cIdx}`}>
                                <PlayingCard card={play.card} compact={true} />
                                <CardPlayerLabel title={rawName}>{playerName}</CardPlayerLabel>
                              </CardItem>
                            );
                          })}
                        </CardsRow>
                      )}
                    </HistoryEntry>
                  );
                })
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}
