import type { FC } from 'react';
import type { PlayerProps } from '../../../types/player';
import { formatTime } from '../../../utils/time';
import { WindowControls } from '../WindowControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import '../../styles/player.css';

export const Player: FC<PlayerProps> = ({
  currentTrack,
  isPlaying,
  volume,
  progress,
  onPlayPause,
  onVolumeChange,
  onSeek,
  onNext,
  onPrevious,
}) => {
  return (
    <div className="player">
      <div className="track-info">
        <div className="track-image" />
        <div className="track-details">
          <span className="track-title">{currentTrack?.title || 'No Track Selected'}</span>
          <span className="track-artist">{currentTrack?.artist || 'Unknown Artist'}</span>
        </div>
      </div>

      <WindowControls />

      <div className="player-controls">
        <div className="control-buttons">
          <button
            type="button"
            className="control-button"
            onClick={onPrevious}
            aria-label="Previous Track"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z" />
            </svg>
          </button>

          <button
            type="button"
            className="control-button play-button"
            onClick={onPlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
              </svg>
            )}
          </button>

          <button type="button" className="control-button" onClick={onNext} aria-label="Next Track">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.7 1a.7.7 0 0 0-.7.7v5.15L10.05 1.107A.7.7 0 0 0 9 1.712v12.575a.7.7 0 0 0 1.05.607L20 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z" />
            </svg>
          </button>
        </div>

        <ProgressBar
          currentTime={
            currentTrack?.duration ? formatTime((progress * currentTrack.duration) / 100) : '0:00'
          }
          duration={currentTrack?.duration ? formatTime(currentTrack.duration) : '0:00'}
          progress={progress}
          onSeek={onSeek}
        />
      </div>

      <div className="playback-controls">
        <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
      </div>
    </div>
  );
};
