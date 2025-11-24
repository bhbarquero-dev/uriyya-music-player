import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

// Mock child components to isolate App component testing
jest.mock('./components/Player', () => ({
    Player: () => <div data-testid="player">Player Component</div>
}));

jest.mock('./components/Sidebar', () => ({
    Sidebar: () => <div data-testid="sidebar">Sidebar Component</div>
}));

jest.mock('./components/SongList', () => ({
    SongList: () => <div data-testid="songlist">SongList Component</div>
}));

describe('App', () => {
    it('should render without crashing', () => {
        render(<App />);
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('songlist')).toBeInTheDocument();
        expect(screen.getByTestId('player')).toBeInTheDocument();
    });

    it('should render all main components', () => {
        render(<App />);

        // Verify Sidebar is rendered
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();

        // Verify SongList is rendered
        expect(screen.getByTestId('songlist')).toBeInTheDocument();

        // Verify Player is rendered
        expect(screen.getByTestId('player')).toBeInTheDocument();
    });

    it('should have correct layout structure', () => {
        const { container } = render(<App />);

        // Verify app-container exists
        const appContainer = container.querySelector('.app-container');
        expect(appContainer).toBeInTheDocument();

        // Verify main-content exists
        const mainContent = container.querySelector('.main-content');
        expect(mainContent).toBeInTheDocument();
    });

    it('should render components in correct order', () => {
        const { container } = render(<App />);

        const appContainer = container.querySelector('.app-container');
        const children = appContainer?.children;

        // Sidebar should be first
        expect(children?.[0]).toHaveAttribute('data-testid', 'sidebar');

        // Main content should be second
        expect(children?.[1]).toHaveClass('main-content');

        // Player should be third
        expect(children?.[2]).toHaveAttribute('data-testid', 'player');
    });
});
