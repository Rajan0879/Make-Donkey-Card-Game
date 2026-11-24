import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme.js';
import { GlobalStyle } from './styles/globalStyles.js';
import { useRoomStore } from './store/roomStore.js';
import { useGameStore } from './store/gameStore.js';
import { useAuthStore } from './store/authStore.js';
import { useSocket } from './hooks/useSocket.js';
import { LandingPage } from './pages/LandingPage.jsx';
import { RulesPage } from './pages/RulesPage.jsx';
import { TutorialPage } from './pages/TutorialPage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { Navbar } from './components/navigation/Navbar.jsx';
import { Footer } from './components/navigation/Footer.jsx';
import { RoomLobby } from './components/lobby/RoomLobby.jsx';
import { GameTable } from './components/game/GameTable.jsx';

const AppContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export function App() {
  const socket = useSocket();
  const { user } = useAuthStore();
  const { room, setRoom, clearRoom } = useRoomStore();
  const { gameState, resetGame } = useGameStore();

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'rules' | 'tutorial' | 'about'

  const isPlaying = gameState && gameState.status === 'playing';

  // 1. Initial route detection & direct link joining
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/(room|game)\/([a-zA-Z0-9]+)/);
    if (match) {
      const codeFromUrl = match[2].toUpperCase();
      // If we don't have this room in store yet, join it via socket
      if ((!room || room.code !== codeFromUrl) && socket) {
        socket.emit('join_room', { roomCode: codeFromUrl, username: user?.username }, (res) => {
          if (res && res.success) {
            setRoom(res.room);
          } else if (res && !res.success) {
            clearRoom();
            resetGame();
            window.history.pushState(null, '', '/');
          }
        });
      }
    } else if (path === '/rules') {
      setActiveTab('rules');
    } else if (path === '/tutorial' || path === '/how-to-play') {
      setActiveTab('tutorial');
    } else if (path === '/about') {
      setActiveTab('about');
    }
  }, [socket, user?.username, room, setRoom, clearRoom, resetGame]);

  // 2. Synchronize URL bar with current app stage without breaking WebSocket
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (isPlaying && (gameState?.roomId || room?.code)) {
      const code = gameState?.roomId || room?.code;
      const targetPath = `/game/${code}`;
      if (currentPath !== targetPath) {
        window.history.pushState({ stage: 'game', code }, '', targetPath);
      }
    } else if (room && room.code) {
      const targetPath = `/room/${room.code}`;
      if (currentPath !== targetPath) {
        window.history.pushState({ stage: 'room', code: room.code }, '', targetPath);
      }
    } else if (!room && !isPlaying) {
      const targetPath = activeTab === 'home' ? '/' : `/${activeTab}`;
      if (currentPath !== targetPath) {
        window.history.pushState({ stage: activeTab }, '', targetPath);
      }
    }
  }, [isPlaying, gameState?.roomId, room, activeTab]);

  // 3. Handle browser Back/Forward buttons smoothly
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') {
        setActiveTab('home');
        if (room) {
          socket.emit('leave_room', { roomCode: room.code });
          clearRoom();
          resetGame();
        }
      } else if (path === '/rules') {
        setActiveTab('rules');
      } else if (path === '/tutorial' || path === '/how-to-play') {
        setActiveTab('tutorial');
      } else if (path === '/about') {
        setActiveTab('about');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [room, socket, clearRoom, resetGame]);

  const handleLeaveAll = () => {
    window.history.pushState(null, '', '/');
    resetGame();
    clearRoom();
    setActiveTab('home');
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showHeaderAndFooter = !isPlaying && !room;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        {showHeaderAndFooter && (
          <Navbar activePage={activeTab} onNavigate={handleNavigate} />
        )}

        <ContentArea>
          {isPlaying ? (
            <GameTable onLeave={handleLeaveAll} />
          ) : room ? (
            <RoomLobby onLeave={handleLeaveAll} />
          ) : activeTab === 'rules' ? (
            <RulesPage onStartPlaying={() => handleNavigate('home')} />
          ) : activeTab === 'tutorial' ? (
            <TutorialPage onStartPlaying={() => handleNavigate('home')} />
          ) : activeTab === 'about' ? (
            <AboutPage />
          ) : (
            <LandingPage onEnterLobby={() => {}} onNavigate={handleNavigate} />
          )}
        </ContentArea>

        {showHeaderAndFooter && <Footer onNavigate={handleNavigate} />}
      </AppContainer>
    </ThemeProvider>
  );
}


export default App;
