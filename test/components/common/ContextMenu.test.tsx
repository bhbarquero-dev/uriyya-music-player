import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContextMenu, ContextMenuItem } from "../../../src/components/common/ContextMenu";

describe("ContextMenu", () => {
    const onClose = vi.fn();
    const defaultItems: ContextMenuItem[] = [
        { label: "Play", onClick: vi.fn() },
        { label: "Delete", onClick: vi.fn() },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("rendering", () => {
        it("should render all items", () => {
            render(<ContextMenu x={10} y={20} items={defaultItems} onClose={onClose} />);

            expect(screen.getByText("Play")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();
        });

        it("should position the menu using x and y", () => {
            const { container } = render(
                <ContextMenu x={50} y={80} items={defaultItems} onClose={onClose} />
            );

            const menu = container.querySelector(".context-menu") as HTMLElement;
            expect(menu.style.left).toBe("50px");
            expect(menu.style.top).toBe("80px");
        });

        it("should add the disabled class to disabled items", () => {
            const items: ContextMenuItem[] = [
                { label: "Enabled", onClick: vi.fn() },
                { label: "Disabled", onClick: vi.fn(), disabled: true },
            ];
            render(<ContextMenu x={0} y={0} items={items} onClose={onClose} />);

            expect(screen.getByText("Disabled").closest("li")).toHaveClass("disabled");
            expect(screen.getByText("Enabled").closest("li")).not.toHaveClass("disabled");
        });
    });

    describe("item interaction", () => {
        it("should call onClick and onClose when an enabled item is clicked", async () => {
            const user = userEvent.setup();
            const itemClick = vi.fn();
            const items: ContextMenuItem[] = [{ label: "Play", onClick: itemClick }];
            render(<ContextMenu x={0} y={0} items={items} onClose={onClose} />);

            await user.click(screen.getByText("Play"));

            expect(itemClick).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("should not call onClick or onClose when a disabled item is clicked", async () => {
            const user = userEvent.setup();
            const itemClick = vi.fn();
            const items: ContextMenuItem[] = [{ label: "Disabled", onClick: itemClick, disabled: true }];
            render(<ContextMenu x={0} y={0} items={items} onClose={onClose} />);

            await user.click(screen.getByText("Disabled"));

            expect(itemClick).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe("closing", () => {
        it("should call onClose when Escape is pressed", async () => {
            const user = userEvent.setup();
            render(<ContextMenu x={0} y={0} items={defaultItems} onClose={onClose} />);

            await user.keyboard("{Escape}");

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("should call onClose when clicking outside the menu", async () => {
            const user = userEvent.setup();
            render(
                <div>
                    <ContextMenu x={0} y={0} items={defaultItems} onClose={onClose} />
                    <button>Outside</button>
                </div>
            );

            await user.click(screen.getByText("Outside"));

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("should not call onClose when clicking inside the menu (without hitting an item)", async () => {
            const user = userEvent.setup();
            const { container } = render(
                <ContextMenu x={0} y={0} items={defaultItems} onClose={onClose} />
            );

            const menu = container.querySelector(".context-menu") as HTMLElement;
            await user.click(menu);

            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe("cleanup", () => {
        it("should remove event listeners on unmount", () => {
            const addSpy = vi.spyOn(document, "addEventListener");
            const removeSpy = vi.spyOn(document, "removeEventListener");

            const { unmount } = render(
                <ContextMenu x={0} y={0} items={defaultItems} onClose={onClose} />
            );

            const addedTypes = addSpy.mock.calls.map(([type]) => type);
            expect(addedTypes).toContain("keydown");
            expect(addedTypes).toContain("mousedown");

            unmount();

            const removedTypes = removeSpy.mock.calls.map(([type]) => type);
            expect(removedTypes).toContain("keydown");
            expect(removedTypes).toContain("mousedown");
        });
    });
});
