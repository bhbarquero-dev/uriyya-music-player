export const SUPPORTED_AUDIO_EXTENSIONS = [".mp3", ".wav"] as const;

export function isSupportedAudioPath(path: string): boolean {
    const normalizedPath = path.trim().toLowerCase();
    return SUPPORTED_AUDIO_EXTENSIONS.some((extension) => normalizedPath.endsWith(extension));
}