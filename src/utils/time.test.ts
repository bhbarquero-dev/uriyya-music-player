import { formatTime } from './time';

describe('Format time', () => {
  test('should format time correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(65)).toBe('1:05');
  });
});
