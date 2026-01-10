interface SongRowProps {
    song: string;
    isSelected: boolean;
    isPlaying: boolean;
    onSelect: (song: string) => void;
    onPlay: (song: string) => void;
}

export function SongRow({ song, isSelected, isPlaying, onSelect, onPlay }: SongRowProps) {
    const getFileName = (path: string) => path.split(/[\\/]/).pop() || path;

    return (
        <tr
            className={`song-row ${isSelected ? "selected" : ""}`}
            onClick={() => onSelect(song)}
            onDoubleClick={() => onPlay(song)}
        >
            <td className="song-title">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "24px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                        {isPlaying && (
                            <span className="playing-indicator" title="Reproduciendo">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--apple-accent)">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                </svg>
                            </span>
                        )}
                    </div>
                    <span>{getFileName(song)}</span>
                </div>
            </td>
        </tr>
    );
}
