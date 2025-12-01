import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import '@testing-library/jest-dom';

describe('Sidebar', () => {

  it('renders navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Recently Added')).toBeInTheDocument();
    expect(screen.getByText('Albums')).toBeInTheDocument();
    expect(screen.getByText('Artists')).toBeInTheDocument();
  });

  it('renders section title', () => {
    render(<Sidebar />);
    expect(screen.getByText('Your Playlists')).toBeInTheDocument();
  });

  it('renders add playlist button', () => {
    render(<Sidebar />);
    expect(screen.getByLabelText('Add Playlist')).toBeInTheDocument();
  });
});
