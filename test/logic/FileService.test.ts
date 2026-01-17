import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileService } from "../../src/logic/FileService";
import { Song } from "../../src/logic/Song";

// Mock Tauri APIs
vi.mock("@tauri-apps/plugin-dialog", () => ({
    open: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
    readTextFile: vi.fn(),
}));

describe("FileService", () => {
    let service: FileService;

    beforeEach(() => {
        service = new FileService();
        vi.clearAllMocks();
    });

    it("should return null if no file is selected", async () => {
        const { open } = await import("@tauri-apps/plugin-dialog");
        vi.mocked(open).mockResolvedValue(null);

        const result = await service.selectAndReadPlaylist();
        expect(result).toBeNull();
    });

    it("should parse a playlist file correctly and return Song objects", async () => {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readTextFile } = await import("@tauri-apps/plugin-fs");

        vi.mocked(open).mockResolvedValue("C:\\Music\\my-playlist.txt");
        vi.mocked(readTextFile).mockResolvedValue("song1.mp3\n  \n  song2.MP3\nnot-a-song.txt\n");

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
    });

    it("should handle mixed slashes in paths for name extraction", async () => {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readTextFile } = await import("@tauri-apps/plugin-fs");

        vi.mocked(open).mockResolvedValue("/home/user/music/linux-playlist.alb");
        vi.mocked(readTextFile).mockResolvedValue("s1.mp3");

        const result = await service.selectAndReadPlaylist();
        expect(result?.name).toBe("linux-playlist");
        expect(result?.songs).toHaveLength(1);
        expect(result?.songs[0]).toBeInstanceOf(Song);
    });

    it("should throw error if readTextFile fails", async () => {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readTextFile } = await import("@tauri-apps/plugin-fs");

        vi.mocked(open).mockResolvedValue("path.txt");
        vi.mocked(readTextFile).mockRejectedValue(new Error("Read error"));

        await expect(service.selectAndReadPlaylist()).rejects.toThrow("Read error");
    });
});
