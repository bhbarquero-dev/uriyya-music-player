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
    hasUnsavedChanges?: boolean;
    onSelectSong: (song: Song) => void;
    onPlaySong: (song: Song) => void;
    onLoadPlaylist: () => void;
    onChangePlaylist?: () => void;
    onRevealInExplorer?: (song: Song) => void;
    onRemoveSong?: (song: Song) => void;
}

export function SongList({ playlist, selectedSong, playingSong, isPlaying, currentPlaylistName, hasUnsavedChanges, onSelectSong, onPlaySong, onLoadPlaylist, onChangePlaylist, onRevealInExplorer, onRemoveSong }: SongListProps) {
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
            <PlaylistBanner
                currentPlaylistName={currentPlaylistName}
                songsCount={playlist.length}
                onLoadPlaylist={onLoadPlaylist}
                onChangePlaylist={onChangePlaylist}
                hasUnsavedChanges={hasUnsavedChanges}
            />
            {playlist.length === 0 ? (
                <EmptyPlaylist />
            ) : (
                <table className="song-list-table" style={{ marginTop: "10px" }}>
                    <tbody>
                        {playlist.map((song) => {
                            const isSelected = song.equals(selectedSong);
                            const isLoadedSong = song.equals(playingSong);
                            const isReallyPlaying = isLoadedSong && isPlaying;
                            return (
                                <SongRow
                                    key={song.getPath()}
                                    song={song}
                                    isSelected={isSelected}
                                    isPlaying={isReallyPlaying}
                                    isPlayingSong={isLoadedSong}
                                    onSelect={onSelectSong}
                                    onPlay={onPlaySong}
                                    onRevealInExplorer={onRevealInExplorer}
                                    onRemoveSong={onRemoveSong}
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
