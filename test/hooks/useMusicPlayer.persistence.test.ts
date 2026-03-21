import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMusicPlayer } from "../../src/hooks/useMusicPlayer";
import { FileService } from "../../src/logic/FileService";
import { Song } from "../../src/logic/Song";

const createMockFileService = (playlistData: { songs: Song[]; name: string; path?: string } | null = null) => {
    const data = playlistData ? { path: "C:\\Music\\playlist.txt", ...playlistData } : null;
    const mockFileService: Partial<FileService> = {
        selectAndReadPlaylist: vi.fn().mockResolvedValue(data),
        savePlaylist: vi.fn().mockResolvedValue(undefined),
    };
    return mockFileService as FileService;
};

describe("useMusicPlayer - playlist persistence", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
        vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllTimers();
    });

    it("should have currentPlaylistPath as null before loading a playlist", () => {
        const { result } = renderHook(() => useMusicPlayer());

        expect(result.current.currentPlaylistPath).toBeNull();
    });

    it("should set currentPlaylistPath after loadPlaylist", async () => {
        const song = new Song("song1.mp3");
        const mockFileService = createMockFileService({
            songs: [song],
            name: "playlist",
            path: "C:\\Music\\playlist.alb",
        });

        const { result } = renderHook(() => useMusicPlayer(mockFileService));

        await act(async () => {
            await result.current.loadPlaylist();
        });

        expect(result.current.currentPlaylistPath).toBe("C:\\Music\\playlist.alb");
    });

    it("should save the current playlist to disk when saveCurrentPlaylist is called", async () => {
        const song1 = new Song("C:\\Music\\song1.mp3");
        const song2 = new Song("C:\\Music\\song2.mp3");
        const mockFileService = createMockFileService({
            songs: [song1, song2],
            name: "playlist",
            path: "C:\\Music\\playlist.alb",
        });

        const { result } = renderHook(() => useMusicPlayer(mockFileService));

        await act(async () => { await result.current.loadPlaylist(); });
        await act(async () => { await result.current.saveCurrentPlaylist(); });

        expect(mockFileService.savePlaylist).toHaveBeenCalledWith(
            "C:\\Music\\playlist.alb",
            [song1, song2]
        );
    });

    it("should clear hasUnsavedChanges after saveCurrentPlaylist", async () => {
        const song1 = new Song("song1.mp3");
        const song2 = new Song("song2.mp3");
        const mockFileService = createMockFileService({
            songs: [song1, song2],
            name: "playlist",
            path: "C:\\Music\\playlist.alb",
        });

        const { result } = renderHook(() => useMusicPlayer(mockFileService));

        await act(async () => { await result.current.loadPlaylist(); });
        act(() => { result.current.removeSong(song1); });
        expect(result.current.hasUnsavedChanges).toBe(true);

        await act(async () => { await result.current.saveCurrentPlaylist(); });

        expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it("should not call savePlaylist if no playlist is loaded", async () => {
        const mockFileService = createMockFileService();
        const { result } = renderHook(() => useMusicPlayer(mockFileService));

        await act(async () => { await result.current.saveCurrentPlaylist(); });

        expect(mockFileService.savePlaylist).not.toHaveBeenCalled();
    });
});
