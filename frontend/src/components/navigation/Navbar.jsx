import React, { useState } from 'react';
import styled from 'styled-components';
import { SoundToggle } from '../common/SoundToggle.jsx';
import { Menu, X } from 'lucide-react';

const NavContainer = styled.header`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  background: ${({ theme }) => theme.colors.surface};
  position: sticky;
  top: 0;
  z-index: 50;
`;

const NavInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

/* Desktop links */
const DesktopLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    display: none;
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
`;

/* Mobile right side: sound + hamburger */
const MobileActions = styled.div`
  display: none;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const HamburgerButton = styled.button`
  background: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  color: ${({ theme }) => theme.colors.text};
  padding: 7px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
    border-color: ${({ theme }) => theme.colors.gold};
  }
`;

/* Mobile drop-down drawer */
const MobileMenu = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.surfaceBorder};
  padding: 12px 16px 16px;
  gap: 8px;

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileNavButton = styled.button`
  background: ${({ $active, theme }) => ($active ? theme.colors.surfaceLight : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.goldLight : theme.colors.text)};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.surfaceBorder : 'transparent')};
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceLight};
    color: ${({ theme }) => theme.colors.gold};
  }
`;

export function Navbar({ activePage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <NavContainer>
      <NavInner>
        <Brand onClick={() => handleNavClick('home')}>
          Make Donkey
          <BrandTag>Multiplayer</BrandTag>
        </Brand>

        {/* Desktop Navigation */}
        <DesktopLinks>
          <NavButton $active={activePage === 'home'} onClick={() => handleNavClick('home')}>
            Play
          </NavButton>
          <NavButton $active={activePage === 'rules'} onClick={() => handleNavClick('rules')}>
            Rules
          </NavButton>
          <NavButton $active={activePage === 'tutorial'} onClick={() => handleNavClick('tutorial')}>
            How to Play
          </NavButton>
          <NavButton $active={activePage === 'about'} onClick={() => handleNavClick('about')}>
            About
          </NavButton>
          <SoundToggle />
        </DesktopLinks>

        {/* Mobile Actions: Sound + Hamburger */}
        <MobileActions>
          <SoundToggle compact={true} />
          <HamburgerButton
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </HamburgerButton>
        </MobileActions>
      </NavInner>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <MobileMenu>
          <MobileNavButton
            $active={activePage === 'home'}
            onClick={() => handleNavClick('home')}
          >
            <span>Play Game</span>
            {activePage === 'home' && <span style={{ fontSize: 11 }}>●</span>}
          </MobileNavButton>
          <MobileNavButton
            $active={activePage === 'rules'}
            onClick={() => handleNavClick('rules')}
          >
            <span>Rules</span>
            {activePage === 'rules' && <span style={{ fontSize: 11 }}>●</span>}
          </MobileNavButton>
          <MobileNavButton
            $active={activePage === 'tutorial'}
            onClick={() => handleNavClick('tutorial')}
          >
            <span>How to Play</span>
            {activePage === 'tutorial' && <span style={{ fontSize: 11 }}>●</span>}
          </MobileNavButton>
          <MobileNavButton
            $active={activePage === 'about'}
            onClick={() => handleNavClick('about')}
          >
            <span>About</span>
            {activePage === 'about' && <span style={{ fontSize: 11 }}>●</span>}
          </MobileNavButton>
        </MobileMenu>
      )}
    </NavContainer>
  );
}
