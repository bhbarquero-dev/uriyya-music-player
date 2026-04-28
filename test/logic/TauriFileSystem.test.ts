import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReadFile = vi.fn();
const mockExists = vi.fn();
const mockWriteFile = vi.fn();

vi.mock("@tauri-apps/plugin-fs", () => ({
    readFile: mockReadFile,
    exists: mockExists,
    writeFile: mockWriteFile,
}));

const { TauriFileSystem } = await import("../../src/logic/TauriFileSystem");

function toBytes(values: number[]): Uint8Array {
    return Uint8Array.from(values);
}

describe("TauriFileSystem", () => {
    let fileSystem: InstanceType<typeof TauriFileSystem>;

    beforeEach(() => {
        vi.clearAllMocks();
        fileSystem = new TauriFileSystem();
    });

    it("defaults to UTF-8 write for files that were not read before writing", async () => {
        await fileSystem.writeTextFile("C:/playlist.alb", "cancion.mp3");

        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        const [, payload] = mockWriteFile.mock.calls[0] as [string, Uint8Array];
        expect(payload).toEqual(new TextEncoder().encode("cancion.mp3"));
    });

    it("reads Windows-1252 playlists and rewrites them as UTF-8", async () => {
        // canci\u00f3n.mp3 in Windows-1252 bytes
        mockReadFile.mockResolvedValue(toBytes([0x63, 0x61, 0x6e, 0x63, 0x69, 0xf3, 0x6e, 0x2e, 0x6d, 0x70, 0x33]));

        const content = await fileSystem.readTextFile("C:/playlist.alb");
        expect(content).toBe("canci\u00f3n.mp3");

        await fileSystem.writeTextFile("C:/playlist.alb", "ni\u00f1o.mp3");

        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        const [, payload] = mockWriteFile.mock.calls[0] as [string, Uint8Array];
        expect(payload).toEqual(new TextEncoder().encode("ni\u00f1o.mp3"));
    });

    it("preserves UTF-8 BOM when rewriting UTF-8 files", async () => {
        const utf8WithBom = new Uint8Array([
            0xef, 0xbb, 0xbf,
            ...new TextEncoder().encode("canci\u00f3n.mp3"),
        ]);
        mockReadFile.mockResolvedValue(utf8WithBom);

        const content = await fileSystem.readTextFile("C:/playlist-bom.alb");
        expect(content).toBe("canci\u00f3n.mp3");

        await fileSystem.writeTextFile("C:/playlist-bom.alb", "se\u00f1al.mp3");

        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        const [, payload] = mockWriteFile.mock.calls[0] as [string, Uint8Array];
        const expected = new Uint8Array([
            0xef, 0xbb, 0xbf,
            ...new TextEncoder().encode("se\u00f1al.mp3"),
        ]);

        expect(payload).toEqual(expected);
    });

    it("delegates exists checks to the fs plugin", async () => {
        mockExists.mockResolvedValue(true);

        const result = await fileSystem.exists("C:/file.mp3");

        expect(result).toBe(true);
        expect(mockExists).toHaveBeenCalledWith("C:/file.mp3");
    });
});
