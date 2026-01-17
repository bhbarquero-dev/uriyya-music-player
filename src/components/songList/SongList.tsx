import { useRef, useEffect } from "react";
import { SongRow } from "./SongRow";
import { EmptyPlaylist } from "./EmptyPlaylist";
import { Song } from "../../logic/Song";

interface SongListProps {
    playlist: Song[];
    selectedSong: Song | null;
    playingSong: Song | null;
    isPlaying: boolean;
    onSelectSong: (song: Song) => void;
    onPlaySong: (song: Song) => void;
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
                        {playlist.map((song) => {
                            const isSelected = song.equals(selectedSong);
                            const isReallyPlaying = song.equals(playingSong) && isPlaying;
                            return (
                                <SongRow
                                    key={song.getPath()}
                                    song={song}
                                    isSelected={isSelected}
                                    isPlaying={isReallyPlaying}
                                    onSelect={onSelectSong}
                                    onPlay={onPlaySong}
                                    ref={isSelected ? selectedRowRef : null}
                                />
                            );
                        })}
                    </tbody>
                </table>
            )}
        </section>
    );
}
