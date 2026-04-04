interface ProgressBarProps {
    playedPercent: number;
    onSeek: (fraction: number) => void;
}

export function ProgressBar({ playedPercent, onSeek }: ProgressBarProps) {
    const pct = Math.max(0, Math.min(100, Number.isFinite(playedPercent) ? playedPercent : 0));

    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width <= 0) return;
        const rawFraction = (e.clientX - rect.left) / rect.width;
        const fraction = Math.max(0, Math.min(1, rawFraction));
        if (!Number.isFinite(fraction)) return;
        onSeek(fraction);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        const STEP = 0.05;
        const currentFraction = pct / 100;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            onSeek(Math.min(1, currentFraction + STEP));
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onSeek(Math.max(0, currentFraction - STEP));
        }
    }

    return (
        <div
            className="progress-container"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            style={{ cursor: "pointer" }}
        >
            <div className="progress-bar" style={{ width: `${pct}%` }}></div>
        </div>
    );
}
