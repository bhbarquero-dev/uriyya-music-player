import { useEffect, useCallback, useState, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { Sidebar } from "@components/sidebar/Sidebar";
import { Player } from "@components/player/Player";
import { SongList } from "@components/songList/SongList";
import { ShortcutsFooter } from "@components/ShortcutsFooter";
import { ConfirmDialog } from "@components/common/ConfirmDialog";
import { useMusicPlayer } from "./hooks/useMusicPlayer";
import { Song } from "./logic/Song";
import "./App.css";

type DialogConfig = {
  onSave: () => void;
  onDiscard: () => void;
};

function App() {
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const {
    playlist,
    currentPlaylistName,
    currentPlaylistPath,
    selectedSong,
    hasUnsavedChanges,
    playingSong,
    isPlaying,
    isStopping,
    setSelectedSong,
    loadPlaylist,
    saveCurrentPlaylist,
    playSong,
    playCurrentSelected,
    pause,
    stop,
    removeSong,
    selectNextInList,
    selectPreviousInList,
    currentTime,
    remaining,
    playedPercent
  } = useMusicPlayer();

  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  hasUnsavedChangesRef.current = hasUnsavedChanges;

  const showUnsavedChangesDialogRef = useRef<((onProceed: () => Promise<void> | void) => void) | null>(null);

  const showUnsavedChangesDialog = useCallback((onProceed: () => Promise<void> | void) => {
    setDialogConfig({
      onSave: async () => {
        await saveCurrentPlaylist();
        setDialogConfig(null);
        await onProceed();
      },
      onDiscard: async () => {
        setDialogConfig(null);
        await onProceed();
      },
    });
  }, [saveCurrentPlaylist]);
  showUnsavedChangesDialogRef.current = showUnsavedChangesDialog;

  const handleLoadPlaylist = useCallback(async () => {
    try {
      await loadPlaylist();
    } catch (error) {
      console.error("Failed to load playlist:", error);
    }
  }, [loadPlaylist]);

  const handleChangePlaylist = useCallback(async () => {
    if (hasUnsavedChanges) {
      showUnsavedChangesDialog(async () => {
        try {
          await loadPlaylist();
        } catch (error) {
          console.error("Failed to change playlist:", error);
        }
      });
    } else {
      try {
        await loadPlaylist();
      } catch (error) {
        console.error("Failed to change playlist:", error);
      }
    }
  }, [hasUnsavedChanges, loadPlaylist, showUnsavedChangesDialog]);

  const handleRevealInExplorer = useCallback(async (song: Song) => {
    try {
      await revealItemInDir(song.getPath());
    } catch (error) {
      console.error("Failed to reveal in explorer:", error);
    }
  }, []);

  const handleRemoveSong = useCallback((song: Song) => {
    removeSong(song);
  }, [removeSong]);

  const toggleSidebar = useCallback(() => setIsSidebarCompact(prev => !prev), []);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let cancelled = false;

    try {
      const win = getCurrentWindow();
      win.onCloseRequested((event) => {
        if (hasUnsavedChangesRef.current) {
          event.preventDefault();
          showUnsavedChangesDialogRef.current?.(async () => {
            await win.destroy();
          });
        }
      }).then(fn => {
        if (cancelled) {
          fn();
        } else {
          unlisten = fn;
        }
      });
    } catch {
      // Not running in a Tauri context (e.g., browser-based e2e tests)
    }

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "p") {
        playCurrentSelected();
      } else if (e.code === "Space") {
        e.preventDefault();
        pause();
      } else if (key === "s") {
        stop();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        selectNextInList();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectPreviousInList();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playCurrentSelected, pause, stop, selectNextInList, selectPreviousInList]);

  return (
    <div className={`app-container ${isSidebarCompact ? 'sidebar-compact-mode' : ''}`}>
      <Player
        playingSong={playingSong}
        isPlaying={isPlaying}
        isStopping={isStopping}
        onPlay={playCurrentSelected}
        onPause={pause}
        onStop={stop}
        currentTime={currentTime}
        remaining={remaining}
        playedPercent={playedPercent}
      />

      <Sidebar isCompact={isSidebarCompact} onCollapse={toggleSidebar} />

      <SongList
        playlist={playlist}
        selectedSong={selectedSong}
        playingSong={playingSong}
        isPlaying={isPlaying}
        currentPlaylistName={currentPlaylistName}
        hasUnsavedChanges={hasUnsavedChanges}
        onSelectSong={setSelectedSong}
        onPlaySong={playSong}
        onLoadPlaylist={handleLoadPlaylist}
        onChangePlaylist={handleChangePlaylist}
        onRevealInExplorer={handleRevealInExplorer}
        onRemoveSong={handleRemoveSong}
      />

      {dialogConfig && (
        <ConfirmDialog
          title="Cambios sin guardar"
          message="Tienes cambios sin guardar en la lista de reproducción. ¿Qué deseas hacer antes de continuar?"
          canSave={!!currentPlaylistPath}
          onSave={dialogConfig.onSave}
          onDiscard={dialogConfig.onDiscard}
          onCancel={() => setDialogConfig(null)}
        />
      )}

      <ShortcutsFooter />
    </div>
  );
}

export default App;
