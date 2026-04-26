/**
 * Settings store abstraction for persisting user preferences.
 * Implementations wrap platform-specific storage APIs (e.g., Tauri plugin-store).
 */
export interface SettingsStore {
    /**
     * Returns the stored library path, or null if none has been saved.
     */
    getLibraryPath(): Promise<string | null>;

    /**
     * Persists the given library path.
     */
    saveLibraryPath(path: string): Promise<void>;
}
