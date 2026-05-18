import { describe, it, expect, beforeEach } from "vitest";
import { PlaylistManager } from "@logic/PlaylistManager";
import { Song } from "@logic/Song";

describe("PlaylistManager", () => {
    let manager: PlaylistManager;

    beforeEach(() => {
        manager = new PlaylistManager();
    });

    it("should start with no current song", () => {
        expect(manager.getCurrentSong()).toBeNull();
    });

    it("should set songs and select the first one if none selected", () => {
        const songs = [new Song("s1.mp3"), new Song("s2.mp3")];
        manager.setSongs(songs);
        expect(manager.getCurrentSong()).toBe(songs[0]);
    });

    it("should navigate next and previous", () => {
        const s1 = new Song("s1.mp3");
        const s2 = new Song("s2.mp3");
        const s3 = new Song("s3.mp3");
        manager.setSongs([s1, s2, s3]);
        expect(manager.getCurrentSong()).toBe(s1);

        expect(manager.getNext()).toBe(s2);
        expect(manager.getCurrentSong()).toBe(s2);

        expect(manager.getNext()).toBe(s3);
        // Boundary: stay at end
        expect(manager.getNext()).toBe(s3);

        expect(manager.getPrevious()).toBe(s2);
        expect(manager.getPrevious()).toBe(s1);
        // Boundary: stay at start
        expect(manager.getPrevious()).toBe(s1);
    });

    it("should allow setting current song", () => {
        const s1 = new Song("s1.mp3");
        const s2 = new Song("s2.mp3");
        const s3 = new Song("s3.mp3");
        manager.setSongs([s1, s2, s3]);
        manager.setCurrentSong(s3);
        expect(manager.getCurrentSong()).toBe(s3);

        const nonExistent = new Song("non-existent.mp3");
        manager.setCurrentSong(nonExistent);
        expect(manager.getCurrentSong()).toBeNull();
    });

    it("should handle navigation in an empty list", () => {
        expect(manager.getNext()).toBeNull();
        expect(manager.getPrevious()).toBeNull();
    });

    describe("peekNext", () => {
        it("should return the next song without advancing the index", () => {
            const s1 = new Song("s1.mp3");
            const s2 = new Song("s2.mp3");
            manager.setSongs([s1, s2]);

            const peeked = manager.peekNext();

            expect(peeked).toBe(s2);
            // Index must NOT have advanced
            expect(manager.getCurrentSong()).toBe(s1);
        });

        it("should return null when at the last song", () => {
            const s1 = new Song("s1.mp3");
            const s2 = new Song("s2.mp3");
            manager.setSongs([s1, s2]);
            manager.setCurrentSong(s2);

            expect(manager.peekNext()).toBeNull();
        });

        it("should return null when the playlist is empty", () => {
            expect(manager.peekNext()).toBeNull();
        });
    });

    it("should reset current song when setting empty songs array", () => {
        manager.setSongs([new Song("s1.mp3")]);
        expect(manager.getCurrentSong()).not.toBeNull();
        manager.setSongs([]);
        expect(manager.getCurrentSong()).toBeNull();
    });
});
