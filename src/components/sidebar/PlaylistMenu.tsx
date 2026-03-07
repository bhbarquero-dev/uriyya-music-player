import { SIDEBAR_ITEMS, type SidebarItemId } from "../../types/sidebar";

interface PlaylistMenuProps {
    currentPlaylistName: string | null;
    activeItem: SidebarItemId | "";
    onSelectItem: (id: SidebarItemId) => void;
}

export function PlaylistMenu({ currentPlaylistName, activeItem, onSelectItem }: PlaylistMenuProps) {
    return (
        <>
            {currentPlaylistName && (
                <li
                    className={`sidebar-item ${activeItem === SIDEBAR_ITEMS.PLAYLIST ? "active" : ""}`}
                    onClick={() => onSelectItem(SIDEBAR_ITEMS.PLAYLIST)}
                >
                    {currentPlaylistName}
                </li>
            )}
        </>
    );
}
