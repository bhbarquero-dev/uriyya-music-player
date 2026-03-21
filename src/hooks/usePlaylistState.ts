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

function isPlaylistOrderEqual(a: Song[], b: Song[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((song, i) => song.getPath() === b[i].getPath());
}

export function usePlaylistState() {
    const [playlist, setPlaylistState] = useState<Song[]>([]);
    const [selectedSong, setSelectedSongState] = useState<Song | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const playlistManagerRef = useRef(new PlaylistManager());
    const playlistRef = useRef<Song[]>([]);
    const originalPlaylistRef = useRef<Song[]>([]);
    const selectedSongRef = useRef<Song | null>(null);

    const updateSelectedSong = useCallback((song: Song | null) => {
        selectedSongRef.current = song;
        setSelectedSongState(song);
    }, []);

    const setPlaylist = useCallback((songs: Song[]) => {
        playlistRef.current = songs;
        originalPlaylistRef.current = songs;
        playlistManagerRef.current.setSongs(songs);
        setPlaylistState(songs);
        setHasUnsavedChanges(false);
        updateSelectedSong(null);
    }, [updateSelectedSong]);

    const applyPlaylistUpdate = useCallback((updated: Song[], currentSong: Song | null = selectedSongRef.current) => {
        playlistRef.current = updated;
        playlistManagerRef.current.setSongs(updated);
        if (currentSong) {
            playlistManagerRef.current.setCurrentSong(currentSong);
        }

        setPlaylistState(updated);
        setHasUnsavedChanges(!isPlaylistOrderEqual(updated, originalPlaylistRef.current));
    }, []);

    const moveSong = useCallback((fromIndex: number, toIndex: number) => {
        const currentPlaylist = playlistRef.current;
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || fromIndex >= currentPlaylist.length) return;
        if (toIndex < 0 || toIndex >= currentPlaylist.length) return;

        const reordered = [...currentPlaylist];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);

        applyPlaylistUpdate(reordered);
    }, [applyPlaylistUpdate]);

    const addSong = useCallback((song: Song) => {
        const updated = [...playlistRef.current, song];

        applyPlaylistUpdate(updated);
    }, [applyPlaylistUpdate]);

    const addSongAtStart = useCallback((song: Song) => {
        const updated = [song, ...playlistRef.current];

        applyPlaylistUpdate(updated);
    }, [applyPlaylistUpdate]);

    const insertSongAfter = useCallback((referenceSong: Song, songToInsert: Song) => {
        const currentPlaylist = playlistRef.current;
        const referenceIndex = currentPlaylist.findIndex((song) => song.equals(referenceSong));
        if (referenceIndex === -1) return;

        const updated = [...currentPlaylist];
        updated.splice(referenceIndex + 1, 0, songToInsert);

        applyPlaylistUpdate(updated);
    }, [applyPlaylistUpdate]);

    const removeSong = useCallback((song: Song) => {
        const currentPlaylist = playlistRef.current;
        const songIndex = currentPlaylist.findIndex(s => s.equals(song));
        if (songIndex === -1) return;

        const updated = currentPlaylist.filter(s => !s.equals(song));
        const newSelection = resolveSelectionAfterRemoval(updated, songIndex, selectedSongRef.current, song);

        applyPlaylistUpdate(updated, newSelection);
        updateSelectedSong(newSelection);
    }, [applyPlaylistUpdate, updateSelectedSong]);

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
        originalPlaylistRef.current = playlistRef.current;
        setHasUnsavedChanges(false);
    }, []);

    return {
        playlist,
        selectedSong,
        hasUnsavedChanges,
        setPlaylist,
        setSelectedSong,
        addSong,
        addSongAtStart,
        insertSongAfter,
        moveSong,
        removeSong,
        markAsSaved,
        selectNext,
        selectPrevious,
        peekNextSong
    };
}

