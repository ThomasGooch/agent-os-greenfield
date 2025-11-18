import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { InspirationCard } from './InspirationCard';

describe('InspirationCard', () => {
  it('should render with content', async () => {
    const content = 'This is an inspirational message';
    render(<InspirationCard content={content} isLoading={false} />);

    await waitFor(() => {
      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });

  it('should display pulsing animation when loading', () => {
    const { container } = render(
      <InspirationCard content={null} isLoading={true} />
    );

    // Check for animate-pulse class in the DOM
    const pulsingElement = container.querySelector('.animate-pulse');
    expect(pulsingElement).toBeInTheDocument();
  });

  it('should not render when no content and not loading', () => {
    const { container } = render(
      <InspirationCard content={null} isLoading={false} />
    );

    // Component should not render anything
    expect(container.firstChild).toBeNull();
  });

  it('should apply fade-in transition class when content appears', () => {
    const content = 'Inspirational content';
    const { container } = render(
      <InspirationCard content={content} isLoading={false} />
    );

    // Check for transition-opacity class
    const cardElement = container.querySelector('.transition-opacity');
    expect(cardElement).toBeInTheDocument();
  });

  it('should update content when content prop changes', async () => {
    const initialContent = 'First message';
    const { rerender } = render(
      <InspirationCard content={initialContent} isLoading={false} />
    );

    await waitFor(() => {
      expect(screen.getByText(initialContent)).toBeInTheDocument();
    });

    // Update content
    const newContent = 'Second message';
    rerender(<InspirationCard content={newContent} isLoading={false} />);

    await waitFor(() => {
      expect(screen.getByText(newContent)).toBeInTheDocument();
    });
    expect(screen.queryByText(initialContent)).not.toBeInTheDocument();
  });
});
