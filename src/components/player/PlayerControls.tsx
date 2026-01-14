interface PlayerControlsProps {
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
}

export function PlayerControls({ isPlaying, onPlay, onPause, onStop }: PlayerControlsProps) {
    return (
        <div className="player-controls">
            <button
                className="control-btn stop-btn"
                onClick={onStop}
                onMouseDown={(e) => e.currentTarget.blur()}
                title="Detener (S)"
                disabled={!isPlaying}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" />
                </svg>
            </button>
            <button
                className="control-btn play-pause-btn"
                onClick={onPlay}
                onMouseDown={(e) => e.currentTarget.blur()}
                title="Reproducir (P)"
                disabled={isPlaying}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </button>
            <button
                className="control-btn pause-btn"
                onClick={onPause}
                onMouseDown={(e) => e.currentTarget.blur()}
                title="Pausar (Espacio)"
                disabled={!isPlaying}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
            </button>
        </div>
    );
}
