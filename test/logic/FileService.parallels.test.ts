import { describe, it, expect, vi } from "vitest";
import { FileService } from "../../src/logic/FileService";
import { FileDialog } from "../../src/abstractions/FileDialog";
import { FileSystem } from "../../src/abstractions/FileSystem";
import { Song } from "../../src/logic/Song";

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
            exists: vi.fn()
                .mockResolvedValueOnce(false)  // exact VM path does not exist
                .mockResolvedValueOnce(true),  // resolved Mac path exists
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
});
