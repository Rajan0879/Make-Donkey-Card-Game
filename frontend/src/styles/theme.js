export const theme = {
  colors: {
    // Felt & table
    tableBackground: '#0b1d14',
    tableBorder: '#1c3d2c',
    feltGreen: '#133924',
    feltGradiant: 'radial-gradient(ellipse at center, #1e4d34 0%, #0d281a 70%, #06150d 100%)',
    
    // Accents & Golds
    gold: '#e5b842',
    goldLight: '#f6d365',
    goldDark: '#b88a1e',
    
    // UI Neutrals
    background: '#0a0d0c',
    surface: '#151b18',
    surfaceLight: '#1f2924',
    surfaceBorder: '#293a32',
    
    // Text
    text: '#f0f5f2',
    textMuted: '#96a89f',
    textDim: '#5c7066',
    
    // Game States
    cardRed: '#e63946',
    cardBlack: '#1d232a',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    donkey: '#d97706'
  },
  shadows: {
    card: '0 4px 12px rgba(0, 0, 0, 0.45)',
    cardHover: '0 8px 24px rgba(229, 184, 66, 0.35)',
    cardSelected: '0 0 20px rgba(246, 211, 101, 0.8)',
    tableFelt: 'inset 0 0 100px rgba(0, 0, 0, 0.8)',
    glowGold: '0 0 15px rgba(229, 184, 66, 0.5)'
  },
  radii: {
    sm: '6px',
    md: '12px',
    lg: '20px',
    full: '9999px'
  },
  transitions: {
    default: '0.2s ease-in-out',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
};
