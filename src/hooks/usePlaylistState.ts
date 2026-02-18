import { useState, useRef, useCallback } from "react";
import { PlaylistManager } from "../logic/PlaylistManager";
import { Song } from "../logic/Song";

export function usePlaylistState() {
    const [playlist, setPlaylistState] = useState<Song[]>([]);
    const [selectedSong, setSelectedSongState] = useState<Song | null>(null);
    const playlistManagerRef = useRef(new PlaylistManager());

    const setPlaylist = useCallback((songs: Song[]) => {
        playlistManagerRef.current.setSongs(songs);
        setPlaylistState(songs);

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

    return {
        playlist,
        selectedSong,
        setPlaylist,
        setSelectedSong,
        selectNext,
        selectPrevious
    };
}
