interface ProgressBarProps {
    playedPercent: number;
    onSeek: (fraction: number) => void;
}

export function ProgressBar({ playedPercent, onSeek }: ProgressBarProps) {
    const pct = Math.max(0, Math.min(100, Number.isFinite(playedPercent) ? playedPercent : 0));

    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onSeek(fraction);
    }

    return (
        <div className="progress-container" onClick={handleClick} style={{ cursor: "pointer" }}>
            <div className="progress-bar" style={{ width: `${pct}%` }}></div>
        </div>
    );
}
