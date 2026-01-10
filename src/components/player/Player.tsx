import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { TimeDisplay } from "./TimeDisplay";
import { getFileName } from "../../utils/formatting";

interface PlayerProps {
    playingSong: string | null;
    isPlaying: boolean;
    isStopping: boolean;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    currentTime: number;
    remaining: number | null;
    playedPercent: number;
}

export function Player({ playingSong, isPlaying, isStopping, onPlay, onPause, onStop, currentTime, remaining, playedPercent }: PlayerProps) {
    return (
        <header className="player-header">
            <PlayerControls isPlaying={isPlaying} onPlay={onPlay} onPause={onPause} onStop={onStop} />

            <div className="player-info">
                <div className="song-name">
                    {playingSong
                        ? getFileName(playingSong)
                        : (isStopping ? "Deteniendo..." : "Sin reproducción")}
                </div>

                <ProgressBar playedPercent={playedPercent} />

                <TimeDisplay currentTime={currentTime} remaining={remaining} />
            </div>
        </header>
    );
}
