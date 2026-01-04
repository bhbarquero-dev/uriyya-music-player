interface SidebarProps {
    onLoadPlaylist: () => void;
    currentPlaylistName: string | null;
    activeItem: string;
    onSelectItem: (id: string) => void;
}

export function Sidebar({ onLoadPlaylist, currentPlaylistName, activeItem, onSelectItem }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <div className="sidebar-section">
                    <div className="sidebar-header">
                        <h3 className="sidebar-title">Biblioteca</h3>
                        <button className="add-btn" title="Añadir a la biblioteca">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                        </button>
                    </div>
                    <ul className="sidebar-menu">
                        {/* Library items will be added dynamically in the future */}
                    </ul>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-header">
                        <h3 className="sidebar-title">Listas de reproducción</h3>
                        <button className="add-btn" onClick={onLoadPlaylist} title="Nueva lista">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                        </button>
                    </div>
                    <ul className="sidebar-menu">
                        {currentPlaylistName && (
                            <li
                                className={`sidebar-item ${activeItem === "playlist" ? "active" : ""}`}
                                onClick={() => onSelectItem("playlist")}
                            >
                                {currentPlaylistName}
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="sidebar-footer">
                <div>Uriyya Music Player v0.1.0</div>
                <div>Hecho con ❤️ por <a href="https://github.com/bhbarquero-dev">bhbarquero-dev</a></div>
            </div>
        </aside>
    );
}
