import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SongRow } from "@components/songList";
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
});
