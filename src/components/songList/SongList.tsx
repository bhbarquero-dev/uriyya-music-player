import { useRef, useEffect } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { SongRow } from "./SongRow";
import { EmptyPlaylist } from "./EmptyPlaylist";
import { PlaylistBanner } from "./PlaylistBanner";
import { Song } from "../../logic/Song";

type DragEntityWithId = {
    id: string | number;
};

type SortableDragEntity = DragEntityWithId & {
    index: number;
    initialIndex: number;
};

function hasEntityId(entity: unknown): entity is DragEntityWithId {
    return typeof entity === "object" && entity !== null && "id" in entity
        && (typeof entity.id === "string" || typeof entity.id === "number");
}

function hasSortableIndices(entity: unknown): entity is SortableDragEntity {
    return hasEntityId(entity)
        && "index" in entity
        && typeof entity.index === "number"
        && "initialIndex" in entity
        && typeof entity.initialIndex === "number";
}

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

    const handleDragEnd = (event: { operation: { source: unknown; target: unknown }; canceled: boolean }) => {
        if (event.canceled || !onMoveSong) return;
        const { source, target } = event.operation;

        if (hasSortableIndices(source)) {
            const fromIndex = source.initialIndex;
            const toIndex = source.index;

            if (fromIndex !== toIndex) {
                onMoveSong(fromIndex, toIndex);
            }

            return;
        }

        if (!hasEntityId(source) || !hasEntityId(target)) return;

        const fromIndex = playlist.findIndex(s => s.getId() === String(source.id));
        const toIndex = playlist.findIndex(s => s.getId() === String(target.id));
        if (fromIndex !== -1 && toIndex !== -1) {
            onMoveSong(fromIndex, toIndex);
        }
    };

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
                <DragDropProvider
                    onDragEnd={handleDragEnd}
                    modifiers={[RestrictToVerticalAxis]}
                >
                    <table className="song-list-table" style={{ marginTop: "10px" }}>
                        <tbody>
                            {playlist.map((song, index) => {
                                const isSelected = song.equals(selectedSong);
                                const isLoadedSong = song.equals(playingSong);
                                const isReallyPlaying = isLoadedSong && isPlaying;
                                return (
                                    <SongRow
                                        key={song.getId()}
                                        song={song}
                                        index={index}
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
                </DragDropProvider>
            )}
        </section>
    );
}
