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

    const containerRef = useRef<HTMLElement | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    useEffect(() => {
        const row = selectedRowRef.current;
        const container = containerRef.current;
        if (!row || !container) return;

        const banner = container.querySelector(".playlist-banner");
        const bannerHeight = banner ? banner.getBoundingClientRect().height : 0;

        const rowRect = row.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const visibleTop = containerRect.top + bannerHeight;
        const visibleBottom = containerRect.bottom;

        if (rowRect.top < visibleTop) {
            container.scrollTop -= visibleTop - rowRect.top;
        } else if (rowRect.bottom > visibleBottom) {
            container.scrollTop += rowRect.bottom - visibleBottom;
        }
    }, [selectedSong]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !onMoveSong) return;
        const fromIndex = playlist.findIndex(s => s.getId() === String(active.id));
        const toIndex = playlist.findIndex(s => s.getId() === String(over.id));
        if (fromIndex !== -1 && toIndex !== -1) {
            onMoveSong(fromIndex, toIndex);
        }
    };

    const songIds = playlist.map(s => s.getId());

    return (
        <section className="main-content" ref={containerRef}>
            <PlaylistBanner
                currentPlaylistName={currentPlaylistName}
                songsCount={playlist.length}
                onLoadPlaylist={onLoadPlaylist}
                onChangePlaylist={onChangePlaylist}
                hasUnsavedChanges={hasUnsavedChanges}
                disabled={playingSong !== null}
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
                                            key={song.getId()}
                                            song={song}
                                            isSelected={isSelected}
                                            isPlaying={isReallyPlaying}
                                            isPlayingSong={isLoadedSong}
                                            sortable={!!onMoveSong}
                                            onSelect={onSelectSong}
                                            onPlay={onPlaySong}
                                            onRevealInExplorer={onRevealInExplorer}
                                            onRemoveSong={onRemoveSong}
                                            scrollRef={isSelected ? (el) => { selectedRowRef.current = el; } : undefined}
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
