import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayback } from "../../src/hooks/useAudioPlayback";
import { Song } from "../../src/logic/Song";

describe("useAudioPlayback", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
        vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllTimers();
    });

    describe("initialization", () => {
        it("should start with no playback", () => {
            const { result } = renderHook(() => useAudioPlayback());

            expect(result.current.isPlaying).toBe(false);
            expect(result.current.isStopping).toBe(false);
            expect(result.current.playingSong).toBeNull();
            expect(result.current.currentTime).toBe(0);
            expect(result.current.duration).toBeNull();
        });

        it("should initialize computed values", () => {
            const { result } = renderHook(() => useAudioPlayback());

            expect(result.current.remaining).toBeNull();
            expect(result.current.playedPercent).toBe(0);
        });
    });

    describe("play / pause / stop", () => {
        it("should update state when playing a song", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            expect(result.current.isPlaying).toBe(true);
            expect(result.current.playingSong).toBe(song);
            expect(result.current.isStopping).toBe(false);
        });

        it("should pause playback", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            expect(result.current.isPlaying).toBe(true);

            act(() => {
                result.current.pause();
            });

            expect(result.current.isPlaying).toBe(false);
            expect(result.current.playingSong).toBe(song); // Still set
        });

        it("should stop with fade and reset state", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            act(() => {
                result.current.stop();
            });

            expect(result.current.isPlaying).toBe(false);
            expect(result.current.playingSong).toBeNull();
            expect(result.current.isStopping).toBe(true);
            expect(result.current.currentTime).toBe(0);
            expect(result.current.duration).toBeNull();
        });

        it("should not restart if same song is already playing", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            const playCount = (window.HTMLMediaElement.prototype.play as any).mock.calls.length;

            act(() => {
                result.current.play(song);
            });

            expect((window.HTMLMediaElement.prototype.play as any).mock.calls.length).toBe(playCount);
        });
    });

    describe("timing updates", () => {
        it("should poll and update current time and duration when playing", async () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            // Mock audio element properties
            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'currentTime', { value: 45, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });

            // Advance timers to trigger poll
            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(result.current.currentTime).toBe(45);
            expect(result.current.duration).toBe(180);
        });

        it("should compute remaining time correctly", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'currentTime', { value: 60, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(result.current.remaining).toBe(120);
        });

        it("should compute played percent correctly", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'currentTime', { value: 90, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(result.current.playedPercent).toBe(50);
        });

        it("should reset times when audio is paused and not in playing state", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'currentTime', { value: 60, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(result.current.currentTime).toBe(60);

            act(() => {
                result.current.pause();
            });

            Object.defineProperty(audioElement, 'paused', { value: true, configurable: true });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(result.current.currentTime).toBe(0);
            expect(result.current.duration).toBeNull();
        });

        it("should not overwrite reset state after stop (endedOrStoppedRef mechanism)", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'currentTime', { value: 60, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });

            act(() => {
                result.current.stop();
            });

            // After stop, times should be 0/null
            expect(result.current.currentTime).toBe(0);
            expect(result.current.duration).toBeNull();

            // Polling should NOT overwrite this
            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(result.current.currentTime).toBe(0);
            expect(result.current.duration).toBeNull();
        });
    });

    describe("audio element access", () => {
        it("should provide access to audio element", () => {
            const { result } = renderHook(() => useAudioPlayback());

            const audioElement = result.current.getAudioElement();
            expect(audioElement).toBeInstanceOf(HTMLAudioElement);
        });
    });

    describe("cleanup", () => {
        it("should cleanup on unmount", () => {
            const { result, unmount } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            unmount();

            // Should not throw and timers should be cleaned up
            expect(() => {
                vi.advanceTimersByTime(1000);
            }).not.toThrow();
        });
    });

    describe("channel switching and race conditions", () => {
        it("should handle rapid song switches", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song1 = new Song("song1.mp3");
            const song2 = new Song("song2.mp3");
            const song3 = new Song("song3.mp3");

            act(() => {
                result.current.play(song1);
                result.current.play(song2);
                result.current.play(song3);
            });

            expect(result.current.playingSong).toBe(song3);
            expect(result.current.isPlaying).toBe(true);
        });

        it("should clear endedOrStoppedRef flag when starting new playback", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song1 = new Song("song1.mp3");
            const song2 = new Song("song2.mp3");

            act(() => {
                result.current.play(song1);
                result.current.stop();
            });

            // After stop, polling should be blocked
            let audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'currentTime', { value: 60, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(result.current.currentTime).toBe(0);

            // Play new song should clear the flag
            act(() => {
                result.current.play(song2);
            });

            // Get new active audio element after channel switch
            audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'currentTime', { value: 30, configurable: true });
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            // Now polling should work again
            expect(result.current.currentTime).toBe(30);
        });
    });
});
