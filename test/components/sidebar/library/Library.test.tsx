import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Library } from "@components/sidebar/library/Library";

const getPathMock = vi.fn();
const getSongsMock = vi.fn();
const addMock = vi.fn();
const getNameMock = vi.fn();
const hasLibraryMock = vi.fn();

vi.mock("../../../../src/logic/Library", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../../src/logic/Library")>();
    return {
        ...actual,
        Library: class {
            getPath = getPathMock;
            setPath = vi.fn().mockResolvedValue(undefined);
            getSongs = getSongsMock;
            add = addMock;
            getName = getNameMock;
            hasLibrary = hasLibraryMock;
        }
    };
});

describe("Library", () => {
    const renderLibrary = async () => {
        const view = render(<Library />);
        await waitFor(() => {
            expect(getPathMock).toHaveBeenCalled();
        });
        return view;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        getPathMock.mockResolvedValue(null);
        getSongsMock.mockResolvedValue([]);
        addMock.mockResolvedValue(null);
        getNameMock.mockReturnValue(null);
        hasLibraryMock.mockReturnValue(false);
    });

    it("should call library add when add button is clicked", async () => {
        const user = userEvent.setup();
        await renderLibrary();
        const button = screen.getByRole("button", { name: "Agregar biblioteca" });
        await user.click(button);
        expect(addMock).toHaveBeenCalledOnce();
    });

    it("should render selected library after picking a directory", async () => {
        const user = userEvent.setup();
        addMock.mockImplementation(async () => {
            getNameMock.mockReturnValue("Music");
            hasLibraryMock.mockReturnValue(true);
            return "C:/Music";
        });

        await renderLibrary();
        await user.click(screen.getByRole("button", { name: "Agregar biblioteca" }));

        expect(await screen.findByText("Music")).toBeInTheDocument();
    });

    it("should render selected library and edit button when a path is stored", async () => {
        getPathMock.mockResolvedValue("C:/My Folder");
        getNameMock.mockReturnValue("My Folder");
        hasLibraryMock.mockReturnValue(true);
        await renderLibrary();

        expect(await screen.findByText("My Folder")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cambiar biblioteca" })).toBeInTheDocument();
    });

    it("should render search input and filter library songs", async () => {
        const user = userEvent.setup();
        getPathMock.mockResolvedValue("C:/Music");
        hasLibraryMock.mockReturnValue(true);
        getSongsMock.mockResolvedValue(["C:/Music/uno.mp3", "C:/Music/dos.wav"]);

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
        getPathMock.mockResolvedValue("C:/Music");
        hasLibraryMock.mockReturnValue(true);
        getSongsMock.mockResolvedValue([]);

        await renderLibrary();

        expect(await screen.findByText("No se encontraron archivos .mp3 o .wav")).toBeInTheDocument();
    });
});
