import { useState, useRef, useCallback } from "react";
import { PlaylistManager } from "../logic/PlaylistManager";
import { Song } from "../logic/Song";

export function usePlaylistState() {
    const [playlist, setPlaylistState] = useState<Song[]>([]);
    const [selectedSong, setSelectedSongState] = useState<Song | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const playlistManagerRef = useRef(new PlaylistManager());
    const playlistRef = useRef<Song[]>([]);

    const setPlaylist = useCallback((songs: Song[]) => {
        playlistRef.current = songs;
        playlistManagerRef.current.setSongs(songs);
        setPlaylistState(songs);
        setHasUnsavedChanges(false);

        // Auto-select first song if no song is selected and playlist is not empty
        // Use functional update to avoid stale closure
        setSelectedSongState(prev => {
            if (songs.length > 0 && !prev) {
                return songs[0];
            } else if (songs.length === 0) {
                return null;
            }
            return prev;
        });
    }, []);

    const removeSong = useCallback((song: Song) => {
        const currentPlaylist = playlistRef.current;
        const songIndex = currentPlaylist.findIndex(s => s.equals(song));
        if (songIndex === -1) return;

        const updated = currentPlaylist.filter(s => !s.equals(song));
        playlistRef.current = updated;
        setPlaylistState(updated);

        const currentSelected = selectedSong;
        let newSelected: Song | null = currentSelected;

        if (currentSelected?.equals(song)) {
            // Removing the selected song; pick the song at the same index (or last)
            if (updated.length === 0) {
                newSelected = null;
            } else {
                newSelected = updated[Math.min(songIndex, updated.length - 1)];
            }
        }

        // Keep PlaylistManager in sync with the updated playlist and selection
        playlistManagerRef.current.setSongs(updated);
        if (newSelected) {
            playlistManagerRef.current.setCurrentSong(newSelected);
        }

        setSelectedSongState(newSelected);
        setHasUnsavedChanges(true);
    }, [selectedSong]);

    const setSelectedSong = useCallback((song: Song | null) => {
        setSelectedSongState(song);
        if (song) {
            playlistManagerRef.current.setCurrentSong(song);
        }
    }, []);

    const selectNext = useCallback(() => {
        const next = playlistManagerRef.current.getNext();
        if (next) {
            setSelectedSongState(next);
        }
    }, []);

    const selectPrevious = useCallback(() => {
        const prev = playlistManagerRef.current.getPrevious();
        if (prev) {
            setSelectedSongState(prev);
        }
    }, []);

    const peekNextSong = useCallback((): Song | null => {
        return playlistManagerRef.current.peekNext();
    }, []);

    return {
        playlist,
        selectedSong,
        hasUnsavedChanges,
        setPlaylist,
        setSelectedSong,
        removeSong,
        selectNext,
        selectPrevious,
        peekNextSong
    };
}
