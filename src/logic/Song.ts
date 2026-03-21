import { convertFileSrc } from "@tauri-apps/api/core";
import { isSupportedAudioPath, SUPPORTED_AUDIO_EXTENSIONS } from "./audioFormats";

export class Song {
    private readonly id: string;
    private readonly path: string;

    constructor(
        path: string,
        private readonly valid: boolean = true
    ) {
        const normalizedPath = path.trim();

        if (!normalizedPath) {
            throw new Error("Song path cannot be empty");
        }

        if (!isSupportedAudioPath(normalizedPath)) {
            throw new Error(
                `Invalid song format: ${normalizedPath}. Supported formats: ${SUPPORTED_AUDIO_EXTENSIONS.join(", ")}.`
            );
        }

        this.path = normalizedPath;
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
