import { type FC, useState } from 'react';
import type { VolumeControlProps } from '../../../types/player';

export const VolumeControl: FC<VolumeControlProps> = ({ volume, onVolumeChange }) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  return (
    <div className="volume-controls">
      <button
        type="button"
        className="volume-button control-button"
        onClick={() => setShowVolumeSlider(!showVolumeSlider)}
        aria-label="Volume Control"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M10.116 1.5A.5.5 0 0 1 10.5 2v20a.5.5 0 0 1-.812.39L3.825 18H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.825l5.863-4.39a.5.5 0 0 1 .428-.11z" />
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
              onVolumeChange(Math.max(0, Math.min(100, percent)));
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                onVolumeChange(Math.max(0, volume - 5));
              } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                onVolumeChange(Math.min(100, volume + 5));
              } else if (e.key === 'Home') {
                e.preventDefault();
                onVolumeChange(0);
              } else if (e.key === 'End') {
                e.preventDefault();
                onVolumeChange(100);
              }
            }}
            role="slider"
            aria-valuenow={volume}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Volume Slider"
          ></div>
        </div>
      )}
    </div>
  );
};
