import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AudioManager } from "../../src/logic/AudioManager";
import { Song } from "../../src/logic/Song";

describe("AudioManager", () => {
    let audioManager: AudioManager;
    const mockEvents = {
        onEnded: vi.fn(),
        onError: vi.fn(),
        onFadeFinished: vi.fn(),
    };

    beforeEach(() => {
        vi.useFakeTimers();
        // Mock HTMLAudioElement
        // In JSDOM, HTMLAudioElement exists but methods like play() might need mocking
        vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
        vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => { });

        audioManager = new AudioManager(mockEvents);
    });

    afterEach(() => {
        audioManager.cleanup();
        vi.restoreAllMocks();
        vi.clearAllTimers();
    });

    it("should initialize with two audio channels", () => {
        expect(audioManager).toBeDefined();
        const activeAudio = audioManager.getActiveAudio();
        expect(activeAudio).toBeInstanceOf(HTMLAudioElement);
    });

    it("should update active audio source when playing new songs", () => {
        audioManager.play(new Song("song1.mp3"));
        expect(audioManager.getActiveAudio().src).toContain("song1.mp3");

        audioManager.play(new Song("song2.mp3"));
        expect(audioManager.getActiveAudio().src).toContain("song2.mp3");
    });

    it("should start a fade out on the old channel when playing a new one", () => {
        // First play something
        audioManager.play(new Song("song1.mp3"));
        const channel1 = audioManager.getActiveAudio();
        // Manually set as "playing" for the logic to trigger fade
        Object.defineProperty(channel1, 'paused', { value: false, configurable: true });

        audioManager.play(new Song("song2.mp3"));

        // Channel 1 should be fading (volume < 1 eventually)
        vi.advanceTimersByTime(200);
        expect(channel1.volume).toBeLessThan(1);
    });

    it("should stop with fade when stopWithFade is called", () => {
        audioManager.play(new Song("song1.mp3"));
        const audio = audioManager.getActiveAudio();
        Object.defineProperty(audio, 'paused', { value: false, configurable: true });

        audioManager.stopWithFade(1000); // 1s fade

        vi.advanceTimersByTime(500);
        expect(audio.volume).toBeLessThan(1);
        expect(audio.volume).toBeGreaterThan(0);

        vi.advanceTimersByTime(600);
        expect(audio.volume).toBe(1); // Resets to 1 after pause
        expect(audio.pause).toHaveBeenCalled();
    });

    it("should cleanup both channels on cleanup()", () => {
        audioManager.play(new Song("song1.mp3"));
        audioManager.cleanup();

        // JSDOM might prepend origin, so we check if it's empty or just the origin/blank
        const src = audioManager.getActiveAudio().src;
        expect(src === "" || src === "http://localhost:3000/" || src === "about:blank").toBe(true);
    });
});
