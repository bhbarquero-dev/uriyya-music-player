import { readFile, exists, writeFile } from "@tauri-apps/plugin-fs";
import { FileSystem } from "../abstractions/FileSystem";

type FileTextEncoding = "utf-8" | "windows-1252";

type FileEncodingState = {
    encoding: FileTextEncoding;
    hasUtf8Bom: boolean;
};

const UTF8_BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

function hasUtf8Bom(bytes: Uint8Array): boolean {
    return bytes.length >= 3 && bytes[0] === UTF8_BOM[0] && bytes[1] === UTF8_BOM[1] && bytes[2] === UTF8_BOM[2];
}

function decodeWindows1252(bytes: Uint8Array): string {
    try {
        return new TextDecoder("windows-1252").decode(bytes);
    } catch {
        return new TextDecoder("latin1").decode(bytes);
    }
}

function decodeText(bytes: Uint8Array): { text: string; state: FileEncodingState } {
    const withBom = hasUtf8Bom(bytes);
    const payload = withBom ? bytes.slice(3) : bytes;

    try {
        const text = new TextDecoder("utf-8", { fatal: true }).decode(payload);
        return {
            text,
            state: { encoding: "utf-8", hasUtf8Bom: withBom },
        };
    } catch {
        const text = decodeWindows1252(bytes);
        return {
            text,
            state: { encoding: "windows-1252", hasUtf8Bom: false },
        };
    }
}

/**
 * Tauri implementation of FileSystem abstraction.
 * Wraps @tauri-apps/plugin-fs for file system operations.
 */
export class TauriFileSystem implements FileSystem {
    private readonly encodingByPath = new Map<string, FileEncodingState>();

    public async readTextFile(path: string): Promise<string> {
        const bytes = await readFile(path);
        const decoded = decodeText(bytes);
        this.encodingByPath.set(path, decoded.state);
        return decoded.text;
    }

    public async exists(path: string): Promise<boolean> {
        return await exists(path);
    }

    public async writeTextFile(path: string, content: string): Promise<void> {
        const state = this.encodingByPath.get(path);
        const payload = new TextEncoder().encode(content);

        if (state?.encoding === "utf-8" && state.hasUtf8Bom) {
            const withBom = new Uint8Array(UTF8_BOM.length + payload.length);
            withBom.set(UTF8_BOM, 0);
            withBom.set(payload, UTF8_BOM.length);
            await writeFile(path, withBom);
            return;
        }

        await writeFile(path, payload);
    }
}
