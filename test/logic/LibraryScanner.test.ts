import { describe, it, expect, vi, beforeEach } from "vitest";
import { scanLibraryAudioFiles } from "@logic/LibraryScanner";

vi.mock("@tauri-apps/api/path", () => ({
    join: vi.fn(async (...parts: string[]) => parts.join("/")),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
    readDir: vi.fn(),
}));

const { readDir } = await import("@tauri-apps/plugin-fs");
const mockedReadDir = vi.mocked(readDir);

describe("scanLibraryAudioFiles", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns empty array when directory is empty", async () => {
        mockedReadDir.mockResolvedValue([]);

        const result = await scanLibraryAudioFiles("/music");

        expect(result).toEqual([]);
    });

    it("finds mp3 files in the root directory", async () => {
        mockedReadDir.mockResolvedValue([
            { name: "song.mp3", isFile: true, isDirectory: false, isSymlink: false },
        ]);

        const result = await scanLibraryAudioFiles("/music");

        expect(result).toEqual(["/music/song.mp3"]);
    });

    it("finds wav files in the root directory", async () => {
        mockedReadDir.mockResolvedValue([
            { name: "song.wav", isFile: true, isDirectory: false, isSymlink: false },
        ]);

        const result = await scanLibraryAudioFiles("/music");

        expect(result).toEqual(["/music/song.wav"]);
    });

    it("ignores non-audio files", async () => {
        const { join } = await import("@tauri-apps/api/path");
        const mockedJoin = vi.mocked(join);
        mockedReadDir.mockResolvedValue([
            { name: "cover.jpg", isFile: true, isDirectory: false, isSymlink: false },
            { name: "notes.txt", isFile: true, isDirectory: false, isSymlink: false },
            { name: "song.mp3", isFile: true, isDirectory: false, isSymlink: false },
        ]);

        const result = await scanLibraryAudioFiles("/music");

        expect(result).toEqual(["/music/song.mp3"]);
        expect(mockedJoin).toHaveBeenCalledTimes(1);
    });

    it("recursively scans subdirectories", async () => {
        mockedReadDir
            .mockResolvedValueOnce([
                { name: "Rock", isFile: false, isDirectory: true, isSymlink: false },
            ])
            .mockResolvedValueOnce([
                { name: "song.mp3", isFile: true, isDirectory: false, isSymlink: false },
            ]);

        const result = await scanLibraryAudioFiles("/music");

        expect(result).toEqual(["/music/Rock/song.mp3"]);
    });

    it("returns results sorted alphabetically", async () => {
        mockedReadDir.mockResolvedValue([
            { name: "zebra.mp3", isFile: true, isDirectory: false, isSymlink: false },
            { name: "alpha.mp3", isFile: true, isDirectory: false, isSymlink: false },
            { name: "mango.wav", isFile: true, isDirectory: false, isSymlink: false },
        ]);

        const result = await scanLibraryAudioFiles("/music");

        expect(result).toEqual(["/music/alpha.mp3", "/music/mango.wav", "/music/zebra.mp3"]);
    });

    it("skips unreadable directories and continues scanning siblings", async () => {
        // Stack is LIFO: "Readable" is pushed first, "Unreadable" is pushed second.
        // Popping order: "Unreadable" first (fails), then "Readable" (succeeds).
        mockedReadDir
            .mockResolvedValueOnce([
                { name: "Readable", isFile: false, isDirectory: true, isSymlink: false },
                { name: "Unreadable", isFile: false, isDirectory: true, isSymlink: false },
            ])
            .mockRejectedValueOnce(new Error("Permission denied"))
            .mockResolvedValueOnce([
                { name: "song.mp3", isFile: true, isDirectory: false, isSymlink: false },
            ]);

        const result = await scanLibraryAudioFiles("/music");

        expect(result).toEqual(["/music/Readable/song.mp3"]);
    });

    it("includes audio files when isFile is false (symlinked files on Windows/OneDrive)", async () => {
        mockedReadDir.mockResolvedValue([
            { name: "linked.mp3", isFile: false, isDirectory: false, isSymlink: true },
        ]);

        const result = await scanLibraryAudioFiles("/music");

        expect(result).toEqual(["/music/linked.mp3"]);
    });

    it("scans junction/symlink directories where isDirectory is false (Windows)", async () => {
        mockedReadDir
            .mockResolvedValueOnce([
                { name: "Rock", isFile: false, isDirectory: false, isSymlink: true },
            ])
            .mockResolvedValueOnce([
                { name: "song.mp3", isFile: true, isDirectory: false, isSymlink: false },
            ]);

        const result = await scanLibraryAudioFiles("/music");

        expect(result).toEqual(["/music/Rock/song.mp3"]);
    });

    it("is case-insensitive for audio extensions", async () => {
        mockedReadDir.mockResolvedValue([
            { name: "song.MP3", isFile: true, isDirectory: false, isSymlink: false },
            { name: "other.WAV", isFile: true, isDirectory: false, isSymlink: false },
        ]);

        const result = await scanLibraryAudioFiles("/music");

        expect(result).toEqual(["/music/other.WAV", "/music/song.MP3"]);
    });

});
