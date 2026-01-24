import { Song } from "./Song";

export class PlaylistManager {
    private songs: Song[] = [];
    private currentIndex: number = -1;

    public setSongs(songs: Song[]) {
        this.songs = songs;
        if (this.songs.length > 0 && this.currentIndex === -1) {
            this.currentIndex = 0;
        } else if (this.songs.length === 0) {
            this.currentIndex = -1;
        }
    }

    public setCurrentSong(song: Song) {
        this.currentIndex = this.songs.findIndex(s => s.getPath() === song.getPath());
    }

    public getCurrentSong(): Song | null {
        if (this.currentIndex >= 0 && this.currentIndex < this.songs.length) {
            return this.songs[this.currentIndex];
        }
        return null;
    }

    public getNext(): Song | null {
        if (this.songs.length === 0) return null;
        if (this.currentIndex < this.songs.length - 1) {
            this.currentIndex++;
            return this.songs[this.currentIndex];
        }
        return this.songs[this.currentIndex]; // Stay at end
    }

    public getPrevious(): Song | null {
        if (this.songs.length === 0) return null;
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.songs[this.currentIndex];
        }
        if (this.currentIndex === -1 && this.songs.length > 0) {
            this.currentIndex = 0;
            return this.songs[0];
        }
        return this.songs[this.currentIndex]; // Stay at start
    }
}
