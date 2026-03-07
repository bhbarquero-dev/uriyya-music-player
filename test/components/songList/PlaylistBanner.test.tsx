import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaylistBanner } from "@components/songList/PlaylistBanner";

describe("PlaylistBanner", () => {
    const mockOnLoadPlaylist = vi.fn();
    const mockOnChangePlaylist = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Without playlist", () => {
        it("should render load button when currentPlaylistName is null", () => {
            render(
                <PlaylistBanner currentPlaylistName={null} onLoadPlaylist={mockOnLoadPlaylist} onChangePlaylist={mockOnChangePlaylist} />
            );
            expect(screen.getByRole("button", { name: /cargar lista de reproducción/i })).toBeInTheDocument();
        });

        it("should not render playlist name when currentPlaylistName is null", () => {
            const { container } = render(
                <PlaylistBanner currentPlaylistName={null} onLoadPlaylist={mockOnLoadPlaylist} onChangePlaylist={mockOnChangePlaylist} />
            );
            expect(container.querySelector(".playlist-banner-name")).not.toBeInTheDocument();
        });

        it("should call onLoadPlaylist when button is clicked", async () => {
            const user = userEvent.setup();
            render(
                <PlaylistBanner currentPlaylistName={null} onLoadPlaylist={mockOnLoadPlaylist} onChangePlaylist={mockOnChangePlaylist} />
            );
            await user.click(screen.getByRole("button", { name: /cargar lista de reproducción/i }));
            expect(mockOnLoadPlaylist).toHaveBeenCalledOnce();
        });
    });

    describe("With playlist", () => {
        it("should render playlist name when currentPlaylistName is provided", () => {
            render(
                <PlaylistBanner currentPlaylistName="Mi Playlist" onLoadPlaylist={mockOnLoadPlaylist} onChangePlaylist={mockOnChangePlaylist} />
            );
            expect(screen.getByText("Mi Playlist")).toBeInTheDocument();
        });

        it("should render change button when currentPlaylistName is provided", () => {
            render(
                <PlaylistBanner currentPlaylistName="Mi Playlist" onLoadPlaylist={mockOnLoadPlaylist} onChangePlaylist={mockOnChangePlaylist} />
            );
            expect(screen.getByRole("button", { name: /cambiar/i })).toBeInTheDocument();
        });

        it("should not render load button when currentPlaylistName is provided", () => {
            render(
                <PlaylistBanner currentPlaylistName="Mi Playlist" onLoadPlaylist={mockOnLoadPlaylist} onChangePlaylist={mockOnChangePlaylist} />
            );
            expect(screen.queryByRole("button", { name: /cargar lista de reproducción/i })).not.toBeInTheDocument();
        });

        it("should call onChangePlaylist when change button is clicked", async () => {
            const user = userEvent.setup();
            render(
                <PlaylistBanner currentPlaylistName="Mi Playlist" onLoadPlaylist={mockOnLoadPlaylist} onChangePlaylist={mockOnChangePlaylist} />
            );
            await user.click(screen.getByRole("button", { name: /cambiar/i }));
            expect(mockOnChangePlaylist).toHaveBeenCalledOnce();
        });
    });
});
