import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Library } from "@components/sidebar/library/Library";

const openDirectoryMock = vi.fn();
const saveLibraryPathToSettingsMock = vi.fn();
const getLibraryPathFromSettingsMock = vi.fn();
const scanLibraryAudioFilesMock = vi.fn();

vi.mock("../../../../src/logic/TauriFileDialog", () => ({
    TauriFileDialog: class {
        openDirectory = (...args: unknown[]) => openDirectoryMock(...args);
        open = vi.fn().mockResolvedValue(null);
    }
}));

vi.mock("../../../../src/logic/UserSettingsStore", () => ({
    getLibraryPathFromSettings: (...args: unknown[]) => getLibraryPathFromSettingsMock(...args),
    saveLibraryPathToSettings: (...args: unknown[]) => saveLibraryPathToSettingsMock(...args),
}));

vi.mock("../../../../src/logic/LibraryScanner", () => ({
    scanLibraryAudioFiles: (...args: unknown[]) => scanLibraryAudioFilesMock(...args),
}));

describe("Library", () => {
    const renderLibrary = async () => {
        const view = render(<Library />);
        await waitFor(() => {
            expect(getLibraryPathFromSettingsMock).toHaveBeenCalled();
        });
        return view;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        openDirectoryMock.mockResolvedValue(null);
        saveLibraryPathToSettingsMock.mockResolvedValue(undefined);
        getLibraryPathFromSettingsMock.mockResolvedValue(null);
        scanLibraryAudioFilesMock.mockResolvedValue([]);
    });

    it("should render section with Biblioteca title", async () => {
        await renderLibrary();
        expect(screen.getByText("Biblioteca")).toBeInTheDocument();
    });

    it("should render add button when no library selected", async () => {
        await renderLibrary();
        const button = screen.getByRole("button", { name: "Agregar biblioteca" });
        expect(button).toBeInTheDocument();
    });

    it("should render placeholder when no library selected", async () => {
        await renderLibrary();
        expect(screen.getByText("No hay biblioteca seleccionada")).toBeInTheDocument();
    });

    it("should call file dialog when add button is clicked", async () => {
        const user = userEvent.setup();
        await renderLibrary();
        const button = screen.getByRole("button", { name: "Agregar biblioteca" });
        await user.click(button);
        expect(openDirectoryMock).toHaveBeenCalledOnce();
    });

    it("should save selected library path after picking a directory", async () => {
        const user = userEvent.setup();
        openDirectoryMock.mockResolvedValue("C:/Music");

        await renderLibrary();
        await user.click(screen.getByRole("button", { name: "Agregar biblioteca" }));

        expect(saveLibraryPathToSettingsMock).toHaveBeenCalledWith("C:/Music");
    });

    it("should render selected library and edit button when a path is stored", async () => {
        getLibraryPathFromSettingsMock.mockResolvedValue("C:/My Folder");
        await renderLibrary();

        expect(await screen.findByText("My Folder")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cambiar biblioteca" })).toBeInTheDocument();
    });

    it("should not render placeholder when library is selected", async () => {
        getLibraryPathFromSettingsMock.mockResolvedValue("C:/My Folder");
        await renderLibrary();

        await screen.findByText("My Folder");
        expect(screen.queryByText("No hay biblioteca seleccionada")).not.toBeInTheDocument();
    });

    it("should render refresh button when library is selected", async () => {
        getLibraryPathFromSettingsMock.mockResolvedValue("C:/My Folder");
        await renderLibrary();

        expect(await screen.findByRole("button", { name: "Actualizar lista de canciones" })).toBeInTheDocument();
    });

    it("should render search input and filter library songs", async () => {
        const user = userEvent.setup();
        getLibraryPathFromSettingsMock.mockResolvedValue("C:/Music");
        scanLibraryAudioFilesMock.mockResolvedValue(["C:/Music/uno.mp3", "C:/Music/dos.wav"]);

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

    it("should filter songs when search query contains ñ", async () => {
        const user = userEvent.setup();
        getLibraryPathFromSettingsMock.mockResolvedValue("C:/Music");
        scanLibraryAudioFilesMock.mockResolvedValue(["C:/Music/niña.mp3", "C:/Music/nina.wav"]);

        await renderLibrary();

        const searchInput = await screen.findByPlaceholderText("Buscar canciones...");
        await user.type(searchInput, "ñ");

        await waitFor(() => {
            expect(screen.getByText("niña.mp3")).toBeInTheDocument();
        });
        expect(screen.queryByText("nina.wav")).not.toBeInTheDocument();
    });

    it("should filter songs when search query contains accented vowels", async () => {
        const user = userEvent.setup();
        getLibraryPathFromSettingsMock.mockResolvedValue("C:/Music");
        scanLibraryAudioFilesMock.mockResolvedValue(["C:/Music/canción.mp3", "C:/Music/cancion.wav"]);

        await renderLibrary();

        const searchInput = await screen.findByPlaceholderText("Buscar canciones...");
        await user.type(searchInput, "ó");

        await waitFor(() => {
            expect(screen.getByText("canción.mp3")).toBeInTheDocument();
        });
        expect(screen.queryByText("cancion.wav")).not.toBeInTheDocument();
    });

    it("should render empty state when selected library has no supported files", async () => {
        getLibraryPathFromSettingsMock.mockResolvedValue("C:/Music");
        scanLibraryAudioFilesMock.mockResolvedValue([]);

        await renderLibrary();

        expect(await screen.findByText("No se encontraron archivos .mp3 o .wav")).toBeInTheDocument();
    });
});
