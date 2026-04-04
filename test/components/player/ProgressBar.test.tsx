import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
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
});
