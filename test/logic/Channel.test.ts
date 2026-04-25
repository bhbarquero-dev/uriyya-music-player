import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Channel } from "@logic/Channel";
import { Song } from "@logic/Song";
import type { AudioChannel } from "@logic/AudioManager";

describe("Channel", () => {
    let channel: Channel;
    const channelId: AudioChannel = 1;
    const mockEvents = {
        onEnded: vi.fn(),
        onError: vi.fn(),
        onFadeFinished: vi.fn(),
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
        vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => { });

        channel = new Channel(channelId, mockEvents);
    });

    afterEach(() => {
        channel.cleanup();
        vi.restoreAllMocks();
        vi.clearAllTimers();
    });

    describe("initialization", () => {
        it("should create a channel with correct ID", () => {
            expect(channel.getId()).toBe(1);
        });

        it("should have an HTMLAudioElement", () => {
            expect(channel.getAudioElement()).toBeInstanceOf(HTMLAudioElement);
        });

        it("should set up event listeners for ended and error", () => {
            const audio = channel.getAudioElement();
            
            audio.dispatchEvent(new Event("ended"));
            expect(mockEvents.onEnded).toHaveBeenCalledWith(channelId);

            audio.dispatchEvent(new Event("error"));
            expect(mockEvents.onError).toHaveBeenCalledWith(channelId, expect.any(Event));
        });
    });

    describe("play", () => {
        it("should set audio source and properties correctly", () => {
            const song = new Song("test-song.mp3");
            channel.play(song);

            const audio = channel.getAudioElement();
            expect(audio.src).toContain("test-song.mp3");
            expect(audio.volume).toBe(1.0);
            expect(audio.currentTime).toBe(0);
        });

        it("should call play on the audio element", () => {
            const song = new Song("test.mp3");
            const audio = channel.getAudioElement();
            const playSpy = vi.spyOn(audio, 'play');

            channel.play(song);

            expect(playSpy).toHaveBeenCalled();
        });

        it("should handle play() promise rejection", async () => {
            const song = new Song("test.mp3");
            const error = new Error("Play failed");
            vi.spyOn(channel.getAudioElement(), 'play').mockRejectedValue(error);

            channel.play(song);
            await vi.runAllTimersAsync();

            expect(mockEvents.onError).toHaveBeenCalledWith(channelId, error);
        });

        it("should clear any existing fade before playing", () => {
            const audio = channel.getAudioElement();
            Object.defineProperty(audio, 'paused', { value: false, configurable: true });
            
            channel.startFadeOut(1000, vi.fn());
            vi.advanceTimersByTime(200);
            expect(audio.volume).toBeLessThan(1.0); // Fade started

            const song = new Song("new.mp3");
            channel.play(song);
            
            vi.advanceTimersByTime(200);
            expect(audio.volume).toBe(1.0); // Fade was cleared, volume reset
        });
    });

    describe("pause", () => {
        it("should pause the audio element when playing", () => {
            const audio = channel.getAudioElement();
            Object.defineProperty(audio, 'paused', { value: false, configurable: true });
            const pauseSpy = vi.spyOn(audio, 'pause');

            channel.pause();

            expect(pauseSpy).toHaveBeenCalled();
        });

        it("should not pause if already paused", () => {
            const audio = channel.getAudioElement();
            Object.defineProperty(audio, 'paused', { value: true, configurable: true });
            const pauseSpy = vi.spyOn(audio, 'pause');

            channel.pause();

            expect(pauseSpy).not.toHaveBeenCalled();
        });
    });

    describe("fade out", () => {
        it("should gradually reduce volume over specified duration", () => {
            const audio = channel.getAudioElement();
            const onComplete = vi.fn();
            
            channel.startFadeOut(1000, onComplete);

            expect(audio.volume).toBe(1.0);

            vi.advanceTimersByTime(500);
            expect(audio.volume).toBeLessThan(1.0);
            expect(audio.volume).toBeGreaterThan(0);

            vi.advanceTimersByTime(600);
            expect(audio.volume).toBe(1.0); // Reset after fade completes
        });

        it("should pause audio and reset state when fade completes", () => {
            const audio = channel.getAudioElement();
            const pauseSpy = vi.spyOn(audio, 'pause');
            const onComplete = vi.fn();
            
            channel.startFadeOut(1000, onComplete);

            vi.advanceTimersByTime(1100);

            expect(pauseSpy).toHaveBeenCalled();
            expect(audio.currentTime).toBe(0);
            expect(audio.volume).toBe(1.0);
        });

        it("should call onFadeFinished callback when fade completes", () => {
            const onComplete = vi.fn();
            
            channel.startFadeOut(1000, onComplete);
            vi.advanceTimersByTime(1100);

            expect(mockEvents.onFadeFinished).toHaveBeenCalledWith(channelId);
            expect(onComplete).toHaveBeenCalled();
        });

        it("should not start a new fade if one is already in progress", () => {
            const audio = channel.getAudioElement();
            const onComplete1 = vi.fn();
            const onComplete2 = vi.fn();
            
            channel.startFadeOut(1000, onComplete1);
            vi.advanceTimersByTime(300);
            const volumeAfter300ms = audio.volume;

            // Try to start second fade (should be ignored)
            channel.startFadeOut(1000, onComplete2);

            // First fade should continue running
            vi.advanceTimersByTime(100);
            expect(audio.volume).toBeLessThan(volumeAfter300ms);

            // First fade completes, second never started
            vi.advanceTimersByTime(700);
            expect(onComplete1).toHaveBeenCalled();
            expect(onComplete2).not.toHaveBeenCalled();
        });

        it("should use default fade duration of 6000ms", () => {
            const audio = channel.getAudioElement();
            const onComplete = vi.fn();
            
            channel.startFadeOut(undefined, onComplete);

            vi.advanceTimersByTime(3000);
            expect(audio.volume).toBeGreaterThan(0.4);
            expect(audio.volume).toBeLessThan(0.65);

            vi.advanceTimersByTime(3100);
            expect(onComplete).toHaveBeenCalled();
        });
    });

    describe("clearFade", () => {
        it("should stop fade and maintain current volume", () => {
            const audio = channel.getAudioElement();
            const onComplete = vi.fn();
            
            channel.startFadeOut(1000, onComplete);
            vi.advanceTimersByTime(500);
            const volumeAt500ms = audio.volume;

            channel.clearFade();
            vi.advanceTimersByTime(1000);

            // Volume should not have changed after clearFade
            expect(audio.volume).toBe(volumeAt500ms);
            expect(onComplete).not.toHaveBeenCalled();
        });

        it("should be safe to call when no fade is in progress", () => {
            expect(() => {
                channel.clearFade();
                channel.clearFade();
            }).not.toThrow();
        });
    });

    describe("cleanup", () => {
        it("should clear any active fade", () => {
            const onComplete = vi.fn();
            channel.startFadeOut(1000, onComplete);
            
            channel.cleanup();
            vi.advanceTimersByTime(2000);

            expect(onComplete).not.toHaveBeenCalled();
        });

        it("should pause audio and reset source", () => {
            const audio = channel.getAudioElement();
            const song = new Song("test.mp3");
            channel.play(song);

            channel.cleanup();

            const src = audio.src;
            expect(src === "" || src === "http://localhost:3000/" || src === "about:blank").toBe(true);
            expect(audio.pause).toHaveBeenCalled();
        });

        it("should be safe to call multiple times", () => {
            expect(() => {
                channel.cleanup();
                channel.cleanup();
                channel.cleanup();
            }).not.toThrow();
        });
    });

    describe("edge cases", () => {
        it("should handle rapid play calls without leaking intervals", () => {
            const song1 = new Song("song1.mp3");
            const song2 = new Song("song2.mp3");
            const song3 = new Song("song3.mp3");

            channel.play(song1);
            channel.startFadeOut(1000, vi.fn());
            channel.play(song2);
            channel.startFadeOut(500, vi.fn());
            channel.play(song3);

            // Should not throw or cause issues
            vi.advanceTimersByTime(2000);
            expect(channel.getAudioElement().src).toContain("song3.mp3");
        });

        it("should handle cleanup during active fade", () => {
            const audio = channel.getAudioElement();
            channel.startFadeOut(1000, vi.fn());
            
            vi.advanceTimersByTime(500);
            expect(audio.volume).toBeLessThan(1.0);

            channel.cleanup();
            
            // Should not throw on further timer advances
            expect(() => {
                vi.advanceTimersByTime(1000);
            }).not.toThrow();
        });
    });
});
