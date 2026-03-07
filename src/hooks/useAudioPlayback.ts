import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AudioManager } from "../logic/AudioManager";
import { Song } from "../logic/Song";
import type { AudioChannel } from "../logic/AudioManager";

const TIME_POLL_INTERVAL_MS = 250;

/**
 * Creates event handlers for AudioManager that update playback state.
 * Handlers check if the event is from the active channel to avoid race conditions during crossfade.
 */
function createAudioEventHandlers(
    getAudioManager: () => AudioManager | null,
    setState: {
        setIsPlaying: (value: boolean) => void;
        setPlayingSong: (value: Song | null) => void;
        setIsStopping: (value: boolean) => void;
        setCurrentTime: (value: number) => void;
        setDuration: (value: number | null) => void;
    }
) {
    return {
        onEnded: (id: AudioChannel) => {
            // Only reset timing and clear playing state if the ended channel is the active one
            const audioManager = getAudioManager();
            if (id === audioManager?.getActiveChannelId()) {
                setState.setIsPlaying(false);
                setState.setPlayingSong(null);
                setState.setIsStopping(false);
                setState.setCurrentTime(0);
                setState.setDuration(null);
            }
        },
        onError: (id: AudioChannel, err: any) => {
            console.error(`Audio Error on channel ${id}:`, err);
            const audioManager = getAudioManager();
            if (id === audioManager?.getActiveChannelId()) {
                setState.setIsPlaying(false);
                setState.setPlayingSong(null);
                setState.setIsStopping(false);
            }
        },
        onFadeFinished: (id: AudioChannel) => {
            const audioManager = getAudioManager();
            if (id === audioManager?.getActiveChannelId()) {
                setState.setIsPlaying(false);
                setState.setPlayingSong(null);
                setState.setIsStopping(false);
                setState.setCurrentTime(0);
                setState.setDuration(null);
            }
        }
    };
}

/**
 * Polls the active audio element for timing updates.
 * Avoids overwriting reset state when playback has ended or been stopped.
 */
function createTimingTick(
    audioManager: AudioManager,
    endedOrStoppedRef: { current: boolean },
    isPlaying: boolean,
    setState: {
        setCurrentTime: (value: number) => void;
        setDuration: (value: number | null) => void;
    }
) {
    return (mounted: { current: boolean }) => {
        const audio = audioManager.getActiveAudio();
        if (!audio) return;

        // If we've recently ended/stopped, don't overwrite the reset
        if (endedOrStoppedRef.current) return;

        // If audio is paused and we are not in playing state, keep times reset
        if (audio.paused && !isPlaying) {
            if (!mounted.current) return;
            setState.setCurrentTime(0);
            setState.setDuration(null);
            return;
        }

        const ct = audio.currentTime || 0;
        const d = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
        if (!mounted.current) return;
        setState.setCurrentTime(ct);
        setState.setDuration(d);
    };
}

export function useAudioPlayback() {
    const [playingSong, setPlayingSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number | null>(null);

    // Ref to indicate we've recently ended/stopped playback so polling shouldn't overwrite resets
    const endedOrStoppedRef = useRef(false);

    // Initialize AudioManager with lazy initializer (proper React pattern)
    const [audioManager] = useState(() => {
        const audioManagerRef = { current: null as AudioManager | null };
        const handlers = createAudioEventHandlers(
            () => audioManagerRef.current,
            { setIsPlaying, setPlayingSong, setIsStopping, setCurrentTime, setDuration }
        );
        const manager = new AudioManager(handlers);
        audioManagerRef.current = manager;
        return manager;
    });

    // Poll active audio for time/duration updates. Avoid overwriting reset state when playback is stopped.
    useEffect(() => {
        const mountedRef = { current: true };
        const tick = createTimingTick(
            audioManager,
            endedOrStoppedRef,
            isPlaying,
            { setCurrentTime, setDuration }
        );

        const interval = window.setInterval(() => {
            try {
                tick(mountedRef);
            } catch (e) {
                // ignore
            }
        }, TIME_POLL_INTERVAL_MS);

        // initial tick
        tick(mountedRef);

        return () => {
            mountedRef.current = false;
            clearInterval(interval);
        };
    }, [isPlaying, audioManager]);

    const play = useCallback((song: Song) => {
        // Clear any ended/stopped flag when starting playback
        endedOrStoppedRef.current = false;

        const url = song.toMediaUrl();
        const currentAudio = audioManager.getActiveAudio();
        if (currentAudio && currentAudio.src === url && isPlaying) {
            return;
        }

        setPlayingSong(song);
        setIsPlaying(true);
        setIsStopping(false);
        audioManager.play(song);
    }, [isPlaying, audioManager]);

    const pause = useCallback(() => {
        audioManager.pause();
        setIsPlaying(false);
    }, [audioManager]);

    const stop = useCallback(() => {
        audioManager.stopWithFade();
        setIsPlaying(false);
        setPlayingSong(null);
        setIsStopping(true);
        setCurrentTime(0);
        setDuration(null);
        endedOrStoppedRef.current = true;
    }, [audioManager]);

    const getAudioElement = useCallback(() => {
        return audioManager.getActiveAudio();
    }, [audioManager]);

    useEffect(() => {
        return () => {
            audioManager.cleanup();
        };
    }, [audioManager]);

    // Computed values with memoization to avoid recalculation on every render
    const remaining = useMemo(() => {
        return duration ? Math.max(0, duration - currentTime) : null;
    }, [duration, currentTime]);

    const playedPercent = useMemo(() => {
        return duration ? (currentTime / duration) * 100 : 0;
    }, [duration, currentTime]);

    return {
        playingSong,
        isPlaying,
        isStopping,
        currentTime,
        duration,
        remaining,
        playedPercent,
        play,
        pause,
        stop,
        getAudioElement
    };
}
