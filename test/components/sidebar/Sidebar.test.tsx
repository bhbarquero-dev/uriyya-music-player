import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@components/sidebar/Sidebar";

describe("Sidebar", () => {
    const mockOnLoadPlaylist = vi.fn();
    const mockOnSelectItem = vi.fn();

    const defaultProps = {
        onLoadPlaylist: mockOnLoadPlaylist,
        currentPlaylistName: null,
        activeItem: "",
        onSelectItem: mockOnSelectItem,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Structure", () => {
        it("should render aside element with sidebar class", () => {
            const { container } = render(<Sidebar {...defaultProps} />);
            const aside = container.querySelector("aside.sidebar");
            expect(aside).toBeTruthy();
        });

        it("should render two sidebar sections", () => {
            const { container } = render(<Sidebar {...defaultProps} />);
            const sections = container.querySelectorAll(".sidebar-section");
            expect(sections).toHaveLength(2);
        });

        it("should render sidebar footer with version and credits", () => {
            render(<Sidebar {...defaultProps} />);
            expect(screen.getByText("Uriyya Music Player v0.1.0")).toBeInTheDocument();
            expect(screen.getByText(/Hecho con ❤️ por/)).toBeInTheDocument();
            expect(screen.getByRole("link", { name: /bhbarquero-dev/ })).toBeInTheDocument();
        });
    });

    describe("Biblioteca section", () => {
        it("should display 'Biblioteca' title", () => {
            render(<Sidebar {...defaultProps} />);
            expect(screen.getByText("Biblioteca")).toBeInTheDocument();
        });

        it("should render SVG in biblioteca button", () => {
            const { container } = render(<Sidebar {...defaultProps} />);
            const svgs = container.querySelectorAll("svg");
            expect(svgs.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("Listas de reproducción section", () => {
        it("should display 'Listas de reproducción' title", () => {
            render(<Sidebar {...defaultProps} />);
            expect(screen.getByText("Listas de reproducción")).toBeInTheDocument();
        });

        it("should not render playlist item when currentPlaylistName is null", () => {
            const { container } = render(<Sidebar {...defaultProps} />);
            const playlistItems = container.querySelectorAll(".sidebar-item");
            expect(playlistItems).toHaveLength(0);
        });

        it("should render playlist item when currentPlaylistName has value", () => {
            render(
                <Sidebar
                    {...defaultProps}
                    currentPlaylistName="Mi Playlist"
                />
            );
            expect(screen.getByText("Mi Playlist")).toBeInTheDocument();
        });

        it("should apply 'active' class when activeItem is 'playlist'", () => {
            const { container } = render(
                <Sidebar
                    {...defaultProps}
                    currentPlaylistName="Mi Playlist"
                    activeItem="playlist"
                />
            );
            const playlistItem = container.querySelector(".sidebar-item");
            expect(playlistItem?.className).toContain("active");
        });

        it("should not apply 'active' class when activeItem is not 'playlist'", () => {
            const { container } = render(
                <Sidebar
                    {...defaultProps}
                    currentPlaylistName="Mi Playlist"
                    activeItem="other"
                />
            );
            const playlistItem = container.querySelector(".sidebar-item");
            expect(playlistItem?.className).not.toContain("active");
        });
    });

    describe("Footer", () => {
        it("should have valid github link in footer", () => {
            render(<Sidebar {...defaultProps} />);
            const link = screen.getByRole("link", { name: /bhbarquero-dev/ });
            expect(link).toHaveAttribute("href", "https://github.com/bhbarquero-dev");
        });
    });
});
