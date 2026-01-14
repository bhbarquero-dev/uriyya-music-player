import { useEffect } from "react";
import { Sidebar } from "@components/sidebar";
import { Player } from "@components/player";
import { SongList } from "@components/songList";
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
    activeSidebarItem,
    setActiveSidebarItem,
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

      <Sidebar
        onLoadPlaylist={loadPlaylist}
        currentPlaylistName={currentPlaylistName}
        activeItem={activeSidebarItem}
        onSelectItem={setActiveSidebarItem}
      />

      <SongList
        playlist={playlist}
        selectedSong={selectedSong}
        playingSong={playingSong}
        isPlaying={isPlaying}
        onSelectSong={setSelectedSong}
        onPlaySong={playSong}
      />

      <ShortcutsFooter />
    </div>
  );
}

export default App;
