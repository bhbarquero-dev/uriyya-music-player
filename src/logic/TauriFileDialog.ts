import { open } from "@tauri-apps/plugin-dialog";
import { FileDialog, FileDialogOptions } from "../abstractions/FileDialog";

/**
 * Tauri implementation of FileDialog abstraction.
 * Wraps @tauri-apps/plugin-dialog for file selection.
 */
export class TauriFileDialog implements FileDialog {
    public async open(options: FileDialogOptions): Promise<string | null> {
        const selected = await open(options);
        
        // Tauri's open() can return string | string[] | null
        // When multiple is false, it returns string | null
        if (!selected || typeof selected !== "string") {
            return null;
        }
        
        return selected;
    }
}
