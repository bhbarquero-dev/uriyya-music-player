import { useRef, useEffect } from "react";
import { SongRow } from "./SongRow";
import { EmptyPlaylist } from "./EmptyPlaylist";

interface SongListProps {
    playlist: string[];
    selectedSong: string | null;
    playingSong: string | null;
    isPlaying: boolean;
    onSelectSong: (song: string) => void;
    onPlaySong: (song: string) => void;
}

export function SongList({ playlist, selectedSong, playingSong, isPlaying, onSelectSong, onPlaySong }: SongListProps) {
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
                <EmptyPlaylist />
            ) : (
                <table className="song-list-table" style={{ marginTop: "10px" }}>
                    <tbody>
                        {playlist.map((song, index) => {
                            const isSelected = selectedSong === song;
                            const isReallyPlaying = playingSong === song && isPlaying;
                            return (
                                <SongRow
                                    key={index}
                                    song={song}
                                    isSelected={isSelected}
                                    isPlaying={isReallyPlaying}
                                    onSelect={onSelectSong}
                                    onPlay={onPlaySong}
                                />
                            );
                        })}
                    </tbody>
                </table>
            )}
        </section>
    );
}
