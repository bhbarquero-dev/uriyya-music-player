import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibrarySongItem } from "@components/sidebar/LibrarySongItem";

const mockRevealItemInDir = vi.fn();

vi.mock("@tauri-apps/plugin-opener", () => ({
    revealItemInDir: (...args: unknown[]) => mockRevealItemInDir(...args),
}));

describe("LibrarySongItem", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render the filename from the path", () => {
        render(
            <ul>
                <LibrarySongItem path={"C:\\Music\\song.mp3"} />
            </ul>
        );
        expect(screen.getByText("song.mp3")).toBeInTheDocument();
    });

    it("should show context menu on right-click", async () => {
        const user = userEvent.setup();
        render(
            <ul>
                <LibrarySongItem path={"C:\\Music\\song.mp3"} />
            </ul>
        );
        const item = screen.getByText("song.mp3");
        await user.pointer([{ keys: "[MouseRight]", target: item }]);
        expect(screen.getByText("Mostrar en el Explorador")).toBeInTheDocument();
    });

    it("should show 'Agregar al final' only when callback is provided", async () => {
        const user = userEvent.setup();
        const onAddToPlaylist = vi.fn();
        render(
            <ul>
                <LibrarySongItem path={"C:\\Music\\song.mp3"} onAddToPlaylist={onAddToPlaylist} />
            </ul>
        );

        await user.pointer([{ keys: "[MouseRight]", target: screen.getByText("song.mp3") }]);

        expect(screen.getByText("Agregar al final")).toBeInTheDocument();
        expect(screen.getByText("Mostrar en el Explorador")).toBeInTheDocument();
    });

    it("should call add callback with the path when 'Agregar al final' is clicked", async () => {
        const user = userEvent.setup();
        const onAddToPlaylist = vi.fn();
        render(
            <ul>
                <LibrarySongItem path={"C:\\Music\\song.mp3"} onAddToPlaylist={onAddToPlaylist} />
            </ul>
        );

        await user.pointer([{ keys: "[MouseRight]", target: screen.getByText("song.mp3") }]);
        await user.click(screen.getByText("Agregar al final"));

        expect(onAddToPlaylist).toHaveBeenCalledWith("C:\\Music\\song.mp3");
        expect(screen.queryByText("Agregar al final")).not.toBeInTheDocument();
    });

    it("should call revealItemInDir with the path when option is clicked", async () => {
        const user = userEvent.setup();
        render(
            <ul>
                <LibrarySongItem path={"C:\\Music\\song.mp3"} />
            </ul>
        );
        const item = screen.getByText("song.mp3");
        await user.pointer([{ keys: "[MouseRight]", target: item }]);
        await user.click(screen.getByText("Mostrar en el Explorador"));
        expect(mockRevealItemInDir).toHaveBeenCalledWith("C:\\Music\\song.mp3");
    });

    it("should dismiss context menu after clicking an option", async () => {
        const user = userEvent.setup();
        render(
            <ul>
                <LibrarySongItem path={"C:\\Music\\song.mp3"} />
            </ul>
        );
        const item = screen.getByText("song.mp3");
        await user.pointer([{ keys: "[MouseRight]", target: item }]);
        await user.click(screen.getByText("Mostrar en el Explorador"));
        expect(screen.queryByText("Mostrar en el Explorador")).not.toBeInTheDocument();
    });

    it("should dismiss context menu on Escape", async () => {
        const user = userEvent.setup();
        render(
            <ul>
                <LibrarySongItem path={"C:\\Music\\song.mp3"} />
            </ul>
        );
        const item = screen.getByText("song.mp3");
        await user.pointer([{ keys: "[MouseRight]", target: item }]);
        await user.keyboard("{Escape}");
        expect(screen.queryByText("Mostrar en el Explorador")).not.toBeInTheDocument();
    });
});
