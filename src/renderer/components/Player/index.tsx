import { useState } from 'react';
import '../../styles/player.css';
import { TrackInfo } from './TrackInfo';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';

export const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);

  // Mock data for now
  const currentTime = 0;
  const duration = 225; // 3:45

  return (
    <div className="player">
      <TrackInfo title="Song Title" artist="Artist Name" />
      <div className="player-controls">
        <Controls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onPrevious={() => { }}
          onNext={() => { }}
        />
        <ProgressBar currentTime={currentTime} duration={duration} />
      </div>
      <div className="playback-controls">
        <VolumeControl volume={volume} onVolumeChange={setVolume} />
      </div>
    </div>
  );
};
