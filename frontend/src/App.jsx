import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme.js';
import { GlobalStyle } from './styles/globalStyles.js';
import { useRoomStore } from './store/roomStore.js';
import { useGameStore } from './store/gameStore.js';
import { LandingPage } from './pages/LandingPage.jsx';
import { RoomLobby } from './components/lobby/RoomLobby.jsx';
import { GameTable } from './components/game/GameTable.jsx';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export function App() {
  const { room, clearRoom } = useRoomStore();
  const { gameState, resetGame } = useGameStore();
  const [view, setView] = useState('landing'); // 'landing', 'lobby', 'game'

  const isPlaying = gameState && gameState.status === 'playing';

  const handleLeaveAll = () => {
    resetGame();
    clearRoom();
    setView('landing');
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        {isPlaying ? (
          <GameTable onLeave={handleLeaveAll} />
        ) : room ? (
          <RoomLobby onLeave={handleLeaveAll} />
        ) : (
          <LandingPage onEnterLobby={() => setView('lobby')} />
        )}
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
