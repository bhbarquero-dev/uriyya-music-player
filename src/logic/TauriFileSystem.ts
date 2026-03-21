import { readTextFile, exists, writeTextFile } from "@tauri-apps/plugin-fs";
import { FileSystem } from "../abstractions/FileSystem";

/**
 * Tauri implementation of FileSystem abstraction.
 * Wraps @tauri-apps/plugin-fs for file system operations.
 */
export class TauriFileSystem implements FileSystem {
    public async readTextFile(path: string): Promise<string> {
        return await readTextFile(path);
    }

    public async exists(path: string): Promise<boolean> {
        return await exists(path);
    }

    public async writeTextFile(path: string, content: string): Promise<void> {
        await writeTextFile(path, content);
    }
}
