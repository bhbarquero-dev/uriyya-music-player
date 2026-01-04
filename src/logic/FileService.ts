import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";

export interface PlaylistData {
    songs: string[];
    name: string;
}

export class FileService {
    public async selectAndReadPlaylist(): Promise<PlaylistData | null> {
        try {
            const selected = await open({
                multiple: false,
                filters: [{ name: "Listas de reproducción", extensions: ["txt", "alb"] }],
            });

            if (!selected || typeof selected !== "string") {
                return null;
            }

            const content = await readTextFile(selected);
            const fileNameWithExt = selected.split(/[\\/]/).pop() || "";
            const name = fileNameWithExt.replace(/\.[^/.]+$/, "");

            const songs = content
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0 && line.toLowerCase().endsWith(".mp3"));

            return { songs, name };
        } catch (err) {
            console.error("FileService Error:", err);
            throw err;
        }
    }
}
