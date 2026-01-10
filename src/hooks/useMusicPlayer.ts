import { useState, useRef, useEffect, useCallback } from "react";
import { AudioManager } from "../logic/AudioManager";
import { PlaylistManager } from "../logic/PlaylistManager";
import { FileService } from "../logic/FileService";
import { convertFileSrc } from "@tauri-apps/api/core";

export function useMusicPlayer() {
    // UI-facing state
    const [playlist, setPlaylist] = useState<string[]>([]);
    const [currentPlaylistName, setCurrentPlaylistName] = useState<string | null>(null);
    const [selectedSong, setSelectedSong] = useState<string | null>(null);
    const [playingSong, setPlayingSong] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [activeSidebarItem, setActiveSidebarItem] = useState<string>("");
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number | null>(null);

    // Services (persisted across renders)
    const audioManagerRef = useRef<AudioManager | null>(null);
    const playlistManagerRef = useRef(new PlaylistManager());
    const fileServiceRef = useRef(new FileService());

    // Initialize AudioManager
    if (!audioManagerRef.current) {
        audioManagerRef.current = new AudioManager({
            onEnded: (id) => {
                // Always reset timing info when any audio element fires 'ended'
                setCurrentTime(0);
                setDuration(null);

                // Only clear playing state if the ended channel is the active one
                if (id === audioManagerRef.current?.getActiveChannelId()) {
                    setIsPlaying(false);
                    setPlayingSong(null);
                    setIsStopping(false);
                }
            },
            onError: (id, err) => {
                console.error(`Audio Error on channel ${id}:`, err);
                if (id === audioManagerRef.current?.getActiveChannelId()) {
                    setIsPlaying(false);
                    setPlayingSong(null);
                    setIsStopping(false);
                }
            },
            onFadeFinished: (id) => {
                if (id === audioManagerRef.current?.getActiveChannelId()) {
                    setIsPlaying(false);
                    setPlayingSong(null);
                    setIsStopping(false);
                    setCurrentTime(0);
                    setDuration(null);
                }
            }
        });
    }

    // Poll active audio for time/duration updates. Avoid overwriting reset state when playback is stopped.
    useEffect(() => {
        let mounted = true;
        const tick = () => {
            const audio = audioManagerRef.current?.getActiveAudio();
            if (!audio) return;

            // If audio is paused and we are not in playing state, keep times reset
            if (audio.paused && !isPlaying) {
                if (!mounted) return;
                setCurrentTime(0);
                setDuration(null);
                return;
            }

            const ct = audio.currentTime || 0;
            const d = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
            if (!mounted) return;
            setCurrentTime(ct);
            setDuration(d);
        };

        const interval = window.setInterval(() => {
            try {
                tick();
            } catch (e) {
                // ignore
            }
        }, 250);

        // initial tick
        tick();

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [isPlaying]);

    const loadPlaylist = async () => {
        try {
            const result = await fileServiceRef.current.selectAndReadPlaylist();
            if (result) {
                playlistManagerRef.current.setSongs(result.songs);
                setPlaylist(result.songs);
                setCurrentPlaylistName(result.name);
                setActiveSidebarItem("playlist");

                const first = playlistManagerRef.current.getCurrentSong();
                if (first && !selectedSong) {
                    setSelectedSong(first);
                }
            }
        } catch (err) {
            console.error("Failed to load playlist:", err);
        }
    };

    const playSong = useCallback((song: string) => {
        if (!audioManagerRef.current) return;

        const url = convertFileSrc(song);
        const currentAudio = audioManagerRef.current.getActiveAudio();
        if (currentAudio && currentAudio.src === url && isPlaying) {
            return;
        }

        playlistManagerRef.current.setCurrentSong(song);
        setPlayingSong(song);
        setSelectedSong(song);
        setIsPlaying(true);
        setIsStopping(false);
        audioManagerRef.current.play(url);
    }, [isPlaying]);

    const playCurrentSelected = useCallback(() => {
        if (isPlaying) return;
        if (selectedSong) {
            playSong(selectedSong);
        } else {
            const first = playlistManagerRef.current.getCurrentSong();
            if (first) playSong(first);
        }
    }, [selectedSong, isPlaying, playSong]);

    const pause = useCallback(() => {
        audioManagerRef.current?.pause();
        setIsPlaying(false);
    }, []);

    const stop = useCallback(() => {
        audioManagerRef.current?.stopWithFade();
        setIsPlaying(false);
        setPlayingSong(null);
        setIsStopping(true);
        setCurrentTime(0);
        setDuration(null);
    }, []);

    const selectNextInList = useCallback(() => {
        const next = playlistManagerRef.current.getNext();
        if (next) {
            setSelectedSong(next);
        }
    }, []);

    const selectPreviousInList = useCallback(() => {
        const prev = playlistManagerRef.current.getPrevious();
        if (prev) {
            setSelectedSong(prev);
        }
    }, []);

    useEffect(() => {
        return () => {
            audioManagerRef.current?.cleanup();
        };
    }, []);

    return {
        playlist,
        currentPlaylistName,
        selectedSong,
        playingSong,
        isPlaying,
        isStopping,
        activeSidebarItem,
        setActiveSidebarItem,
        setSelectedSong,
        loadPlaylist,
        playSong,
        playCurrentSelected,
        pause,
        stop,
        selectNextInList,
        selectPreviousInList
        ,
        // timing info
        currentTime,
        duration,
        remaining: duration ? Math.max(0, duration - currentTime) : null,
        playedPercent: duration ? (currentTime / duration) * 100 : 0
    };
}
