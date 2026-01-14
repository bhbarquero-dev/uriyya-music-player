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
                    className={`sidebar-item ${activeItem === "playlist" ? "active" : ""}`}
                    onClick={() => onSelectItem("playlist")}
                >
                    {currentPlaylistName}
                </li>
            )}
        </>
    );
}
