import { join } from "@tauri-apps/api/path";
import { readDir } from "@tauri-apps/plugin-fs";
import { isSupportedAudioPath } from "./audioFormats";

function isSupportedAudioFile(fileName: string): boolean {
    return isSupportedAudioPath(fileName);
}

export async function scanLibraryAudioFiles(libraryRootPath: string): Promise<string[]> {
    const files: string[] = [];
    const pendingDirectories: string[] = [libraryRootPath];

    while (pendingDirectories.length > 0) {
        const currentDirectory = pendingDirectories.pop();
        if (!currentDirectory) {
            continue;
        }

        let entries;
        try {
            entries = await readDir(currentDirectory);
        } catch {
            // Skip unreadable directories instead of failing the full scan.
            continue;
        }

        for (const entry of entries) {
            if (entry.isDirectory || (!entry.isFile && !isSupportedAudioFile(entry.name))) {
                const entryPath = await join(currentDirectory, entry.name);
                pendingDirectories.push(entryPath);
                continue;
            }

            if (isSupportedAudioFile(entry.name)) {
                const entryPath = await join(currentDirectory, entry.name);
                files.push(entryPath);
            }
        }
    }

    return files.sort((a, b) => {
        const nameA = a.split(/[\\/]/).pop() ?? a;
        const nameB = b.split(/[\\/]/).pop() ?? b;
        return nameA.localeCompare(nameB);
    });
}
