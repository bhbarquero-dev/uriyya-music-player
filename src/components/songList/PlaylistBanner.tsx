interface PlaylistBannerProps {
    currentPlaylistName: string | null;
    songsCount?: number;
    hasUnsavedChanges?: boolean;
    onLoadPlaylist: () => void;
    onChangePlaylist?: () => void;
}

export function PlaylistBanner({ currentPlaylistName, songsCount = 0, hasUnsavedChanges, onLoadPlaylist, onChangePlaylist }: PlaylistBannerProps) {
    const songsLabel = songsCount === 1 ? "1 canción" : `${songsCount} canciones`;

    return (
        <div className="playlist-banner">
            {currentPlaylistName ? (
                    <div className="playlist-banner-header">
                        <div className="playlist-banner-main">
                            <span className="playlist-banner-label">Lista de reproducción</span>
                            <div className="playlist-banner-name-row">
                                <span className="playlist-banner-name" title={currentPlaylistName}>{currentPlaylistName}</span>
                                {hasUnsavedChanges && (
                                    <span className="unsaved-dot" title="Cambios sin guardar">●</span>
                                )}
                                <span className="playlist-banner-count">{songsLabel}</span>
                            </div>
                        </div>
                        {onChangePlaylist && (
                            <button className="btn-change-playlist" onClick={onChangePlaylist}>
                                Cambiar lista de reproducción
                            </button>
                        )}
                    </div>
            ) : (
                <button className="btn-load" onClick={onLoadPlaylist}>
                    Cargar lista de reproducción
                </button>
            )}
        </div>
    );
}
