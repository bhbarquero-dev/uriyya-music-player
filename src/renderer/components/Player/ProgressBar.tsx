import type { FC } from 'react';
import type { ProgressBarProps } from '../../../types/player';

export const ProgressBar: FC<ProgressBarProps> = ({ currentTime, duration, progress, onSeek }) => {
  return (
    <div className="progress-bar">
      <span>{currentTime}</span>
      <div
        className="progress-slider"
        style={{ '--progress': `${progress}%` } as React.CSSProperties}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percent = (x / rect.width) * 100;
          onSeek(percent);
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            onSeek(Math.max(0, progress - 5));
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            onSeek(Math.min(100, progress + 5));
          } else if (e.key === 'Home') {
            e.preventDefault();
            onSeek(0);
          } else if (e.key === 'End') {
            e.preventDefault();
            onSeek(100);
          }
        }}
        role="slider"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Song Progress"
      ></div>
      <span>{duration}</span>
    </div>
  );
};
