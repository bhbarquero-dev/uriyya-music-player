import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlaylistState } from "../../src/hooks/usePlaylistState";
import { Song } from "@logic/Song";

describe("usePlaylistState", () => {
    describe("initialization", () => {
        it("should start with empty playlist and null selected song", () => {
            const { result } = renderHook(() => usePlaylistState());

            expect(result.current.playlist).toEqual([]);
            expect(result.current.selectedSong).toBeNull();
        });
    });

    describe("loading playlist", () => {
        it("should set playlist songs", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
            });

            expect(result.current.playlist).toEqual(songs);
            expect(result.current.playlist).toHaveLength(2);
        });

        it("should have null selection after loading playlist", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
            });

            expect(result.current.selectedSong).toBeNull();
        });

        it("should clear selected song even if one was already selected", () => {
            const { result } = renderHook(() => usePlaylistState());
            const song1 = new Song("song1.mp3");
            const song2 = new Song("song2.mp3");

            act(() => {
                result.current.setSelectedSong(song1);
                result.current.setPlaylist([song1, song2]);
            });

            expect(result.current.selectedSong).toBeNull();
        });

        it("should handle empty playlist", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => {
                result.current.setPlaylist([]);
            });

            expect(result.current.playlist).toEqual([]);
            expect(result.current.selectedSong).toBeNull();
        });
    });

    describe("selection", () => {
        it("should allow manual song selection", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[1]);
            });

            expect(result.current.selectedSong).toBe(songs[1]);
        });

        it("should update internal PlaylistManager when selecting song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3"), new Song("song3.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[1]);
            });

            // Verify by checking next/previous navigation
            act(() => {
                result.current.selectNext();
            });

            expect(result.current.selectedSong).toBe(songs[2]);
        });
    });

    describe("navigation", () => {
        let songs: Song[];

        beforeEach(() => {
            songs = [
                new Song("song1.mp3"),
                new Song("song2.mp3"),
                new Song("song3.mp3")
            ];
        });

        it("should navigate to next song", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[0]);
            });

            act(() => {
                result.current.selectNext();
            });

            expect(result.current.selectedSong).toBe(songs[1]);
        });

        it("should navigate to previous song", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => {
                result.current.setPlaylist(songs);
                result.current.selectNext();
            });

            expect(result.current.selectedSong).toBe(songs[1]);

            act(() => {
                result.current.selectPrevious();
            });

            expect(result.current.selectedSong).toBe(songs[0]);
        });

        it("should stay at end when navigating next from last song", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[2]);
                result.current.selectNext();
            });

            expect(result.current.selectedSong).toBe(songs[2]);
        });

        it("should stay at start when navigating previous from first song", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[0]);
            });

            act(() => {
                result.current.selectPrevious();
            });

            expect(result.current.selectedSong).toBe(songs[0]);
        });

        it("should handle empty playlist navigation gracefully", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => {
                result.current.selectNext();
                result.current.selectPrevious();
            });

            expect(result.current.selectedSong).toBeNull();
        });

        it("should navigate from beginning if no selection when calling previous", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(null);
                result.current.selectPrevious();
            });

            expect(result.current.selectedSong).toBe(songs[0]);
        });
    });

    describe("removing songs", () => {
        it("should start with hasUnsavedChanges as false", () => {
            const { result } = renderHook(() => usePlaylistState());

            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        it("should remove a song from the playlist", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3"), new Song("song3.mp3")];

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.removeSong(songs[1]); });

            expect(result.current.playlist).toHaveLength(2);
            expect(result.current.playlist[0]).toBe(songs[0]);
            expect(result.current.playlist[1]).toBe(songs[2]);
        });

        it("should set hasUnsavedChanges to true after removing a song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.removeSong(songs[0]); });

            expect(result.current.hasUnsavedChanges).toBe(true);
        });

        it("should reset hasUnsavedChanges to false when loading a new playlist", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.removeSong(songs[0]); });
            expect(result.current.hasUnsavedChanges).toBe(true);

            act(() => { result.current.setPlaylist([new Song("new1.mp3")]); });
            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        it("should keep the selected song when a different song is removed", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3"), new Song("song3.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[0]);
            });

            act(() => { result.current.removeSong(songs[2]); });

            expect(result.current.selectedSong).toBe(songs[0]);
        });

        it("should auto-select the next song when the selected song is removed and it is not the last", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3"), new Song("song3.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[0]);
            });

            act(() => { result.current.removeSong(songs[0]); });

            expect(result.current.selectedSong).toBe(songs[1]);
        });

        it("should append a song to the end of the playlist", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];
            const appendedSong = new Song("song3.wav");

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.addSong(appendedSong); });

            expect(result.current.playlist).toHaveLength(3);
            expect(result.current.playlist[2]).toBe(appendedSong);
        });

        it("should set hasUnsavedChanges to true after appending a song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3")];

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.addSong(new Song("song2.wav")); });

            expect(result.current.hasUnsavedChanges).toBe(true);
        });

        it("should keep current selection after appending a song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[0]);
            });

            act(() => { result.current.addSong(new Song("song3.wav")); });

            expect(result.current.selectedSong).toBe(songs[0]);
        });

        it("should prepend a song to the start of the playlist", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song2.mp3"), new Song("song3.mp3")];
            const prependedSong = new Song("song1.wav");

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.addSongAtStart(prependedSong); });

            expect(result.current.playlist).toHaveLength(3);
            expect(result.current.playlist[0]).toBe(prependedSong);
        });

        it("should keep current selection after prepending a song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[1]);
            });

            act(() => { result.current.addSongAtStart(new Song("song0.wav")); });

            expect(result.current.selectedSong).toBe(songs[1]);
            expect(result.current.hasUnsavedChanges).toBe(true);
        });

        it("should insert a song after the reference song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const firstSong = new Song("song1.mp3");
            const referenceSong = new Song("song2.mp3");
            const lastSong = new Song("song4.mp3");
            const insertedSong = new Song("song3.wav");

            act(() => {
                result.current.setPlaylist([firstSong, referenceSong, lastSong]);
            });

            act(() => {
                result.current.insertSongAfter(referenceSong, insertedSong);
            });

            expect(result.current.playlist).toEqual([firstSong, referenceSong, insertedSong, lastSong]);
        });

        it("should keep current selection after inserting a song after the selected one", () => {
            const { result } = renderHook(() => usePlaylistState());
            const firstSong = new Song("song1.mp3");
            const selectedSong = new Song("song2.mp3");
            const insertedSong = new Song("song3.wav");

            act(() => {
                result.current.setPlaylist([firstSong, selectedSong]);
                result.current.setSelectedSong(selectedSong);
            });

            act(() => {
                result.current.insertSongAfter(selectedSong, insertedSong);
            });

            expect(result.current.selectedSong).toBe(selectedSong);
        });

        it("should set hasUnsavedChanges to true after inserting a song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const firstSong = new Song("song1.mp3");
            const referenceSong = new Song("song2.mp3");

            act(() => {
                result.current.setPlaylist([firstSong, referenceSong]);
            });

            act(() => {
                result.current.insertSongAfter(referenceSong, new Song("song3.wav"));
            });

            expect(result.current.hasUnsavedChanges).toBe(true);
        });

        it("should do nothing when inserting after a song not in the playlist", () => {
            const { result } = renderHook(() => usePlaylistState());
            const firstSong = new Song("song1.mp3");
            const referenceSong = new Song("song2.mp3");
            const missingSong = new Song("missing.mp3");

            act(() => {
                result.current.setPlaylist([firstSong, referenceSong]);
            });

            act(() => {
                result.current.insertSongAfter(missingSong, new Song("song3.wav"));
            });

            expect(result.current.playlist).toEqual([firstSong, referenceSong]);
            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        it("should reset hasUnsavedChanges when removing and re-adding the same last song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const firstSong = new Song("song1.mp3");
            const lastSong = new Song("song2.mp3");

            act(() => {
                result.current.setPlaylist([firstSong, lastSong]);
            });

            act(() => {
                result.current.removeSong(lastSong);
            });

            expect(result.current.hasUnsavedChanges).toBe(true);

            act(() => {
                result.current.addSong(new Song("song2.mp3"));
            });

            expect(result.current.playlist.map((song) => song.getPath())).toEqual(["song1.mp3", "song2.mp3"]);
            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        it("should auto-select the previous song when removing the last song in the list", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3"), new Song("song3.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[2]);
            });

            act(() => { result.current.removeSong(songs[2]); });

            expect(result.current.selectedSong).toBe(songs[1]);
        });

        it("should set selectedSong to null when removing the only song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const song = new Song("song1.mp3");

            act(() => { result.current.setPlaylist([song]); });
            act(() => { result.current.removeSong(song); });

            expect(result.current.selectedSong).toBeNull();
            expect(result.current.playlist).toHaveLength(0);
        });

        it("should keep correct navigation after removing a song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3"), new Song("song3.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[0]);
            });

            act(() => { result.current.removeSong(songs[0]); });

            // After removal: playlist = [song2, song3], selectedSong = song2 (new index 0)
            expect(result.current.selectedSong).toBe(songs[1]);

            act(() => { result.current.selectNext(); });

            expect(result.current.selectedSong).toBe(songs[2]);
        });

        it("should do nothing when removing a song not in the playlist", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];
            const notInList = new Song("other.mp3");

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.removeSong(notInList); });

            expect(result.current.playlist).toHaveLength(2);
            expect(result.current.hasUnsavedChanges).toBe(false);
        });
    });

    describe("markAsSaved", () => {
        it("should set hasUnsavedChanges to false", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.removeSong(songs[0]); });
            expect(result.current.hasUnsavedChanges).toBe(true);

            act(() => { result.current.markAsSaved(); });

            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        it("should not affect songs or selected song", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.setSelectedSong(songs[0]); });
            act(() => { result.current.removeSong(songs[0]); });
            act(() => { result.current.markAsSaved(); });

            expect(result.current.playlist).toHaveLength(1);
            expect(result.current.playlist[0]).toBe(songs[1]);
            expect(result.current.selectedSong).toBe(songs[1]);
        });
    });

    describe("moving songs", () => {
        let songs: Song[];

        beforeEach(() => {
            songs = [
                new Song("song1.mp3"),
                new Song("song2.mp3"),
                new Song("song3.mp3"),
            ];
        });

        it("should move a song from one position to another", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.moveSong(0, 2); });

            expect(result.current.playlist[0]).toBe(songs[1]);
            expect(result.current.playlist[1]).toBe(songs[2]);
            expect(result.current.playlist[2]).toBe(songs[0]);
        });

        it("should move a song forward in the list", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.moveSong(0, 1); });

            expect(result.current.playlist[0]).toBe(songs[1]);
            expect(result.current.playlist[1]).toBe(songs[0]);
            expect(result.current.playlist[2]).toBe(songs[2]);
        });

        it("should move a song backward in the list", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.moveSong(2, 0); });

            expect(result.current.playlist[0]).toBe(songs[2]);
            expect(result.current.playlist[1]).toBe(songs[0]);
            expect(result.current.playlist[2]).toBe(songs[1]);
        });

        it("should set hasUnsavedChanges to true after moving a song", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.moveSong(0, 2); });

            expect(result.current.hasUnsavedChanges).toBe(true);
        });

        it("should preserve selectedSong when moving a different song", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[0]);
            });

            act(() => { result.current.moveSong(1, 2); });

            expect(result.current.selectedSong).toBe(songs[0]);
        });

        it("should preserve selectedSong when moving the selected song itself", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[0]);
            });

            act(() => { result.current.moveSong(0, 2); });

            expect(result.current.selectedSong).toBe(songs[0]);
        });

        it("should do nothing when fromIndex equals toIndex", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.moveSong(1, 1); });

            expect(result.current.playlist).toEqual(songs);
            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        it("should do nothing when fromIndex is out of bounds", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.moveSong(5, 0); });

            expect(result.current.playlist).toEqual(songs);
            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        it("should do nothing when toIndex is out of bounds", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => { result.current.setPlaylist(songs); });
            act(() => { result.current.moveSong(0, 5); });

            expect(result.current.playlist).toEqual(songs);
            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        it("should clear hasUnsavedChanges when moves result in the original order", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => { result.current.setPlaylist(songs); });

            // [song1, song2, song3] → move song1 to end → [song2, song3, song1]
            act(() => { result.current.moveSong(0, 2); });
            expect(result.current.hasUnsavedChanges).toBe(true);

            // [song2, song3, song1] → move song1 back to start → [song1, song2, song3]
            act(() => { result.current.moveSong(2, 0); });
            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        it("should maintain correct navigation after moving a song", () => {
            const { result } = renderHook(() => usePlaylistState());

            act(() => {
                result.current.setPlaylist(songs);
                result.current.setSelectedSong(songs[0]);
            });

            act(() => { result.current.moveSong(0, 2); });

            // playlist is now [song2, song3, song1], selected = song1 (index 2 — last)
            act(() => { result.current.selectNext(); });

            expect(result.current.selectedSong).toBe(songs[0]);
        });
    });

    describe("edge cases", () => {
        it("should handle replacing playlist while song is selected", () => {
            const { result } = renderHook(() => usePlaylistState());
            const oldSongs = [new Song("old1.mp3"), new Song("old2.mp3")];
            const newSongs = [new Song("new1.mp3"), new Song("new2.mp3")];

            act(() => {
                result.current.setPlaylist(oldSongs);
                result.current.setSelectedSong(oldSongs[1]);
            });

            expect(result.current.selectedSong).toBe(oldSongs[1]);

            act(() => {
                result.current.setPlaylist(newSongs);
            });

            // Should clear selection when loading new playlist
            expect(result.current.selectedSong).toBeNull();
        });

        it("should handle loading playlist multiple times", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs1 = [new Song("song1.mp3")];
            const songs2 = [new Song("song2.mp3"), new Song("song3.mp3")];

            act(() => {
                result.current.setPlaylist(songs1);
            });

            expect(result.current.playlist).toHaveLength(1);

            act(() => {
                result.current.setPlaylist(songs2);
            });

            expect(result.current.playlist).toHaveLength(2);
            expect(result.current.playlist).toEqual(songs2);
        });
    });
});
