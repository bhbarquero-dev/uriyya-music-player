import { useState } from "react";
import { createPortal } from "react-dom";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { SongContextMenu } from "../songList/SongContextMenu";

interface LibrarySongItemProps {
    path: string;
}

function getFileName(path: string): string {
    return path.split(/[\\/]/).pop() || path;
}

export function LibrarySongItem({ path }: LibrarySongItemProps) {
    const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
    };

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
                <SongContextMenu
                    x={contextMenuPos.x}
                    y={contextMenuPos.y}
                    items={[{
                        label: "Mostrar en el Explorador",
                        onClick: async () => {
                            try {
                                await revealItemInDir(path);
                            } catch (error) {
                                console.error("Failed to reveal in explorer:", error);
                            }
                        },
                    }]}
                    onClose={() => setContextMenuPos(null)}
                />,
                document.body
            )}
        </>
    );
}
