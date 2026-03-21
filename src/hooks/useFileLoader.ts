import { useRef, useCallback } from "react";
import { FileService } from "../logic/FileService";
import type { PlaylistData } from "../logic/FileService";
import { Song } from "../logic/Song";

export function useFileLoader(fileService?: FileService) {
    const fileServiceRef = useRef(fileService ?? new FileService());

    const loadPlaylist = useCallback(async (): Promise<PlaylistData | null> => {
        return await fileServiceRef.current.selectAndReadPlaylist();
    }, []);

    const savePlaylist = useCallback(async (path: string, songs: Song[]): Promise<void> => {
        await fileServiceRef.current.savePlaylist(path, songs);
    }, []);

    return {
        loadPlaylist,
        savePlaylist,
    };
}
