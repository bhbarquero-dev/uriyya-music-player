import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ShortcutsFooter } from "@components/ShortcutsFooter";

describe("ShortcutsFooter", () => {
    it("should render the footer element with correct class", () => {
        const { container } = render(<ShortcutsFooter />);
        const footer = container.querySelector("footer.shortcuts-footer");
        expect(footer).toBeTruthy();
    });

    it("should render all four shortcut items", () => {
        const { container } = render(<ShortcutsFooter />);
        const shortcutItems = container.querySelectorAll(".shortcut-item");
        expect(shortcutItems).toHaveLength(4);
    });

    it("should display Play (P) shortcut", () => {
        render(<ShortcutsFooter />);
        expect(screen.getByText("P")).toBeInTheDocument();
        expect(screen.getByText("Reproducir")).toBeInTheDocument();
    });

    it("should display Stop (S) shortcut", () => {
        render(<ShortcutsFooter />);
        expect(screen.getByText("S")).toBeInTheDocument();
        expect(screen.getByText("Detener")).toBeInTheDocument();
    });

    it("should display Pause (Space) shortcut", () => {
        render(<ShortcutsFooter />);
        expect(screen.getByText("Espacio")).toBeInTheDocument();
        expect(screen.getByText("Pausar")).toBeInTheDocument();
    });

    it("should display Navigation (Up/Down arrows) shortcut", () => {
        render(<ShortcutsFooter />);
        expect(screen.getByText("↑")).toBeInTheDocument();
        expect(screen.getByText("↓")).toBeInTheDocument();
        expect(screen.getByText("Navegar")).toBeInTheDocument();
    });

    it("should have key-cap class on all key elements", () => {
        const { container } = render(<ShortcutsFooter />);
        const keyCaps = container.querySelectorAll(".key-cap");
        expect(keyCaps.length).toBeGreaterThanOrEqual(5); // P, S, Espacio, ↑, ↓
    });

    it("should render up/down arrow keys in a flex container", () => {
        const { container } = render(<ShortcutsFooter />);
        const flexContainer = container.querySelector("div[style*='flex']");
        expect(flexContainer).toBeTruthy();
        if (flexContainer) {
            const style = window.getComputedStyle(flexContainer);
            expect(style.display).toBe("flex");
        }
    });
});
