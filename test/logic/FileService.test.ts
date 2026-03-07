import { describe, it, expect, vi } from "vitest";
import { FileService } from "../../src/logic/FileService";
import { FileDialog } from "../../src/abstractions/FileDialog";
import { FileSystem } from "../../src/abstractions/FileSystem";
import { Song } from "../../src/logic/Song";

describe("FileService", () => {
    it("should return null if no file is selected", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn(),
            exists: vi.fn().mockResolvedValue(true),
        };

        const service = new FileService(mockDialog, mockFileSystem);
        const result = await service.selectAndReadPlaylist();

        expect(result).toBeNull();
        expect(mockDialog.open).toHaveBeenCalledWith({
            multiple: false,
            filters: [{ name: "Listas de reproducción", extensions: ["txt", "alb"] }],
        });
    });

    it("should parse a playlist file correctly and return Song objects", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\Music\\my-playlist.txt"),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue("song1.mp3\n  \n  song2.MP3\nnot-a-song.txt\n"),
            exists: vi.fn().mockResolvedValue(true),
        };

        const service = new FileService(mockDialog, mockFileSystem);
        const result = await service.selectAndReadPlaylist();

        expect(result).not.toBeNull();
        if (result) {
            expect(result.name).toBe("my-playlist");
            expect(result.songs).toHaveLength(2);
            expect(result.songs[0]).toBeInstanceOf(Song);
            expect(result.songs[1]).toBeInstanceOf(Song);
            expect(result.songs[0].getDisplayName()).toBe("song1.mp3");
            expect(result.songs[1].getDisplayName()).toBe("song2.MP3");
        }
        expect(mockFileSystem.readTextFile).toHaveBeenCalledWith("C:\\Music\\my-playlist.txt");
    });

    it("should handle mixed slashes in paths for name extraction", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("/home/user/music/linux-playlist.alb"),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue("s1.mp3"),
            exists: vi.fn().mockResolvedValue(true),
        };

        const service = new FileService(mockDialog, mockFileSystem);
        const result = await service.selectAndReadPlaylist();

        expect(result?.name).toBe("linux-playlist");
        expect(result?.songs).toHaveLength(1);
        expect(result?.songs[0]).toBeInstanceOf(Song);
    });

    it("should throw error if readTextFile fails", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("path.txt"),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockRejectedValue(new Error("Read error")),
            exists: vi.fn().mockResolvedValue(true),
        };

        const service = new FileService(mockDialog, mockFileSystem);

        await expect(service.selectAndReadPlaylist()).rejects.toThrow("Read error");
    });
});
