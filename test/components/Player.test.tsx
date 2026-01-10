import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { Player } from "../../src/components/Player";

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

        it("should render player controls section", () => {
            const { container } = render(<Player {...defaultProps} />);
            const controls = container.querySelector(".player-controls");
            expect(controls).toBeTruthy();
        });

        it("should render player info section", () => {
            const { container } = render(<Player {...defaultProps} />);
            const info = container.querySelector(".player-info");
            expect(info).toBeTruthy();
        });

        it("should render three control buttons", () => {
            render(<Player {...defaultProps} />);
            const buttons = screen.getAllByRole("button");
            expect(buttons).toHaveLength(3);
        });
    });

    describe("Button states and disabling", () => {
        it("should disable stop button when not playing", () => {
            render(<Player {...defaultProps} isPlaying={false} />);
            const buttons = screen.getAllByRole("button");
            const stopBtn = buttons[0];
            expect(stopBtn).toBeDisabled();
        });

        it("should enable stop button when playing", () => {
            render(
                <Player {...defaultProps} isPlaying={true} playingSong="song.mp3" />
            );
            const buttons = screen.getAllByRole("button");
            const stopBtn = buttons[0];
            expect(stopBtn).not.toBeDisabled();
        });

        it("should disable play button when playing", () => {
            render(
                <Player {...defaultProps} isPlaying={true} playingSong="song.mp3" />
            );
            const buttons = screen.getAllByRole("button");
            const playBtn = buttons[1];
            expect(playBtn).toBeDisabled();
        });

        it("should enable play button when not playing", () => {
            render(<Player {...defaultProps} isPlaying={false} />);
            const buttons = screen.getAllByRole("button");
            const playBtn = buttons[1];
            expect(playBtn).not.toBeDisabled();
        });

        it("should disable pause button when not playing", () => {
            render(<Player {...defaultProps} isPlaying={false} />);
            const buttons = screen.getAllByRole("button");
            const pauseBtn = buttons[2];
            expect(pauseBtn).toBeDisabled();
        });

        it("should enable pause button when playing", () => {
            render(
                <Player {...defaultProps} isPlaying={true} playingSong="song.mp3" />
            );
            const buttons = screen.getAllByRole("button");
            const pauseBtn = buttons[2];
            expect(pauseBtn).not.toBeDisabled();
        });
    });

    describe("Button callbacks", () => {
        it("should call onStop when stop button is clicked", async () => {
            const user = userEvent.setup();
            render(
                <Player {...defaultProps} isPlaying={true} playingSong="song.mp3" />
            );
            const buttons = screen.getAllByRole("button");
            const stopBtn = buttons[0];
            await user.click(stopBtn);
            expect(mockOnStop).toHaveBeenCalledOnce();
        });

        it("should call onPlay when play button is clicked", async () => {
            const user = userEvent.setup();
            render(<Player {...defaultProps} />);
            const buttons = screen.getAllByRole("button");
            const playBtn = buttons[1];
            await user.click(playBtn);
            expect(mockOnPlay).toHaveBeenCalledOnce();
        });

        it("should call onPause when pause button is clicked", async () => {
            const user = userEvent.setup();
            render(
                <Player {...defaultProps} isPlaying={true} playingSong="song.mp3" />
            );
            const buttons = screen.getAllByRole("button");
            const pauseBtn = buttons[2];
            await user.click(pauseBtn);
            expect(mockOnPause).toHaveBeenCalledOnce();
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

    describe("Time formatting", () => {
        it("should format 0 seconds as 0:00", () => {
            render(<Player {...defaultProps} currentTime={0} remaining={0} />);
            expect(screen.getByText("0:00")).toBeInTheDocument();
        });

        it("should format 65 seconds as 1:05", () => {
            render(
                <Player {...defaultProps} currentTime={65} remaining={null} />
            );
            const labels = screen.getAllByText(/\d+:\d+/);
            expect(labels.some((el) => el.textContent === "1:05")).toBe(true);
        });

        it("should format single digit seconds with leading zero", () => {
            render(
                <Player {...defaultProps} currentTime={61} remaining={null} />
            );
            const labels = screen.getAllByText(/\d+:\d+/);
            expect(labels.some((el) => el.textContent === "1:01")).toBe(true);
        });

        it("should show --:-- for null currentTime", () => {
            const { container } = render(
                <Player {...defaultProps} currentTime={null as any} remaining={null} />
            );
            const elapsed = container.querySelector(".elapsed");
            expect(elapsed?.textContent).toBe("--:--");
        });

        it("should show --:-- for Infinity currentTime", () => {
            const { container } = render(
                <Player {...defaultProps} currentTime={Infinity} remaining={null} />
            );
            const elapsed = container.querySelector(".elapsed");
            expect(elapsed?.textContent).toBe("--:--");
        });

        it("should show --:-- for remaining when null", () => {
            const { container } = render(
                <Player {...defaultProps} currentTime={0} remaining={null} />
            );
            const remaining = container.querySelector(".remaining");
            expect(remaining?.textContent).toBe("-:--");
        });

        it("should format remaining with minus prefix", () => {
            const { container } = render(
                <Player {...defaultProps} currentTime={0} remaining={65} />
            );
            const remaining = container.querySelector(".remaining");
            expect(remaining?.textContent).toBe("-1:05");
        });
    });

    describe("Progress bar", () => {
        it("should render progress bar container", () => {
            const { container } = render(<Player {...defaultProps} />);
            const progressContainer = container.querySelector(".progress-container");
            expect(progressContainer).toBeTruthy();
        });

        it("should set progress bar width to playedPercent", () => {
            const { container } = render(
                <Player {...defaultProps} playedPercent={50} />
            );
            const progressBar = container.querySelector(".progress-bar");
            expect(progressBar).toHaveStyle("width: 50%");
        });

        it("should clamp progress to 0 when negative", () => {
            const { container } = render(
                <Player {...defaultProps} playedPercent={-10} />
            );
            const progressBar = container.querySelector(".progress-bar");
            expect(progressBar).toHaveStyle("width: 0%");
        });

        it("should clamp progress to 100 when over", () => {
            const { container } = render(
                <Player {...defaultProps} playedPercent={150} />
            );
            const progressBar = container.querySelector(".progress-bar");
            expect(progressBar).toHaveStyle("width: 100%");
        });

        it("should set progress to 0 for NaN", () => {
            const { container } = render(
                <Player {...defaultProps} playedPercent={NaN} />
            );
            const progressBar = container.querySelector(".progress-bar");
            expect(progressBar).toHaveStyle("width: 0%");
        });

        it("should have progress-container with aria-hidden false", () => {
            const { container } = render(<Player {...defaultProps} />);
            const progressContainer = container.querySelector(".progress-container");
            expect(progressContainer).toHaveAttribute("aria-hidden", "false");
        });
    });

    describe("Time labels", () => {
        it("should display elapsed time", () => {
            const { container } = render(
                <Player {...defaultProps} currentTime={65} remaining={null} />
            );
            const elapsed = container.querySelector(".elapsed");
            expect(elapsed?.textContent).toBe("1:05");
        });

        it("should display remaining time", () => {
            const { container } = render(
                <Player {...defaultProps} currentTime={0} remaining={65} />
            );
            const remaining = container.querySelector(".remaining");
            expect(remaining?.textContent).toBe("-1:05");
        });
    });

    describe("Complex scenarios", () => {
        it("should handle playing state transition", async () => {
            const user = userEvent.setup();
            const { rerender } = render(
                <Player {...defaultProps} isPlaying={false} />
            );

            const buttons = screen.getAllByRole("button");
            const playBtn = buttons[1];
            expect(playBtn).not.toBeDisabled();

            await user.click(playBtn);
            expect(mockOnPlay).toHaveBeenCalledOnce();

            rerender(
                <Player
                    {...defaultProps}
                    isPlaying={true}
                    playingSong="song.mp3"
                />
            );

            const updatedButtons = screen.getAllByRole("button");
            const updatedPlayBtn = updatedButtons[1];
            expect(updatedPlayBtn).toBeDisabled();
        });

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
    });

    describe("Button titles and accessibility", () => {
        it("should have correct button titles", () => {
            render(<Player {...defaultProps} />);
            const buttons = screen.getAllByRole("button");
            expect(buttons[0]).toHaveAttribute("title", "Detener (S)");
            expect(buttons[1]).toHaveAttribute("title", "Reproducir (P)");
            expect(buttons[2]).toHaveAttribute("title", "Pausar (Espacio)");
        });
    });
});
