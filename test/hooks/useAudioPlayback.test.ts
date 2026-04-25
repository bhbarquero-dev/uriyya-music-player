import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayback } from "../../src/hooks/useAudioPlayback";
import { Song } from "@logic/Song";

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

        it("should preserve currentTime and duration when audio is paused", () => {
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

            expect(result.current.currentTime).toBe(60);
            expect(result.current.duration).toBe(180);
        });

        it("should reset times to 0/null after stop but not after pause", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => { result.current.play(song); });

            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'currentTime', { value: 45, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 120, configurable: true });
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });
            act(() => { vi.advanceTimersByTime(250); });

            // pause — timing preserved
            act(() => { result.current.pause(); });
            Object.defineProperty(audioElement, 'paused', { value: true, configurable: true });
            act(() => { vi.advanceTimersByTime(250); });
            expect(result.current.currentTime).toBe(45);
            expect(result.current.duration).toBe(120);

            // resume then stop — timing resets
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });
            act(() => { result.current.play(song); });
            act(() => { result.current.stop(); });
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

    describe("natural song end (audio 'ended' event)", () => {
        it("should reset all state when audio fires 'ended' event", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            expect(result.current.isPlaying).toBe(true);
            expect(result.current.playingSong).toBe(song);

            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'paused', { value: true, configurable: true });
            Object.defineProperty(audioElement, 'ended', { value: true, configurable: true });
            Object.defineProperty(audioElement, 'currentTime', { value: 180, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });

            act(() => {
                audioElement.dispatchEvent(new Event("ended"));
            });

            expect(result.current.isPlaying).toBe(false);
            expect(result.current.playingSong).toBeNull();
            expect(result.current.isStopping).toBe(false);
            expect(result.current.currentTime).toBe(0);
            expect(result.current.duration).toBeNull();
        });

        it("should not overwrite reset state after natural end (timer must not interfere)", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'paused', { value: true, configurable: true });
            Object.defineProperty(audioElement, 'ended', { value: true, configurable: true });
            Object.defineProperty(audioElement, 'currentTime', { value: 180, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });

            act(() => {
                audioElement.dispatchEvent(new Event("ended"));
            });

            // Polling should NOT overwrite the reset
            act(() => {
                vi.advanceTimersByTime(500);
            });

            expect(result.current.isPlaying).toBe(false);
            expect(result.current.playingSong).toBeNull();
            expect(result.current.currentTime).toBe(0);
            expect(result.current.duration).toBeNull();
        });

        it("should reset state via timer fallback when 'ended' event never fires", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            // Simulate audio that has ended (audio.ended = true) but the 'ended' event
            // never fired (edge case in some WebViews / Tauri)
            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'paused', { value: true, configurable: true });
            Object.defineProperty(audioElement, 'ended', { value: true, configurable: true });
            Object.defineProperty(audioElement, 'currentTime', { value: 180, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });

            // No dispatchEvent("ended") — only allow the timer to detect it
            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(result.current.isPlaying).toBe(false);
            expect(result.current.playingSong).toBeNull();
            expect(result.current.isStopping).toBe(false);
            expect(result.current.currentTime).toBe(0);
            expect(result.current.duration).toBeNull();
        });
    });

    describe("onNaturalEnd callback", () => {
        it("should invoke the callback when audio fires 'ended' event", () => {
            const onNaturalEnd = vi.fn();
            const { result } = renderHook(() => useAudioPlayback(onNaturalEnd));
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            const audioElement = result.current.getAudioElement();
            act(() => {
                audioElement.dispatchEvent(new Event("ended"));
            });

            expect(onNaturalEnd).toHaveBeenCalledTimes(1);
        });

        it("should invoke the callback via timer fallback when 'ended' event never fires", () => {
            const onNaturalEnd = vi.fn();
            const { result } = renderHook(() => useAudioPlayback(onNaturalEnd));
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
            });

            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'paused', { value: true, configurable: true });
            Object.defineProperty(audioElement, 'ended', { value: true, configurable: true });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(onNaturalEnd).toHaveBeenCalledTimes(1);
        });

        it("should NOT invoke the callback when user explicitly stops playback", () => {
            const onNaturalEnd = vi.fn();
            const { result } = renderHook(() => useAudioPlayback(onNaturalEnd));
            const song = new Song("test.mp3");

            act(() => {
                result.current.play(song);
                result.current.stop();
            });

            act(() => {
                vi.advanceTimersByTime(500);
            });

            expect(onNaturalEnd).not.toHaveBeenCalled();
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

    describe("seek", () => {
        it("should update currentTime immediately", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => { result.current.play(song); });
            act(() => { result.current.seek(60); });

            expect(result.current.currentTime).toBe(60);
        });

        it("should set currentTime on the audio element", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => { result.current.play(song); });

            const audioElement = result.current.getAudioElement();
            act(() => { result.current.seek(90); });

            expect(audioElement.currentTime).toBe(90);
        });

        it("should allow polling to resume after seeking following a stop", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => { result.current.play(song); });
            act(() => { result.current.stop(); });

            // After stop, endedOrStoppedRef is true — polling is blocked
            expect(result.current.currentTime).toBe(0);

            // Seek should clear the flag
            act(() => { result.current.seek(45); });

            expect(result.current.currentTime).toBe(45);

            // Polling should now update normally
            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'currentTime', { value: 50, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });

            act(() => { vi.advanceTimersByTime(250); });

            expect(result.current.currentTime).toBe(50);
        });

        it("should ignore NaN time and not update state", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => { result.current.play(song); });

            const audioElement = result.current.getAudioElement();
            Object.defineProperty(audioElement, 'currentTime', { value: 30, configurable: true });
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });
            act(() => { vi.advanceTimersByTime(250); });
            expect(result.current.currentTime).toBe(30);

            act(() => { result.current.seek(NaN); });

            expect(result.current.currentTime).toBe(30);
        });

        it("should clamp negative time to 0", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => { result.current.play(song); });
            act(() => { result.current.seek(-10); });

            expect(result.current.currentTime).toBe(0);
        });

        it("should allow polling to resume after seeking following natural end", () => {
            const { result } = renderHook(() => useAudioPlayback());
            const song = new Song("test.mp3");

            act(() => { result.current.play(song); });

            const audioElement = result.current.getAudioElement();
            act(() => { audioElement.dispatchEvent(new Event("ended")); });

            expect(result.current.currentTime).toBe(0);

            act(() => { result.current.seek(30); });

            expect(result.current.currentTime).toBe(30);

            Object.defineProperty(audioElement, 'currentTime', { value: 35, configurable: true });
            Object.defineProperty(audioElement, 'duration', { value: 180, configurable: true });
            Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });
            Object.defineProperty(audioElement, 'ended', { value: false, configurable: true });

            act(() => { vi.advanceTimersByTime(250); });

            expect(result.current.currentTime).toBe(35);
        });
    });
});
