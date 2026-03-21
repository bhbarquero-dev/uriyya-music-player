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

    /**
     * Checks if a file exists in the file system.
     * @param path Absolute path to the file
     * @returns Promise resolving to true if the file exists, false otherwise
     */
    exists(path: string): Promise<boolean>;

    /**
     * Writes text content to a file, overwriting if it exists.
     * @param path Absolute path to the file
     * @param content Text content to write
     */
    writeTextFile(path: string, content: string): Promise<void>;
}
