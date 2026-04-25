import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryHeader } from "@components/sidebar/library/LibraryHeader";

describe("LibraryHeader", () => {
    const onAddClick = vi.fn();
    const onRefreshClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when no library is selected", () => {
        it("should render Biblioteca title", () => {
            render(<LibraryHeader selectedLibraryName={null} hasLibrary={false} onAddClick={onAddClick} onRefreshClick={onRefreshClick} />);
            expect(screen.getByText("Biblioteca")).toBeInTheDocument();
        });

        it("should render add button", () => {
            render(<LibraryHeader selectedLibraryName={null} hasLibrary={false} onAddClick={onAddClick} onRefreshClick={onRefreshClick} />);
            expect(screen.getByRole("button", { name: "Agregar biblioteca" })).toBeInTheDocument();
        });

        it("should render placeholder", () => {
            render(<LibraryHeader selectedLibraryName={null} hasLibrary={false} onAddClick={onAddClick} onRefreshClick={onRefreshClick} />);
            expect(screen.getByText("No hay biblioteca seleccionada")).toBeInTheDocument();
        });

        it("should call onAddClick when add button is clicked", async () => {
            const user = userEvent.setup();
            render(<LibraryHeader selectedLibraryName={null} hasLibrary={false} onAddClick={onAddClick} onRefreshClick={onRefreshClick} />);
            await user.click(screen.getByRole("button", { name: "Agregar biblioteca" }));
            expect(onAddClick).toHaveBeenCalledOnce();
        });
    });

    describe("when a library is selected", () => {
        it("should render the library name", () => {
            render(<LibraryHeader selectedLibraryName="My Music" hasLibrary={true} onAddClick={onAddClick} onRefreshClick={onRefreshClick} />);
            expect(screen.getByText("My Music")).toBeInTheDocument();
        });

        it("should render edit and refresh buttons", () => {
            render(<LibraryHeader selectedLibraryName="My Music" hasLibrary={true} onAddClick={onAddClick} onRefreshClick={onRefreshClick} />);
            expect(screen.getByRole("button", { name: "Cambiar biblioteca" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Actualizar lista de canciones" })).toBeInTheDocument();
        });

        it("should not render add button", () => {
            render(<LibraryHeader selectedLibraryName="My Music" hasLibrary={true} onAddClick={onAddClick} onRefreshClick={onRefreshClick} />);
            expect(screen.queryByRole("button", { name: "Agregar biblioteca" })).not.toBeInTheDocument();
        });

        it("should not render placeholder", () => {
            render(<LibraryHeader selectedLibraryName="My Music" hasLibrary={true} onAddClick={onAddClick} onRefreshClick={onRefreshClick} />);
            expect(screen.queryByText("No hay biblioteca seleccionada")).not.toBeInTheDocument();
        });

        it("should call onAddClick when edit button is clicked", async () => {
            const user = userEvent.setup();
            render(<LibraryHeader selectedLibraryName="My Music" hasLibrary={true} onAddClick={onAddClick} onRefreshClick={onRefreshClick} />);
            await user.click(screen.getByRole("button", { name: "Cambiar biblioteca" }));
            expect(onAddClick).toHaveBeenCalledOnce();
        });

        it("should call onRefreshClick when refresh button is clicked", async () => {
            const user = userEvent.setup();
            render(<LibraryHeader selectedLibraryName="My Music" hasLibrary={true} onAddClick={onAddClick} onRefreshClick={onRefreshClick} />);
            await user.click(screen.getByRole("button", { name: "Actualizar lista de canciones" }));
            expect(onRefreshClick).toHaveBeenCalledOnce();
        });
    });
});
