export const mockElectronWindow = {
  on: jest.fn(),
  removeListener: jest.fn(),
  isMaximized: jest.fn(() => false),
  minimize: jest.fn(),
  maximize: jest.fn(),
  unmaximize: jest.fn(),
  close: jest.fn(),
};

export const mockElectronRemote = {
  getCurrentWindow: jest.fn(() => mockElectronWindow),
  process: {
    platform: 'win32',
  },
};

// Helper to reset all mocks between tests
export const resetElectronMocks = () => {
  for(const mock of Object.values(mockElectronWindow)){
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  };
  mockElectronRemote.getCurrentWindow.mockClear();
};
