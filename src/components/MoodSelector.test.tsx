import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { MoodSelector } from './MoodSelector';

describe('MoodSelector', () => {
  it('should render all four mood buttons', () => {
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={false} onMoodSelect={mockCallback} />);

    expect(
      screen.getByRole('button', { name: /😊 happy/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /😌 calm/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /💪 motivated/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /🎨 creative/i })
    ).toBeInTheDocument();
  });

  it('should call onMoodSelect with correct mood when button is clicked', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={false} onMoodSelect={mockCallback} />);

    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    await user.click(happyButton);

    expect(mockCallback).toHaveBeenCalledWith('happy');
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should not call onMoodSelect when disabled', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={true} onMoodSelect={mockCallback} />);

    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    await user.click(happyButton);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should display active state styling on selected mood', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={false} onMoodSelect={mockCallback} />);

    const calmButton = screen.getByRole('button', { name: /😌 calm/i });
    await user.click(calmButton);

    // Active state should be visible (ring-2 ring-gray-900)
    expect(calmButton).toHaveClass('ring-2', 'ring-gray-900');
  });

  it('should maintain active state when clicking same mood again', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={false} onMoodSelect={mockCallback} />);

    const motivatedButton = screen.getByRole('button', {
      name: /💪 motivated/i,
    });

    // Click once
    await user.click(motivatedButton);
    expect(mockCallback).toHaveBeenCalledWith('motivated');
    expect(motivatedButton).toHaveClass('ring-2', 'ring-gray-900');

    // Click again
    await user.click(motivatedButton);
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(motivatedButton).toHaveClass('ring-2', 'ring-gray-900');
  });

  it('should support keyboard navigation with Tab, Enter, and Space', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();
    render(<MoodSelector disabled={false} onMoodSelect={mockCallback} />);

    // Tab to first button
    await user.tab();
    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    expect(happyButton).toHaveFocus();

    // Activate with Enter
    await user.keyboard('{Enter}');
    expect(mockCallback).toHaveBeenCalledWith('happy');

    // Tab to next button
    await user.tab();
    const calmButton = screen.getByRole('button', { name: /😌 calm/i });
    expect(calmButton).toHaveFocus();

    // Activate with Space
    await user.keyboard(' ');
    expect(mockCallback).toHaveBeenCalledWith('calm');
  });
});
