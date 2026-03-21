import { FileDialog } from "../abstractions/FileDialog";
import { FileSystem } from "../abstractions/FileSystem";
import { TauriFileDialog } from "./TauriFileDialog";
import { TauriFileSystem } from "./TauriFileSystem";
import { Song } from "./Song";

export interface PlaylistData {
    songs: Song[];
    name: string;
    path: string;
}

export class FileService {
    private fileDialog: FileDialog;
    private fileSystem: FileSystem;

    constructor(fileDialog?: FileDialog, fileSystem?: FileSystem) {
        this.fileDialog = fileDialog ?? new TauriFileDialog();
        this.fileSystem = fileSystem ?? new TauriFileSystem();
    }

    public async selectAndReadPlaylist(): Promise<PlaylistData | null> {
        try {
            const selected = await this.fileDialog.open({
                multiple: false,
                filters: [{ name: "Listas de reproducción", extensions: ["txt", "alb"] }],
            });

            if (!selected) {
                return null;
            }

            const content = await this.fileSystem.readTextFile(selected);
            const fileNameWithExt = selected.split(/[\\/]/).pop() || "";
            const name = fileNameWithExt.replace(/\.[^/.]+$/, "");

            const songPaths = content
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0 && line.toLowerCase().endsWith(".mp3"));

            // Validate each song file exists
            const songs = await Promise.all(
                songPaths.map(async (path) => {
                    const exists = await this.fileSystem.exists(path);
                    return new Song(path, exists);
                })
            );

            return { songs, name, path: selected };
        } catch (err) {
            console.error("FileService Error:", err);
            throw err;
        }
    }

    public async savePlaylist(path: string, songs: Song[]): Promise<void> {
        try {
            const content = songs.map(s => s.getPath()).join('\n');
            await this.fileSystem.writeTextFile(path, content);
        } catch (err) {
            console.error("FileService Error:", err);
            throw err;
        }
    }
}
