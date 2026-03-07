import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlaylistState } from "../../src/hooks/usePlaylistState";
import { Song } from "../../src/logic/Song";

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

        it("should auto-select first song when loading non-empty playlist", () => {
            const { result } = renderHook(() => usePlaylistState());
            const songs = [new Song("song1.mp3"), new Song("song2.mp3")];

            act(() => {
                result.current.setPlaylist(songs);
            });

            expect(result.current.selectedSong).toBe(songs[0]);
        });

        it("should not auto-select if a song is already selected", () => {
            const { result } = renderHook(() => usePlaylistState());
            const song1 = new Song("song1.mp3");
            const song2 = new Song("song2.mp3");

            act(() => {
                result.current.setSelectedSong(song1);
                result.current.setPlaylist([song1, song2]);
            });

            expect(result.current.selectedSong).toBe(song1);
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
            });

            expect(result.current.selectedSong).toBe(songs[0]);

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
            });

            expect(result.current.selectedSong).toBe(songs[0]);

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

            // Should keep old selection when loading new playlist
            expect(result.current.selectedSong).toBe(oldSongs[1]);
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
