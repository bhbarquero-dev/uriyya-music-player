import { readFile, exists, writeFile } from "@tauri-apps/plugin-fs";
import { FileSystem } from "../abstractions/FileSystem";

type FileTextEncoding = "utf-8" | "windows-1252";

type FileEncodingState = {
    encoding: FileTextEncoding;
    hasUtf8Bom: boolean;
};

const UTF8_BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

const WINDOWS_1252_EXTRA_ENCODE_MAP = new Map<number, number>([
    [0x20AC, 0x80],
    [0x201A, 0x82],
    [0x0192, 0x83],
    [0x201E, 0x84],
    [0x2026, 0x85],
    [0x2020, 0x86],
    [0x2021, 0x87],
    [0x02C6, 0x88],
    [0x2030, 0x89],
    [0x0160, 0x8A],
    [0x2039, 0x8B],
    [0x0152, 0x8C],
    [0x017D, 0x8E],
    [0x2018, 0x91],
    [0x2019, 0x92],
    [0x201C, 0x93],
    [0x201D, 0x94],
    [0x2022, 0x95],
    [0x2013, 0x96],
    [0x2014, 0x97],
    [0x02DC, 0x98],
    [0x2122, 0x99],
    [0x0161, 0x9A],
    [0x203A, 0x9B],
    [0x0153, 0x9C],
    [0x017E, 0x9E],
    [0x0178, 0x9F],
]);

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

function encodeWindows1252(text: string): Uint8Array {
    const bytes: number[] = [];

    for (const char of text) {
        const codePoint = char.codePointAt(0);
        if (codePoint === undefined) {
            continue;
        }

        if (codePoint <= 0x7f || (codePoint >= 0xa0 && codePoint <= 0xff)) {
            bytes.push(codePoint);
            continue;
        }

        const mapped = WINDOWS_1252_EXTRA_ENCODE_MAP.get(codePoint);
        bytes.push(mapped ?? 0x3f);
    }

    return Uint8Array.from(bytes);
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

        if (!state || state.encoding === "utf-8") {
            const payload = new TextEncoder().encode(content);
            if (state?.hasUtf8Bom) {
                const withBom = new Uint8Array(UTF8_BOM.length + payload.length);
                withBom.set(UTF8_BOM, 0);
                withBom.set(payload, UTF8_BOM.length);
                await writeFile(path, withBom);
                return;
            }

            await writeFile(path, payload);
            return;
        }

        await writeFile(path, encodeWindows1252(content));
    }
}
