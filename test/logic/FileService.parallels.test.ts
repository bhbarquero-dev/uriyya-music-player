import { describe, it, expect, vi } from "vitest";
import { FileService } from "@logic/FileService";
import { FileDialog } from "../../src/abstractions/FileDialog";
import { FileSystem } from "../../src/abstractions/FileSystem";
import { Song } from "@logic/Song";

const HOME_DIR = "/Users/uriyya";
const VM_PATH = "\\\\Mac\\Home\\Music\\file.mp3";
const RESOLVED_PATH = "/Users/uriyya/Music/file.mp3";

describe("FileService - Parallels path resolution", () => {
    it("resolves a Parallels path when homeDir is available and resolved file exists", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\playlist.alb"),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue(`${VM_PATH}\n`),
            exists: vi.fn().mockResolvedValue(true),  // resolved Mac path exists
            writeTextFile: vi.fn(),
        };
        const homeDirFn = vi.fn().mockResolvedValue(HOME_DIR);

        const service = new FileService(mockDialog, mockFileSystem, homeDirFn);
        const result = await service.selectAndReadPlaylist();

        expect(result?.songs).toHaveLength(1);
        const song = result!.songs[0];
        expect(song.isValid()).toBe(true);
        expect(song.getPath()).toBe(RESOLVED_PATH);
        expect(song.getOriginalPath()).toBe(VM_PATH);
        // exists is called only once — with the resolved Mac path, never with the raw VM path
        expect(mockFileSystem.exists).toHaveBeenCalledTimes(1);
        expect(mockFileSystem.exists).toHaveBeenCalledWith(RESOLVED_PATH);
    });

    it("keeps song invalid when homeDir is null (graceful degradation)", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\playlist.alb"),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue(`${VM_PATH}\n`),
            exists: vi.fn().mockResolvedValue(false),
            writeTextFile: vi.fn(),
        };
        const homeDirFn = vi.fn().mockResolvedValue(null);

        const service = new FileService(mockDialog, mockFileSystem, homeDirFn);
        const result = await service.selectAndReadPlaylist();

        expect(result?.songs[0].isValid()).toBe(false);
        expect(result?.songs[0].getPath()).toBe(VM_PATH);
        expect(result?.songs[0].getOriginalPath()).toBe(VM_PATH);
    });

    it("keeps song invalid when Parallels path does not exist even after resolution", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\playlist.alb"),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue(`${VM_PATH}\n`),
            exists: vi.fn().mockResolvedValue(false),
            writeTextFile: vi.fn(),
        };
        const homeDirFn = vi.fn().mockResolvedValue(HOME_DIR);

        const service = new FileService(mockDialog, mockFileSystem, homeDirFn);
        const result = await service.selectAndReadPlaylist();

        expect(result?.songs[0].isValid()).toBe(false);
    });

    it("does not attempt resolution for non-Parallels paths", async () => {
        const nativePath = "/Users/uriyya/Music/native.mp3";
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\playlist.alb"),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue(`${nativePath}\n`),
            exists: vi.fn().mockResolvedValue(true),
            writeTextFile: vi.fn(),
        };
        const homeDirFn = vi.fn().mockResolvedValue(HOME_DIR);

        const service = new FileService(mockDialog, mockFileSystem, homeDirFn);
        const result = await service.selectAndReadPlaylist();

        expect(result?.songs[0].isValid()).toBe(true);
        expect(result?.songs[0].getPath()).toBe(nativePath);
        expect(result?.songs[0].getOriginalPath()).toBe(nativePath);
        // exists called only once — no second lookup for resolution
        expect(mockFileSystem.exists).toHaveBeenCalledTimes(1);
    });

    it("savePlaylist writes original VM paths, not the resolved Mac paths", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn(),
            openDirectory: vi.fn(),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn(),
            exists: vi.fn(),
            writeTextFile: vi.fn().mockResolvedValue(undefined),
        };
        const songs = [new Song(RESOLVED_PATH, true, VM_PATH)];
        const service = new FileService(mockDialog, mockFileSystem);

        await service.savePlaylist("C:\\playlist.alb", songs);

        expect(mockFileSystem.writeTextFile).toHaveBeenCalledWith(
            "C:\\playlist.alb",
            VM_PATH
        );
    });

    it("selectAndReadPlaylist returns parallelsHomeDir when the playlist contains Parallels paths", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\playlist.alb"),
            openDirectory: vi.fn(),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue(`${VM_PATH}\n`),
            exists: vi.fn().mockResolvedValue(true),
            writeTextFile: vi.fn(),
        };
        const homeDirFn = vi.fn().mockResolvedValue(HOME_DIR);

        const service = new FileService(mockDialog, mockFileSystem, homeDirFn);
        const result = await service.selectAndReadPlaylist();

        expect(result?.parallelsHomeDir).toBe(HOME_DIR);
    });

    it("selectAndReadPlaylist does not set parallelsHomeDir for a non-Parallels playlist", async () => {
        const nativePath = "/Users/uriyya/Music/native.mp3";
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\playlist.alb"),
            openDirectory: vi.fn(),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue(`${nativePath}\n`),
            exists: vi.fn().mockResolvedValue(true),
            writeTextFile: vi.fn(),
        };
        const homeDirFn = vi.fn().mockResolvedValue(HOME_DIR);

        const service = new FileService(mockDialog, mockFileSystem, homeDirFn);
        const result = await service.selectAndReadPlaylist();

        expect(result?.parallelsHomeDir).toBeUndefined();
    });

    it("savePlaylist converts macOS paths to VM paths when parallelsHomeDir is provided", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn(),
            openDirectory: vi.fn(),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn(),
            exists: vi.fn(),
            writeTextFile: vi.fn().mockResolvedValue(undefined),
        };
        // A newly added song — macOS path only, no originalPath
        const newSong = new Song(RESOLVED_PATH, true);
        const service = new FileService(mockDialog, mockFileSystem);

        await service.savePlaylist("C:\\playlist.alb", [newSong], HOME_DIR);

        expect(mockFileSystem.writeTextFile).toHaveBeenCalledWith(
            "C:\\playlist.alb",
            VM_PATH
        );
    });

    it("savePlaylist with parallelsHomeDir saves a mix of original and new songs as VM paths", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn(),
            openDirectory: vi.fn(),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn(),
            exists: vi.fn(),
            writeTextFile: vi.fn().mockResolvedValue(undefined),
        };
        const existingSong = new Song(RESOLVED_PATH, true, VM_PATH);
        const newSong = new Song(RESOLVED_PATH, true);
        const service = new FileService(mockDialog, mockFileSystem);

        await service.savePlaylist("C:\\playlist.alb", [existingSong, newSong], HOME_DIR);

        expect(mockFileSystem.writeTextFile).toHaveBeenCalledWith(
            "C:\\playlist.alb",
            `${VM_PATH}\n${VM_PATH}`
        );
    });
});
