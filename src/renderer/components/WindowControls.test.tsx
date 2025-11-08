import { fireEvent, render, screen } from '@testing-library/react';
import { WindowControls } from './WindowControls';
import '@testing-library/jest-dom';

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
