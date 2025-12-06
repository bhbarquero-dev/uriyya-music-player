export interface Track {
  title: string;
  artist: string;
  duration: number;
  imagePath?: string;
}

export interface PlayerProps {
  currentTrack?: Track;
  isPlaying: boolean;
  volume: number;
  progress: number;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (position: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export interface ProgressBarProps {
  currentTime: string;
  duration: string;
  progress: number;
  onSeek: (position: number) => void;
}
