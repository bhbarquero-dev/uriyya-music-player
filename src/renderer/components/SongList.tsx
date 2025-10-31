import '../styles/songList.css';

interface Song {
    id: number;
    title: string;
    artist: string;
    album: string;
    duration: string;
}

const sampleSongs: Song[] = [
    {
        id: 1,
        title: "Dreams",
        artist: "Fleetwood Mac",
        album: "Rumours",
        duration: "4:14"
    },
    {
        id: 2,
        title: "Bohemian Rhapsody",
        artist: "Queen",
        album: "A Night at the Opera",
        duration: "5:55"
    },
    {
        id: 3,
        title: "Hotel California",
        artist: "Eagles",
        album: "Hotel California",
        duration: "6:30"
    },
    {
        id: 4,
        title: "Sweet Child O' Mine",
        artist: "Guns N' Roses",
        album: "Appetite for Destruction",
        duration: "5:56"
    },
    {
        id: 5,
        title: "Purple Rain",
        artist: "Prince",
        album: "Purple Rain",
        duration: "8:41"
    },
];

export const SongList = () => {
    return (
        <div className="song-list">
            <div className="song-list-header">
                <h1 className="song-list-title">All Songs</h1>
            </div>

            <div>
                <div className="songs-grid songs-header">
                    <div>#</div>
                    <div>Title</div>
                    <div>Artist</div>
                    <div>Album</div>
                    <div>Duration</div>
                </div>

                {sampleSongs.map((song) => (
                    <div key={song.id} className="songs-grid song-row">
                        <div className="song-index">{song.id}</div>
                        <div className="song-title">{song.title}</div>
                        <div>{song.artist}</div>
                        <div>{song.album}</div>
                        <div className="song-duration">{song.duration}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};