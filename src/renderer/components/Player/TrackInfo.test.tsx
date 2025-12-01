import { render, screen } from '@testing-library/react';
import { TrackInfo } from './TrackInfo';
import '@testing-library/jest-dom';

describe('TrackInfo', () => {
  it('renders track title and artist', () => {
    render(<TrackInfo title="Test Song" artist="Test Artist" />);

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('renders placeholder text when no track is selected', () => {
    render(<TrackInfo />);

    expect(screen.getByText('No track selected')).toBeInTheDocument();
    expect(screen.getByText('Select a song to play')).toBeInTheDocument();
  });
});
