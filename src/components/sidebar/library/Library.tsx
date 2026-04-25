import { useEffect, useMemo, useState } from "react";
import { LibrarySongItem } from "./LibrarySongItem";
import { LibraryHeader } from "./LibraryHeader";
import { LibrarySearch } from "./LibrarySearch";
import { Library as LibraryStore, filterSongs } from "@logic/Library";

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
    const libraryStore = useMemo(() => new LibraryStore(), []);

    useEffect(() => {
        let isMounted = true;

        const loadStoredLibraryPath = async () => {
            const storedPath = await libraryStore.getPath();
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
                const songs = await libraryStore.getSongs();
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
        const selectedPath = await libraryStore.add();
        if (selectedPath) {
            setLibraryPath(selectedPath);
        }
    };

    const handleLibraryRefresh = async () => {
        if (!libraryPath) return;

        setIsScanningLibrary(true);
        try {
            const songs = await libraryStore.getSongs();
            setLibrarySongs(songs);
        } finally {
            setIsScanningLibrary(false);
        }
    };

    const filteredSongs = useMemo(
        () => filterSongs(librarySongs, searchQuery),
        [librarySongs, searchQuery]
    );

    const hasLibrary = libraryStore.hasLibrary();

    return (
        <div className="sidebar-section">
            <LibraryHeader
                selectedLibraryName={ libraryStore.getName()}
                hasLibrary={hasLibrary}
                onAddClick={handleLibraryAddClick}
                onRefreshClick={handleLibraryRefresh}
            />

            {hasLibrary && !isScanningLibrary && librarySongs.length > 0 && (
                <LibrarySearch value={searchQuery} onChange={setSearchQuery} />
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
