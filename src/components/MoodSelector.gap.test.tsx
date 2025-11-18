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
    expect(happyButton).toHaveClass('bg-yellow-300');

    // Select Calm - Happy should no longer be active
    const calmButton = screen.getByRole('button', { name: /😌 calm/i });
    await user.click(calmButton);
    expect(calmButton).toHaveClass('bg-blue-300');
    expect(happyButton).not.toHaveClass('bg-yellow-300');

    // Select Motivated
    const motivatedButton = screen.getByRole('button', {
      name: /💪 motivated/i,
    });
    await user.click(motivatedButton);
    expect(motivatedButton).toHaveClass('bg-orange-300');
    expect(calmButton).not.toHaveClass('bg-blue-300');

    // Select Creative
    const creativeButton = screen.getByRole('button', { name: /🎨 creative/i });
    await user.click(creativeButton);
    expect(creativeButton).toHaveClass('bg-purple-300');
    expect(motivatedButton).not.toHaveClass('bg-orange-300');

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
    expect(motivatedButton).toHaveClass('bg-orange-300');
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
    expect(creativeButton).toHaveClass('bg-purple-300');
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
      expect(button.className).toContain('disabled:opacity-50');
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
