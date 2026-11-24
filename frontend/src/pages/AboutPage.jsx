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

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 14px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureItem = styled.div`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 8px;
  padding: 14px;

  h3 {
    margin: 0 0 6px 0;
    font-size: 15px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin: 0;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.5;
  }
`;

const TechStackList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const TechBadge = styled.span`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  color: ${({ theme }) => theme.colors.goldLight};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
`;

const AuthorCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 8px;
  padding: 18px;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`;

const ExtLink = styled.a`
  color: ${({ theme }) => theme.colors.gold};
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.goldLight};
    text-decoration: underline;
  }
`;

export function AboutPage() {
  return (
    <PageWrapper>
      <Header>
        <Title>About Make Donkey</Title>
        <Subtitle>
          An authoritative, real-time multiplayer implementation of the classic regional card game,
          designed with resilient network synchronization and voice chat.
        </Subtitle>
      </Header>

      <Section>
        <SectionHeading>Project Overview</SectionHeading>
        <Text>
          Make Donkey is built as a production-grade full-stack multiplayer card game.
          Traditional card platforms often suffer from mobile connection drops, race conditions during rapid tapping,
          and client-side cheating. This project was developed with a 100% <strong>server-authoritative game engine</strong>,
          meaning moves, suit enforcement, penalty resolutions, and hand histories are strictly validated by the server before any state changes are emitted.
        </Text>
      </Section>

      <Section>
        <SectionHeading>Architecture & Key Engineering Features</SectionHeading>
        <FeatureGrid>
          <FeatureItem>
            <h3>Authoritative Game Engine</h3>
            <p>
              Zero client-side trust. Suit rules, starter rotation, card distributions, and penalty pile returns are executed synchronously in an isolated Node.js engine.
            </p>
          </FeatureItem>
          <FeatureItem>
            <h3>Resilient Socket Synchronization</h3>
            <p>
              Reconnection grace periods protect mobile players during screen locks, Wi-Fi transitions, and incoming phone interruptions without disrupting room play.
            </p>
          </FeatureItem>
          <FeatureItem>
            <h3>Peer-to-Peer Voice Chat</h3>
            <p>
              Mesh WebRTC voice signaling integrated directly over Socket.IO rooms, with real-time mute indicators and zero external media server overhead.
            </p>
          </FeatureItem>
          <FeatureItem>
            <h3>Safe Serialization & Memory Isolation</h3>
            <p>
              Strict separation between server timers and client payloads, eliminating circular reference serialization errors and memory leaks across long matches.
            </p>
          </FeatureItem>
        </FeatureGrid>
      </Section>

      <Section>
        <SectionHeading>Technology Stack</SectionHeading>
        <Text>
          Engineered using modern web technologies focused on real-time performance and responsiveness:
        </Text>
        <TechStackList>
          <TechBadge>React 18</TechBadge>
          <TechBadge>Node.js</TechBadge>
          <TechBadge>Socket.IO</TechBadge>
          <TechBadge>WebRTC</TechBadge>
          <TechBadge>Zustand</TechBadge>
          <TechBadge>Styled Components</TechBadge>
          <TechBadge>Vite</TechBadge>
          <TechBadge>Vitest</TechBadge>
        </TechStackList>
      </Section>

      <Section>
        <SectionHeading>Developer & Contact</SectionHeading>
        <Text>
          This project was designed, engineered, and maintained by <strong>Rajan Verma</strong>.
        </Text>
        <AuthorCard>
          <div style={{ fontSize: '14px', color: '#f0f5f2', fontWeight: 600 }}>
            Rajan Verma — Full Stack Engineer
          </div>
          <div style={{ fontSize: '13px', color: '#96a89f' }}>
            Specializing in high-performance web applications, interactive interfaces, and real-time multiplayer systems.
          </div>
          <LinkRow>
            <ExtLink
              href="https://www.linkedin.com/in/rajan-verma-10363124a/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn Profile
            </ExtLink>
            <ExtLink
              href="https://rajan-ui.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Portfolio Website
            </ExtLink>
          </LinkRow>
        </AuthorCard>
      </Section>
    </PageWrapper>
  );
}
