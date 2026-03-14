import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SongContextMenu } from "@components/songList/SongContextMenu";
import { Song } from "../../../src/logic/Song";

describe("SongContextMenu", () => {
    it("should render the reveal in explorer option", () => {
        render(
            <SongContextMenu
                song={new Song("C:\\Music\\song.mp3")}
                x={100}
                y={200}
                onRevealInExplorer={vi.fn()}
                onClose={vi.fn()}
            />
        );
        expect(screen.getByText("Mostrar en el Explorador")).toBeInTheDocument();
    });

    it("should call onRevealInExplorer with the song when option is clicked", async () => {
        const user = userEvent.setup();
        const song = new Song("C:\\Music\\song.mp3");
        const onRevealInExplorer = vi.fn();
        render(
            <SongContextMenu
                song={song}
                x={100}
                y={200}
                onRevealInExplorer={onRevealInExplorer}
                onClose={vi.fn()}
            />
        );
        await user.click(screen.getByText("Mostrar en el Explorador"));
        expect(onRevealInExplorer).toHaveBeenCalledWith(song);
    });

    it("should call onClose after clicking an option", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <SongContextMenu
                song={new Song("song.mp3")}
                x={0}
                y={0}
                onRevealInExplorer={vi.fn()}
                onClose={onClose}
            />
        );
        await user.click(screen.getByText("Mostrar en el Explorador"));
        expect(onClose).toHaveBeenCalled();
    });

    it("should call onClose when Escape is pressed", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <SongContextMenu
                song={new Song("song.mp3")}
                x={0}
                y={0}
                onRevealInExplorer={vi.fn()}
                onClose={onClose}
            />
        );
        await user.keyboard("{Escape}");
        expect(onClose).toHaveBeenCalled();
    });

    it("should call onClose when clicking outside the menu", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <div>
                <SongContextMenu
                    song={new Song("song.mp3")}
                    x={0}
                    y={0}
                    onRevealInExplorer={vi.fn()}
                    onClose={onClose}
                />
                <button>Outside</button>
            </div>
        );
        await user.click(screen.getByText("Outside"));
        expect(onClose).toHaveBeenCalled();
    });
});
