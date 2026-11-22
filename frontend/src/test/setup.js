import '@testing-library/jest-dom';

// Polyfills for browser environment in jsdom
if (typeof window !== 'undefined') {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Mock clipboard
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    value: {
      writeText: async () => {},
      readText: async () => '',
    },
  });

  // Mock Audio
  window.Audio = class {
    constructor() {
      this.srcObject = null;
    }
    play() {
      return Promise.resolve();
    }
    pause() {}
    load() {}
  };
}
