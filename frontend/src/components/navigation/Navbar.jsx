import React from 'react';
import styled from 'styled-components';
import { SoundToggle } from '../common/SoundToggle.jsx';

const NavContainer = styled.header`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  background: ${({ theme }) => theme.colors.surface};
  position: sticky;
  top: 0;
  z-index: 40;
`;

const NavInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Brand = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.goldLight};
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const BrandTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  padding: 2px 6px;
  border-radius: 4px;
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 640px) {
    gap: 4px;
  }
`;

const NavButton = styled.button`
  background: ${({ $active, theme }) => ($active ? theme.colors.surfaceLight : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.text : theme.colors.textMuted)};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.surfaceBorder : 'transparent')};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceLight};
  }

  @media (max-width: 640px) {
    padding: 6px 8px;
    font-size: 12px;
  }
`;

export function Navbar({ activePage, onNavigate }) {
  return (
    <NavContainer>
      <NavInner>
        <Brand onClick={() => onNavigate('home')}>
          Make Donkey
          <BrandTag>Multiplayer</BrandTag>
        </Brand>

        <NavLinks>
          <NavButton $active={activePage === 'home'} onClick={() => onNavigate('home')}>
            Play
          </NavButton>
          <NavButton $active={activePage === 'rules'} onClick={() => onNavigate('rules')}>
            Rules
          </NavButton>
          <NavButton $active={activePage === 'tutorial'} onClick={() => onNavigate('tutorial')}>
            How to Play
          </NavButton>
          <NavButton $active={activePage === 'about'} onClick={() => onNavigate('about')}>
            About
          </NavButton>
          <SoundToggle />
        </NavLinks>
      </NavInner>
    </NavContainer>
  );
}
