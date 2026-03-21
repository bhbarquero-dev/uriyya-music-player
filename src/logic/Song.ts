import { convertFileSrc } from "@tauri-apps/api/core";
import { isSupportedAudioPath, SUPPORTED_AUDIO_EXTENSIONS } from "./audioFormats";

export class Song {
    private readonly id: string;

    constructor(
        private readonly path: string,
        private readonly valid: boolean = true
    ) {
        if (!path || path.trim().length === 0) {
            throw new Error("Song path cannot be empty");
        }

        if (!isSupportedAudioPath(path)) {
            throw new Error(
                `Invalid song format: ${path}. Supported formats: ${SUPPORTED_AUDIO_EXTENSIONS.join(", ")}.`
            );
        }

        this.id = crypto.randomUUID();
    }

    public getId(): string {
        return this.id;
    }

    public getPath(): string {
        return this.path;
    }

    public isValid(): boolean {
        return this.valid;
    }

    public toMediaUrl(): string {
        return convertFileSrc(this.path);
    }

    public getDisplayName(): string {
        return this.path.split(/[\\\/]/).pop() || this.path;
    }

    public equals(other: Song | null | undefined): boolean {
        if (!other) return false;
        return this.id === other.id;
    }
}
