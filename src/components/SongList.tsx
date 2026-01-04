import { useRef, useEffect } from "react";

interface SongListProps {
    playlist: string[];
    selectedSong: string | null;
    playingSong: string | null;
    isPlaying: boolean;
    onSelectSong: (song: string) => void;
    onPlaySong: (song: string) => void;
}

export function SongList({ playlist, selectedSong, playingSong, isPlaying, onSelectSong, onPlaySong }: SongListProps) {
    const getFileName = (path: string) => path.split(/[\\/]/).pop() || path;
    const selectedRowRef = useRef<HTMLTableRowElement | null>(null);

    useEffect(() => {
        if (selectedRowRef.current) {
            selectedRowRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [selectedSong]);

    return (
        <section className="main-content">
            {playlist.length === 0 ? (
                <p style={{ color: "var(--apple-text-secondary)", padding: "32px 48px" }}>
                    No hay canciones cargadas. Usa la barra lateral para cargar una lista.
                </p>
            ) : (
                <table className="song-list-table" style={{ marginTop: "10px" }}>
                    <tbody>
                        {playlist.map((song, index) => {
                            const isSelected = selectedSong === song;
                            const isReallyPlaying = playingSong === song && isPlaying;
                            return (
                                <tr
                                    key={index}
                                    ref={isSelected ? selectedRowRef : null}
                                    className={`song-row ${isSelected ? "selected" : ""}`}
                                    onClick={() => onSelectSong(song)}
                                    onDoubleClick={() => onPlaySong(song)}
                                >
                                    <td className="song-title">
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <div style={{ width: "24px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                                                {isReallyPlaying && (
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
                        })}
                    </tbody>
                </table>
            )}
        </section>
    );
}
