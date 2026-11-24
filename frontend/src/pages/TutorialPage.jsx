import React from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 16px 40px;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 600px) {
    padding: 16px 12px 32px;
  }
`;

const Header = styled.div`
  margin-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  padding-bottom: 14px;

  @media (max-width: 600px) {
    margin-bottom: 18px;
    padding-bottom: 12px;
  }
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 6px 0;
  color: ${({ theme }) => theme.colors.goldLight};

  @media (max-width: 600px) {
    font-size: 22px;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;

  @media (max-width: 600px) {
    font-size: 13px;
  }
`;

const StepGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const StepCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 10px;
  padding: 18px;
  display: flex;
  gap: 14px;

  @media (max-width: 600px) {
    padding: 14px;
    gap: 12px;
  }
`;

const StepNumber = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  color: ${({ theme }) => theme.colors.goldLight};
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
`;

const StepContent = styled.div`
  flex: 1;
  min-width: 0;

  h2 {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 6px 0;
    color: ${({ theme }) => theme.colors.text};

    @media (max-width: 600px) {
      font-size: 15px;
    }
  }

  p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }

    @media (max-width: 600px) {
      font-size: 13px;
      line-height: 1.5;
    }
  }
`;

const ProTip = styled.div`
  background: rgba(229, 184, 66, 0.08);
  border-left: 3px solid ${({ theme }) => theme.colors.gold};
  padding: 8px 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0 6px 6px 0;
  margin-top: 8px;

  strong {
    color: ${({ theme }) => theme.colors.goldLight};
  }

  @media (max-width: 600px) {
    font-size: 12px;
    padding: 6px 10px;
  }
`;

const ActionBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 8px;
  padding: 16px 18px;
  margin-top: 24px;
  gap: 14px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    padding: 14px;
    gap: 12px;
  }
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
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.goldLight};
  }

  @media (max-width: 600px) {
    width: 100%;
    padding: 12px;
    text-align: center;
  }
`;

export function TutorialPage({ onStartPlaying }) {
  return (
    <PageWrapper>
      <Header>
        <Title>Interactive Tutorial & How to Play</Title>
        <Subtitle>
          A step-by-step guide to hosting a match, making moves on mobile or desktop, and avoiding the Donkey penalty.
        </Subtitle>
      </Header>

      <StepGrid>
        <StepCard>
          <StepNumber>1</StepNumber>
          <StepContent>
            <h2>Create or Join a Room</h2>
            <p>
              On the main screen, enter your name. Click <strong>Host a Game</strong> to generate a unique 6-character room code (e.g. <code>X8W7R7</code>), or enter an existing code under <strong>Join a Game</strong>.
            </p>
            <ProTip>
              <strong>Tip:</strong> In the lobby, tap the room badge to copy just the 6-character code to your clipboard.
            </ProTip>
          </StepContent>
        </StepCard>

        <StepCard>
          <StepNumber>2</StepNumber>
          <StepContent>
            <h2>Mark Ready & Start the Game</h2>
            <p>
              Make Donkey requires a minimum of 3 players (up to 6). Every joined player clicks <strong>Mark Ready</strong>. Once all players are ready, the host clicks <strong>Start Game</strong> to deal the cards.
            </p>
          </StepContent>
        </StepCard>

        <StepCard>
          <StepNumber>3</StepNumber>
          <StepContent>
            <h2>Watch the Turn Ring & Starting Suit</h2>
            <p>
              When it is your turn, your seat glows with a gold indicator and the turn timer counts down. The center of the table displays the <strong>Starting Suit</strong> for the current round.
            </p>
            <ProTip>
              <strong>First Round Rule:</strong> Whoever holds the <strong>Ace of Spades (♠A)</strong> must lead with it.
            </ProTip>
          </StepContent>
        </StepCard>

        <StepCard>
          <StepNumber>4</StepNumber>
          <StepContent>
            <h2>Play a Card (Tap Twice or Press Button)</h2>
            <p>
              Your cards are organized by suit. Tap any valid card once to lift/select it. Tap it again to immediately throw it onto the table, or click the bottom <strong>Play Card</strong> button.
            </p>
            <p>
              Illegal cards (e.g. attempting to throw a Heart when you still hold Spades) will shake and display a brief explanation banner.
            </p>
          </StepContent>
        </StepCard>

        <StepCard>
          <StepNumber>5</StepNumber>
          <StepContent>
            <h2>Off-Suit Penalty ("Cutting")</h2>
            <p>
              When a suit you don't possess is led, you can throw an <strong>off-suit card</strong>. The round stops immediately. Whoever threw the highest card of the starting suit takes every card played in that round into their hand!
            </p>
            <ProTip>
              <strong>Strategy:</strong> Getting rid of high cards when someone else leads a suit you lack is the key to emptying your hand quickly.
            </ProTip>
          </StepContent>
        </StepCard>

        <StepCard>
          <StepNumber>6</StepNumber>
          <StepContent>
            <h2>Winning vs. Donkey</h2>
            <p>
              The moment you play your last card, you become a <strong>Winner (Safe)</strong>. The match continues with remaining players until only one player is left holding cards — that player is declared the <strong>Donkey</strong>.
            </p>
          </StepContent>
        </StepCard>
      </StepGrid>

      <ActionBanner>
        <div>
          <strong style={{ display: 'block', marginBottom: 4 }}>Ready to give it a try?</strong>
          <span style={{ fontSize: 13, color: '#96a89f' }}>
            Jump into a room or test with friends on desktop or mobile.
          </span>
        </div>
        <Button onClick={onStartPlaying}>Go to Play</Button>
      </ActionBanner>
    </PageWrapper>
  );
}
