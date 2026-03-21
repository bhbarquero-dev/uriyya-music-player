import { useState } from "react";
import { createPortal } from "react-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Song } from "../../logic/Song";
import { ContextMenu } from "../common/ContextMenu";

interface SongRowProps {
    song: Song;
    isSelected: boolean;
    isPlaying: boolean;
    isPlayingSong?: boolean;
    onSelect: (song: Song) => void;
    onPlay: (song: Song) => void;
    onRevealInExplorer?: (song: Song) => void;
    onRemoveSong?: (song: Song) => void;
    sortable?: boolean;
    scrollRef?: (el: HTMLTableRowElement | null) => void;
}

export function SongRow({ song, isSelected, isPlaying, isPlayingSong, onSelect, onPlay, onRevealInExplorer, onRemoveSong, sortable, scrollRef }: SongRowProps) {
    const isInvalid = !song.isValid();
    const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: song.getId() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : undefined,
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        if (!onRevealInExplorer && !onRemoveSong) return;
        e.preventDefault();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
    };

    const contextMenuItems = [
        ...(onRemoveSong ? [{ label: "Eliminar de la lista", disabled: isPlayingSong, onClick: () => onRemoveSong(song) }] : []),
        ...(onRevealInExplorer ? [{ label: "Mostrar en el Explorador", disabled: isInvalid, onClick: () => onRevealInExplorer(song) }] : []),
    ];

    return (
        <>
        <tr
            ref={(el) => { setNodeRef(el); scrollRef?.(el); }}
            style={style}
            className={`song-row ${isSelected ? "selected" : ""} ${isInvalid ? "invalid" : ""}`}
            onClick={() => onSelect(song)}
            onDoubleClick={() => onPlay(song)}
            onContextMenu={handleContextMenu}
        >
            {sortable && (
                <td className="drag-handle" {...attributes} {...listeners}>⠿</td>
            )}
            <td className="song-title">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "24px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                        {isInvalid ? (
                            <span className="invalid-indicator" title="Archivo no encontrado">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff3b30">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                            </span>
                        ) : isPlaying ? (
                            <span className="playing-indicator" title="Reproduciendo">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--apple-accent)">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                </svg>
                            </span>
                        ) : null}
                    </div>
                    <span>{song.getDisplayName()}</span>
                </div>
            </td>
        </tr>
        {contextMenuPos && createPortal(
            <ContextMenu
                x={contextMenuPos.x}
                y={contextMenuPos.y}
                items={contextMenuItems}
                onClose={() => setContextMenuPos(null)}
            />,
            document.body
        )}
        </>
    );
}

SongRow.displayName = "SongRow";
