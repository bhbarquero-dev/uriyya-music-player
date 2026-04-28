import { describe, it, expect, vi, beforeEach } from "vitest";
import { mock } from "vitest-mock-extended";
import { Library, filterSongs } from "@logic/Library";
import type { FileDialog } from "@abstractions/FileDialog";
import type { SettingsStore } from "@abstractions/SettingsStore";

const scanLibraryAudioFilesMock = vi.fn();

vi.mock("../../src/logic/LibraryScanner", () => ({
    scanLibraryAudioFiles: (...args: unknown[]) => scanLibraryAudioFilesMock(...args),
}));

describe("Library", () => {
    let library: Library;
    let fakeFileDialog: ReturnType<typeof mock<FileDialog>>;
    let fakeSettings: ReturnType<typeof mock<SettingsStore>>;

    beforeEach(() => {
        vi.clearAllMocks();
        scanLibraryAudioFilesMock.mockResolvedValue([]);
        fakeFileDialog = mock<FileDialog>();
        fakeSettings = mock<SettingsStore>();
        library = new Library(fakeFileDialog, fakeSettings);
    });

    describe("getPath", () => {
        it("should return the library path from settings", async () => {
            fakeSettings.getLibraryPath.mockResolvedValue("C:/Music");

            const path = await library.getPath();

            expect(path).toBe("C:/Music");
            expect(fakeSettings.getLibraryPath).toHaveBeenCalledOnce();
        });

        it("should return null if no path is stored", async () => {
            fakeSettings.getLibraryPath.mockResolvedValue(null);

            const path = await library.getPath();

            expect(path).toBeNull();
        });

        it("should propagate errors from settings store", async () => {
            const error = new Error("Settings store error");
            fakeSettings.getLibraryPath.mockRejectedValue(error);

            await expect(library.getPath()).rejects.toThrow("Settings store error");
        });
    });

    describe("setPath", () => {
        it("should save the library path to settings", async () => {
            await library.setPath("C:/Music");

            expect(fakeSettings.saveLibraryPath).toHaveBeenCalledWith("C:/Music");
            expect(fakeSettings.saveLibraryPath).toHaveBeenCalledOnce();
        });

        it("should propagate errors from settings store", async () => {
            const error = new Error("Settings store error");
            fakeSettings.saveLibraryPath.mockRejectedValue(error);

            await expect(library.setPath("C:/Music")).rejects.toThrow("Settings store error");
        });
    });

    describe("add", () => {
        it("should open a directory dialog and return the selected path", async () => {
            fakeFileDialog.openDirectory.mockResolvedValue("C:/Music");

            const result = await library.add();

            expect(result).toBe("C:/Music");
            expect(fakeFileDialog.openDirectory).toHaveBeenCalledOnce();
        });

        it("should save the selected path to settings", async () => {
            fakeFileDialog.openDirectory.mockResolvedValue("C:/Music");

            await library.add();

            expect(fakeSettings.saveLibraryPath).toHaveBeenCalledWith("C:/Music");
        });

        it("should return null and not save if dialog is cancelled", async () => {
            fakeFileDialog.openDirectory.mockResolvedValue(null);

            const result = await library.add();

            expect(result).toBeNull();
            expect(fakeSettings.saveLibraryPath).not.toHaveBeenCalled();
        });

        it("should propagate errors from the file dialog", async () => {
            fakeFileDialog.openDirectory.mockRejectedValue(new Error("Dialog error"));

            await expect(library.add()).rejects.toThrow("Dialog error");
        });
    });

    describe("getSongs", () => {
        it("should return songs from the stored path", async () => {
            const mockSongs = ["C:/Music/song1.mp3", "C:/Music/song2.mp3"];
            scanLibraryAudioFilesMock.mockResolvedValue(mockSongs);

            await library.setPath("C:/Music");
            const songs = await library.getSongs();

            expect(songs).toEqual(mockSongs);
            expect(scanLibraryAudioFilesMock).toHaveBeenCalledWith("C:/Music");
        });

        it("should return empty array if no path is set", async () => {
            const songs = await library.getSongs();

            expect(songs).toEqual([]);
            expect(scanLibraryAudioFilesMock).not.toHaveBeenCalled();
        });

        it("should propagate errors from scanner", async () => {
            const error = new Error("Scanner error");
            scanLibraryAudioFilesMock.mockRejectedValue(error);

            await library.setPath("C:/Music");
            await expect(library.getSongs()).rejects.toThrow("Scanner error");
        });
    });

    describe("filterSongs", () => {
        const songs = [
            "C:/Music/niña.mp3",
            "C:/Music/nina.wav",
            "C:/Music/canción.mp3",
            "C:/Music/cancion.wav",
        ];

        it("should return all songs when query is empty", () => {
            expect(filterSongs(songs, "")).toEqual(songs);
        });

        it("should return all songs when query is only whitespace", () => {
            expect(filterSongs(songs, "   ")).toEqual(songs);
        });

        it("should filter by filename case-insensitively", () => {
            expect(filterSongs(songs, "NIÑA")).toEqual(["C:/Music/niña.mp3"]);
        });

        it("should filter using NFC normalization for ñ", () => {
            expect(filterSongs(songs, "ñ")).toEqual(["C:/Music/niña.mp3"]);
        });

        it("should match NFD-encoded filenames when query is NFC", () => {
            const nfdSongs = ["C:/Music/nin\u0303a.mp3", "C:/Music/nina.wav"];
            expect(filterSongs(nfdSongs, "ñ")).toEqual(["C:/Music/nin\u0303a.mp3"]);
        });

        it("should filter by accented vowels", () => {
            expect(filterSongs(songs, "ó")).toEqual(["C:/Music/canción.mp3"]);
        });

        it("should return empty array when no songs match", () => {
            expect(filterSongs(songs, "xyz")).toEqual([]);
        });
    });

    describe("getName", () => {
        it("should return the folder name from a Unix path", async () => {
            await library.setPath("/home/user/Music");
            expect(library.getName()).toBe("Music");
        });

        it("should return the folder name from a Windows path", async () => {
            await library.setPath("C:/Users/user/Music");
            expect(library.getName()).toBe("Music");
        });

        it("should return null when no path is set", () => {
            expect(library.getName()).toBeNull();
        });
    });

    describe("hasLibrary", () => {
        it("should return false when no path is set", () => {
            expect(library.hasLibrary()).toBe(false);
        });

        it("should return true after setting a path", async () => {
            await library.setPath("C:/Music");
            expect(library.hasLibrary()).toBe(true);
        });
    });
});
