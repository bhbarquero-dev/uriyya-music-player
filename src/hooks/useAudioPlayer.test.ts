import { act, renderHook } from '@testing-library/react';
import type { Track } from '../types/player';
import { useAudioPlayer } from './useAudioPlayer';

// Mock HTMLAudioElement
class MockAudioElement {
  volume = 0.5;
  currentTime = 0;
  duration = 100;
  paused = true;
  src = '';

  play = jest.fn().mockResolvedValue(undefined);
  pause = jest.fn();
  load = jest.fn();

  addEventListener = jest.fn();
  removeEventListener = jest.fn();
}

describe('useAudioPlayer', () => {
  let mockAudio: MockAudioElement;

  beforeEach(() => {
    mockAudio = new MockAudioElement();
    // @ts-expect-error - Mocking global Audio constructor
    global.Audio = jest.fn(() => mockAudio);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAudioPlayer());

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.volume).toBe(50);
      expect(result.current.progress).toBe(0);
      expect(result.current.currentTime).toBe('0:00');
      expect(result.current.duration).toBe('0:00');
      expect(result.current.currentTrack).toBeUndefined();
    });

    it('should create audio element on mount', () => {
      renderHook(() => useAudioPlayer());
      expect(global.Audio).toHaveBeenCalled();
    });

    it('should set up event listeners', () => {
      renderHook(() => useAudioPlayer());
      expect(mockAudio.addEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function));
      expect(mockAudio.addEventListener).toHaveBeenCalledWith(
        'loadedmetadata',
        expect.any(Function)
      );
    });

    it('should clean up audio element on unmount', () => {
      const { unmount } = renderHook(() => useAudioPlayer());

      unmount();

      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('should remove event listeners on unmount', () => {
      const { unmount } = renderHook(() => useAudioPlayer());

      unmount();

      expect(mockAudio.removeEventListener).toHaveBeenCalledWith(
        'timeupdate',
        expect.any(Function)
      );
      expect(mockAudio.removeEventListener).toHaveBeenCalledWith(
        'loadedmetadata',
        expect.any(Function)
      );
    });
  });

  describe('Play/Pause Functionality', () => {
    it('should toggle from paused to playing', () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.handlePlayPause();
      });

      expect(mockAudio.play).toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(true);
    });

    it('should toggle from playing to paused', () => {
      const { result } = renderHook(() => useAudioPlayer());

      // First play
      act(() => {
        result.current.handlePlayPause();
      });

      // Then pause
      act(() => {
        result.current.handlePlayPause();
      });

      expect(mockAudio.pause).toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(false);
    });

    it('should handle multiple play/pause toggles', () => {
      const { result } = renderHook(() => useAudioPlayer());

      // Initial state: paused
      expect(result.current.isPlaying).toBe(false);

      // Toggle to playing
      act(() => {
        result.current.handlePlayPause();
      });
      expect(result.current.isPlaying).toBe(true);

      // Toggle to paused
      act(() => {
        result.current.handlePlayPause();
      });
      expect(result.current.isPlaying).toBe(false);

      // Toggle back to playing
      act(() => {
        result.current.handlePlayPause();
      });
      expect(result.current.isPlaying).toBe(true);
    });
  });

  describe('Volume Control', () => {
    it('should update volume to valid value', () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.handleVolumeChange(75);
      });

      expect(result.current.volume).toBe(75);
      expect(mockAudio.volume).toBe(0.75);
    });

    it('should clamp volume to minimum (0)', () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.handleVolumeChange(-10);
      });

      expect(result.current.volume).toBe(0);
      expect(mockAudio.volume).toBe(0);
    });

    it('should clamp volume to maximum (100)', () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.handleVolumeChange(150);
      });

      expect(result.current.volume).toBe(100);
      expect(mockAudio.volume).toBe(1);
    });

    it('should update audio element volume on initialization', () => {
      renderHook(() => useAudioPlayer());

      // Default volume is 50
      expect(mockAudio.volume).toBe(0.5);
    });

    it('should handle volume at boundaries', () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.handleVolumeChange(0);
      });
      expect(result.current.volume).toBe(0);

      act(() => {
        result.current.handleVolumeChange(100);
      });
      expect(result.current.volume).toBe(100);
    });
  });

  describe('Progress & Seeking', () => {
    it('should seek to specific position', () => {
      const { result } = renderHook(() => useAudioPlayer());
      mockAudio.duration = 200;

      act(() => {
        result.current.handleSeek(50); // 50%
      });

      expect(mockAudio.currentTime).toBe(100); // 50% of 200
      expect(result.current.progress).toBe(50);
    });

    it('should update current time when seeking', () => {
      const { result } = renderHook(() => useAudioPlayer());
      mockAudio.duration = 120;

      act(() => {
        result.current.handleSeek(25); // 25%
      });

      expect(result.current.currentTime).toBe('0:30'); // 25% of 120 = 30 seconds
    });

    it('should handle seeking to start (0%)', () => {
      const { result } = renderHook(() => useAudioPlayer());
      mockAudio.duration = 100;

      act(() => {
        result.current.handleSeek(0);
      });

      expect(mockAudio.currentTime).toBe(0);
      expect(result.current.progress).toBe(0);
    });

    it('should handle seeking to end (100%)', () => {
      const { result } = renderHook(() => useAudioPlayer());
      mockAudio.duration = 100;

      act(() => {
        result.current.handleSeek(100);
      });

      expect(mockAudio.currentTime).toBe(100);
      expect(result.current.progress).toBe(100);
    });
  });

  describe('Track Management', () => {
    const mockTrack: Track = {
      title: 'Test Song',
      artist: 'Test Artist',
      duration: 180,
      imagePath: '/test.jpg',
    };

    it('should update current track', () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.handleTrackChange(mockTrack);
      });

      expect(result.current.currentTrack).toEqual(mockTrack);
    });

    it('should load audio when track changes', () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.handleTrackChange(mockTrack);
      });

      expect(mockAudio.load).toHaveBeenCalled();
    });

    it('should auto-play new track if currently playing', () => {
      const { result } = renderHook(() => useAudioPlayer());

      // Start playing
      act(() => {
        result.current.handlePlayPause();
      });

      // Change track
      act(() => {
        result.current.handleTrackChange(mockTrack);
      });

      // Should call play again for new track
      expect(mockAudio.play).toHaveBeenCalledTimes(2);
    });

    it('should not auto-play new track if currently paused', () => {
      const { result } = renderHook(() => useAudioPlayer());

      // Change track while paused
      act(() => {
        result.current.handleTrackChange(mockTrack);
      });

      // Should only call load, not play
      expect(mockAudio.load).toHaveBeenCalled();
      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('should handle multiple track changes', () => {
      const { result } = renderHook(() => useAudioPlayer());

      const track2: Track = {
        title: 'Second Song',
        artist: 'Second Artist',
        duration: 200,
      };

      act(() => {
        result.current.handleTrackChange(mockTrack);
        result.current.handleTrackChange(track2);
      });

      expect(result.current.currentTrack).toEqual(track2);
      expect(mockAudio.load).toHaveBeenCalledTimes(2);
    });
  });

  describe('Time Updates', () => {
    it('should update progress on timeupdate event', () => {
      const { result } = renderHook(() => useAudioPlayer());

      // Get the timeupdate callback
      const timeUpdateCallback = mockAudio.addEventListener.mock.calls.find(
        (call) => call[0] === 'timeupdate'
      )?.[1];

      expect(timeUpdateCallback).toBeDefined();

      // Simulate time update
      mockAudio.currentTime = 50;
      mockAudio.duration = 100;

      act(() => {
        timeUpdateCallback?.();
      });

      expect(result.current.progress).toBe(50);
      expect(result.current.currentTime).toBe('0:50');
    });

    it('should update duration on loadedmetadata event', () => {
      const { result } = renderHook(() => useAudioPlayer());

      // Get the loadedmetadata callback
      const metadataCallback = mockAudio.addEventListener.mock.calls.find(
        (call) => call[0] === 'loadedmetadata'
      )?.[1];

      expect(metadataCallback).toBeDefined();

      // Simulate metadata loaded
      mockAudio.duration = 245;

      act(() => {
        metadataCallback?.();
      });

      expect(result.current.duration).toBe('4:05');
    });

    it('should format time correctly for various durations', () => {
      const { result } = renderHook(() => useAudioPlayer());

      const metadataCallback = mockAudio.addEventListener.mock.calls.find(
        (call) => call[0] === 'loadedmetadata'
      )?.[1];

      // Test 0 seconds
      mockAudio.duration = 0;
      act(() => metadataCallback?.());
      expect(result.current.duration).toBe('0:00');

      // Test 5 seconds
      mockAudio.duration = 5;
      act(() => metadataCallback?.());
      expect(result.current.duration).toBe('0:05');

      // Test 1 minute 5 seconds
      mockAudio.duration = 65;
      act(() => metadataCallback?.());
      expect(result.current.duration).toBe('1:05');

      // Test 10 minutes
      mockAudio.duration = 600;
      act(() => metadataCallback?.());
      expect(result.current.duration).toBe('10:00');
    });
  });
});
