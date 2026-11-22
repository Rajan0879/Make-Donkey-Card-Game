import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../styles/theme.js';
import { PlayingCard } from '../components/cards/PlayingCard.jsx';
import { PlayerHand } from '../components/game/PlayerHand.jsx';
import { PlayerSeat } from '../components/game/PlayerSeat.jsx';

const renderWithTheme = (ui) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('PlayingCard Component', () => {
  it('renders card suit symbol and rank correctly', () => {
    const card = { id: 'spades-A', suit: 'spades', rank: 'A', value: 14 };
    renderWithTheme(<PlayingCard card={card} />);
    
    expect(screen.getAllByText('A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('♠').length).toBeGreaterThan(0);
  });

  it('triggers onClick when clicked and not disabled', () => {
    const card = { id: 'hearts-K', suit: 'hearts', rank: 'K', value: 13 };
    const handleClick = vi.fn();
    renderWithTheme(<PlayingCard card={card} onClick={handleClick} disabled={false} />);
    
    const cardElement = screen.getAllByText('K')[0].closest('[tabindex="0"]');
    fireEvent.click(cardElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick when disabled', () => {
    const card = { id: 'hearts-K', suit: 'hearts', rank: 'K', value: 13 };
    const handleClick = vi.fn();
    renderWithTheme(<PlayingCard card={card} onClick={handleClick} disabled={true} />);
    
    const cardElement = screen.getAllByText('K')[0].closest('[tabindex="0"]');
    fireEvent.click(cardElement);
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('PlayerHand Component', () => {
  const mockHand = [
    { id: 'spades-A', suit: 'spades', rank: 'A', value: 14 },
    { id: 'hearts-10', suit: 'hearts', rank: '10', value: 10 }
  ];

  it('renders hand cards and suit count indicators', () => {
    renderWithTheme(
      <PlayerHand
        hand={mockHand}
        selectedCardId={null}
        onSelectCard={() => {}}
        onPlayCard={() => {}}
        isMyTurn={false}
      />
    );

    expect(screen.getByText('Hand (2):')).toBeInTheDocument();
    expect(screen.getByText('Wait for your turn')).toBeDisabled();
  });

  it('displays safe notification and hides wait button when hand is empty', () => {
    renderWithTheme(
      <PlayerHand
        hand={[]}
        selectedCardId={null}
        onSelectCard={() => {}}
        onPlayCard={() => {}}
        isMyTurn={false}
      />
    );

    expect(screen.getByText(/You emptied all your cards! You are SAFE/i)).toBeInTheDocument();
    expect(screen.queryByText('Wait for your turn')).not.toBeInTheDocument();
  });
});

describe('PlayerSeat Component', () => {
  it('displays player name and card count pill', () => {
    const mockPlayer = {
      id: 'p1',
      username: 'Alice',
      cardCount: 7,
      connected: true,
      status: 'active'
    };

    renderWithTheme(<PlayerSeat player={mockPlayer} isTurn={false} isStarter={false} seatIndex={0} />);

    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/7/)).toBeInTheDocument();
  });

  it('displays reconnecting badge when player is disconnected', () => {
    const mockPlayer = {
      id: 'p2',
      username: 'Bob',
      cardCount: 4,
      connected: false,
      status: 'active'
    };

    renderWithTheme(<PlayerSeat player={mockPlayer} isTurn={false} isStarter={false} seatIndex={1} />);

    expect(screen.getByTitle('Player is reconnecting...')).toBeInTheDocument();
  });
});
