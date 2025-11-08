import { render, screen, fireEvent } from '@testing-library/react';
import { WindowControls } from '../../../../src/renderer/components/WindowControls';

describe('WindowControls', () => {
  it('renders window control buttons', () => {
    render(<WindowControls />);

    expect(screen.getByRole('button', { name: /minimize/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /maximize/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('handles window control actions', () => {
    const getCurrentWindow = require('@electron/remote').getCurrentWindow;
    render(<WindowControls />);

    fireEvent.click(screen.getByRole('button', { name: /minimize/i }));
    expect(getCurrentWindow().minimize).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /maximize/i }));
    expect(getCurrentWindow().maximize).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(getCurrentWindow().close).toHaveBeenCalled();
  });
});
