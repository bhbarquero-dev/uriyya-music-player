import { describe, it, expect, vi } from "vitest";
import { TauriFileSystem } from "../../src/logic/TauriFileSystem";

describe("TauriFileSystem", () => {
    it("should read text file contents", async () => {
        const { readTextFile } = await import("@tauri-apps/plugin-fs");
        vi.mocked(readTextFile).mockResolvedValue("song1.mp3\nsong2.mp3\n");

        const fileSystem = new TauriFileSystem();
        const content = await fileSystem.readTextFile("C:\\Music\\playlist.txt");

        expect(content).toBe("song1.mp3\nsong2.mp3\n");
        expect(readTextFile).toHaveBeenCalledWith("C:\\Music\\playlist.txt");
    });

    it("should throw error when file cannot be read", async () => {
        const { readTextFile } = await import("@tauri-apps/plugin-fs");
        const error = new Error("File not found");
        vi.mocked(readTextFile).mockRejectedValue(error);

        const fileSystem = new TauriFileSystem();

        await expect(fileSystem.readTextFile("invalid.txt")).rejects.toThrow("File not found");
    });
});
