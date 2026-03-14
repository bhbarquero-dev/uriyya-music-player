import { useEffect, useRef } from "react";
import { Song } from "../../logic/Song";

interface SongContextMenuProps {
    song: Song;
    x: number;
    y: number;
    onRevealInExplorer: (song: Song) => void;
    onClose: () => void;
}

export function SongContextMenu({ song, x, y, onRevealInExplorer, onClose }: SongContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        const handleMouseDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleMouseDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleMouseDown);
        };
    }, [onClose]);

    return (
        <div ref={menuRef} className="context-menu" style={{ top: y, left: x }}>
            <ul className="context-menu-list">
                <li
                    className="context-menu-item"
                    onClick={() => {
                        onRevealInExplorer(song);
                        onClose();
                    }}
                >
                    Mostrar en el Explorador
                </li>
            </ul>
        </div>
    );
}
