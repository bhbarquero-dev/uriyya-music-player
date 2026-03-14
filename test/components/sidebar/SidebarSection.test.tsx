import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarSection } from "@components/sidebar/SidebarSection";

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

    it("should render add button when no library selected", () => {
        render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick}>
                <li>Item 1</li>
            </SidebarSection>
        );
        const button = screen.getByRole("button", { name: "Agregar biblioteca" });
        expect(button).toBeInTheDocument();
    });

    it("should render placeholder when no library selected", () => {
        render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick}>
                <li>Item 1</li>
            </SidebarSection>
        );
        expect(screen.getByText("No hay biblioteca seleccionada")).toBeInTheDocument();
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

    it("should render selected item when provided", () => {
        render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick} selectedItem="My Folder">
                <li>Item 1</li>
            </SidebarSection>
        );
        expect(screen.getByText("My Folder")).toBeInTheDocument();
    });

    it("should render edit button when library selected", () => {
        render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick} selectedItem="My Folder">
                <li>Item 1</li>
            </SidebarSection>
        );
        const editButton = screen.getByRole("button", { name: "Cambiar biblioteca" });
        expect(editButton).toBeInTheDocument();
    });

    it("should not render placeholder when library selected", () => {
        render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick} selectedItem="My Folder">
                <li>Item 1</li>
            </SidebarSection>
        );
        expect(screen.queryByText("No hay biblioteca seleccionada")).not.toBeInTheDocument();
    });

    it("should not render selected item div when not provided", () => {
        const { container } = render(
            <SidebarSection title="Test Section" onAddClick={mockOnAddClick}>
                <li>Item 1</li>
            </SidebarSection>
        );
        const selectedItemDiv = container.querySelector(".sidebar-selected-item");
        expect(selectedItemDiv).toBeNull();
    });
});
