import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { TimeDisplay } from "./TimeDisplay";
import { Song } from "../../logic/Song";

interface PlayerProps {
    playingSong: Song | null;
    isPlaying: boolean;
    isStopping: boolean;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    currentTime: number;
    remaining: number | null;
    playedPercent: number;
    onSeek: (fraction: number) => void;
}

export function Player({ playingSong, isPlaying, isStopping, onPlay, onPause, onStop, currentTime, remaining, playedPercent, onSeek }: PlayerProps) {
    return (
        <header className="player-header">
            <PlayerControls isPlaying={isPlaying} onPlay={onPlay} onPause={onPause} onStop={onStop} />

            <div className="player-info">
                <div className="song-name">
                    {playingSong
                        ? playingSong.getDisplayName()
                        : (isStopping ? "Deteniendo..." : "Sin reproducción")}
                </div>

                <ProgressBar playedPercent={playedPercent} onSeek={onSeek} />

                <TimeDisplay currentTime={currentTime} remaining={remaining} />
            </div>
        </header>
    );
}
