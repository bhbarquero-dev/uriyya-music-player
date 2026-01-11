import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TimeDisplay } from "@components/player";

describe("TimeDisplay", () => {
    it("should display elapsed time", () => {
        const { container } = render(<TimeDisplay currentTime={65} remaining={null} />);
        const elapsed = container.querySelector(".elapsed");
        expect(elapsed?.textContent).toBe("1:05");
    });

    it("should display remaining time", () => {
        const { container } = render(<TimeDisplay currentTime={0} remaining={65} />);
        const remaining = container.querySelector(".remaining");
        expect(remaining?.textContent).toBe("-1:05");
    });

    it("should show --:-- for elapsed when currentTime is null", () => {
        const { container } = render(<TimeDisplay currentTime={null as any} remaining={null} />);
        const elapsed = container.querySelector(".elapsed");
        expect(elapsed?.textContent).toBe("--:--");
    });

    it("should show --:-- for remaining when null", () => {
        const { container } = render(<TimeDisplay currentTime={0} remaining={null} />);
        const remaining = container.querySelector(".remaining");
        expect(remaining?.textContent).toBe("-:--");
    });

    it("should format 0 seconds correctly", () => {
        const { container } = render(<TimeDisplay currentTime={0} remaining={0} />);
        const elapsed = container.querySelector(".elapsed");
        expect(elapsed?.textContent).toBe("0:00");
    });

    it("should handle Infinity currentTime", () => {
        const { container } = render(<TimeDisplay currentTime={Infinity} remaining={null} />);
        const elapsed = container.querySelector(".elapsed");
        expect(elapsed?.textContent).toBe("--:--");
    });
});
