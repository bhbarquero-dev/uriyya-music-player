import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@components/sidebar/Sidebar";

vi.mock("../../../src/logic/TauriFileDialog", () => ({
    TauriFileDialog: class {
        openDirectory = vi.fn().mockResolvedValue(null);
        open = vi.fn().mockResolvedValue(null);
    }
}));

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

        it("should render sidebar footer", () => {
            const { container } = render(<Sidebar />);
            const footer = container.querySelector(".sidebar-footer");
            expect(footer).toBeTruthy();
        });
    });

    describe("Biblioteca section", () => {
        it("should display 'Biblioteca' title", () => {
            render(<Sidebar />);
            expect(screen.getByText("Biblioteca")).toBeInTheDocument();
        });

        it("should render add library button when no library selected", () => {
            render(<Sidebar />);
            const button = screen.getByRole("button", { name: "Agregar biblioteca" });
            expect(button).toBeInTheDocument();
        });
    });
});
