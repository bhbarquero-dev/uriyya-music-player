import { useState } from 'react';
import '../styles/player.css';

export const Player = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackMode, setPlaybackMode] = useState<'auto' | 'manual'>('auto');
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

            <div className="player-controls">
                <div className="control-buttons">
                    <button className="control-button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"/>
                        </svg>
                    </button>
                    <button 
                        className="control-button play-button"
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/>
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>
                            </svg>
                        )}
                    </button>
                    <button className="control-button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.7 1a.7.7 0 0 0-.7.7v5.15L10.05 1.107A.7.7 0 0 0 9 1.712v12.575a.7.7 0 0 0 1.05.607L20 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"/>
                        </svg>
                    </button>
                </div>
                
                <div className="progress-bar">
                    <span>0:00</span>
                    <div className="progress-slider" style={{"--progress": "30%"} as React.CSSProperties}></div>
                    <span>3:45</span>
                </div>
            </div>

            <div className="playback-controls">
                <div className="playback-mode">
                    <button 
                        className={["mode-button", playbackMode === 'auto' ? 'active' : ''].join(' ')}
                        onClick={() => setPlaybackMode('auto')}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.001 12a5 5 0 0 1-4.288 4.95v-9.9A5 5 0 0 1 17 12zM12 8.05v7.9a5 5 0 0 1 0-7.9zm-6.001 4a5 5 0 0 1 4.288-4.95v9.9A5 5 0 0 1 6 12z"/>
                            <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM1.5 12C1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12 17.799 22.5 12 22.5 1.5 17.799 1.5 12z"/>
                        </svg>
                        <span>Reproducción Continua</span>
                    </button>
                    <button 
                        className={["mode-button", playbackMode === 'manual' ? 'active' : ''].join(' ')}
                        onClick={() => setPlaybackMode('manual')}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM1.5 12C1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12 17.799 22.5 12 22.5 1.5 17.799 1.5 12z"/>
                            <path d="M8 8h3v8H8V8zm5 0h3v8h-3V8z"/>
                        </svg>
                        <span>Reproducción Manual</span>
                    </button>
                </div>

                <div className="volume-controls">
                    <button 
                        className="volume-button control-button"
                        onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.116 1.5A.5.5 0 0 1 10.5 2v20a.5.5 0 0 1-.812.39L3.825 18H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.825l5.863-4.39a.5.5 0 0 1 .428-.11zM14.573 7.573a.75.75 0 0 1 1.06 0 6 6 0 0 1 0 8.484.75.75 0 0 1-1.06-1.06 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06z"/>
                        </svg>
                    </button>
                    {showVolumeSlider && (
                        <div className="volume-slider-container">
                            <div 
                                className="volume-slider" 
                                style={{"--volume": `${volume}%`} as React.CSSProperties}
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const percent = Math.round((x / rect.width) * 100);
                                    setVolume(Math.max(0, Math.min(100, percent)));
                                }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};