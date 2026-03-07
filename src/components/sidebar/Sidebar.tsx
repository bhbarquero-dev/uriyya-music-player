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

export function Sidebar() {
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
            const songs = await scanLibraryAudioFiles(libraryPath);

            if (isMounted) {
                setLibrarySongs(songs);
                setIsScanningLibrary(false);
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
        const songs = await scanLibraryAudioFiles(libraryPath);
        setLibrarySongs(songs);
        setIsScanningLibrary(false);
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

    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <SidebarSection
                    title="Biblioteca"
                    onAddClick={handleLibraryAddClick}
                    selectedItem={libraryPath ? getDirectoryName(libraryPath) : null}
                    onRefreshClick={libraryPath ? handleLibraryRefresh : undefined}
                >
                    {libraryPath && !isScanningLibrary && librarySongs.length > 0 && (
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
        </aside>
    );
}
