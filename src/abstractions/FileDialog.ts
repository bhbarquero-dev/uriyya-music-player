/**
 * File dialog abstraction for selecting files from the file system.
 * Implementations wrap platform-specific file dialog APIs (e.g., Tauri, Electron).
 */
export interface FileDialogFilter {
    name: string;
    extensions: string[];
}

export interface FileDialogOptions {
    multiple: boolean;
    filters?: FileDialogFilter[];
}

export interface FileDialog {
    /**
     * Opens a file dialog for the user to select a file.
     * @param options Configuration for the file dialog
     * @returns Promise resolving to the selected file path, or null if cancelled
     */
    open(options: FileDialogOptions): Promise<string | null>;
}
