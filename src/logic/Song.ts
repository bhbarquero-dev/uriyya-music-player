import { convertFileSrc } from "@tauri-apps/api/core";

export class Song {
    constructor(private readonly path: string) {
        if (!path || path.trim().length === 0) {
            throw new Error("Song path cannot be empty");
        }

        const lowerPath = path.toLowerCase();
        if (!lowerPath.endsWith(".mp3")) {
            throw new Error(`Invalid song format: ${path}. Only .mp3 files are supported.`);
        }
    }

    public toMediaUrl(): string {
        return convertFileSrc(this.path);
    }

    public getDisplayName(): string {
        return this.path.split(/[\\\/]/).pop() || this.path;
    }
}
