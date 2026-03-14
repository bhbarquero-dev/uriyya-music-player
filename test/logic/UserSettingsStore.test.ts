import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockSet = vi.fn();
const mockSave = vi.fn();
const mockLoad = vi.fn().mockResolvedValue({
    get: mockGet,
    set: mockSet,
    save: mockSave,
});

vi.mock("@tauri-apps/plugin-store", () => ({
    load: mockLoad,
}));

const { getLibraryPathFromSettings, saveLibraryPathToSettings } = await import(
    "../../src/logic/UserSettingsStore"
);

describe("UserSettingsStore", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLoad.mockResolvedValue({ get: mockGet, set: mockSet, save: mockSave });
    });

    describe("getLibraryPathFromSettings", () => {
        it("returns the stored string when the key exists", async () => {
            mockGet.mockResolvedValue("/home/music");

            const result = await getLibraryPathFromSettings();

            expect(result).toBe("/home/music");
        });

        it("returns null when the key is missing (undefined)", async () => {
            mockGet.mockResolvedValue(undefined);

            const result = await getLibraryPathFromSettings();

            expect(result).toBeNull();
        });

        it("returns null when the stored value is not a string", async () => {
            mockGet.mockResolvedValue(42);

            const result = await getLibraryPathFromSettings();

            expect(result).toBeNull();
        });

        it("returns null when the plugin throws", async () => {
            mockLoad.mockRejectedValue(new Error("plugin error"));

            const result = await getLibraryPathFromSettings();

            expect(result).toBeNull();
        });
    });

    describe("saveLibraryPathToSettings", () => {
        it("saves the path using set and save", async () => {
            mockSet.mockResolvedValue(undefined);
            mockSave.mockResolvedValue(undefined);

            await saveLibraryPathToSettings("/home/music");

            expect(mockSet).toHaveBeenCalledWith("library.path", "/home/music");
            expect(mockSave).toHaveBeenCalledOnce();
        });

        it("does not throw when the plugin throws", async () => {
            mockLoad.mockRejectedValue(new Error("plugin error"));

            await expect(saveLibraryPathToSettings("/home/music")).resolves.toBeUndefined();
        });
    });
});
