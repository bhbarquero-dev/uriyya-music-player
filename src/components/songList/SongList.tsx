import { useRef, useEffect } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
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
    onMoveSong?: (fromIndex: number, toIndex: number) => void;
}

export function SongList({ playlist, selectedSong, playingSong, isPlaying, currentPlaylistName, hasUnsavedChanges, onSelectSong, onPlaySong, onLoadPlaylist, onChangePlaylist, onRevealInExplorer, onRemoveSong, onMoveSong }: SongListProps) {
    const selectedRowRef = useRef<HTMLTableRowElement | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    useEffect(() => {
        if (selectedRowRef.current) {
            selectedRowRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [selectedSong]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !onMoveSong) return;
        const fromIndex = playlist.findIndex(s => s.getPath() === active.id);
        const toIndex = playlist.findIndex(s => s.getPath() === over.id);
        if (fromIndex !== -1 && toIndex !== -1) {
            onMoveSong(fromIndex, toIndex);
        }
    };

    const songIds = playlist.map(s => s.getPath());

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
                <DndContext
                    sensors={sensors}
                    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={songIds} strategy={verticalListSortingStrategy}>
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
                                            sortable={!!onMoveSong}
                                            onSelect={onSelectSong}
                                            onPlay={onPlaySong}
                                            onRevealInExplorer={onRevealInExplorer}
                                            onRemoveSong={onRemoveSong}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </SortableContext>
                </DndContext>
            )}
        </section>
    );
}
