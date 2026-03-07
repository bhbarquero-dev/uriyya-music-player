import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileLoader } from "../../src/hooks/useFileLoader";
import type { PlaylistData } from "../../src/logic/FileService";
import { FileDialog } from "../../src/abstractions/FileDialog";
import { FileSystem } from "../../src/abstractions/FileSystem";
import { FileService } from "../../src/logic/FileService";
import { Song } from "../../src/logic/Song";

describe("useFileLoader", () => {
    describe("with default FileService", () => {
        it("should initialize without errors", () => {
            const { result } = renderHook(() => useFileLoader());
            
            expect(result.current.loadPlaylist).toBeInstanceOf(Function);
        });
    });

    describe("with mocked FileService", () => {
        it("should return null when no file is selected", async () => {
            const mockDialog: FileDialog = {
                open: vi.fn().mockResolvedValue(null),
            };
            const mockFileSystem: FileSystem = {
                readTextFile: vi.fn(),
                exists: vi.fn().mockResolvedValue(true),
            };
            const mockFileService = new FileService(mockDialog, mockFileSystem);

            const { result } = renderHook(() => useFileLoader(mockFileService));

            let loadResult: PlaylistData | null | undefined;
            await act(async () => {
                loadResult = await result.current.loadPlaylist();
            });

            expect(loadResult).toBeNull();
            expect(mockDialog.open).toHaveBeenCalledWith({
                multiple: false,
                filters: [{ name: "Listas de reproducción", extensions: ["txt", "alb"] }],
            });
        });

        it("should parse playlist file and return songs with name", async () => {
            const mockDialog: FileDialog = {
                open: vi.fn().mockResolvedValue("C:\\Music\\my-playlist.txt"),
            };
            const mockFileSystem: FileSystem = {
                readTextFile: vi.fn().mockResolvedValue("song1.mp3\nsong2.mp3\n"),
                exists: vi.fn().mockResolvedValue(true),
            };
            const mockFileService = new FileService(mockDialog, mockFileSystem);

            const { result } = renderHook(() => useFileLoader(mockFileService));

            let loadResult: PlaylistData | null | undefined;
            await act(async () => {
                loadResult = await result.current.loadPlaylist();
            });

            expect(loadResult).not.toBeNull();
            expect(loadResult?.name).toBe("my-playlist");
            expect(loadResult?.songs).toHaveLength(2);
            expect(loadResult?.songs[0]).toBeInstanceOf(Song);
            expect(loadResult?.songs[0].getDisplayName()).toBe("song1.mp3");
            expect(loadResult?.songs[1].getDisplayName()).toBe("song2.mp3");
        });

        it("should handle file read errors", async () => {
            const mockDialog: FileDialog = {
                open: vi.fn().mockResolvedValue("test.txt"),
            };
            const mockFileSystem: FileSystem = {
                readTextFile: vi.fn().mockRejectedValue(new Error("Read error")),
                exists: vi.fn().mockResolvedValue(true),
            };
            const mockFileService = new FileService(mockDialog, mockFileSystem);

            const { result } = renderHook(() => useFileLoader(mockFileService));

            await expect(async () => {
                await act(async () => {
                    await result.current.loadPlaylist();
                });
            }).rejects.toThrow("Read error");
        });

        it("should handle playlists with .alb extension", async () => {
            const mockDialog: FileDialog = {
                open: vi.fn().mockResolvedValue("/home/user/playlist.alb"),
            };
            const mockFileSystem: FileSystem = {
                readTextFile: vi.fn().mockResolvedValue("track.mp3\n"),
                exists: vi.fn().mockResolvedValue(true),
            };
            const mockFileService = new FileService(mockDialog, mockFileSystem);

            const { result } = renderHook(() => useFileLoader(mockFileService));

            let loadResult: PlaylistData | null | undefined;
            await act(async () => {
                loadResult = await result.current.loadPlaylist();
            });

            expect(loadResult?.name).toBe("playlist");
            expect(loadResult?.songs).toHaveLength(1);
        });

        it("should filter out non-mp3 lines", async () => {
            const mockDialog: FileDialog = {
                open: vi.fn().mockResolvedValue("C:\\playlist.txt"),
            };
            const mockFileSystem: FileSystem = {
                readTextFile: vi.fn().mockResolvedValue("song1.mp3\nnot-audio.txt\nsong2.MP3\n\n  \n"),
                exists: vi.fn().mockResolvedValue(true),
            };
            const mockFileService = new FileService(mockDialog, mockFileSystem);

            const { result } = renderHook(() => useFileLoader(mockFileService));

            let loadResult: PlaylistData | null | undefined;
            await act(async () => {
                loadResult = await result.current.loadPlaylist();
            });

            expect(loadResult?.songs).toHaveLength(2);
            expect(loadResult?.songs[0].getDisplayName()).toBe("song1.mp3");
            expect(loadResult?.songs[1].getDisplayName()).toBe("song2.MP3");
        });

        it("should handle multiple calls to loadPlaylist", async () => {
            const mockDialog: FileDialog = {
                open: vi.fn()
                    .mockResolvedValueOnce("C:\\playlist1.txt")
                    .mockResolvedValueOnce("C:\\playlist2.txt"),
            };
            const mockFileSystem: FileSystem = {
                readTextFile: vi.fn()
                    .mockResolvedValueOnce("song1.mp3\n")
                    .mockResolvedValueOnce("song2.mp3\nsong3.mp3\n"),
                exists: vi.fn().mockResolvedValue(true),
            };
            const mockFileService = new FileService(mockDialog, mockFileSystem);

            const { result } = renderHook(() => useFileLoader(mockFileService));

            let result1: PlaylistData | null | undefined, result2: PlaylistData | null | undefined;
            await act(async () => {
                result1 = await result.current.loadPlaylist();
            });

            await act(async () => {
                result2 = await result.current.loadPlaylist();
            });

            expect(result1?.songs).toHaveLength(1);
            expect(result2?.songs).toHaveLength(2);
        });
    });
});
