import { useCallback, useState } from "react";
import { FileService } from "../logic/FileService";
import { Song } from "../logic/Song";
import { usePlaylistState } from "./usePlaylistState";
import { useFileLoader } from "./useFileLoader";
import { useAudioPlayback } from "./useAudioPlayback";

/**
 * Coordinator hook that composes domain-specific hooks to provide
 * a unified interface for music player functionality.
 */
export function useMusicPlayer(fileService?: FileService) {
    const [currentPlaylistName, setCurrentPlaylistName] = useState<string | null>(null);

    // Domain hooks
    const {
        playlist,
        selectedSong,
        setPlaylist: setPlaylistState,
        setSelectedSong: setSelectedSongState,
        selectNext,
        selectPrevious
    } = usePlaylistState();

    const { loadPlaylist: loadPlaylistFiles } = useFileLoader(fileService);

    const {
        playingSong,
        isPlaying,
        isStopping,
        currentTime,
        duration,
        remaining,
        playedPercent,
        play: playAudio,
        pause: pauseAudio,
        stop: stopAudio
    } = useAudioPlayback();

    // Coordination functions that bridge between different domain hooks

    const loadPlaylist = useCallback(async () => {
        try {
            const result = await loadPlaylistFiles();
            if (result) {
                setPlaylistState(result.songs);
                setCurrentPlaylistName(result.name);
            }
        } catch (err) {
            console.error("Failed to load playlist:", err);
        }
    }, [loadPlaylistFiles, setPlaylistState]);

    const playSong = useCallback((song: Song) => {
        // Update playlist selection and play audio
        setSelectedSongState(song);
        playAudio(song);
    }, [setSelectedSongState, playAudio]);

    const playCurrentSelected = useCallback(() => {
        if (isPlaying) return;
        if (selectedSong) {
            playSong(selectedSong);
        } else if (playlist.length > 0) {
            playSong(playlist[0]);
        }
    }, [selectedSong, isPlaying, playlist, playSong]);

    return {
        playlist,
        currentPlaylistName,
        selectedSong,
        playingSong,
        isPlaying,
        isStopping,
        setSelectedSong: setSelectedSongState,
        loadPlaylist,
        playSong,
        playCurrentSelected,
        pause: pauseAudio,
        stop: stopAudio,
        selectNextInList: selectNext,
        selectPreviousInList: selectPrevious,
        // timing info
        currentTime,
        duration,
        remaining,
        playedPercent
    };
}
