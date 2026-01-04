import { describe, it, expect, beforeEach } from "vitest";
import { PlaylistManager } from "../../src/logic/PlaylistManager";

describe("PlaylistManager", () => {
    let manager: PlaylistManager;

    beforeEach(() => {
        manager = new PlaylistManager();
    });

    it("should start empty", () => {
        expect(manager.getSongs()).toEqual([]);
        expect(manager.getCurrentSong()).toBeNull();
        expect(manager.isEmpty()).toBe(true);
    });

    it("should set songs and select the first one if none selected", () => {
        const songs = ["s1.mp3", "s2.mp3"];
        manager.setSongs(songs);
        expect(manager.getSongs()).toEqual(songs);
        expect(manager.getCurrentSong()).toBe("s1.mp3");
        expect(manager.isEmpty()).toBe(false);
    });

    it("should navigate next and previous", () => {
        manager.setSongs(["s1.mp3", "s2.mp3", "s3.mp3"]);
        expect(manager.getCurrentSong()).toBe("s1.mp3");

        expect(manager.getNext()).toBe("s2.mp3");
        expect(manager.getCurrentSong()).toBe("s2.mp3");

        expect(manager.getNext()).toBe("s3.mp3");
        // Boundary: stay at end
        expect(manager.getNext()).toBe("s3.mp3");

        expect(manager.getPrevious()).toBe("s2.mp3");
        expect(manager.getPrevious()).toBe("s1.mp3");
        // Boundary: stay at start
        expect(manager.getPrevious()).toBe("s1.mp3");
    });

    it("should allow setting current song", () => {
        manager.setSongs(["s1.mp3", "s2.mp3", "s3.mp3"]);
        manager.setCurrentSong("s3.mp3");
        expect(manager.getCurrentSong()).toBe("s3.mp3");

        manager.setCurrentSong("non-existent.mp3");
        expect(manager.getCurrentSong()).toBeNull();
    });

    it("should handle clearing", () => {
        manager.setSongs(["s1.mp3"]);
        manager.clear();
        expect(manager.isEmpty()).toBe(true);
        expect(manager.getCurrentSong()).toBeNull();
    });

    it("should handle navigation in an empty list", () => {
        expect(manager.getNext()).toBeNull();
        expect(manager.getPrevious()).toBeNull();
    });
});
