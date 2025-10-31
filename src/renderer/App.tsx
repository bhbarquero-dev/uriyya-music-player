import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { SongList } from './components/SongList';
import { Titlebar } from './components/Titlebar';
import './styles/variables.css';
import './styles/layout.css';

export default function App() {
    return (
        <>
            <Titlebar />
            <div className="app-container">
                <Sidebar />
                <main className="main-content">
                    <SongList />
                </main>
                <Player />
            </div>
        </>
    );
}
