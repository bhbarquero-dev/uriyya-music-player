interface ProgressBarProps {
    playedPercent: number;
}

export function ProgressBar({ playedPercent }: ProgressBarProps) {
    const pct = Math.max(0, Math.min(100, Number.isFinite(playedPercent) ? playedPercent : 0));

    return (
        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${pct}%` }}></div>
        </div>
    );
}
