import { SIDEBAR_ITEMS } from "../../types/sidebar";

interface PlaylistMenuProps {
    currentPlaylistName: string | null;
    activeItem: string;
    onSelectItem: (id: string) => void;
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
