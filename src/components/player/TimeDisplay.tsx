import { formatTime } from "../../utils/formatting";

interface TimeDisplayProps {
    currentTime: number;
    remaining: number | null;
}

export function TimeDisplay({ currentTime, remaining }: TimeDisplayProps) {
    const elapsed = formatTime(currentTime);
    const remainingLabel = remaining !== null ? `-${formatTime(remaining)}` : "-:--";

    return (
        <div className="time-labels" style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--apple-text-secondary)" }}>
            <div className="elapsed">{elapsed}</div>
            <div className="remaining">{remainingLabel}</div>
        </div>
    );
}
