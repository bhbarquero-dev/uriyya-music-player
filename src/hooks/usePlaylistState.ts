import { useState, useRef, useCallback } from "react";
import { PlaylistManager } from "../logic/PlaylistManager";
import { Song } from "../logic/Song";

function resolveSelectionAfterRemoval(
    updated: Song[],
    removedIndex: number,
    currentSelected: Song | null,
    removedSong: Song
): Song | null {
    if (!currentSelected?.equals(removedSong)) return currentSelected;
    if (updated.length === 0) return null;
    return updated[Math.min(removedIndex, updated.length - 1)];
}

export function usePlaylistState() {
    const [playlist, setPlaylistState] = useState<Song[]>([]);
    const [selectedSong, setSelectedSongState] = useState<Song | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const playlistManagerRef = useRef(new PlaylistManager());
    const playlistRef = useRef<Song[]>([]);
    // Ref mirrors selectedSong state to allow synchronous reads inside callbacks (avoids stale closures)
    const selectedSongRef = useRef<Song | null>(null);

    const updateSelectedSong = useCallback((song: Song | null) => {
        selectedSongRef.current = song;
        setSelectedSongState(song);
    }, []);

    const setPlaylist = useCallback((songs: Song[]) => {
        playlistRef.current = songs;
        playlistManagerRef.current.setSongs(songs);
        setPlaylistState(songs);
        setHasUnsavedChanges(false);

        const prev = selectedSongRef.current;
        if (songs.length > 0 && !prev) {
            updateSelectedSong(songs[0]);
        } else if (songs.length === 0) {
            updateSelectedSong(null);
        }
    }, [updateSelectedSong]);

    const removeSong = useCallback((song: Song) => {
        const currentPlaylist = playlistRef.current;
        const songIndex = currentPlaylist.findIndex(s => s.equals(song));
        if (songIndex === -1) return;

        const updated = currentPlaylist.filter(s => !s.equals(song));
        const newSelection = resolveSelectionAfterRemoval(updated, songIndex, selectedSongRef.current, song);

        playlistRef.current = updated;
        playlistManagerRef.current.setSongs(updated);
        if (newSelection) playlistManagerRef.current.setCurrentSong(newSelection);

        setPlaylistState(updated);
        updateSelectedSong(newSelection);
        setHasUnsavedChanges(true);
    }, [updateSelectedSong]);

    const setSelectedSong = useCallback((song: Song | null) => {
        updateSelectedSong(song);
        if (song) {
            playlistManagerRef.current.setCurrentSong(song);
        }
    }, [updateSelectedSong]);

    const selectNext = useCallback(() => {
        const next = playlistManagerRef.current.getNext();
        if (next) {
            updateSelectedSong(next);
        }
    }, [updateSelectedSong]);

    const selectPrevious = useCallback(() => {
        const prev = playlistManagerRef.current.getPrevious();
        if (prev) {
            updateSelectedSong(prev);
        }
    }, [updateSelectedSong]);

    const peekNextSong = useCallback((): Song | null => {
        return playlistManagerRef.current.peekNext();
    }, []);

    const markAsSaved = useCallback(() => {
        setHasUnsavedChanges(false);
    }, []);

    return {
        playlist,
        selectedSong,
        hasUnsavedChanges,
        setPlaylist,
        setSelectedSong,
        removeSong,
        markAsSaved,
        selectNext,
        selectPrevious,
        peekNextSong
    };
}

