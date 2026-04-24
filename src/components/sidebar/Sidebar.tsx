import { useEffect, useMemo, useState } from "react";
import { SidebarSection } from "./SidebarSection";
import { SidebarFooter } from "./SidebarFooter";
import { LibrarySongItem } from "./LibrarySongItem";
import { TauriFileDialog } from "../../logic/TauriFileDialog";
import { getLibraryPathFromSettings, saveLibraryPathToSettings } from "../../logic/UserSettingsStore";
import { scanLibraryAudioFiles } from "../../logic/LibraryScanner";
import { getFileName } from "../../utils/formatting";

interface SidebarProps {
    onAddToPlaylist?: (path: string) => void;
    onAddToStart?: (path: string) => void;
    onAddAfterSelected?: (path: string) => void;
}

export function Sidebar({ onAddToPlaylist, onAddToStart, onAddAfterSelected }: SidebarProps = {}) {
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

    const libraryIcon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
    );

    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <SidebarSection
                    title="Biblioteca"
                    icon={libraryIcon}
                    onAddClick={handleLibraryAddClick}
                    selectedItem={libraryPath ? getFileName(libraryPath) : null}
                    onRefreshClick={libraryPath ? handleLibraryRefresh : undefined}
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
                            <LibrarySongItem
                                key={songPath}
                                path={songPath}
                                onAddToPlaylist={onAddToPlaylist}
                                onAddToStart={onAddToStart}
                                onAddAfterSelected={onAddAfterSelected}
                            />
                        ))}
                </SidebarSection>
            </div>

            <SidebarFooter />
        </aside>
    );
}
