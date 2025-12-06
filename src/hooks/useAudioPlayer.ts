import { useCallback, useEffect, useRef, useState } from 'react';
import type { Track } from '../types/player';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>();

  // Create audio element once on mount and clean up on unmount
  useEffect(() => {
    audioRef.current = new Audio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update audio volume when `volume` changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100);
      setCurrentTime(formatTime(current));
    }
  }, [formatTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(formatTime(audioRef.current.duration));
    }
  }, [formatTime]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume / 100;
    }
  }, []);

  const handleSeek = useCallback(
    (position: number) => {
      if (audioRef.current) {
        const time = (position / 100) * audioRef.current.duration;
        audioRef.current.currentTime = time;
        setProgress(position);
        setCurrentTime(formatTime(time));
      }
    },
    [formatTime]
  );

  const handleTrackChange = useCallback(
    (track: Track) => {
      setCurrentTrack(track);
      if (audioRef.current) {
        // In a real app, we would set the audio source here
        // audioRef.current.src = track.audioUrl;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play();
        }
      }
    },
    [isPlaying]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
    return undefined;
  }, [handleTimeUpdate, handleLoadedMetadata]);

  return {
    isPlaying,
    volume,
    progress,
    currentTime,
    duration,
    currentTrack,
    handlePlayPause,
    handleVolumeChange,
    handleSeek,
    handleTrackChange,
  };
}
