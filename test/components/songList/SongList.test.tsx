import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SongList } from "@components/songList/SongList";
import { Song } from "../../../src/logic/Song";

describe("SongList", () => {
    const mockOnSelectSong = vi.fn();
    const mockOnPlaySong = vi.fn();
    const mockOnLoadPlaylist = vi.fn();

    const defaultProps = {
        playlist: [],
        selectedSong: null,
        playingSong: null,
        isPlaying: false,
        currentPlaylistName: null,
        onSelectSong: mockOnSelectSong,
        onPlaySong: mockOnPlaySong,
        onLoadPlaylist: mockOnLoadPlaylist,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Empty playlist", () => {
        it("should render empty state message when playlist is empty", () => {
            render(<SongList {...defaultProps} />);
            expect(screen.getByText("No hay canciones cargadas.")).toBeInTheDocument();
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
                <SongList {...defaultProps} playlist={[new Song("song1.mp3")]} />
            );
            const table = container.querySelector("table.song-list-table");
            expect(table).toBeTruthy();
        });

        it("should render one row per song in playlist", () => {
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={[new Song("song1.mp3"), new Song("song2.mp3"), new Song("song3.mp3")]}
                />
            );
            const rows = container.querySelectorAll("tr.song-row");
            expect(rows).toHaveLength(3);
        });

        it("should not render empty state when playlist has songs", () => {
            const { container } = render(
                <SongList {...defaultProps} playlist={[new Song("song1.mp3")]} />
            );
            const emptyMessage = container.querySelector("p");
            expect(emptyMessage).not.toBeInTheDocument();
        });
    });

    describe("Remove song", () => {
        it("should disable 'Eliminar de la lista' for the loaded song even when playback is paused", async () => {
            const { default: userEvent } = await import("@testing-library/user-event");
            const user = userEvent.setup();
            const song = new Song("song.mp3");
            render(
                <SongList
                    {...defaultProps}
                    playlist={[song]}
                    playingSong={song}
                    isPlaying={false}
                    onRemoveSong={vi.fn()}
                />
            );
            const row = screen.getByText("song.mp3").closest("tr");
            await user.pointer([{ keys: "[MouseRight]", target: row! }]);
            const item = screen.getByText("Eliminar de la lista").closest("li");
            expect(item?.className).toContain("disabled");
        });
    });

    describe("Complex interactions", () => {
        it("should correctly render playing and selected different songs", () => {
            const song1 = new Song("song1.mp3");
            const song2 = new Song("song2.mp3");
            const { container } = render(
                <SongList
                    {...defaultProps}
                    playlist={[song1, song2]}
                    selectedSong={song1}
                    playingSong={song2}
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
