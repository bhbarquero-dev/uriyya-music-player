import { mockElectronRemote } from './utils/mocks/electron';

// Setup global mocks
jest.mock('@electron/remote', () => mockElectronRemote);

// Add custom matchers if needed
expect.extend({
  toHaveBeenCalledExactlyOnceWith(received: jest.Mock, expected: unknown) {
    const pass =
      received.mock.calls.length === 1 &&
      JSON.stringify(received.mock.calls[0][0]) === JSON.stringify(expected);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received.mock.calls} not to have been called exactly once with ${expected}`
          : `Expected ${received.mock.calls} to have been called exactly once with ${expected}`,
    };
  },
});
