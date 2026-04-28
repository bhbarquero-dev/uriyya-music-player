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

describe("TauriFileSystem windows-1252 migration", () => {
    let fileSystem: InstanceType<typeof TauriFileSystem>;

    beforeEach(() => {
        vi.clearAllMocks();
        fileSystem = new TauriFileSystem();
    });

    it("migrates a windows-1252 playlist to UTF-8 so later saves can include emoji", async () => {
        mockReadFile.mockResolvedValue(toBytes([0x53, 0x45, 0xd1, 0x4f, 0x52, 0x2e, 0x6d, 0x70, 0x33]));

        await fileSystem.readTextFile("C:/playlist.alb");

        await fileSystem.writeTextFile("C:/playlist.alb", "SEÑOR 🎄.mp3");

        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        const [, payload] = mockWriteFile.mock.calls[0] as [string, Uint8Array];
        expect(payload).toEqual(new TextEncoder().encode("SEÑOR 🎄.mp3"));
    });
});
