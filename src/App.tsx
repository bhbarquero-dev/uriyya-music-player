import { useEffect, useCallback, useState } from "react";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { Sidebar } from "@components/sidebar/Sidebar";
import { Player } from "@components/player/Player";
import { SongList } from "@components/songList/SongList";
import { ShortcutsFooter } from "@components/ShortcutsFooter";
import { useMusicPlayer } from "./hooks/useMusicPlayer";
import { Song } from "./logic/Song";
import "./App.css";

function App() {
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  const {
    playlist,
    currentPlaylistName,
    selectedSong,
    playingSong,
    isPlaying,
    isStopping,
    setSelectedSong,
    loadPlaylist,
    playSong,
    playCurrentSelected,
    pause,
    stop,
    selectNextInList,
    selectPreviousInList,
    currentTime,
    remaining,
    playedPercent
  } = useMusicPlayer();

  const handleLoadPlaylist = useCallback(async () => {
    try {
      await loadPlaylist();
    } catch (error) {
      console.error("Failed to load playlist:", error);
    }
  }, [loadPlaylist]);

  const handleChangePlaylist = useCallback(async () => {
    try {
      await loadPlaylist();
    } catch (error) {
      console.error("Failed to change playlist:", error);
    }
  }, [loadPlaylist]);

  const handleRevealInExplorer = useCallback(async (song: Song) => {
    try {
      await revealItemInDir(song.getPath());
    } catch (error) {
      console.error("Failed to reveal in explorer:", error);
    }
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

      <Sidebar onCompactChange={setIsSidebarCompact} />

      <SongList
        playlist={playlist}
        selectedSong={selectedSong}
        playingSong={playingSong}
        isPlaying={isPlaying}
        currentPlaylistName={currentPlaylistName}
        onSelectSong={setSelectedSong}
        onPlaySong={playSong}
        onLoadPlaylist={handleLoadPlaylist}
        onChangePlaylist={handleChangePlaylist}
        onRevealInExplorer={handleRevealInExplorer}
      />

      <ShortcutsFooter />
    </div>
  );
}

export default App;
