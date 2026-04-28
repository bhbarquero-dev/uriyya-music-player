import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mock } from "vitest-mock-extended";
import { Library } from "@components/sidebar/library/Library";
import type { Library as LibraryStore } from "@logic/Library";

describe("Library", () => {
    let fakeStore: ReturnType<typeof mock<LibraryStore>>;

    const renderLibrary = async () => {
        const view = render(<Library store={fakeStore} />);
        await waitFor(() => {
            expect(fakeStore.getPath).toHaveBeenCalled();
        });
        return view;
    };

    beforeEach(() => {
        fakeStore = mock<LibraryStore>();
    });

    it("should call library add when add button is clicked", async () => {
        const user = userEvent.setup();
        await renderLibrary();
        const button = screen.getByRole("button", { name: "Agregar biblioteca" });
        await user.click(button);
        expect(fakeStore.add).toHaveBeenCalledOnce();
    });

    it("should render selected library after picking a directory", async () => {
        const user = userEvent.setup();
        fakeStore.getSongs.mockResolvedValue([]);
        fakeStore.add.mockImplementation(async () => {
            fakeStore.getName.mockReturnValue("Music");
            fakeStore.hasLibrary.mockReturnValue(true);
            return "C:/Music";
        });

        await renderLibrary();
        await user.click(screen.getByRole("button", { name: "Agregar biblioteca" }));

        expect(await screen.findByText("Music")).toBeInTheDocument();
    });

    it("should render selected library and edit button when a path is stored", async () => {
        fakeStore.getPath.mockResolvedValue("C:/My Folder");
        fakeStore.getName.mockReturnValue("My Folder");
        fakeStore.hasLibrary.mockReturnValue(true);
        fakeStore.getSongs.mockResolvedValue([]);
        await renderLibrary();

        expect(await screen.findByText("My Folder")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cambiar biblioteca" })).toBeInTheDocument();
    });

    it("should render search input and filter library songs", async () => {
        const user = userEvent.setup();
        fakeStore.getPath.mockResolvedValue("C:/Music");
        fakeStore.hasLibrary.mockReturnValue(true);
        fakeStore.getSongs.mockResolvedValue(["C:/Music/uno.mp3", "C:/Music/dos.wav"]);

        await renderLibrary();

        const searchInput = await screen.findByPlaceholderText("Buscar canciones...");
        expect(screen.getByText("uno.mp3")).toBeInTheDocument();
        expect(screen.getByText("dos.wav")).toBeInTheDocument();

        await user.type(searchInput, "uno");

        await waitFor(() => {
            expect(screen.getByText("uno.mp3")).toBeInTheDocument();
        });
        expect(screen.queryByText("dos.wav")).not.toBeInTheDocument();
    });

    it("should render empty state when selected library has no supported files", async () => {
        fakeStore.getPath.mockResolvedValue("C:/Music");
        fakeStore.hasLibrary.mockReturnValue(true);
        fakeStore.getSongs.mockResolvedValue([]);

        await renderLibrary();

        expect(await screen.findByText("No se encontraron archivos .mp3 o .wav")).toBeInTheDocument();
    });
});
