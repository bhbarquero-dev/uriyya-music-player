import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarFooter } from "@components/sidebar/SidebarFooter";

describe("SidebarFooter", () => {
    it("should display version", () => {
        render(<SidebarFooter />);
        expect(screen.getByText(/Uriyyá Music Player v\d+\.\d+\.\d+/)).toBeInTheDocument();
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
