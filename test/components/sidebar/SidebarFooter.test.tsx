import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SidebarFooter } from "@components/sidebar";

describe("SidebarFooter", () => {
    it("should display version", () => {
        render(<SidebarFooter />);
        expect(screen.getByText("Uriyya Music Player v0.1.0")).toBeInTheDocument();
    });

    it("should display credits with heart", () => {
        render(<SidebarFooter />);
        expect(screen.getByText(/Hecho con ❤️ por/)).toBeInTheDocument();
    });

    it("should have github link", () => {
        render(<SidebarFooter />);
        const link = screen.getByRole("link", { name: /bhbarquero-dev/ });
        expect(link).toHaveAttribute("href", "https://github.com/bhbarquero-dev");
    });

    it("should have sidebar-footer class", () => {
        const { container } = render(<SidebarFooter />);
        const footer = container.querySelector(".sidebar-footer");
        expect(footer).toBeTruthy();
    });
});
