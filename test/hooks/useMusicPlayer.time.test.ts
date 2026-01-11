import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock Tauri APIs used by the hook
vi.mock('@tauri-apps/api/core', () => ({
  convertFileSrc: vi.fn((path) => `asset://${path}`),
}));

// Mock the AudioManager BEFORE importing the hook
let lastAM: any = null;
vi.mock('../../src/logic/AudioManager', () => {

  class AudioManager {
    events: any;
    activeChannelId = 1;
    audio: any;

    constructor(events: any) {
      this.events = events;
      lastAM = this;
      this.audio = {
        currentTime: 0,
        duration: null,
        paused: true,
        volume: 1,
        play: () => Promise.resolve(),
        pause: () => {},
      };
    }

    getActiveAudio() {
      return this.audio;
    }

    getActiveChannelId() {
      return this.activeChannelId;
    }

    getInactiveChannelId() {
      return this.activeChannelId === 1 ? 2 : 1;
    }

    play(_src: string) {
      this.audio.paused = false;
      return this.audio.play();
    }

    pause() {
      this.audio.paused = true;
    }

    stopWithFade() {
      this.audio.paused = true;
      // simulate immediate fade finished for tests
      this.events.onFadeFinished(this.getActiveChannelId());
    }

    cleanup() {
      this.audio.paused = true;
      this.audio.currentTime = 0;
      this.audio.duration = null;
    }

    // Test helpers
    triggerEnded() {
      this.events.onEnded(this.getActiveChannelId());
    }

    setCurrentTime(t: number) {
      this.audio.currentTime = t;
    }

    setDuration(d: number | null) {
      this.audio.duration = d;
    }
  }

  return {
    AudioManager,
  };
});

import { useMusicPlayer } from '../../src/hooks/useMusicPlayer';

describe('useMusicPlayer timing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('updates currentTime/duration/playedPercent via polling while playing', async () => {
    const { result } = renderHook(() => useMusicPlayer());

    act(() => {
      result.current.playSong('a.mp3');
    });

    const am = lastAM;
    // set duration and time
    am.setDuration(120);
    am.setCurrentTime(5);

    // advance timers so polling runs
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.duration).toBe(120);
    expect(result.current.currentTime).toBe(5);
    expect(Math.round(result.current.playedPercent)).toBe(Math.round((5 / 120) * 100));

    // advance time further
    am.setCurrentTime(30);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.currentTime).toBe(30);
    expect(Math.round(result.current.playedPercent)).toBe(Math.round((30 / 120) * 100));
  });

  it('resets times when ended or stopped and polling does not overwrite reset', async () => {
    const { result } = renderHook(() => useMusicPlayer());

    act(() => {
      result.current.playSong('b.mp3');
    });

    const am = lastAM;
    am.setDuration(60);
    am.setCurrentTime(40);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.currentTime).toBe(40);
    expect(result.current.duration).toBe(60);

    // Play again, then stop via API and ensure reset
    act(() => {
      result.current.playSong('c.mp3');
    });
    am.setDuration(90);
    am.setCurrentTime(10);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.currentTime).toBe(10);

    // Stop and verify reset is maintained
    act(() => {
      result.current.stop();
    });

    expect(result.current.currentTime).toBe(0);
    expect(result.current.duration).toBeNull();

    // Polling should not overwrite the reset
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.currentTime).toBe(0);
    expect(result.current.duration).toBeNull();
  });
});
