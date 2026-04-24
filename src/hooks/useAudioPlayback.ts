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
    onNaturalEndRef: { current: (() => void) | undefined },
    resetPlaybackStateRef: { current: () => void },
    setState: {
        setIsPlaying: (value: boolean) => void;
        setPlayingSong: (value: Song | null) => void;
        setIsStopping: (value: boolean) => void;
    }
) {
    return {
        onEnded: (id: AudioChannel) => {
            // Only reset timing and clear playing state if the ended channel is the active one
            const audioManager = getAudioManager();
            if (id === audioManager?.getActiveChannelId()) {
                resetPlaybackStateRef.current();
                onNaturalEndRef.current?.();
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
                resetPlaybackStateRef.current();
            }
        }
    };
}

/**
 * Polls the active audio element for timing updates.
 * Avoids overwriting reset state when playback has ended or been stopped.
 * Also acts as a fallback detector for natural song end when the 'ended' event is unreliable.
 */
function createTimingTick(
    audioManager: AudioManager,
    endedOrStoppedRef: { current: boolean },
    isPlaying: boolean,
    setState: {
        setCurrentTime: (value: number) => void;
        setDuration: (value: number | null) => void;
    },
    onNaturalEnd: () => void
) {
    return (mounted: { current: boolean }) => {
        const audio = audioManager.getActiveAudio();
        if (!audio) return;

        // If we've recently ended/stopped, don't overwrite the reset
        if (endedOrStoppedRef.current) return;

        // Fallback: detect natural end when the 'ended' event didn't fire (e.g. some WebViews)
        if (audio.ended && isPlaying) {
            if (!mounted.current) return;
            onNaturalEnd();
            return;
        }

        // If audio is paused and we are not in playing state, preserve current timing state
        // (stop/ended resets are handled separately via endedOrStoppedRef above)
        const ct = audio.currentTime || 0;
        const d = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
        if (!mounted.current) return;
        setState.setCurrentTime(ct);
        setState.setDuration(d);
    };
}

export function useAudioPlayback(onNaturalEnd?: () => void) {
    const [playingSong, setPlayingSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number | null>(null);

    // Ref to indicate we've recently ended/stopped playback so polling shouldn't overwrite resets
    const endedOrStoppedRef = useRef(false);

    // Keep the external callback in a ref so handlers created once can always see the latest version
    const onNaturalEndRef = useRef(onNaturalEnd);
    useEffect(() => { onNaturalEndRef.current = onNaturalEnd; }, [onNaturalEnd]);

    // Stable ref for full playback reset — captured by handlers created in the useState lazy init
    // and reused by the polling fallback. Safe because all closed-over values (React setters,
    // endedOrStoppedRef) are stable references guaranteed by React.
    const resetPlaybackStateRef = useRef(() => {
        endedOrStoppedRef.current = true;
        setIsPlaying(false);
        setPlayingSong(null);
        setIsStopping(false);
        setCurrentTime(0);
        setDuration(null);
    });

    // Initialize AudioManager with lazy initializer (proper React pattern)
    const [audioManager] = useState(() => {
        const audioManagerRef = { current: null as AudioManager | null };
        const handlers = createAudioEventHandlers(
            () => audioManagerRef.current,
            onNaturalEndRef,
            resetPlaybackStateRef,
            { setIsPlaying, setPlayingSong, setIsStopping }
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
            { setCurrentTime, setDuration },
            () => {
                resetPlaybackStateRef.current();
                onNaturalEndRef.current?.();
            }
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
        resetPlaybackStateRef.current();
        setIsStopping(true); // override: track that a fade-stop is in progress
    }, [audioManager]);

    const seek = useCallback((time: number) => {
        if (!Number.isFinite(time)) return;
        endedOrStoppedRef.current = false;
        const safeTime = Math.max(0, time);
        audioManager.seek(safeTime);
        const actualTime = audioManager.getActiveAudio()?.currentTime;
        setCurrentTime(Number.isFinite(actualTime) ? actualTime : safeTime);
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
        seek,
        getAudioElement
    };
}
