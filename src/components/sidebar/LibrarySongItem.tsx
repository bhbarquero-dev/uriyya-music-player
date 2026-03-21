import { useState } from "react";
import { createPortal } from "react-dom";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { ContextMenu } from "../common/ContextMenu";
import { getFileName } from "../../utils/formatting";

interface LibrarySongItemProps {
    path: string;
    onAddToPlaylist?: (path: string) => void;
}

export function LibrarySongItem({ path, onAddToPlaylist }: LibrarySongItemProps) {
    const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
    };

    const contextMenuItems = [
        ...(onAddToPlaylist ? [{
            label: "Agregar al final",
            onClick: () => onAddToPlaylist(path),
        }] : []),
        {
            label: "Mostrar en el Explorador",
            onClick: async () => {
                try {
                    await revealItemInDir(path);
                } catch (error) {
                    console.error("Failed to reveal in explorer:", error);
                }
            },
        }
    ];

    return (
        <>
            <li
                className="sidebar-library-item"
                title={path}
                onContextMenu={handleContextMenu}
            >
                {getFileName(path)}
            </li>
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
