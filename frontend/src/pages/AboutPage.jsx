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

const Section = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 16px;

  @media (max-width: 600px) {
    padding: 14px;
    border-radius: 8px;
    margin-bottom: 12px;
  }
`;

const SectionHeading = styled.h2`
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 600px) {
    font-size: 15px;
  }
`;

const Text = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textMuted};

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 600px) {
    font-size: 13px;
    line-height: 1.5;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 10px;
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

    @media (max-width: 600px) {
      font-size: 14px;
    }
  }

  p {
    margin: 0;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.5;

    @media (max-width: 600px) {
      font-size: 12px;
    }
  }
`;

const TechStackList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  @media (max-width: 600px) {
    gap: 6px;
  }
`;

const TechBadge = styled.span`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  color: ${({ theme }) => theme.colors.goldLight};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;

  @media (max-width: 600px) {
    font-size: 11px;
    padding: 3px 8px;
  }
`;

const AuthorCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 600px) {
    padding: 12px;
    gap: 8px;
  }
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    gap: 10px;
  }
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

  @media (max-width: 600px) {
    font-size: 12px;
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
