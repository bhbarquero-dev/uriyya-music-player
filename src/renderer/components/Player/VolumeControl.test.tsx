import { fireEvent, render, screen } from '@testing-library/react';
import { VolumeControl } from './VolumeControl';
import '@testing-library/jest-dom';

describe('VolumeControl', () => {
  const mockOnVolumeChange = jest.fn();

  beforeEach(() => {
    mockOnVolumeChange.mockClear();
  });

  it('renders volume slider always visible', () => {
    render(<VolumeControl volume={50} onVolumeChange={mockOnVolumeChange} />);

    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByLabelText('Volume Control')).toBeInTheDocument();
  });

  it('handles click interaction on slider', () => {
    render(<VolumeControl volume={50} onVolumeChange={mockOnVolumeChange} />);

    const slider = screen.getByRole('slider');

    // Mock getBoundingClientRect to simulate slider dimensions
    const mockGetBoundingClientRect = jest.fn(() => ({
      left: 0,
      width: 100,
      top: 0,
      right: 100,
      bottom: 10,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => { },
    }));
    slider.getBoundingClientRect = mockGetBoundingClientRect;

    // Click at 75% of the slider width (should set volume to 75)
    fireEvent.click(slider, { clientX: 75 });
    expect(mockOnVolumeChange).toHaveBeenCalledWith(75);

    // Click at 25% of the slider width (should set volume to 25)
    fireEvent.click(slider, { clientX: 25 });
    expect(mockOnVolumeChange).toHaveBeenCalledWith(25);

    // Click at 100% of the slider width (should set volume to 100)
    fireEvent.click(slider, { clientX: 100 });
    expect(mockOnVolumeChange).toHaveBeenCalledWith(100);
  });
});
