import { describe, it, expect, vi } from "vitest";
import { FileService } from "@logic/FileService";
import { FileDialog } from "../../src/abstractions/FileDialog";
import { FileSystem } from "../../src/abstractions/FileSystem";

describe("FileService - Song validation", () => {
    it("should mark songs as invalid when they don't exist on disk", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\Music\\playlist.txt"),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue("existing.mp3\nmissing.mp3\n"),
            exists: vi.fn()
                .mockResolvedValueOnce(true)   // existing.mp3 exists
                .mockResolvedValueOnce(false), // missing.mp3 doesn't exist
            writeTextFile: vi.fn(),
        };

        const service = new FileService(mockDialog, mockFileSystem);
        const result = await service.selectAndReadPlaylist();

        expect(result).not.toBeNull();
        expect(result?.songs).toHaveLength(2);
        expect(result?.songs[0].isValid()).toBe(true);
        expect(result?.songs[0].getDisplayName()).toBe("existing.mp3");
        expect(result?.songs[1].isValid()).toBe(false);
        expect(result?.songs[1].getDisplayName()).toBe("missing.mp3");
        
        // Verify exists was called for each song
        expect(mockFileSystem.exists).toHaveBeenCalledTimes(2);
        expect(mockFileSystem.exists).toHaveBeenCalledWith("existing.mp3");
        expect(mockFileSystem.exists).toHaveBeenCalledWith("missing.mp3");
    });

    it("should mark all songs as valid when all files exist", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\Music\\playlist.txt"),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue("song1.mp3\nsong2.mp3\nsong3.mp3\n"),
            exists: vi.fn().mockResolvedValue(true), // All files exist
            writeTextFile: vi.fn(),
        };

        const service = new FileService(mockDialog, mockFileSystem);
        const result = await service.selectAndReadPlaylist();

        expect(result?.songs).toHaveLength(3);
        result?.songs.forEach(song => {
            expect(song.isValid()).toBe(true);
        });
    });

    it("should mark all songs as invalid when no files exist", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\Music\\playlist.txt"),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue("missing1.mp3\nmissing2.mp3\n"),
            exists: vi.fn().mockResolvedValue(false), // No files exist
            writeTextFile: vi.fn(),
        };

        const service = new FileService(mockDialog, mockFileSystem);
        const result = await service.selectAndReadPlaylist();

        expect(result?.songs).toHaveLength(2);
        result?.songs.forEach(song => {
            expect(song.isValid()).toBe(false);
        });
    });
});
