import React from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 16px 48px;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.text};
`;

const Header = styled.div`
  margin-bottom: 28px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  padding-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.goldLight};
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SectionHeading = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Text = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textMuted};

  &:last-child {
    margin-bottom: 0;
  }
`;

const RuleList = styled.ol`
  margin: 0;
  padding-left: 20px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  line-height: 1.7;

  li {
    margin-bottom: 8px;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-top: 12px;

  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  }

  th {
    background: ${({ theme }) => theme.colors.surfaceLight};
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }

  td {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ActionBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 8px;
  padding: 16px 20px;
  margin-top: 24px;
  gap: 16px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.gold};
  color: #000;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.goldLight};
  }
`;

export function RulesPage({ onStartPlaying }) {
  return (
    <PageWrapper>
      <Header>
        <Title>Official Game Rules</Title>
        <Subtitle>
          Make Donkey (also known as Get Away / Bhabhi) is an elimination-style shedding card game.
          The primary objective is to empty your hand. The last player left holding cards becomes the Donkey.
        </Subtitle>
      </Header>

      <Section>
        <SectionHeading>1. Deck & Player Distribution</SectionHeading>
        <Text>
          A standard 52-card deck is used (ranks 2 through Ace, where Ace is high).
          Games support 3 to 6 players. Cards are distributed in rounds until hands are dealt:
        </Text>
        <Table>
          <thead>
            <tr>
              <th>Player Count</th>
              <th>Cards Dealt Per Player</th>
              <th>Cards Set Aside</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>3 Players</td>
              <td>16 cards each</td>
              <td>0 (all active cards in play)</td>
            </tr>
            <tr>
              <td>4 Players</td>
              <td>12 cards each</td>
              <td>0</td>
            </tr>
            <tr>
              <td>5 Players</td>
              <td>9 cards each</td>
              <td>3 cards removed (Ace of Spades is never removed)</td>
            </tr>
            <tr>
              <td>6 Players</td>
              <td>8 cards each</td>
              <td>0</td>
            </tr>
          </tbody>
        </Table>
      </Section>

      <Section>
        <SectionHeading>2. Starting the Game (First Chaal)</SectionHeading>
        <RuleList>
          <li>
            <strong>Opening Lead:</strong> The player dealt the <strong>Ace of Spades (♠A)</strong> must lead the very first Chaal (round) with that exact card.
          </li>
          <li>
            <strong>Following Suit:</strong> Every other player in clockwise order must play a Spade if they hold one.
          </li>
          <li>
            <strong>Timer Limit:</strong> Each player gets 90 seconds per turn. If the starter times out on the first hand, the turn advances clockwise and the Ace of Spades requirement is cleared.
          </li>
        </RuleList>
      </Section>

      <Section>
        <SectionHeading>3. Following Suit vs. Cutting (Off-Suit)</SectionHeading>
        <Text>
          Each round establishes a <strong>starting suit</strong> based on the first card played in that round:
        </Text>
        <RuleList>
          <li>
            <strong>Mandatory Following:</strong> If you hold one or more cards of the starting suit, you <strong>must</strong> play one of them. You cannot intentionally discard another suit while holding the lead suit.
          </li>
          <li>
            <strong>Scenario A — All Players Follow:</strong> If all active players play the starting suit, all played cards are permanently discarded from the game. The player who threw the <em>highest card of the starting suit</em> starts the next round.
          </li>
          <li>
            <strong>Scenario B — Off-Suit Penalty ("Thoko" / Cut):</strong> If an active player does not possess any card of the starting suit, they may throw <em>any card</em> of a different suit.
            This immediately ends the round. The player who threw the <strong>highest card of the starting suit</strong> in that round is penalized and must take all cards played in this round into their hand. That penalty player leads the next round.
          </li>
        </RuleList>
      </Section>

      <Section>
        <SectionHeading>4. Winning & Declaring the Donkey</SectionHeading>
        <RuleList>
          <li>
            <strong>Safe / Winners:</strong> Once a player empties all cards from their hand at the conclusion of a round, they are officially <strong>Safe (Winner)</strong> and exit play.
          </li>
          <li>
            <strong>The Donkey:</strong> The game continues until only <strong>one player</strong> remains holding cards. That final player is declared the <strong>Donkey</strong>.
          </li>
          <li>
            <strong>Forfeits & Disconnects:</strong> A 90-second reconnect grace window protects players who experience network drops. If a player permanently leaves, their cards are retired, the round resets safely, and remaining players finish the match.
          </li>
        </RuleList>
      </Section>

      <ActionBanner>
        <div>
          <strong style={{ display: 'block', marginBottom: 4 }}>Ready to test your strategy?</strong>
          <span style={{ fontSize: 13, color: '#96a89f' }}>
            Create a private room or enter a friend's room code to play right now.
          </span>
        </div>
        <Button onClick={onStartPlaying}>Play Make Donkey</Button>
      </ActionBanner>
    </PageWrapper>
  );
}
