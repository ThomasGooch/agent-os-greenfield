import { describe, it, expect } from 'vitest';
import { render, screen } from './test/utils';
import App from './App';

describe('App', () => {
  it('renders Hello World text', () => {
    render(<App />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders with proper styling classes', () => {
    render(<App />);
    const heading = screen.getByText('Hello World');
    expect(heading).toHaveClass('text-4xl', 'font-bold');
  });
});
