/**
 * File system abstraction for reading files.
 * Implementations wrap platform-specific file system APIs (e.g., Tauri, Node.js fs).
 */
export interface FileSystem {
    /**
     * Reads a text file from the file system.
     * @param path Absolute path to the file
     * @returns Promise resolving to the file contents as a string
     * @throws Error if the file cannot be read
     */
    readTextFile(path: string): Promise<string>;
}
