import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SongContextMenu } from "@components/songList/SongContextMenu";

describe("SongContextMenu", () => {
    it("should render all provided items", () => {
        render(
            <SongContextMenu
                x={100}
                y={200}
                items={[
                    { label: "Opción A", onClick: vi.fn() },
                    { label: "Opción B", onClick: vi.fn() },
                ]}
                onClose={vi.fn()}
            />
        );
        expect(screen.getByText("Opción A")).toBeInTheDocument();
        expect(screen.getByText("Opción B")).toBeInTheDocument();
    });

    it("should call item onClick when clicked", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(
            <SongContextMenu
                x={0}
                y={0}
                items={[{ label: "Acción", onClick }]}
                onClose={vi.fn()}
            />
        );
        await user.click(screen.getByText("Acción"));
        expect(onClick).toHaveBeenCalled();
    });

    it("should call onClose after clicking an item", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <SongContextMenu
                x={0}
                y={0}
                items={[{ label: "Acción", onClick: vi.fn() }]}
                onClose={onClose}
            />
        );
        await user.click(screen.getByText("Acción"));
        expect(onClose).toHaveBeenCalled();
    });

    it("should call onClose when Escape is pressed", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <SongContextMenu
                x={0}
                y={0}
                items={[{ label: "Acción", onClick: vi.fn() }]}
                onClose={onClose}
            />
        );
        await user.keyboard("{Escape}");
        expect(onClose).toHaveBeenCalled();
    });

    it("should call onClose when clicking outside the menu", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <div>
                <SongContextMenu
                    x={0}
                    y={0}
                    items={[{ label: "Acción", onClick: vi.fn() }]}
                    onClose={onClose}
                />
                <button>Outside</button>
            </div>
        );
        await user.click(screen.getByText("Outside"));
        expect(onClose).toHaveBeenCalled();
    });

    describe("Disabled items", () => {
        it("should apply disabled class to a disabled item", () => {
            const { container } = render(
                <SongContextMenu
                    x={0}
                    y={0}
                    items={[{ label: "Acción", onClick: vi.fn(), disabled: true }]}
                    onClose={vi.fn()}
                />
            );
            const item = container.querySelector(".context-menu-item");
            expect(item?.className).toContain("disabled");
        });

        it("should not call onClick when a disabled item is clicked", async () => {
            const user = userEvent.setup();
            const onClick = vi.fn();
            render(
                <SongContextMenu
                    x={0}
                    y={0}
                    items={[{ label: "Acción", onClick, disabled: true }]}
                    onClose={vi.fn()}
                />
            );
            await user.click(screen.getByText("Acción"));
            expect(onClick).not.toHaveBeenCalled();
        });

        it("should not call onClose when a disabled item is clicked", async () => {
            const user = userEvent.setup();
            const onClose = vi.fn();
            render(
                <SongContextMenu
                    x={0}
                    y={0}
                    items={[{ label: "Acción", onClick: vi.fn(), disabled: true }]}
                    onClose={onClose}
                />
            );
            await user.click(screen.getByText("Acción"));
            expect(onClose).not.toHaveBeenCalled();
        });
    });
});
