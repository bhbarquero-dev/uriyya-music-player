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
    const [currentPlaylistPath, setCurrentPlaylistPath] = useState<string | null>(null);

    // Domain hooks
    const {
        playlist,
        selectedSong,
        hasUnsavedChanges,
        setPlaylist: setPlaylistState,
        setSelectedSong: setSelectedSongState,
        addSong,
        addSongAtStart,
        insertSongAfter,
        moveSong,
        removeSong,
        markAsSaved,
        selectNext,
        selectPrevious,
        peekNextSong
    } = usePlaylistState();

    const { loadPlaylist: loadPlaylistFiles, savePlaylist: savePlaylistFiles } = useFileLoader(fileService);

    const selectNextSongOnEnd = useCallback(() => {
        const nextSong = peekNextSong();
        if (nextSong) {
            setSelectedSongState(nextSong);
        }
    }, [peekNextSong, setSelectedSongState]);

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
        stop: stopAudio,
        getAudioElement
    } = useAudioPlayback(selectNextSongOnEnd);

    // Coordination functions that bridge between different domain hooks

    const loadPlaylist = useCallback(async () => {
        try {
            const result = await loadPlaylistFiles();
            if (result) {
                setPlaylistState(result.songs);
                setCurrentPlaylistName(result.name);
                setCurrentPlaylistPath(result.path);
            }
        } catch (err) {
            throw err;
        }
    }, [loadPlaylistFiles, setPlaylistState]);

    const saveCurrentPlaylist = useCallback(async () => {
        if (!currentPlaylistPath) return;
        await savePlaylistFiles(currentPlaylistPath, playlist);
        markAsSaved();
    }, [currentPlaylistPath, playlist, savePlaylistFiles, markAsSaved]);

    const playSong = useCallback((song: Song) => {
        // Don't play invalid songs
        if (!song.isValid()) {
            return;
        }

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
        currentPlaylistPath,
        selectedSong,
        hasUnsavedChanges,
        playingSong,
        isPlaying,
        isStopping,
        setSelectedSong: setSelectedSongState,
        loadPlaylist,
        saveCurrentPlaylist,
        playSong,
        playCurrentSelected,
        pause: pauseAudio,
        stop: stopAudio,
        addSong,
        addSongAtStart,
        insertSongAfter,
        removeSong,
        moveSong,
        selectNextInList: selectNext,
        selectPreviousInList: selectPrevious,
        getAudioElement,
        // timing info
        currentTime,
        duration,
        remaining,
        playedPercent
    };
}
