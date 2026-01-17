import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMusicPlayer } from "../../src/hooks/useMusicPlayer";
import { Song } from "../../src/logic/Song";

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
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readTextFile } = await import("@tauri-apps/plugin-fs");

        vi.mocked(open).mockResolvedValue("my-playlist.txt");
        vi.mocked(readTextFile).mockResolvedValue("song1.mp3\nsong2.mp3\n");

        const { result } = renderHook(() => useMusicPlayer());

        await act(async () => {
            await result.current.loadPlaylist();
        });

        expect(result.current.playlist).toHaveLength(2);
        expect(result.current.playlist[0]).toBeInstanceOf(Song);
        expect(result.current.playlist[0].getDisplayName()).toBe("song1.mp3");
        expect(result.current.playlist[1].getDisplayName()).toBe("song2.mp3");
        expect(result.current.selectedSong).toBe(result.current.playlist[0]);
        expect(result.current.currentPlaylistName).toBe("my-playlist");
    });

    it("should handle navigation (next/previous) correctly", async () => {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readTextFile } = await import("@tauri-apps/plugin-fs");

        vi.mocked(open).mockResolvedValue("playlist.txt");
        vi.mocked(readTextFile).mockResolvedValue("s1.mp3\ns2.mp3\ns3.mp3\n");

        const { result } = renderHook(() => useMusicPlayer());

        await act(async () => {
            await result.current.loadPlaylist();
        });

        const [s1, s2, s3] = result.current.playlist;

        // Current is s1.mp3
        expect(result.current.selectedSong).toBe(s1);

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
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readTextFile } = await import("@tauri-apps/plugin-fs");

        vi.mocked(open).mockResolvedValue("empty.txt");
        vi.mocked(readTextFile).mockResolvedValue("\n  \n"); // Just whitespace

        const { result } = renderHook(() => useMusicPlayer());

        await act(async () => {
            await result.current.loadPlaylist();
        });

        expect(result.current.playlist).toEqual([]);
        expect(result.current.selectedSong).toBe(null);
    });
});
