import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ProgressBar } from "@components/player/ProgressBar";

describe("ProgressBar", () => {
    const onSeek = vi.fn();

    it("should render progress bar container", () => {
        const { container } = render(<ProgressBar playedPercent={0} onSeek={onSeek} />);
        const progressContainer = container.querySelector(".progress-container");
        expect(progressContainer).toBeTruthy();
    });

    it("should set progress bar width to playedPercent", () => {
        const { container } = render(<ProgressBar playedPercent={50} onSeek={onSeek} />);
        const progressBar = container.querySelector(".progress-bar");
        expect(progressBar).toHaveStyle("width: 50%");
    });

    it("should clamp progress to 0 when negative", () => {
        const { container } = render(<ProgressBar playedPercent={-10} onSeek={onSeek} />);
        const progressBar = container.querySelector(".progress-bar");
        expect(progressBar).toHaveStyle("width: 0%");
    });

    it("should clamp progress to 100 when over", () => {
        const { container } = render(<ProgressBar playedPercent={150} onSeek={onSeek} />);
        const progressBar = container.querySelector(".progress-bar");
        expect(progressBar).toHaveStyle("width: 100%");
    });

    it("should set progress to 0 for NaN", () => {
        const { container } = render(<ProgressBar playedPercent={NaN} onSeek={onSeek} />);
        const progressBar = container.querySelector(".progress-bar");
        expect(progressBar).toHaveStyle("width: 0%");
    });

    describe("click-to-seek", () => {
        const mockOnSeek = vi.fn();

        beforeEach(() => {
            mockOnSeek.mockClear();
        });

        function renderWithRect(left: number, width: number) {
            const { container } = render(<ProgressBar playedPercent={0} onSeek={mockOnSeek} />);
            const el = container.querySelector(".progress-container") as HTMLElement;
            el.getBoundingClientRect = () => ({
                left, width, right: left + width,
                top: 0, bottom: 0, height: 0, x: left, y: 0,
                toJSON: () => ({})
            });
            return el;
        }

        it("should call onSeek with 0.5 when clicking at the midpoint", () => {
            const el = renderWithRect(0, 200);
            fireEvent.click(el, { clientX: 100 });
            expect(mockOnSeek).toHaveBeenCalledOnce();
            expect(mockOnSeek).toHaveBeenCalledWith(0.5);
        });

        it("should call onSeek with 0 when clicking at the left edge", () => {
            const el = renderWithRect(0, 200);
            fireEvent.click(el, { clientX: 0 });
            expect(mockOnSeek).toHaveBeenCalledWith(0);
        });

        it("should call onSeek with 1 when clicking at the right edge", () => {
            const el = renderWithRect(0, 200);
            fireEvent.click(el, { clientX: 200 });
            expect(mockOnSeek).toHaveBeenCalledWith(1);
        });

        it("should clamp to 0 when clicking before the left edge", () => {
            const el = renderWithRect(50, 200);
            fireEvent.click(el, { clientX: 20 });
            expect(mockOnSeek).toHaveBeenCalledWith(0);
        });

        it("should clamp to 1 when clicking past the right edge", () => {
            const el = renderWithRect(0, 200);
            fireEvent.click(el, { clientX: 300 });
            expect(mockOnSeek).toHaveBeenCalledWith(1);
        });

        it("should account for a non-zero left offset", () => {
            const el = renderWithRect(100, 200);
            fireEvent.click(el, { clientX: 200 });
            expect(mockOnSeek).toHaveBeenCalledWith(0.5);
        });
    });
});
