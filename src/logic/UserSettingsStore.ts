const SETTINGS_FILE_NAME = "settings.json";
const LIBRARY_PATH_KEY = "library.path";

async function createStore() {
    const { load } = await import("@tauri-apps/plugin-store");
    return load(SETTINGS_FILE_NAME);
}

export async function getLibraryPathFromSettings(): Promise<string | null> {
    try {
        const store = await createStore();
        const value = await store.get<string>(LIBRARY_PATH_KEY);

        return typeof value === "string" ? value : null;
    } catch {
        return null;
    }
}

export async function saveLibraryPathToSettings(path: string): Promise<void> {
    try {
        const store = await createStore();
        await store.set(LIBRARY_PATH_KEY, path);
        await store.save();
    } catch {
        // Ignore persistence errors to avoid blocking the UI flow.
    }
}
