import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { MoodSelector } from './MoodSelector';

describe('MoodSelector - Disabled State', () => {
  it('should disable all buttons when disabled prop is true', () => {
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={true} onMoodSelect={mockCallback} />);

    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    const calmButton = screen.getByRole('button', { name: /😌 calm/i });
    const motivatedButton = screen.getByRole('button', {
      name: /💪 motivated/i,
    });
    const creativeButton = screen.getByRole('button', { name: /🎨 creative/i });

    expect(happyButton).toBeDisabled();
    expect(calmButton).toBeDisabled();
    expect(motivatedButton).toBeDisabled();
    expect(creativeButton).toBeDisabled();
  });

  it('should apply disabled styling when disabled', () => {
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={true} onMoodSelect={mockCallback} />);

    const happyButton = screen.getByRole('button', { name: /😊 happy/i });

    // Check for disabled classes
    expect(happyButton).toHaveClass('disabled:opacity-50');
    expect(happyButton).toHaveClass('disabled:cursor-not-allowed');
  });

  it('should not call onMoodSelect when button is clicked while disabled', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={true} onMoodSelect={mockCallback} />);

    const happyButton = screen.getByRole('button', { name: /😊 happy/i });

    // Try to click disabled button
    await user.click(happyButton);

    // Should not trigger callback
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should enable all buttons when disabled prop is false', () => {
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={false} onMoodSelect={mockCallback} />);

    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    const calmButton = screen.getByRole('button', { name: /😌 calm/i });

    expect(happyButton).not.toBeDisabled();
    expect(calmButton).not.toBeDisabled();
  });
});
