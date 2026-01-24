import { describe, it, expect, vi } from "vitest";
import { TauriFileDialog } from "../../src/logic/TauriFileDialog";

describe("TauriFileDialog", () => {
    it("should return file path when user selects a file", async () => {
        const { open } = await import("@tauri-apps/plugin-dialog");
        vi.mocked(open).mockResolvedValue("C:\\Music\\playlist.txt");

        const dialog = new TauriFileDialog();
        const result = await dialog.open({
            multiple: false,
            filters: [{ name: "Text files", extensions: ["txt"] }],
        });

        expect(result).toBe("C:\\Music\\playlist.txt");
        expect(open).toHaveBeenCalledWith({
            multiple: false,
            filters: [{ name: "Text files", extensions: ["txt"] }],
        });
    });

    it("should return null when user cancels the dialog", async () => {
        const { open } = await import("@tauri-apps/plugin-dialog");
        vi.mocked(open).mockResolvedValue(null);

        const dialog = new TauriFileDialog();
        const result = await dialog.open({ multiple: false });

        expect(result).toBeNull();
    });

    it("should return null when open returns an array (multiple selection)", async () => {
        const { open } = await import("@tauri-apps/plugin-dialog");
        vi.mocked(open).mockResolvedValue(["file1.txt", "file2.txt"] as any);

        const dialog = new TauriFileDialog();
        const result = await dialog.open({ multiple: false });

        expect(result).toBeNull();
    });
});
