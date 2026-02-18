import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaylistMenu } from "@components/sidebar/PlaylistMenu";
import { SIDEBAR_ITEMS } from "../../../src/types/sidebar";

describe("PlaylistMenu", () => {
    const mockOnSelectItem = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should not render anything when currentPlaylistName is null", () => {
        const { container } = render(
            <PlaylistMenu
                currentPlaylistName={null}
                activeItem=""
                onSelectItem={mockOnSelectItem}
            />
        );
        const items = container.querySelectorAll("li");
        expect(items).toHaveLength(0);
    });

    it("should render playlist item when currentPlaylistName exists", () => {
        render(
            <PlaylistMenu
                currentPlaylistName="My Playlist"
                activeItem=""
                onSelectItem={mockOnSelectItem}
            />
        );
        expect(screen.getByText("My Playlist")).toBeInTheDocument();
    });

    it("should apply active class when activeItem is 'playlist'", () => {
        const { container } = render(
            <PlaylistMenu
                currentPlaylistName="My Playlist"
                activeItem={SIDEBAR_ITEMS.PLAYLIST}
                onSelectItem={mockOnSelectItem}
            />
        );
        const item = container.querySelector(".sidebar-item");
        expect(item?.className).toContain("active");
    });

    it("should not apply active class when activeItem is not 'playlist'", () => {
        const { container } = render(
            <PlaylistMenu
                currentPlaylistName="My Playlist"
                activeItem=""
                onSelectItem={mockOnSelectItem}
            />
        );
        const item = container.querySelector(".sidebar-item");
        expect(item?.className).not.toContain("active");
    });

    it("should call onSelectItem with 'playlist' when item is clicked", async () => {
        const user = userEvent.setup();
        render(
            <PlaylistMenu
                currentPlaylistName="My Playlist"
                activeItem=""
                onSelectItem={mockOnSelectItem}
            />
        );
        const item = screen.getByText("My Playlist");
        await user.click(item);
        expect(mockOnSelectItem).toHaveBeenCalledWith("playlist");
    });
});
