import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  width: 100%;
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

const FooterInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DevCredit = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;

  strong {
    color: ${({ theme }) => theme.colors.goldLight};
    font-weight: 700;
  }
`;

const LinkGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
    text-decoration: underline;
  }
`;

const NavTextButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
    text-decoration: underline;
  }
`;

export function Footer({ onNavigate }) {
  return (
    <FooterContainer>
      <FooterInner>
        <LeftSection>
          <DevCredit>
            Developed by <strong>Rajan Verma</strong>
          </DevCredit>
          <span style={{ fontSize: '12px', color: '#6e8077' }}>
            Real-time multiplayer card engine with room synchronization & WebRTC voice.
          </span>
        </LeftSection>

        <LinkGroup>
          <NavTextButton onClick={() => onNavigate('rules')}>Rules</NavTextButton>
          <NavTextButton onClick={() => onNavigate('tutorial')}>How to Play</NavTextButton>
          <NavTextButton onClick={() => onNavigate('about')}>About</NavTextButton>
          <FooterLink
            href="https://www.linkedin.com/in/rajan-verma-10363124a/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </FooterLink>
          <FooterLink
            href="https://rajan-ui.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Portfolio
          </FooterLink>
        </LinkGroup>
      </FooterInner>
    </FooterContainer>
  );
}
