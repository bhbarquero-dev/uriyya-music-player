import { render, screen } from '@testing-library/react';
import { SongList } from './SongList';
import '@testing-library/jest-dom';

describe('SongList', () => {
    it('renders song list title', () => {
        render(<SongList />);
        expect(screen.getByText('All Songs')).toBeInTheDocument();
    });

    it('renders table headers', () => {
        render(<SongList />);
        expect(screen.getByText('#')).toBeInTheDocument();
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Artist')).toBeInTheDocument();
        expect(screen.getByText('Album')).toBeInTheDocument();
        expect(screen.getByText('Duration')).toBeInTheDocument();
    });

    it('renders sample songs', () => {
        render(<SongList />);
        expect(screen.getByText('Dreams')).toBeInTheDocument();
        expect(screen.getByText('Fleetwood Mac')).toBeInTheDocument();
        expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
        expect(screen.getByText('Queen')).toBeInTheDocument();
    });
});
