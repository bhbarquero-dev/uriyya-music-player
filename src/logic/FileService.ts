import { FileDialog } from "../abstractions/FileDialog";
import { FileSystem } from "../abstractions/FileSystem";
import { TauriFileDialog } from "./TauriFileDialog";
import { TauriFileSystem } from "./TauriFileSystem";
import { Song } from "./Song";
import { isSupportedAudioPath } from "./audioFormats";
import { isParallelsPath, resolveParallelsPath } from "./ParallelsPathResolver";

export interface PlaylistData {
    songs: Song[];
    name: string;
    path: string;
}

export class FileService {
    private fileDialog: FileDialog;
    private fileSystem: FileSystem;
    private homeDirFn: () => Promise<string | null>;

    constructor(
        fileDialog?: FileDialog,
        fileSystem?: FileSystem,
        homeDirFn?: () => Promise<string | null>
    ) {
        this.fileDialog = fileDialog ?? new TauriFileDialog();
        this.fileSystem = fileSystem ?? new TauriFileSystem();
        this.homeDirFn = homeDirFn ?? (async () => {
            try {
                const { homeDir } = await import("@tauri-apps/api/path");
                return await homeDir();
            } catch {
                return null;
            }
        });
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
                .filter((line) => line.length > 0 && isSupportedAudioPath(line));

            const homeDir = await this.homeDirFn();

            const songs = await Promise.all(
                songPaths.map(async (originalPath) => {
                    const isParallels = isParallelsPath(originalPath);

                    if (!isParallels && await this.fileSystem.exists(originalPath)) {
                        return new Song(originalPath, true);
                    }

                    if (isParallels && homeDir) {
                        const resolvedPath = resolveParallelsPath(originalPath, homeDir);
                        if (await this.fileSystem.exists(resolvedPath)) {
                            return new Song(resolvedPath, true, originalPath);
                        }
                    }

                    return new Song(originalPath, false);
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
            const content = songs.map(s => s.getOriginalPath()).join('\n');
            await this.fileSystem.writeTextFile(path, content);
        } catch (err) {
            console.error("FileService Error:", err);
            throw err;
        }
    }
}
