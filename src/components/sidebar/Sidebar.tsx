import { Library } from "./library/Library";
import { SidebarFooter } from "./SidebarFooter";
import type { Library as LibraryStore } from "@logic/Library";

interface SidebarProps {
    store: LibraryStore;
    onAddToPlaylist?: (path: string) => void;
    onAddToStart?: (path: string) => void;
    onAddAfterSelected?: (path: string) => void;
}

export function Sidebar({ store, onAddToPlaylist, onAddToStart, onAddAfterSelected }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <Library
                    store={store}
                    onAddToPlaylist={onAddToPlaylist}
                    onAddToStart={onAddToStart}
                    onAddAfterSelected={onAddAfterSelected}
                />
            </div>

            <SidebarFooter />
        </aside>
    );
}
