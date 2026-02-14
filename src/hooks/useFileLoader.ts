import { useRef, useCallback } from "react";
import { FileService } from "../logic/FileService";
import type { PlaylistData } from "../logic/FileService";

export function useFileLoader(fileService?: FileService) {
    const fileServiceRef = useRef(fileService ?? new FileService());

    const loadPlaylist = useCallback(async (): Promise<PlaylistData | null> => {
        return await fileServiceRef.current.selectAndReadPlaylist();
    }, []);

    return {
        loadPlaylist
    };
}
