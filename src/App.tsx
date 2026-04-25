import { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { message } from "@tauri-apps/plugin-dialog";
import { Sidebar } from "@components/sidebar/Sidebar";
import { Player } from "@components/player/Player";
import { SongList } from "@components/songList/SongList";
import { ConfirmDialog } from "@components/common/ConfirmDialog";
import { useMusicPlayer } from "./hooks/useMusicPlayer";
import { Song } from "./logic/Song";
import { Library } from "./logic/Library";
import { TauriFileDialog } from "./logic/TauriFileDialog";
import "./App.css";

type DialogConfig = {
  onSave: () => void;
  onDiscard: () => void;
};

function App() {
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const libraryStore = useMemo(() => new Library(new TauriFileDialog()), []);
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
    addSong,
    addSongAtStart,
    insertSongAfter,
    moveSong,
    removeSong,
    selectNextInList,
    selectPreviousInList,
    currentTime,
    remaining,
    playedPercent,
    seekToFraction
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
      await message(String(error), { title: "Error al cargar la lista", kind: "error" });
    }
  }, [loadPlaylist]);

  const handleChangePlaylist = useCallback(async () => {
    if (playingSong !== null) return;
    if (hasUnsavedChanges) {
      showUnsavedChangesDialog(async () => {
        try {
          await loadPlaylist();
        } catch (error) {
          console.error("Failed to change playlist:", error);
          await message(String(error), { title: "Error al cargar la lista", kind: "error" });
        }
      });
    } else {
      try {
        await loadPlaylist();
      } catch (error) {
        console.error("Failed to change playlist:", error);
        await message(String(error), { title: "Error al cargar la lista", kind: "error" });
      }
    }
  }, [playingSong, hasUnsavedChanges, loadPlaylist, showUnsavedChangesDialog]);

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

  const handleAddLibrarySong = useCallback((path: string) => {
    addSong(new Song(path));
  }, [addSong]);

  const handleAddLibrarySongAtStart = useCallback((path: string) => {
    addSongAtStart(new Song(path));
  }, [addSongAtStart]);

  const handleAddLibrarySongAfterSelected = useCallback((path: string) => {
    if (!selectedSong) return;
    insertSongAfter(selectedSong, new Song(path));
  }, [insertSongAfter, selectedSong]);

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
    const isTypingInTextField = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const tagName = target.tagName.toLowerCase();
      return tagName === "input" || tagName === "textarea";
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingInTextField(e.target)) {
        return;
      }

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
    <div className="app-container">
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
        onSeek={seekToFraction}
      />

      <Sidebar
        store={libraryStore}
        onAddToPlaylist={currentPlaylistPath ? handleAddLibrarySong : undefined}
        onAddToStart={currentPlaylistPath ? handleAddLibrarySongAtStart : undefined}
        onAddAfterSelected={selectedSong ? handleAddLibrarySongAfterSelected : undefined}
      />

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
        onMoveSong={moveSong}
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

    </div>
  );
}

export default App;
