import { useState } from 'react';
import { WindowControls } from './WindowControls';
import '../styles/player.css';

export const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(50);

  return (
    <div className="player">
      <div className="track-info">
        <div className="track-image" />
        <div className="track-details">
          <span className="track-title">Song Title</span>
          <span className="track-artist">Artist Name</span>
        </div>
      </div>
      <WindowControls />{' '}
      <div className="player-controls">
        <div className="control-buttons">
          <button type="button" className="control-button" aria-label="Previous Track">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z" />
            </svg>
          </button>
          <button
            type="button"
            className="control-button play-button"
            onClick={() => setIsPlaying(!isPlaying)}
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
          <button type="button" className="control-button" aria-label="Next Track">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.7 1a.7.7 0 0 0-.7.7v5.15L10.05 1.107A.7.7 0 0 0 9 1.712v12.575a.7.7 0 0 0 1.05.607L20 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z" />
            </svg>
          </button>
        </div>

        <div className="progress-bar">
          <span>0:00</span>
          <div
            className="progress-slider"
            style={{ '--progress': '30%' } as React.CSSProperties}
          ></div>
          <span>3:45</span>
        </div>
      </div>
      <div className="playback-controls">
        <div className="volume-controls">
          <button
            type="button"
            className="volume-button control-button"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            aria-label="Volume Control"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M10.116 1.5A.5.5 0 0 1 10.5 2v20a.5.5 0 0 1-.812.39L3.825 18H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.825l5.863-4.39a.5.5 0 0 1 .428-.11zM14.573 7.573a.75.75 0 0 1 1.06 0 6 6 0 0 1 0 8.484.75.75 0 0 1-1.06-1.06 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
          {showVolumeSlider && (
            <div className="volume-slider-container">
              <div
                className="volume-slider"
                style={{ '--volume': `${volume}%` } as React.CSSProperties}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percent = Math.round((x / rect.width) * 100);
                  setVolume(Math.max(0, Math.min(100, percent)));
                }}
                tabIndex={0}
                role="slider"
                aria-valuenow={volume}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Volume Slider"
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    setVolume((v) => Math.max(0, v - 5));
                  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    setVolume((v) => Math.min(100, v + 5));
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    setVolume(0);
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    setVolume(100);
                  }
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
