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

    describe("Unsaved changes indicator", () => {
        it("should show an unsaved changes indicator when hasUnsavedChanges is true", () => {
            render(
                <PlaylistBanner
                    currentPlaylistName="Mi Playlist"
                    onLoadPlaylist={mockOnLoadPlaylist}
                    hasUnsavedChanges={true}
                />
            );
            expect(screen.getByTitle(/cambios sin guardar/i)).toBeInTheDocument();
        });

        it("should not show an unsaved changes indicator when hasUnsavedChanges is false", () => {
            render(
                <PlaylistBanner
                    currentPlaylistName="Mi Playlist"
                    onLoadPlaylist={mockOnLoadPlaylist}
                    hasUnsavedChanges={false}
                />
            );
            expect(screen.queryByTitle(/cambios sin guardar/i)).not.toBeInTheDocument();
        });

        it("should not show an unsaved changes indicator when hasUnsavedChanges is not provided", () => {
            render(
                <PlaylistBanner
                    currentPlaylistName="Mi Playlist"
                    onLoadPlaylist={mockOnLoadPlaylist}
                />
            );
            expect(screen.queryByTitle(/cambios sin guardar/i)).not.toBeInTheDocument();
        });

        it("should not show the indicator when there is no playlist loaded", () => {
            render(
                <PlaylistBanner
                    currentPlaylistName={null}
                    onLoadPlaylist={mockOnLoadPlaylist}
                    hasUnsavedChanges={true}
                />
            );
            expect(screen.queryByTitle(/cambios sin guardar/i)).not.toBeInTheDocument();
        });
    });

    describe("Disabled state (playback active)", () => {
        it("should disable the load button when disabled is true", () => {
            render(
                <PlaylistBanner
                    currentPlaylistName={null}
                    onLoadPlaylist={mockOnLoadPlaylist}
                    disabled={true}
                />
            );
            expect(screen.getByRole("button", { name: /cargar lista de reproducción/i })).toBeDisabled();
        });

        it("should disable the change button when disabled is true", () => {
            render(
                <PlaylistBanner
                    currentPlaylistName="Mi Playlist"
                    onLoadPlaylist={mockOnLoadPlaylist}
                    onChangePlaylist={mockOnChangePlaylist}
                    disabled={true}
                />
            );
            expect(screen.getByRole("button", { name: /cambiar lista de reproducción/i })).toBeDisabled();
        });

        it("should not call onLoadPlaylist when load button is disabled", async () => {
            const user = userEvent.setup();
            render(
                <PlaylistBanner
                    currentPlaylistName={null}
                    onLoadPlaylist={mockOnLoadPlaylist}
                    disabled={true}
                />
            );
            await user.click(screen.getByRole("button", { name: /cargar lista de reproducción/i }));
            expect(mockOnLoadPlaylist).not.toHaveBeenCalled();
        });

        it("should not call onChangePlaylist when change button is disabled", async () => {
            const user = userEvent.setup();
            render(
                <PlaylistBanner
                    currentPlaylistName="Mi Playlist"
                    onLoadPlaylist={mockOnLoadPlaylist}
                    onChangePlaylist={mockOnChangePlaylist}
                    disabled={true}
                />
            );
            await user.click(screen.getByRole("button", { name: /cambiar lista de reproducción/i }));
            expect(mockOnChangePlaylist).not.toHaveBeenCalled();
        });

        it("should show a tooltip on the load button when disabled", () => {
            render(
                <PlaylistBanner
                    currentPlaylistName={null}
                    onLoadPlaylist={mockOnLoadPlaylist}
                    disabled={true}
                />
            );
            expect(screen.getByRole("button", { name: /cargar lista de reproducción/i })).toHaveAttribute("title");
        });

        it("should not disable buttons when disabled is false", () => {
            render(
                <PlaylistBanner
                    currentPlaylistName="Mi Playlist"
                    onLoadPlaylist={mockOnLoadPlaylist}
                    onChangePlaylist={mockOnChangePlaylist}
                    disabled={false}
                />
            );
            expect(screen.getByRole("button", { name: /cambiar lista de reproducción/i })).not.toBeDisabled();
        });
    });
});
