import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@components/sidebar/Sidebar";

describe("Sidebar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Structure", () => {
        it("should render aside element with sidebar class", () => {
            const { container } = render(<Sidebar />);
            const aside = container.querySelector("aside.sidebar");
            expect(aside).toBeTruthy();
        });

        it("should render one sidebar section", () => {
            const { container } = render(<Sidebar />);
            const sections = container.querySelectorAll(".sidebar-section");
            expect(sections).toHaveLength(1);
        });

        it("should render sidebar footer with version and credits", () => {
            render(<Sidebar />);
            expect(screen.getByText("Uriyya Music Player v0.1.0")).toBeInTheDocument();
            expect(screen.getByText(/Hecho con ❤️ por/)).toBeInTheDocument();
            expect(screen.getByRole("link", { name: /bhbarquero-dev/ })).toBeInTheDocument();
        });
    });

    describe("Biblioteca section", () => {
        it("should display 'Biblioteca' title", () => {
            render(<Sidebar />);
            expect(screen.getByText("Biblioteca")).toBeInTheDocument();
        });

        it("should render SVG in biblioteca button", () => {
            const { container } = render(<Sidebar />);
            const svgs = container.querySelectorAll("svg");
            expect(svgs.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("Footer", () => {
        it("should have valid github link in footer", () => {
            render(<Sidebar />);
            const link = screen.getByRole("link", { name: /bhbarquero-dev/ });
            expect(link).toHaveAttribute("href", "https://github.com/bhbarquero-dev");
        });
    });
});
