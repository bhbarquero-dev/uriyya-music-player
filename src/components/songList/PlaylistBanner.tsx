interface PlaylistBannerProps {
    currentPlaylistName: string | null;
    onLoadPlaylist: () => void;
}

export function PlaylistBanner({ currentPlaylistName, onLoadPlaylist }: PlaylistBannerProps) {
    return (
        <div className="playlist-banner">
            {currentPlaylistName ? (
                <span className="playlist-banner-name">{currentPlaylistName}</span>
            ) : (
                <button className="btn-load" onClick={onLoadPlaylist}>
                    Cargar lista de reproducción
                </button>
            )}
        </div>
    );
}
