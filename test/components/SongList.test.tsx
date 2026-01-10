import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { SongList } from "../../src/components/SongList";

describe("SongList", () => {
    const mockOnSelectSong = vi.fn();
    const mockOnPlaySong = vi.fn();

    const defaultProps = {
        playlist: [],
        selectedSong: null,
        playingSong: null,
        isPlaying: false,
        onSelectSong: mockOnSelectSong,
        onPlaySong: mockOnPlaySong,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Empty playlist", () => {
        it("should render empty state message when playlist is empty", () => {
            render(<SongList {...defaultProps} />);
            expect(screen.getByText("No hay canciones cargadas. Usa la barra lateral para cargar una lista.")).toBeInTheDocument();
        });

        it("should not render table when playlist is empty", () => {
            const { container } = render(<SongList {...defaultProps} />);
            const table = container.querySelector("table");
            expect(table).not.toBeInTheDocument();
        });
    });

    describe("Playlist with songs", () => {
        it("should render table when playlist has songs", () => {
            const { container } = render(
                <SongList {...defaultProps} playlist={["song1.mp3"]} />
            );
            const table = container.querySelector("table.song-list-table");
            expect(table).toBeTruthy();
        });

        it("should render one row per song in playlist", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3", "song2.mp3", "song3.mp3"]}
                />
            );
            const rows = container.querySelectorAll("tr.song-row");
            expect(rows).toHaveLength(3);
        });

        it("should not render empty state when playlist has songs", () => {
            const { container } = render(
                <SongList {...defaultProps} playlist={["song1.mp3"]} />
            );
            const emptyMessage = container.querySelector("p");
            expect(emptyMessage).not.toBeInTheDocument();
        });
    });

    describe("File name extraction", () => {
        it("should extract filename from windows path", () => {
            render(
                <SongList {...defaultProps} playlist={["C:\\Music\\song.mp3"]} />
            );
            expect(screen.getByText("song.mp3")).toBeInTheDocument();
        });

        it("should extract filename from unix path", () => {
            render(
                <SongList {...defaultProps} playlist={["/home/user/music.mp3"]} />
            );
            expect(screen.getByText("music.mp3")).toBeInTheDocument();
        });

        it("should handle plain filename", () => {
            render(
                <SongList {...defaultProps} playlist={["song.mp3"]} />
            );
            expect(screen.getByText("song.mp3")).toBeInTheDocument();
        });

        it("should handle mixed path separators", () => {
            render(
                <SongList {...defaultProps} playlist={["C:/Music\\Audio/track.mp3"]} />
            );
            expect(screen.getByText("track.mp3")).toBeInTheDocument();
        });
    });

    describe("Song selection", () => {
        it("should call onSelectSong when clicking a song row", async () => {
            const user = userEvent.setup();
            render(
                <SongList {...defaultProps} playlist={["song1.mp3"]} />
            );
            const row = screen.getByText("song1.mp3").closest("tr");
            await user.click(row!);
            expect(mockOnSelectSong).toHaveBeenCalledWith("song1.mp3");
        });

        it("should apply 'selected' class when song is selectedSong", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3", "song2.mp3"]}
                    selectedSong="song1.mp3"
                />
            );
            const selectedRow = container.querySelector(".song-row.selected");
            expect(selectedRow?.textContent).toContain("song1.mp3");
        });

        it("should not apply 'selected' class when song is not selectedSong", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3", "song2.mp3"]}
                    selectedSong="song2.mp3"
                />
            );
            const rows = container.querySelectorAll(".song-row");
            const firstRow = rows[0];
            expect(firstRow.className).not.toContain("selected");
        });

        it("should select correct song when multiple songs exist", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3", "song2.mp3", "song3.mp3"]}
                    selectedSong="song2.mp3"
                />
            );
            const selectedRow = container.querySelector(".song-row.selected");
            expect(selectedRow?.textContent).toContain("song2.mp3");
        });
    });

    describe("Song playback", () => {
        it("should call onPlaySong when double clicking a song row", async () => {
            const user = userEvent.setup();
            render(
                <SongList {...defaultProps} playlist={["song1.mp3"]} />
            );
            const row = screen.getByText("song1.mp3").closest("tr");
            await user.dblClick(row!);
            expect(mockOnPlaySong).toHaveBeenCalledWith("song1.mp3");
        });

        it("should not show playing indicator when isPlaying is false", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3"]}
                    playingSong="song1.mp3"
                    isPlaying={false}
                />
            );
            const indicator = container.querySelector(".playing-indicator");
            expect(indicator).not.toBeInTheDocument();
        });

        it("should not show playing indicator when playingSong doesn't match", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3", "song2.mp3"]}
                    playingSong="song1.mp3"
                    isPlaying={true}
                />
            );
            const indicators = container.querySelectorAll(".playing-indicator");
            expect(indicators).toHaveLength(1);
            expect(indicators[0].closest("tr")?.textContent).toContain("song1.mp3");
        });
    });

    describe("Playing indicator", () => {
        it("should show playing indicator when playingSong === song and isPlaying", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3"]}
                    playingSong="song1.mp3"
                    isPlaying={true}
                />
            );
            const indicator = container.querySelector(".playing-indicator");
            expect(indicator).toBeTruthy();
            expect(indicator).toHaveAttribute("title", "Reproduciendo");
        });

        it("should render SVG in playing indicator", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3"]}
                    playingSong="song1.mp3"
                    isPlaying={true}
                />
            );
            const svg = container.querySelector(".playing-indicator svg");
            expect(svg).toBeTruthy();
            expect(svg).toHaveAttribute("width", "14");
            expect(svg).toHaveAttribute("height", "14");
        });

        it("should show indicator only for currently playing song", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3", "song2.mp3", "song3.mp3"]}
                    playingSong="song2.mp3"
                    isPlaying={true}
                />
            );
            const indicators = container.querySelectorAll(".playing-indicator");
            expect(indicators).toHaveLength(1);
            expect(indicators[0].closest("tr")?.textContent).toContain("song2.mp3");
        });

        it("should not show any playing indicator when isPlaying is false", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3", "song2.mp3"]}
                    playingSong="song1.mp3"
                    isPlaying={false}
                />
            );
            const indicators = container.querySelectorAll(".playing-indicator");
            expect(indicators).toHaveLength(0);
        });
    });

    describe("Complex interactions", () => {
        it("should handle multiple operations on same playlist", async () => {
            const user = userEvent.setup();
            const { rerender, container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3", "song2.mp3"]}
                    selectedSong="song1.mp3"
                />
            );

            // Click on song1
            let row = container.querySelector(".song-row.selected");
            await user.click(row!);
            expect(mockOnSelectSong).toHaveBeenCalledWith("song1.mp3");

            // Double click song2
            rerender(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3", "song2.mp3"]}
                    selectedSong="song1.mp3"
                />
            );
            row = screen.getByText("song2.mp3").closest("tr");
            await user.dblClick(row!);
            expect(mockOnPlaySong).toHaveBeenCalledWith("song2.mp3");
        });

        it("should correctly render playing and selected different songs", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={["song1.mp3", "song2.mp3"]}
                    selectedSong="song1.mp3"
                    playingSong="song2.mp3"
                    isPlaying={true}
                />
            );
            const selectedRow = container.querySelector(".song-row.selected");
            const indicator = container.querySelector(".playing-indicator");

            expect(selectedRow?.textContent).toContain("song1.mp3");
            expect(indicator?.closest("tr")?.textContent).toContain("song2.mp3");
        });
    });
});
