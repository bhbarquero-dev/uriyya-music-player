import { getLibraryPathFromSettings, saveLibraryPathToSettings } from "./UserSettingsStore";
import { scanLibraryAudioFiles } from "./LibraryScanner";
import type { FileDialog } from "@abstractions/FileDialog";

export class Library {
    private path: string | null = null;

    constructor(private readonly fileDialog: FileDialog) {}

    async getPath(): Promise<string | null> {
        const storePath = await getLibraryPathFromSettings();
        this.path = storePath;
        return storePath;
    }

    async setPath(path: string): Promise<void> {
        this.path = path;
        return saveLibraryPathToSettings(path);
    }

    async add(): Promise<string | null> {
        const selectedPath = await this.fileDialog.openDirectory();
        if (selectedPath) {
            await this.setPath(selectedPath);
        }
        return selectedPath;
    }

    async getSongs(): Promise<string[]> {
        if (!this.path) {
            return [];
        }
        return scanLibraryAudioFiles(this.path);
    }

    getName(): string | null {
        if (!this.path) return null;
        return this.path.split(/[\/\\]/).pop() ?? null;
    }

    hasLibrary(): boolean {
        return this.path !== null;
    }
}

export function filterSongs(songs: string[], query: string): string[] {
    if (!query.trim()) {
        return songs;
    }
    const normalizedQuery = query.normalize('NFC').toLowerCase();
    return songs.filter((songPath) => {
        const fileName = songPath.split(/[\/\\]/).pop() ?? songPath;
        return fileName.normalize('NFC').toLowerCase().includes(normalizedQuery);
    });
}
