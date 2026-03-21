import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SongRow } from "@components/songList/SongRow";
import { Song } from "../../../src/logic/Song";

describe("SongRow", () => {
    const mockOnSelect = vi.fn();
    const mockOnPlay = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render song row with filename", () => {
        render(
            <SongRow
                song={new Song("C:\\Music\\song.mp3")}
                isSelected={false}
                isPlaying={false}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        expect(screen.getByText("song.mp3")).toBeInTheDocument();
    });

    it("should apply selected class when isSelected is true", () => {
        const { container } = render(
            <SongRow
                song={new Song("song.mp3")}
                isSelected={true}
                isPlaying={false}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        const row = container.querySelector("tr");
        expect(row?.className).toContain("selected");
    });

    it("should not apply selected class when isSelected is false", () => {
        const { container } = render(
            <SongRow
                song={new Song("song.mp3")}
                isSelected={false}
                isPlaying={false}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        const row = container.querySelector("tr");
        expect(row?.className).not.toContain("selected");
    });

    it("should call onSelect when clicked", async () => {
        const user = userEvent.setup();
        const song = new Song("song.mp3");
        render(
            <SongRow
                song={song}
                isSelected={false}
                isPlaying={false}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        const row = screen.getByText("song.mp3").closest("tr");
        await user.click(row!);
        expect(mockOnSelect).toHaveBeenCalledWith(song);
    });

    it("should call onPlay when double clicked", async () => {
        const user = userEvent.setup();
        const song = new Song("song.mp3");
        render(
            <SongRow
                song={song}
                isSelected={false}
                isPlaying={false}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        const row = screen.getByText("song.mp3").closest("tr");
        await user.dblClick(row!);
        expect(mockOnPlay).toHaveBeenCalledWith(song);
    });

    it("should show playing indicator when isPlaying is true", () => {
        const { container } = render(
            <SongRow
                song={new Song("song.mp3")}
                isSelected={false}
                isPlaying={true}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        const indicator = container.querySelector(".playing-indicator");
        expect(indicator).toBeTruthy();
    });

    it("should not show playing indicator when isPlaying is false", () => {
        const { container } = render(
            <SongRow
                song={new Song("song.mp3")}
                isSelected={false}
                isPlaying={false}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        const indicator = container.querySelector(".playing-indicator");
        expect(indicator).not.toBeInTheDocument();
    });

    it("should extract filename from unix path", () => {
        render(
            <SongRow
                song={new Song("/home/user/music.mp3")}
                isSelected={false}
                isPlaying={false}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        expect(screen.getByText("music.mp3")).toBeInTheDocument();
    });

    it("should show invalid indicator for invalid songs", () => {
        const invalidSong = new Song("missing.mp3", false);
        const { container } = render(
            <SongRow
                song={invalidSong}
                isSelected={false}
                isPlaying={false}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        const indicator = container.querySelector(".invalid-indicator");
        expect(indicator).toBeTruthy();
        expect(indicator?.getAttribute("title")).toBe("Archivo no encontrado");
    });

    it("should apply invalid class for invalid songs", () => {
        const invalidSong = new Song("missing.mp3", false);
        const { container } = render(
            <SongRow
                song={invalidSong}
                isSelected={false}
                isPlaying={false}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        const row = container.querySelector("tr");
        expect(row?.className).toContain("invalid");
    });

    it("should prioritize invalid indicator over playing indicator", () => {
        const invalidSong = new Song("missing.mp3", false);
        const { container } = render(
            <SongRow
                song={invalidSong}
                isSelected={false}
                isPlaying={true}
                onSelect={mockOnSelect}
                onPlay={mockOnPlay}
            />
        );
        const invalidIndicator = container.querySelector(".invalid-indicator");
        const playingIndicator = container.querySelector(".playing-indicator");
        expect(invalidIndicator).toBeTruthy();
        expect(playingIndicator).not.toBeInTheDocument();
    });

    describe("Context menu", () => {
        it("should show context menu on right-click when onRevealInExplorer is provided", async () => {
            const user = userEvent.setup();
            render(
                <SongRow
                    song={new Song("song.mp3")}
                    isSelected={false}
                    isPlaying={false}
                    onSelect={mockOnSelect}
                    onPlay={mockOnPlay}
                    onRevealInExplorer={vi.fn()}
                />
            );
            const row = screen.getByText("song.mp3").closest("tr");
            await user.pointer([{ keys: "[MouseRight]", target: row! }]);
            expect(screen.getByText("Mostrar en el Explorador")).toBeInTheDocument();
        });

        it("should not show context menu on right-click when onRevealInExplorer is not provided", async () => {
            const user = userEvent.setup();
            render(
                <SongRow
                    song={new Song("song.mp3")}
                    isSelected={false}
                    isPlaying={false}
                    onSelect={mockOnSelect}
                    onPlay={mockOnPlay}
                />
            );
            const row = screen.getByText("song.mp3").closest("tr");
            await user.pointer([{ keys: "[MouseRight]", target: row! }]);
            expect(screen.queryByText("Mostrar en el Explorador")).not.toBeInTheDocument();
        });

        it("should dismiss context menu after clicking an option", async () => {
            const user = userEvent.setup();
            render(
                <SongRow
                    song={new Song("song.mp3")}
                    isSelected={false}
                    isPlaying={false}
                    onSelect={mockOnSelect}
                    onPlay={mockOnPlay}
                    onRevealInExplorer={vi.fn()}
                />
            );
            const row = screen.getByText("song.mp3").closest("tr");
            await user.pointer([{ keys: "[MouseRight]", target: row! }]);
            await user.click(screen.getByText("Mostrar en el Explorador"));
            expect(screen.queryByText("Mostrar en el Explorador")).not.toBeInTheDocument();
        });

        it("should show context menu with 'Eliminar de la lista' when onRemoveSong is provided", async () => {
            const user = userEvent.setup();
            render(
                <SongRow
                    song={new Song("song.mp3")}
                    isSelected={false}
                    isPlaying={false}
                    onSelect={mockOnSelect}
                    onPlay={mockOnPlay}
                    onRemoveSong={vi.fn()}
                />
            );
            const row = screen.getByText("song.mp3").closest("tr");
            await user.pointer([{ keys: "[MouseRight]", target: row! }]);
            expect(screen.getByText("Eliminar de la lista")).toBeInTheDocument();
        });

        it("should show context menu without onRevealInExplorer when only onRemoveSong is provided", async () => {
            const user = userEvent.setup();
            render(
                <SongRow
                    song={new Song("song.mp3")}
                    isSelected={false}
                    isPlaying={false}
                    onSelect={mockOnSelect}
                    onPlay={mockOnPlay}
                    onRemoveSong={vi.fn()}
                />
            );
            const row = screen.getByText("song.mp3").closest("tr");
            await user.pointer([{ keys: "[MouseRight]", target: row! }]);
            expect(screen.getByText("Eliminar de la lista")).toBeInTheDocument();
            expect(screen.queryByText("Mostrar en el Explorador")).not.toBeInTheDocument();
        });

        it("should call onRemoveSong with the song when Eliminar option is clicked", async () => {
            const user = userEvent.setup();
            const mockOnRemoveSong = vi.fn();
            const song = new Song("song.mp3");
            render(
                <SongRow
                    song={song}
                    isSelected={false}
                    isPlaying={false}
                    onSelect={mockOnSelect}
                    onPlay={mockOnPlay}
                    onRemoveSong={mockOnRemoveSong}
                />
            );
            const row = screen.getByText("song.mp3").closest("tr");
            await user.pointer([{ keys: "[MouseRight]", target: row! }]);
            await user.click(screen.getByText("Eliminar de la lista"));
            expect(mockOnRemoveSong).toHaveBeenCalledWith(song);
        });

        it("should disable 'Eliminar de la lista' when the song is currently playing", async () => {
            const user = userEvent.setup();
            render(
                <SongRow
                    song={new Song("song.mp3")}
                    isSelected={false}
                    isPlaying={false}
                    isPlayingSong={true}
                    onSelect={mockOnSelect}
                    onPlay={mockOnPlay}
                    onRemoveSong={vi.fn()}
                />
            );
            const row = screen.getByText("song.mp3").closest("tr");
            await user.pointer([{ keys: "[MouseRight]", target: row! }]);
            const item = screen.getByText("Eliminar de la lista").closest("li");
            expect(item?.className).toContain("disabled");
        });

        it("should enable 'Eliminar de la lista' when the song is not playing", async () => {
            const user = userEvent.setup();
            render(
                <SongRow
                    song={new Song("song.mp3")}
                    isSelected={false}
                    isPlaying={false}
                    isPlayingSong={false}
                    onSelect={mockOnSelect}
                    onPlay={mockOnPlay}
                    onRemoveSong={vi.fn()}
                />
            );
            const row = screen.getByText("song.mp3").closest("tr");
            await user.pointer([{ keys: "[MouseRight]", target: row! }]);
            const item = screen.getByText("Eliminar de la lista").closest("li");
            expect(item?.className).not.toContain("disabled");
        });

        it("should show both options when both onRemoveSong and onRevealInExplorer are provided", async () => {
            const user = userEvent.setup();
            render(
                <SongRow
                    song={new Song("song.mp3")}
                    isSelected={false}
                    isPlaying={false}
                    onSelect={mockOnSelect}
                    onPlay={mockOnPlay}
                    onRemoveSong={vi.fn()}
                    onRevealInExplorer={vi.fn()}
                />
            );
            const row = screen.getByText("song.mp3").closest("tr");
            await user.pointer([{ keys: "[MouseRight]", target: row! }]);
            expect(screen.getByText("Eliminar de la lista")).toBeInTheDocument();
            expect(screen.getByText("Mostrar en el Explorador")).toBeInTheDocument();
        });
    });
});
