import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "@tauri-apps/plugin-dialog";
import App from "../src/App";
import { useMusicPlayer } from "../src/hooks/useMusicPlayer";
import { Song } from "@logic/Song";

vi.mock("../src/hooks/useMusicPlayer");
vi.mock("@components/sidebar/Sidebar", () => ({ Sidebar: () => null }));
vi.mock("@tauri-apps/plugin-dialog", () => ({ message: vi.fn() }));
vi.mock("@tauri-apps/plugin-opener", () => ({ revealItemInDir: vi.fn() }));
vi.mock("@tauri-apps/api/window", () => ({
    getCurrentWindow: () => {
        throw new Error("Not running in Tauri");
    },
}));

type MusicPlayer = ReturnType<typeof useMusicPlayer>;

function mockMusicPlayerWithUnsavedChanges(overrides: Partial<MusicPlayer>) {
    const musicPlayer: MusicPlayer = {
        playlist: [new Song("C:\\Music\\song1.mp3")],
        currentPlaylistName: "lista",
        currentPlaylistPath: "C:\\Music\\lista.txt",
        selectedSong: null,
        hasUnsavedChanges: true,
        playingSong: null,
        isPlaying: false,
        isStopping: false,
        setSelectedSong: vi.fn(),
        loadPlaylist: vi.fn().mockResolvedValue(undefined),
        saveCurrentPlaylist: vi.fn().mockResolvedValue(undefined),
        playSong: vi.fn(),
        playCurrentSelected: vi.fn(),
        pause: vi.fn(),
        stop: vi.fn(),
        addSong: vi.fn(),
        addSongAtStart: vi.fn(),
        insertSongAfter: vi.fn(),
        removeSong: vi.fn(),
        moveSong: vi.fn(),
        selectNextInList: vi.fn(),
        selectPreviousInList: vi.fn(),
        getAudioElement: vi.fn(),
        currentTime: 0,
        duration: null,
        remaining: null,
        playedPercent: 0,
        seekToFraction: vi.fn(),
        ...overrides,
    };
    vi.mocked(useMusicPlayer).mockReturnValue(musicPlayer);
    return musicPlayer;
}

async function chooseSaveInUnsavedChangesDialog() {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cambiar lista de reproducción" }));
    await user.click(screen.getByRole("button", { name: "Guardar" }));
}

describe("App - unsaved changes dialog", () => {
    beforeEach(() => {
        vi.mocked(message).mockReset();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("should save, close the dialog and continue when saving succeeds", async () => {
        const musicPlayer = mockMusicPlayerWithUnsavedChanges({});
        render(<App />);

        await chooseSaveInUnsavedChangesDialog();

        await waitFor(() => expect(musicPlayer.loadPlaylist).toHaveBeenCalledTimes(1));
        expect(musicPlayer.saveCurrentPlaylist).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(message).not.toHaveBeenCalled();
    });

    it("should report the error, keep the dialog open and not continue when saving fails", async () => {
        const musicPlayer = mockMusicPlayerWithUnsavedChanges({
            saveCurrentPlaylist: vi.fn().mockRejectedValue(new Error("disk full")),
        });
        render(<App />);

        await chooseSaveInUnsavedChangesDialog();

        await waitFor(() =>
            expect(message).toHaveBeenCalledWith("Error: disk full", {
                title: "Error al guardar la lista",
                kind: "error",
            }),
        );
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(musicPlayer.loadPlaylist).not.toHaveBeenCalled();
    });
});
