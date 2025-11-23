import { fireEvent, render, screen } from '@testing-library/react';
import { Player } from './Player';
import '@testing-library/jest-dom';

describe('Player', () => {
  it('renders player controls', () => {
    render(<Player />);

    expect(screen.getByLabelText('Previous Track')).toBeInTheDocument();
    expect(screen.getByLabelText('Play')).toBeInTheDocument();
    expect(screen.getByLabelText('Next Track')).toBeInTheDocument();
    expect(screen.getByLabelText('Volume Control')).toBeInTheDocument();
  });

  it('toggles play/pause state', () => {
    render(<Player />);

    const playButton = screen.getByLabelText('Play');
    fireEvent.click(playButton);

    expect(screen.getByLabelText('Pause')).toBeInTheDocument();

    const pauseButton = screen.getByLabelText('Pause');
    fireEvent.click(pauseButton);

    expect(screen.getByLabelText('Play')).toBeInTheDocument();
  });

  it('toggles volume slider visibility', () => {
    render(<Player />);

    const volumeButton = screen.getByLabelText('Volume Control');
    fireEvent.click(volumeButton);

    expect(screen.getByRole('slider', { name: 'Volume Slider' })).toBeInTheDocument();

    fireEvent.click(volumeButton);
    expect(screen.queryByRole('slider', { name: 'Volume Slider' })).not.toBeInTheDocument();
  });

  it('adjusts volume via slider interaction', () => {
    render(<Player />);

    // Open volume slider
    fireEvent.click(screen.getByLabelText('Volume Control'));
    const slider = screen.getByRole('slider', { name: 'Volume Slider' });

    // Test keyboard interaction
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    expect(slider).toHaveAttribute('aria-valuenow', '55'); // Initial 50 + 5

    fireEvent.keyDown(slider, { key: 'ArrowDown' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');

    fireEvent.keyDown(slider, { key: 'Home' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');

    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider).toHaveAttribute('aria-valuenow', '100');
  });
});
