import { useEffect, useMemo, useState } from "react";
import { LibrarySongItem } from "./LibrarySongItem";
import { TauriFileDialog } from "../../../logic/TauriFileDialog";
import { getLibraryPathFromSettings, saveLibraryPathToSettings } from "../../../logic/UserSettingsStore";
import { scanLibraryAudioFiles } from "../../../logic/LibraryScanner";
import { getFileName } from "../../../utils/formatting";

interface LibraryProps {
    onAddToPlaylist?: (path: string) => void;
    onAddToStart?: (path: string) => void;
    onAddAfterSelected?: (path: string) => void;
}

export function Library({ onAddToPlaylist, onAddToStart, onAddAfterSelected }: LibraryProps = {}) {
    const [libraryPath, setLibraryPath] = useState<string | null>(null);
    const [librarySongs, setLibrarySongs] = useState<string[]>([]);
    const [isScanningLibrary, setIsScanningLibrary] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const fileDialog = useMemo(() => new TauriFileDialog(), []);

    useEffect(() => {
        let isMounted = true;

        const loadStoredLibraryPath = async () => {
            const storedPath = await getLibraryPathFromSettings();
            if (isMounted) {
                setLibraryPath(storedPath);
            }
        };

        void loadStoredLibraryPath();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadLibrarySongs = async () => {
            if (!libraryPath) {
                setLibrarySongs([]);
                setIsScanningLibrary(false);
                return;
            }

            setIsScanningLibrary(true);
            try {
                const songs = await scanLibraryAudioFiles(libraryPath);
                if (isMounted) {
                    setLibrarySongs(songs);
                }
            } finally {
                if (isMounted) {
                    setIsScanningLibrary(false);
                }
            }
        };

        void loadLibrarySongs();

        return () => {
            isMounted = false;
        };
    }, [libraryPath]);

    const handleLibraryAddClick = async () => {
        const selectedPath = await fileDialog.openDirectory();
        if (selectedPath) {
            setLibraryPath(selectedPath);
            await saveLibraryPathToSettings(selectedPath);
        }
    };

    const handleLibraryRefresh = async () => {
        if (!libraryPath) return;

        setIsScanningLibrary(true);
        try {
            const songs = await scanLibraryAudioFiles(libraryPath);
            setLibrarySongs(songs);
        } finally {
            setIsScanningLibrary(false);
        }
    };

    const filteredSongs = useMemo(() => {
        if (!searchQuery.trim()) {
            return librarySongs;
        }
        const lowerQuery = searchQuery.toLowerCase();
        return librarySongs.filter((songPath) => {
            const fileName = getFileName(songPath).toLowerCase();
            return fileName.includes(lowerQuery);
        });
    }, [librarySongs, searchQuery]);

    const selectedLibraryName = libraryPath ? getFileName(libraryPath) : null;
    const hasLibrary = !!selectedLibraryName;

    const libraryIcon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
    );

    return (
        <div className="sidebar-section">
            <div className="sidebar-header">
                <h3 className="sidebar-title">
                    <span className="sidebar-title-icon" aria-hidden="true">{libraryIcon}</span>
                    Biblioteca
                </h3>
                {!hasLibrary && (
                    <button className="icon-btn add-icon-btn" onClick={handleLibraryAddClick} title="Agregar biblioteca" aria-label="Agregar biblioteca">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                )}
            </div>

            {!hasLibrary && <div className="sidebar-placeholder">No hay biblioteca seleccionada</div>}

            {hasLibrary && (
                <div className="sidebar-selected-item">
                    <span className="sidebar-selected-item-text">{selectedLibraryName}</span>
                    <div className="sidebar-actions">
                        <button className="icon-btn edit-btn" onClick={handleLibraryAddClick} title="Cambiar biblioteca" aria-label="Cambiar biblioteca">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button className="icon-btn refresh-btn" onClick={handleLibraryRefresh} title="Actualizar lista de canciones" aria-label="Actualizar lista de canciones">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {hasLibrary && !isScanningLibrary && librarySongs.length > 0 && (
                <div className="sidebar-search">
                    <input
                        type="text"
                        className="sidebar-search-input"
                        placeholder="Buscar canciones..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            <ul className="sidebar-menu">
                {isScanningLibrary && <li className="sidebar-library-item">Buscando canciones...</li>}
                {!isScanningLibrary && hasLibrary && librarySongs.length === 0 && (
                    <li className="sidebar-library-item">No se encontraron archivos .mp3 o .wav</li>
                )}
                {!isScanningLibrary && filteredSongs.length === 0 && librarySongs.length > 0 && (
                    <li className="sidebar-library-item">No hay canciones que coincidan con "<strong>{searchQuery}</strong>"</li>
                )}
                {!isScanningLibrary &&
                    filteredSongs.map((songPath) => (
                        <LibrarySongItem
                            key={songPath}
                            path={songPath}
                            onAddToPlaylist={onAddToPlaylist}
                            onAddToStart={onAddToStart}
                            onAddAfterSelected={onAddAfterSelected}
                        />
                    ))}
            </ul>
        </div>
    );
}
