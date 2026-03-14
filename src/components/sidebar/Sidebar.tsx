import { useEffect, useMemo, useState } from "react";
import { SidebarSection } from "./SidebarSection";
import { SidebarFooter } from "./SidebarFooter";
import { TauriFileDialog } from "../../logic/TauriFileDialog";
import { getLibraryPathFromSettings, saveLibraryPathToSettings } from "../../logic/UserSettingsStore";
import { scanLibraryAudioFiles } from "../../logic/LibraryScanner";

function getDirectoryName(path: string): string {
    return path.split(/[\\/]/).pop() || path;
}

function getFileName(path: string): string {
    return path.split(/[\\/]/).pop() || path;
}

interface SidebarProps {
    onCompactChange?: (isCompact: boolean) => void;
}

export function Sidebar({ onCompactChange }: SidebarProps = {}) {
    const [libraryPath, setLibraryPath] = useState<string | null>(null);
    const [librarySongs, setLibrarySongs] = useState<string[]>([]);
    const [isScanningLibrary, setIsScanningLibrary] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCompact, setIsCompact] = useState(false);
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

    const toggleCompact = () => {
        setIsCompact((prev) => {
            const newValue = !prev;
            onCompactChange?.(newValue);
            return newValue;
        });
    };

    return (
        <aside className={`sidebar ${isCompact ? 'sidebar-compact' : ''}`}>
            {isCompact ? (
                <button className="sidebar-expand-btn" onClick={toggleCompact} title="Expandir sidebar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>
            ) : (
                <>
                    <div className="sidebar-content">
                        <SidebarSection
                            title="Biblioteca"
                            onAddClick={handleLibraryAddClick}
                            selectedItem={libraryPath ? getDirectoryName(libraryPath) : null}
                            onRefreshClick={libraryPath ? handleLibraryRefresh : undefined}
                            onCollapseClick={toggleCompact}
                            searchComponent={
                                libraryPath && !isScanningLibrary && librarySongs.length > 0 ? (
                                    <div className="sidebar-search">
                                        <input
                                            type="text"
                                            className="sidebar-search-input"
                                            placeholder="Buscar canciones..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                ) : undefined
                            }
                        >
                            {isScanningLibrary && <li className="sidebar-library-item">Buscando canciones...</li>}
                            {!isScanningLibrary && libraryPath && librarySongs.length === 0 && (
                                <li className="sidebar-library-item">No se encontraron archivos .mp3 o .wav</li>
                            )}
                            {!isScanningLibrary && filteredSongs.length === 0 && librarySongs.length > 0 && (
                                <li className="sidebar-library-item">No hay canciones que coincidan con "<strong>{searchQuery}</strong>"</li>
                            )}
                            {!isScanningLibrary &&
                                filteredSongs.map((songPath) => (
                                    <li key={songPath} className="sidebar-library-item" title={songPath}>
                                        {getFileName(songPath)}
                                    </li>
                                ))}
                        </SidebarSection>
                    </div>

                    <SidebarFooter />
                </>
            )}
        </aside>
    );
}
