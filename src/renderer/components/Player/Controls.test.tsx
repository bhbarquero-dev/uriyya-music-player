import { fireEvent, render, screen } from '@testing-library/react';
import { Controls } from './Controls';
import '@testing-library/jest-dom';

describe('Controls', () => {
  const mockOnPlayPause = jest.fn();
  const mockOnPrevious = jest.fn();
  const mockOnNext = jest.fn();

  it('renders play button when not playing', () => {
    render(
      <Controls
        isPlaying={false}
        onPlayPause={mockOnPlayPause}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
      />
    );
    expect(screen.getByLabelText('Play')).toBeInTheDocument();
  });

  it('renders pause button when playing', () => {
    render(
      <Controls
        isPlaying={true}
        onPlayPause={mockOnPlayPause}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
      />
    );
    expect(screen.getByLabelText('Pause')).toBeInTheDocument();
  });

  it('calls onPlayPause when play/pause button is clicked', () => {
    render(
      <Controls
        isPlaying={false}
        onPlayPause={mockOnPlayPause}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
      />
    );
    fireEvent.click(screen.getByLabelText('Play'));
    expect(mockOnPlayPause).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevious when previous button is clicked', () => {
    render(
      <Controls
        isPlaying={false}
        onPlayPause={mockOnPlayPause}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
      />
    );
    fireEvent.click(screen.getByLabelText('Previous Track'));
    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next button is clicked', () => {
    render(
      <Controls
        isPlaying={false}
        onPlayPause={mockOnPlayPause}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
      />
    );
    fireEvent.click(screen.getByLabelText('Next Track'));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });
});
