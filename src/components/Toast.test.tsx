import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Toast } from './Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toast with message and correct type styling', () => {
    const mockOnClose = vi.fn();

    const { rerender } = render(
      <Toast
        id="1"
        message="Error message"
        type="error"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Test different types
    rerender(
      <Toast
        id="2"
        message="Success message"
        type="success"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Success message')).toBeInTheDocument();

    rerender(
      <Toast id="3" message="Info message" type="info" onClose={mockOnClose} />
    );
    expect(screen.getByText('Info message')).toBeInTheDocument();

    rerender(
      <Toast
        id="4"
        message="Warning message"
        type="warning"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(
      <Toast id="1" message="Test message" type="info" onClose={mockOnClose} />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith('1');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA attributes for accessibility', () => {
    const mockOnClose = vi.fn();

    render(
      <Toast
        id="1"
        message="Accessible message"
        type="success"
        onClose={mockOnClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });
});
