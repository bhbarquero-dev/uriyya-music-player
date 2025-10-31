import '../styles/sidebar.css';

export const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>Uriyyá Music Player</h1>
            </div>
            
            <div className="section-title">Browse</div>
            <ul className="nav-menu">
                <li className="nav-item active">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"/>
                    </svg>
                    Home
                </li>
                <li className="nav-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 .5-.866zM16 4.732V20h4V7.041l-4-2.309zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3zm1-2h4V4H4v16z"/>
                    </svg>
                    Browse
                </li>
                <li className="nav-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 4v12.167a3.5 3.5 0 1 1-3.5-3.5H12V4h3zm-1.5 12.167a2 2 0 1 0-4 0 2 2 0 0 0 4 0zm7-.167h-2V4h2v12zm-11-12H12v6H9.5V4z"/>
                    </svg>
                    Radio
                </li>
            </ul>

            <div className="section-title">Your Playlists</div>
            <ul className="nav-menu">
                <li className="nav-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h7v1.5H4v16h16V13h1.5v8a1 1 0 0 1-1 1H3zm12.489-5.726a4.5 4.5 0 1 1 .637-.637L20.5 20l-.963.963-4.048-4.689zm1.011-1.511a3 3 0 1 0-4.242-4.242 3 3 0 0 0 4.242 4.242z"/>
                    </svg>
                    Recently Added
                </li>
                <li className="nav-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 .5-.866zM16 4.732V20h4V7.041l-4-2.309zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3zm1-2h4V4H4v16z"/>
                    </svg>
                    Albums
                </li>
                <li className="nav-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM1.5 12C1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12 17.799 22.5 12 22.5 1.5 17.799 1.5 12z"/>
                        <path d="M12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 1.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                    </svg>
                    Artists
                </li>
            </ul>
        </aside>
    );
};