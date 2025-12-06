import type React from 'react';

interface TrackInfoProps {
  title?: string;
  artist?: string;
}

export const TrackInfo: React.FC<TrackInfoProps> = ({ title, artist }) => {
  return (
    <div className="track-info">
      <div className="track-details">
        <span className="track-title">{title || 'No track selected'}</span>
        <span className="track-artist">{artist || 'Select a song to play'}</span>
      </div>
    </div>
  );
};
