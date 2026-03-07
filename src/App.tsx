import { useEffect, useCallback } from "react";
import { Sidebar } from "@components/sidebar/Sidebar";
import { Player } from "@components/player/Player";
import { SongList } from "@components/songList/SongList";
import { ShortcutsFooter } from "@components/ShortcutsFooter";
import { useMusicPlayer } from "./hooks/useMusicPlayer";
import "./App.css";

function App() {
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
      />

      <Sidebar />

      <SongList
        playlist={playlist}
        selectedSong={selectedSong}
        playingSong={playingSong}
        isPlaying={isPlaying}
        currentPlaylistName={currentPlaylistName}
        onSelectSong={setSelectedSong}
        onPlaySong={playSong}
        onLoadPlaylist={handleLoadPlaylist}
      />

      <ShortcutsFooter />
    </div>
  );
}

export default App;
