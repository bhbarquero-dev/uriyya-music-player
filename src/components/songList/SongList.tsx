import { useRef, useEffect } from "react";
import { SongRow } from "./SongRow";
import { EmptyPlaylist } from "./EmptyPlaylist";
import { PlaylistBanner } from "./PlaylistBanner";
import { Song } from "../../logic/Song";

interface SongListProps {
    playlist: Song[];
    selectedSong: Song | null;
    playingSong: Song | null;
    isPlaying: boolean;
    currentPlaylistName: string | null;
    onSelectSong: (song: Song) => void;
    onPlaySong: (song: Song) => void;
    onLoadPlaylist: () => void;
}

export function SongList({ playlist, selectedSong, playingSong, isPlaying, currentPlaylistName, onSelectSong, onPlaySong, onLoadPlaylist }: SongListProps) {
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
            <PlaylistBanner currentPlaylistName={currentPlaylistName} onLoadPlaylist={onLoadPlaylist} />
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
