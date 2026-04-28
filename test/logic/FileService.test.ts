import { describe, it, expect, vi } from "vitest";
import { FileService } from "@logic/FileService";
import { FileDialog } from "../../src/abstractions/FileDialog";
import { FileSystem } from "../../src/abstractions/FileSystem";
import { Song } from "@logic/Song";

const HOME_DIR = "/Users/uriyya";
const VM_PATH = "\\\\Mac\\Home\\Music\\file.mp3";
const RESOLVED_PATH = "/Users/uriyya/Music/file.mp3";

describe("FileService", () => {
    it("should return null if no file is selected", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue(null),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn(),
            exists: vi.fn().mockResolvedValue(true),
            writeTextFile: vi.fn(),
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
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue("song1.mp3\n  \n  song2.MP3\nnot-a-song.txt\n"),
            exists: vi.fn().mockResolvedValue(true),
            writeTextFile: vi.fn(),
        };

        const service = new FileService(mockDialog, mockFileSystem);
        const result = await service.selectAndReadPlaylist();

        expect(result).not.toBeNull();
        if (result) {
            expect(result.name).toBe("my-playlist");
            expect(result.path).toBe("C:\\Music\\my-playlist.txt");
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
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue("s1.mp3"),
            exists: vi.fn().mockResolvedValue(true),
            writeTextFile: vi.fn(),
        };

        const service = new FileService(mockDialog, mockFileSystem);
        const result = await service.selectAndReadPlaylist();

        expect(result?.name).toBe("linux-playlist");
        expect(result?.path).toBe("/home/user/music/linux-playlist.alb");
        expect(result?.songs).toHaveLength(1);
        expect(result?.songs[0]).toBeInstanceOf(Song);
    });

    it("should throw error if readTextFile fails", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("path.txt"),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockRejectedValue(new Error("Read error")),
            exists: vi.fn().mockResolvedValue(true),
            writeTextFile: vi.fn(),
        };

        const service = new FileService(mockDialog, mockFileSystem);

        await expect(service.selectAndReadPlaylist()).rejects.toThrow("Read error");
    });

    it("should mark songs as invalid when they don't exist on disk", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\Music\\playlist.txt"),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue("existing.mp3\nmissing.mp3\n"),
            exists: vi.fn()
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false),
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
            exists: vi.fn().mockResolvedValue(true),
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
            exists: vi.fn().mockResolvedValue(false),
            writeTextFile: vi.fn(),
        };

        const service = new FileService(mockDialog, mockFileSystem);
        const result = await service.selectAndReadPlaylist();

        expect(result?.songs).toHaveLength(2);
        result?.songs.forEach(song => {
            expect(song.isValid()).toBe(false);
        });
    });

    it("resolves a Parallels path when homeDir is available and resolved file exists", async () => {
        const mockDialog: FileDialog = {
            open: vi.fn().mockResolvedValue("C:\\playlist.alb"),
            openDirectory: vi.fn().mockResolvedValue(null),
        };
        const mockFileSystem: FileSystem = {
            readTextFile: vi.fn().mockResolvedValue(`${VM_PATH}\n`),
            exists: vi.fn().mockResolvedValue(true),
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
        expect(mockFileSystem.exists).toHaveBeenCalledTimes(1);
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

    describe("savePlaylist", () => {
        it("should write songs as one path per line to the given file", async () => {
            const mockDialog: FileDialog = {
                open: vi.fn(),
                openDirectory: vi.fn(),
            };
            const mockFileSystem: FileSystem = {
                readTextFile: vi.fn(),
                exists: vi.fn(),
                writeTextFile: vi.fn().mockResolvedValue(undefined),
            };
            const songs = [new Song("C:\\Music\\song1.mp3"), new Song("C:\\Music\\song2.mp3")];
            const service = new FileService(mockDialog, mockFileSystem);

            await service.savePlaylist("C:\\Music\\playlist.alb", songs);

            expect(mockFileSystem.writeTextFile).toHaveBeenCalledWith(
                "C:\\Music\\playlist.alb",
                "C:\\Music\\song1.mp3\nC:\\Music\\song2.mp3"
            );
        });

        it("should throw if writeTextFile fails", async () => {
            const mockDialog: FileDialog = {
                open: vi.fn(),
                openDirectory: vi.fn(),
            };
            const mockFileSystem: FileSystem = {
                readTextFile: vi.fn(),
                exists: vi.fn(),
                writeTextFile: vi.fn().mockRejectedValue(new Error("Write error")),
            };
            const service = new FileService(mockDialog, mockFileSystem);

            await expect(service.savePlaylist("C:\\path\\playlist.alb", [])).rejects.toThrow("Write error");
        });

        it("writes original VM paths, not the resolved Mac paths", async () => {
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

        it("converts macOS paths to VM paths when parallelsHomeDir is provided", async () => {
            const mockDialog: FileDialog = {
                open: vi.fn(),
                openDirectory: vi.fn(),
            };
            const mockFileSystem: FileSystem = {
                readTextFile: vi.fn(),
                exists: vi.fn(),
                writeTextFile: vi.fn().mockResolvedValue(undefined),
            };
            const newSong = new Song(RESOLVED_PATH, true);
            const service = new FileService(mockDialog, mockFileSystem);

            await service.savePlaylist("C:\\playlist.alb", [newSong], HOME_DIR);

            expect(mockFileSystem.writeTextFile).toHaveBeenCalledWith(
                "C:\\playlist.alb",
                VM_PATH
            );
        });

        it("saves a mix of original and new songs as VM paths when parallelsHomeDir is provided", async () => {
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
});
