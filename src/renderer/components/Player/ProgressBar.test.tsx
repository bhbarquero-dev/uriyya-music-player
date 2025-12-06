import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';
import '@testing-library/jest-dom';

describe('ProgressBar', () => {
  it('renders current time and duration', () => {
    render(<ProgressBar currentTime={65} duration={200} />);

    expect(screen.getByText('1:05')).toBeInTheDocument();
    expect(screen.getByText('3:20')).toBeInTheDocument();
  });

  it('renders 0:00 when no track is selected', () => {
    render(<ProgressBar currentTime={0} duration={0} />);

    const timeElements = screen.getAllByText('0:00');
    expect(timeElements).toHaveLength(2); // Both current time and duration should be 0:00
  });

  it('progress bar shows 0% when duration is 0', () => {
    const { container } = render(<ProgressBar currentTime={0} duration={0} />);

    const slider = container.querySelector('.progress-slider');
    expect(slider).toHaveStyle({ '--progress': '0%' });
  });

  // Note: Testing the click interaction on the slider might be tricky due to getBoundingClientRect mocking,
  // but we can at least verify it renders.
});
