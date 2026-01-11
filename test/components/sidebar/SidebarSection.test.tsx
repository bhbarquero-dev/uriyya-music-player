import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarSection } from "@components/sidebar";

describe("SidebarSection", () => {
    const mockOnAddClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render section with title", () => {
        render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick}>
                <li>Item 1</li>
            </SidebarSection>
        );
        expect(screen.getByText("Test Section")).toBeInTheDocument();
    });

    it("should render add button with correct title", () => {
        render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick}>
                <li>Item 1</li>
            </SidebarSection>
        );
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("title", "Añadir a test section");
    });

    it("should call onAddClick when button is clicked", async () => {
        const user = userEvent.setup();
        render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick}>
                <li>Item 1</li>
            </SidebarSection>
        );
        const button = screen.getByRole("button");
        await user.click(button);
        expect(mockOnAddClick).toHaveBeenCalledOnce();
    });

    it("should render children in menu", () => {
        render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick}>
                <li>Item 1</li>
                <li>Item 2</li>
            </SidebarSection>
        );
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    it("should have sidebar-section class", () => {
        const { container } = render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick}>
                <li>Item 1</li>
            </SidebarSection>
        );
        const section = container.querySelector(".sidebar-section");
        expect(section).toBeTruthy();
    });

    it("should have sidebar-menu ul element", () => {
        const { container } = render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick}>
                <li>Item 1</li>
            </SidebarSection>
        );
        const menu = container.querySelector(".sidebar-menu");
        expect(menu?.tagName).toBe("UL");
    });
});
