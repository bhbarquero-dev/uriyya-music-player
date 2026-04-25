import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMusicPlayer } from "../../src/hooks/useMusicPlayer";
import { FileService } from "@logic/FileService";
import { Song } from "@logic/Song";

// Helper to create a mock FileService
const createMockFileService = (playlistData: { songs: Song[]; name: string; path?: string } | null = null) => {
    const data = playlistData ? { path: "C:\\Music\\playlist.txt", ...playlistData } : null;
    const mockFileService: Partial<FileService> = {
        selectAndReadPlaylist: vi.fn().mockResolvedValue(data),
        savePlaylist: vi.fn().mockResolvedValue(undefined),
    };
    return mockFileService as FileService;
};

describe("useMusicPlayer", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Mock HTMLAudioElement methods
        vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
        vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllTimers();
    });

    it("should handle overlapping playback correctly when a new song starts during an old song's fade-out", async () => {
        const { result } = renderHook(() => useMusicPlayer());

        const songA = new Song("songA.mp3");
        const songB = new Song("songB.mp3");

        // 1. Play Song A
        act(() => {
            result.current.playSong(songA);
        });
        expect(result.current.playingSong).toBe(songA);
        expect(result.current.isPlaying).toBe(true);

        // 2. Stop Song A (starts fade-out, clearing playingSong immediately in the hook)
        act(() => {
            result.current.stop();
        });
        expect(result.current.playingSong).toBe(null);
        expect(result.current.isStopping).toBe(true);
        expect(result.current.isPlaying).toBe(false);

        // 3. Play Song B immediately (switches channel in AudioManager)
        act(() => {
            result.current.playSong(songB);
        });
        expect(result.current.playingSong).toBe(songB);
        expect(result.current.isPlaying).toBe(true);
        expect(result.current.isStopping).toBe(false);

        // 4. Advance time so Song A's fade finishes (default 8s fade)
        act(() => {
            vi.advanceTimersByTime(8100);
        });

        // 5. REGRESSION CHECK: playingSong should STILL be "songB.mp3"
        expect(result.current.playingSong).toBe(songB);
        expect(result.current.isPlaying).toBe(true);
    });

    it("should load a playlist and select the first song", async () => {
        const song1 = new Song("song1.mp3");
        const song2 = new Song("song2.mp3");
        const mockFileService = createMockFileService({
            songs: [song1, song2],
            name: "my-playlist",
        });

        const { result } = renderHook(() => useMusicPlayer(mockFileService));

        await act(async () => {
            await result.current.loadPlaylist();
        });

        expect(result.current.playlist).toHaveLength(2);
        expect(result.current.playlist[0]).toBe(song1);
        expect(result.current.playlist[1]).toBe(song2);
        expect(result.current.selectedSong).toBeNull();
        expect(result.current.currentPlaylistName).toBe("my-playlist");
    });

    it("should handle navigation (next/previous) correctly", async () => {
        const s1 = new Song("s1.mp3");
        const s2 = new Song("s2.mp3");
        const s3 = new Song("s3.mp3");
        const mockFileService = createMockFileService({
            songs: [s1, s2, s3],
            name: "playlist",
        });

        const { result } = renderHook(() => useMusicPlayer(mockFileService));

        await act(async () => {
            await result.current.loadPlaylist();
        });

        act(() => {
            result.current.setSelectedSong(s1);
        });

        act(() => {
            result.current.selectNextInList();
        });
        expect(result.current.selectedSong).toBe(s2);

        act(() => {
            result.current.selectNextInList();
        });
        expect(result.current.selectedSong).toBe(s3);

        // Boundary: Next at end should stay at end
        act(() => {
            result.current.selectNextInList();
        });
        expect(result.current.selectedSong).toBe(s3);

        act(() => {
            result.current.selectPreviousInList();
        });
        expect(result.current.selectedSong).toBe(s2);

        act(() => {
            result.current.selectPreviousInList();
        });
        expect(result.current.selectedSong).toBe(s1);

        // Boundary: Previous at start should stay at start
        act(() => {
            result.current.selectPreviousInList();
        });
        expect(result.current.selectedSong).toBe(s1);
    });

    it("should toggle isPlaying when pause or playSong is called", () => {
        const { result } = renderHook(() => useMusicPlayer());

        const song1 = new Song("song1.mp3");

        act(() => {
            result.current.playSong(song1);
        });
        expect(result.current.isPlaying).toBe(true);
        expect(result.current.playingSong).toBe(song1);

        act(() => {
            result.current.pause();
        });
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.playingSong).toBe(song1); // song should remain
    });

    it("should not restart the song if playing the already playing song", () => {
        const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play');
        const { result } = renderHook(() => useMusicPlayer());

        const song1 = new Song("song1.mp3");

        act(() => {
            result.current.playSong(song1);
        });
        expect(playSpy).toHaveBeenCalledTimes(1);

        act(() => {
            result.current.playSong(song1);
        });
        // Should NOT call play again because it's already playing
        expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle rapid playback switching (spamming)", () => {
        const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play');
        const { result } = renderHook(() => useMusicPlayer());

        const song1 = new Song("song1.mp3");
        const song2 = new Song("song2.mp3");
        const song3 = new Song("song3.mp3");

        act(() => {
            result.current.playSong(song1);
            result.current.playSong(song2);
            result.current.playSong(song3);
        });

        // The hook should reflect the LATEST song
        expect(result.current.playingSong).toBe(song3);
        expect(result.current.isPlaying).toBe(true);
        // Each playSong call should have triggered a channel switch in AudioManager
        expect(playSpy).toHaveBeenCalledTimes(3);
    });

    it("should handle navigation (next/previous) in an empty list", () => {
        const { result } = renderHook(() => useMusicPlayer());

        expect(result.current.playlist).toEqual([]);
        expect(result.current.selectedSong).toBe(null);

        act(() => {
            result.current.selectNextInList();
        });
        expect(result.current.selectedSong).toBe(null);

        act(() => {
            result.current.selectPreviousInList();
        });
        expect(result.current.selectedSong).toBe(null);
    });

    it("should handle loading an empty playlist correctly", async () => {
        const mockFileService = createMockFileService({
            songs: [],
            name: "empty",
        });

        const { result } = renderHook(() => useMusicPlayer(mockFileService));

        await act(async () => {
            await result.current.loadPlaylist();
        });

        expect(result.current.playlist).toEqual([]);
        expect(result.current.selectedSong).toBe(null);
    });

    it("should not play invalid songs", () => {
        const { result } = renderHook(() => useMusicPlayer());
        const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play');

        const invalidSong = new Song("missing.mp3", false);

        act(() => {
            result.current.playSong(invalidSong);
        });

        // Should not trigger HTML audio play
        expect(playSpy).not.toHaveBeenCalled();
        // Should not update playing state
        expect(result.current.playingSong).toBe(null);
        expect(result.current.isPlaying).toBe(false);
    });

    describe("auto-advance on natural song end", () => {
        it("should select the next song (without playing) when the current one ends naturally", async () => {
            const s1 = new Song("s1.mp3");
            const s2 = new Song("s2.mp3");
            const mockFileService = createMockFileService({ songs: [s1, s2], name: "pl" });
            const { result } = renderHook(() => useMusicPlayer(mockFileService));

            await act(async () => { await result.current.loadPlaylist(); });

            act(() => { result.current.playSong(s1); });
            expect(result.current.playingSong).toBe(s1);

            // Simulate natural end of s1
            const audioElement = result.current.getAudioElement();
            act(() => {
                audioElement.dispatchEvent(new Event("ended"));
            });

            expect(result.current.isPlaying).toBe(false);
            expect(result.current.playingSong).toBeNull();
            expect(result.current.selectedSong).toBe(s2);
        });

        it("should stop playback when last song ends naturally (no auto-advance)", async () => {
            const s1 = new Song("s1.mp3");
            const s2 = new Song("s2.mp3");
            const mockFileService = createMockFileService({ songs: [s1, s2], name: "pl" });
            const { result } = renderHook(() => useMusicPlayer(mockFileService));

            await act(async () => { await result.current.loadPlaylist(); });

            act(() => { result.current.playSong(s2); });
            expect(result.current.playingSong).toBe(s2);

            // Simulate natural end of s2 (the last song)
            const audioElement = result.current.getAudioElement();
            act(() => {
                audioElement.dispatchEvent(new Event("ended"));
            });

            expect(result.current.isPlaying).toBe(false);
            expect(result.current.playingSong).toBeNull();
        });

        it("should stop playback when only one song in the playlist ends naturally", async () => {
            const s1 = new Song("s1.mp3");
            const mockFileService = createMockFileService({ songs: [s1], name: "pl" });
            const { result } = renderHook(() => useMusicPlayer(mockFileService));

            await act(async () => { await result.current.loadPlaylist(); });

            act(() => { result.current.playSong(s1); });

            const audioElement = result.current.getAudioElement();
            act(() => {
                audioElement.dispatchEvent(new Event("ended"));
            });

            expect(result.current.isPlaying).toBe(false);
            expect(result.current.playingSong).toBeNull();
        });
    });

    it("should not play invalid song when using playCurrentSelected", () => {
        const mockFileService = createMockFileService({
            songs: [new Song("invalid.mp3", false)],
            name: "test",
        });

        const { result } = renderHook(() => useMusicPlayer(mockFileService));
        const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play');

        act(async () => {
            await result.current.loadPlaylist();
        });

        // Try to play the current selected song (which is invalid)
        act(() => {
            result.current.playCurrentSelected();
        });

        expect(playSpy).not.toHaveBeenCalled();
        expect(result.current.isPlaying).toBe(false);
    });
});
