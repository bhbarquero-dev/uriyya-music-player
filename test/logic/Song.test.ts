import { describe, it, expect, vi, beforeEach } from "vitest";
import { Song } from "../../src/logic/Song";

describe("Song", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor validation", () => {
        it("should accept valid .mp3 path (lowercase)", () => {
            expect(() => new Song("song.mp3")).not.toThrow();
        });

        it("should accept valid .mp3 path (uppercase)", () => {
            expect(() => new Song("SONG.MP3")).not.toThrow();
        });

        it("should accept valid .mp3 path (mixed case)", () => {
            expect(() => new Song("Song.Mp3")).not.toThrow();
        });

        it("should accept full Windows path with .mp3", () => {
            expect(() => new Song("C:\\Music\\Albums\\song.mp3")).not.toThrow();
        });

        it("should accept full Unix path with .mp3", () => {
            expect(() => new Song("/home/user/music/song.mp3")).not.toThrow();
        });

        it("should throw on empty string", () => {
            expect(() => new Song("")).toThrow("Song path cannot be empty");
        });

        it("should throw on whitespace-only string", () => {
            expect(() => new Song("   ")).toThrow("Song path cannot be empty");
        });

        it("should throw on non-.mp3 extension (.txt)", () => {
            expect(() => new Song("song.txt")).toThrow("Invalid song format");
            expect(() => new Song("song.txt")).toThrow("Only .mp3 files are supported");
        });

        it("should throw on non-.mp3 extension (.wav)", () => {
            expect(() => new Song("song.wav")).toThrow("Invalid song format");
        });

        it("should throw on non-.mp3 extension (.flac)", () => {
            expect(() => new Song("song.flac")).toThrow("Invalid song format");
        });

        it("should throw on file without extension", () => {
            expect(() => new Song("song")).toThrow("Invalid song format");
        });

        it("should accept path with spaces", () => {
            expect(() => new Song("C:\\My Music\\My Song.mp3")).not.toThrow();
        });

        it("should accept path with special characters", () => {
            expect(() => new Song("song-01_final (copy).mp3")).not.toThrow();
        });
    });

    describe("toMediaUrl", () => {
        it("should convert path to media URL using convertFileSrc", async () => {
            const { convertFileSrc } = await import("@tauri-apps/api/core");
            const song = new Song("song.mp3");
            const url = song.toMediaUrl();

            expect(convertFileSrc).toHaveBeenCalledWith("song.mp3");
            expect(url).toBe("asset://song.mp3");
        });

        it("should convert Windows path to media URL", async () => {
            const { convertFileSrc } = await import("@tauri-apps/api/core");
            const song = new Song("C:\\Music\\song.mp3");
            const url = song.toMediaUrl();

            expect(convertFileSrc).toHaveBeenCalledWith("C:\\Music\\song.mp3");
            expect(url).toBe("asset://C:\\Music\\song.mp3");
        });

        it("should convert Unix path to media URL", async () => {
            const { convertFileSrc } = await import("@tauri-apps/api/core");
            const song = new Song("/home/user/song.mp3");
            const url = song.toMediaUrl();

            expect(convertFileSrc).toHaveBeenCalledWith("/home/user/song.mp3");
            expect(url).toBe("asset:///home/user/song.mp3");
        });

        it("should handle paths with spaces", async () => {
            const { convertFileSrc } = await import("@tauri-apps/api/core");
            const song = new Song("My Song.mp3");
            const url = song.toMediaUrl();

            expect(convertFileSrc).toHaveBeenCalledWith("My Song.mp3");
            expect(url).toBe("asset://My Song.mp3");
        });
    });

    describe("getDisplayName", () => {
        it("should extract filename from Windows path", () => {
            const song = new Song("C:\\Music\\Albums\\song.mp3");
            expect(song.getDisplayName()).toBe("song.mp3");
        });

        it("should extract filename from Unix path", () => {
            const song = new Song("/home/user/music/song.mp3");
            expect(song.getDisplayName()).toBe("song.mp3");
        });

        it("should return filename when no path separators", () => {
            const song = new Song("song.mp3");
            expect(song.getDisplayName()).toBe("song.mp3");
        });

        it("should handle mixed path separators", () => {
            const song = new Song("C:/Music\\Albums/song.mp3");
            expect(song.getDisplayName()).toBe("song.mp3");
        });

        it("should handle path with spaces", () => {
            const song = new Song("C:\\My Music\\My Song.mp3");
            expect(song.getDisplayName()).toBe("My Song.mp3");
        });

        it("should handle filename with special characters", () => {
            const song = new Song("track-01_final (copy).mp3");
            expect(song.getDisplayName()).toBe("track-01_final (copy).mp3");
        });

        it("should preserve case in display name", () => {
            const song = new Song("MySong.MP3");
            expect(song.getDisplayName()).toBe("MySong.MP3");
        });
    });

    describe("equals", () => {
        it("should return true for two Songs with the same path", () => {
            const song1 = new Song("song.mp3");
            const song2 = new Song("song.mp3");
            expect(song1.equals(song2)).toBe(true);
        });

        it("should return true when comparing with itself", () => {
            const song = new Song("song.mp3");
            expect(song.equals(song)).toBe(true);
        });

        it("should return false for Songs with different paths", () => {
            const song1 = new Song("song1.mp3");
            const song2 = new Song("song2.mp3");
            expect(song1.equals(song2)).toBe(false);
        });

        it("should return false when comparing with null", () => {
            const song = new Song("song.mp3");
            expect(song.equals(null)).toBe(false);
        });

        it("should return false when comparing with undefined", () => {
            const song = new Song("song.mp3");
            expect(song.equals(undefined)).toBe(false);
        });

        it("should be case-sensitive for path comparison", () => {
            const song1 = new Song("Song.mp3");
            const song2 = new Song("song.mp3");
            expect(song1.equals(song2)).toBe(false);
        });

        it("should compare full paths correctly", () => {
            const song1 = new Song("C:\\Music\\song.mp3");
            const song2 = new Song("C:\\Music\\song.mp3");
            const song3 = new Song("D:\\Music\\song.mp3");
            expect(song1.equals(song2)).toBe(true);
            expect(song1.equals(song3)).toBe(false);
        });
    });

});
