import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek }) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="progress-bar">
      <span>{formatTime(currentTime)}</span>
      <div
        className="progress-slider"
        style={{ '--progress': `${progress}%` } as React.CSSProperties}
      ></div>
      <span>{formatTime(duration)}</span>
    </div>
  );
};
