import { convertFileSrc } from "@tauri-apps/api/core";
import { isSupportedAudioPath, SUPPORTED_AUDIO_EXTENSIONS } from "./audioFormats";

function generateUUID(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export class Song {
    private readonly id: string;
    private readonly path: string;

    private readonly originalPath?: string;

    constructor(
        path: string,
        private readonly valid: boolean = true,
        originalPath?: string
    ) {
        const normalizedOriginalPath = originalPath?.trim();
        this.originalPath = normalizedOriginalPath || undefined;
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
        this.id = generateUUID();
    }

    public getId(): string {
        return this.id;
    }

    public getPath(): string {
        return this.path;
    }

    public getOriginalPath(): string {
        return this.originalPath ?? this.path;
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
