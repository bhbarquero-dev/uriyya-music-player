interface PlayerProps {
    playingSong: string | null;
    isPlaying: boolean;
    isStopping: boolean;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    currentTime: number;
    duration: number | null;
    remaining: number | null;
    playedPercent: number;
}

export function Player({ playingSong, isPlaying, isStopping, onPlay, onPause, onStop, currentTime, duration, remaining, playedPercent }: PlayerProps) {
    const getFileName = (path: string) => path.split(/[\\\/]/).pop() || "Ninguna canción seleccionada";

    const formatTime = (secs: number | null) => {
        if (secs === null || !isFinite(secs)) return "--:--";
        const s = Math.floor(secs);
        const m = Math.floor(s / 60);
        const rem = s % 60;
        return `${m}:${rem.toString().padStart(2, "0")}`;
    };

    const elapsed = formatTime(currentTime);
    const remainingLabel = remaining !== null ? `-${formatTime(remaining)}` : "-:--";
    const pct = Math.max(0, Math.min(100, Number.isFinite(playedPercent) ? playedPercent : 0));

    return (
        <header className="player-header">
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

            <div className="player-info">
                <div className="song-name">
                    {playingSong
                        ? getFileName(playingSong)
                        : (isStopping ? "Deteniendo..." : "Sin reproducción")}
                </div>

                <div className="progress-container" aria-hidden={false}>
                    <div className="progress-bar" style={{ width: `${pct}%` }}></div>
                </div>

                <div className="time-labels" style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--apple-text-secondary)" }}>
                    <div className="elapsed">{elapsed}</div>
                    <div className="remaining">{remainingLabel}</div>
                </div>
            </div>
        </header>
    );
}
