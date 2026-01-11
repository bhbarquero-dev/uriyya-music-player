import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ProgressBar } from "@components/player";

describe("ProgressBar", () => {
    it("should render progress bar container", () => {
        const { container } = render(<ProgressBar playedPercent={0} />);
        const progressContainer = container.querySelector(".progress-container");
        expect(progressContainer).toBeTruthy();
    });

    it("should set progress bar width to playedPercent", () => {
        const { container } = render(<ProgressBar playedPercent={50} />);
        const progressBar = container.querySelector(".progress-bar");
        expect(progressBar).toHaveStyle("width: 50%");
    });

    it("should clamp progress to 0 when negative", () => {
        const { container } = render(<ProgressBar playedPercent={-10} />);
        const progressBar = container.querySelector(".progress-bar");
        expect(progressBar).toHaveStyle("width: 0%");
    });

    it("should clamp progress to 100 when over", () => {
        const { container } = render(<ProgressBar playedPercent={150} />);
        const progressBar = container.querySelector(".progress-bar");
        expect(progressBar).toHaveStyle("width: 100%");
    });

    it("should set progress to 0 for NaN", () => {
        const { container } = render(<ProgressBar playedPercent={NaN} />);
        const progressBar = container.querySelector(".progress-bar");
        expect(progressBar).toHaveStyle("width: 0%");
    });

    it("should have progress-container with aria-hidden false", () => {
        const { container } = render(<ProgressBar playedPercent={0} />);
        const progressContainer = container.querySelector(".progress-container");
        expect(progressContainer).toHaveAttribute("aria-hidden", "false");
    });
});
