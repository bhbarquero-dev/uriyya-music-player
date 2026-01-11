import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerControls } from "@components/player";

describe("PlayerControls", () => {
    const mockOnPlay = vi.fn();
    const mockOnPause = vi.fn();
    const mockOnStop = vi.fn();

    const defaultProps = {
        isPlaying: false,
        onPlay: mockOnPlay,
        onPause: mockOnPause,
        onStop: mockOnStop,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render three control buttons", () => {
        render(<PlayerControls {...defaultProps} />);
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(3);
    });

    it("should have correct button titles", () => {
        render(<PlayerControls {...defaultProps} />);
        const buttons = screen.getAllByRole("button");
        expect(buttons[0]).toHaveAttribute("title", "Detener (S)");
        expect(buttons[1]).toHaveAttribute("title", "Reproducir (P)");
        expect(buttons[2]).toHaveAttribute("title", "Pausar (Espacio)");
    });

    it("should disable stop button when not playing", () => {
        render(<PlayerControls {...defaultProps} isPlaying={false} />);
        const buttons = screen.getAllByRole("button");
        const stopBtn = buttons[0];
        expect(stopBtn).toBeDisabled();
    });

    it("should enable stop button when playing", () => {
        render(<PlayerControls {...defaultProps} isPlaying={true} />);
        const buttons = screen.getAllByRole("button");
        const stopBtn = buttons[0];
        expect(stopBtn).not.toBeDisabled();
    });

    it("should disable play button when playing", () => {
        render(<PlayerControls {...defaultProps} isPlaying={true} />);
        const buttons = screen.getAllByRole("button");
        const playBtn = buttons[1];
        expect(playBtn).toBeDisabled();
    });

    it("should enable play button when not playing", () => {
        render(<PlayerControls {...defaultProps} isPlaying={false} />);
        const buttons = screen.getAllByRole("button");
        const playBtn = buttons[1];
        expect(playBtn).not.toBeDisabled();
    });

    it("should disable pause button when not playing", () => {
        render(<PlayerControls {...defaultProps} isPlaying={false} />);
        const buttons = screen.getAllByRole("button");
        const pauseBtn = buttons[2];
        expect(pauseBtn).toBeDisabled();
    });

    it("should enable pause button when playing", () => {
        render(<PlayerControls {...defaultProps} isPlaying={true} />);
        const buttons = screen.getAllByRole("button");
        const pauseBtn = buttons[2];
        expect(pauseBtn).not.toBeDisabled();
    });

    it("should call onStop when stop button is clicked", async () => {
        const user = userEvent.setup();
        render(<PlayerControls {...defaultProps} isPlaying={true} />);
        const buttons = screen.getAllByRole("button");
        const stopBtn = buttons[0];
        await user.click(stopBtn);
        expect(mockOnStop).toHaveBeenCalledOnce();
    });

    it("should call onPlay when play button is clicked", async () => {
        const user = userEvent.setup();
        render(<PlayerControls {...defaultProps} />);
        const buttons = screen.getAllByRole("button");
        const playBtn = buttons[1];
        await user.click(playBtn);
        expect(mockOnPlay).toHaveBeenCalledOnce();
    });

    it("should call onPause when pause button is clicked", async () => {
        const user = userEvent.setup();
        render(<PlayerControls {...defaultProps} isPlaying={true} />);
        const buttons = screen.getAllByRole("button");
        const pauseBtn = buttons[2];
        await user.click(pauseBtn);
        expect(mockOnPause).toHaveBeenCalledOnce();
    });
});
