import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { MoodSelector } from './MoodSelector';

describe('MoodSelector - Gap Analysis Tests', () => {
  it('should persist active state across multiple consecutive mood selections', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={false} onMoodSelect={mockCallback} />);

    // Select Happy
    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    await user.click(happyButton);
    expect(happyButton).toHaveClass('ring-2', 'ring-gray-900');

    // Select Calm - Happy should no longer be active
    const calmButton = screen.getByRole('button', { name: /😌 calm/i });
    await user.click(calmButton);
    expect(calmButton).toHaveClass('ring-2', 'ring-gray-900');
    expect(happyButton).not.toHaveClass('ring-2');

    // Select Motivated - Calm should no longer be active
    const motivatedButton = screen.getByRole('button', {
      name: /💪 motivated/i,
    });
    await user.click(motivatedButton);
    expect(motivatedButton).toHaveClass('ring-2', 'ring-gray-900');
    expect(calmButton).not.toHaveClass('ring-2');

    // Select Creative - Motivated should no longer be active
    const creativeButton = screen.getByRole('button', { name: /🎨 creative/i });
    await user.click(creativeButton);
    expect(creativeButton).toHaveClass('ring-2', 'ring-gray-900');
    expect(motivatedButton).not.toHaveClass('ring-2');

    expect(mockCallback).toHaveBeenCalledTimes(4);
  });

  it('should handle rapid consecutive clicks on different buttons', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={false} onMoodSelect={mockCallback} />);

    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    const calmButton = screen.getByRole('button', { name: /😌 calm/i });
    const motivatedButton = screen.getByRole('button', {
      name: /💪 motivated/i,
    });

    // Rapid clicks
    await user.click(happyButton);
    await user.click(calmButton);
    await user.click(motivatedButton);

    expect(mockCallback).toHaveBeenCalledTimes(3);
    expect(mockCallback).toHaveBeenNthCalledWith(1, 'happy');
    expect(mockCallback).toHaveBeenNthCalledWith(2, 'calm');
    expect(mockCallback).toHaveBeenNthCalledWith(3, 'motivated');

    // Last clicked button should be active
    expect(motivatedButton).toHaveClass('ring-2', 'ring-gray-900');
  });

  it('should complete full keyboard navigation flow through all buttons', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={false} onMoodSelect={mockCallback} />);

    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    const calmButton = screen.getByRole('button', { name: /😌 calm/i });
    const motivatedButton = screen.getByRole('button', {
      name: /💪 motivated/i,
    });
    const creativeButton = screen.getByRole('button', { name: /🎨 creative/i });

    // Tab through all buttons
    await user.tab();
    expect(happyButton).toHaveFocus();

    await user.tab();
    expect(calmButton).toHaveFocus();

    await user.tab();
    expect(motivatedButton).toHaveFocus();

    await user.tab();
    expect(creativeButton).toHaveFocus();

    // Activate last button with Space
    await user.keyboard(' ');
    expect(mockCallback).toHaveBeenCalledWith('creative');
    expect(creativeButton).toHaveClass('ring-2', 'ring-gray-900');
  });

  it('should maintain disabled state consistently across all buttons', () => {
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={true} onMoodSelect={mockCallback} />);

    const buttons = [
      screen.getByRole('button', { name: /😊 happy/i }),
      screen.getByRole('button', { name: /😌 calm/i }),
      screen.getByRole('button', { name: /💪 motivated/i }),
      screen.getByRole('button', { name: /🎨 creative/i }),
    ];

    buttons.forEach((button) => {
      expect(button).toBeDisabled();
      // Check that disabled classes are present in the className string
      expect(button.className).toContain('disabled:opacity-30');
      expect(button.className).toContain('disabled:cursor-not-allowed');
    });
  });

  it('should apply correct ARIA attributes for accessibility', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={false} onMoodSelect={mockCallback} />);

    const happyButton = screen.getByRole('button', { name: /😊 happy/i });

    // Initially not pressed
    expect(happyButton).toHaveAttribute('aria-pressed', 'false');
    expect(happyButton).toHaveAttribute('aria-label', '😊 Happy');

    // After clicking, should be pressed
    await user.click(happyButton);
    expect(happyButton).toHaveAttribute('aria-pressed', 'true');
  });
});
