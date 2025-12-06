import { fireEvent, render, screen } from '@testing-library/react';
import { Player } from './index';
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

  it('renders volume slider always visible', () => {
    render(<Player />);

    expect(screen.getByRole('slider', { name: 'Volume Slider' })).toBeInTheDocument();
  });
});
