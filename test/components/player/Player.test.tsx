import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Player } from "@components/player";

describe("Player", () => {
    const mockOnPlay = vi.fn();
    const mockOnPause = vi.fn();
    const mockOnStop = vi.fn();

    const defaultProps = {
        playingSong: null,
        isPlaying: false,
        isStopping: false,
        onPlay: mockOnPlay,
        onPause: mockOnPause,
        onStop: mockOnStop,
        currentTime: 0,
        remaining: null,
        playedPercent: 0,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Structure", () => {
        it("should render header with player-header class", () => {
            const { container } = render(<Player {...defaultProps} />);
            const header = container.querySelector("header.player-header");
            expect(header).toBeTruthy();
        });

        it("should render player info section", () => {
            const { container } = render(<Player {...defaultProps} />);
            const info = container.querySelector(".player-info");
            expect(info).toBeTruthy();
        });
    });

    describe("Song name display", () => {
        it("should display filename when playingSong is set", () => {
            render(
                <Player {...defaultProps} playingSong="C:\\Music\\song.mp3" />
            );
            expect(screen.getByText("song.mp3")).toBeInTheDocument();
        });

        it("should extract filename from unix path", () => {
            render(
                <Player {...defaultProps} playingSong="/home/user/music.mp3" />
            );
            expect(screen.getByText("music.mp3")).toBeInTheDocument();
        });

        it("should display 'Sin reproducción' when playingSong is null and not stopping", () => {
            render(
                <Player
                    {...defaultProps}
                    playingSong={null}
                    isStopping={false}
                />
            );
            expect(screen.getByText("Sin reproducción")).toBeInTheDocument();
        });

        it("should display 'Deteniendo...' when isStopping is true", () => {
            render(
                <Player
                    {...defaultProps}
                    playingSong={null}
                    isStopping={true}
                />
            );
            expect(screen.getByText("Deteniendo...")).toBeInTheDocument();
        });

        it("should prefer playingSong over isStopping message", () => {
            render(
                <Player
                    {...defaultProps}
                    playingSong="song.mp3"
                    isStopping={true}
                />
            );
            expect(screen.getByText("song.mp3")).toBeInTheDocument();
            expect(screen.queryByText("Deteniendo...")).not.toBeInTheDocument();
        });
    });

    describe("Complex scenarios", () => {
        it("should update progress while playing", () => {
            const { container, rerender } = render(
                <Player
                    {...defaultProps}
                    isPlaying={true}
                    playingSong="song.mp3"
                    currentTime={0}
                    remaining={180}
                    playedPercent={0}
                />
            );

            let progressBar = container.querySelector(".progress-bar");
            expect(progressBar).toHaveStyle("width: 0%");

            rerender(
                <Player
                    {...defaultProps}
                    isPlaying={true}
                    playingSong="song.mp3"
                    currentTime={90}
                    remaining={90}
                    playedPercent={50}
                />
            );

            progressBar = container.querySelector(".progress-bar");
            expect(progressBar).toHaveStyle("width: 50%");
        });

        it("should correctly render playing and selected different songs", () => {
            const { container } = render(
                <Player
                    {...defaultProps}
                    playingSong="song.mp3"
                    isPlaying={true}
                    currentTime={0}
                    remaining={180}
                    playedPercent={0}
                />
            );
            const progressBar = container.querySelector(".progress-bar");
            expect(progressBar).toBeTruthy();
            expect(screen.getByText("song.mp3")).toBeInTheDocument();
        });
    });
});
