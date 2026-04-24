import { Library } from "./library/Library";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarProps {
    onAddToPlaylist?: (path: string) => void;
    onAddToStart?: (path: string) => void;
    onAddAfterSelected?: (path: string) => void;
}

export function Sidebar({ onAddToPlaylist, onAddToStart, onAddAfterSelected }: SidebarProps = {}) {
    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <Library
                    onAddToPlaylist={onAddToPlaylist}
                    onAddToStart={onAddToStart}
                    onAddAfterSelected={onAddAfterSelected}
                />
            </div>

            <SidebarFooter />
        </aside>
    );
}
