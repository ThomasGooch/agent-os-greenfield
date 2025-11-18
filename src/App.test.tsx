import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test/utils';
import App from './App';
import { ollamaClient } from '@/services/OllamaClient';

vi.mock('@/services/OllamaClient', () => ({
  ollamaClient: {
    checkHealth: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays checking connection status initially', () => {
    vi.mocked(ollamaClient.checkHealth).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<App />);
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });

  it('displays connected status when Ollama is available', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('connected');

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/how are you feeling today/i)
      ).toBeInTheDocument();
    });
  });

  it('displays disconnected error when Ollama is unavailable', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('disconnected');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/ollama not running/i)).toBeInTheDocument();
    });
  });

  it('displays error message when health check fails', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('error');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/connection error/i)).toBeInTheDocument();
    });
  });

  it('renders MoodSelector below Ollama connection status', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('connected');

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/how are you feeling today/i)
      ).toBeInTheDocument();
    });

    // Check that MoodSelector buttons are present
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

  it('disables MoodSelector when Ollama is not connected', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('disconnected');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/ollama not running/i)).toBeInTheDocument();
    });

    // All mood buttons should be disabled
    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    expect(happyButton).toBeDisabled();
  });

  it('logs mood selection when MoodSelector button is clicked', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('connected');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/how are you feeling today/i)
      ).toBeInTheDocument();
    });

    const calmButton = screen.getByRole('button', { name: /😌 calm/i });
    calmButton.click();

    expect(consoleSpy).toHaveBeenCalledWith('Selected mood:', 'calm');

    consoleSpy.mockRestore();
  });
});

// Import agents for InspirationCard integration tests
import { ContentGeneratorAgent } from './agents/ContentGeneratorAgent';
import { MoodInterpreterAgent } from './agents/MoodInterpreterAgent';

describe('App Integration with InspirationCard', () => {
  let mockContentAgent: ContentGeneratorAgent;
  let mockMoodAgent: MoodInterpreterAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('connected');

    // Get singleton instances and mock their methods
    mockContentAgent = ContentGeneratorAgent.getInstance();
    mockMoodAgent = MoodInterpreterAgent.getInstance();

    // Reset mocks
    vi.spyOn(mockMoodAgent, 'getPromptForMood').mockReturnValue('');
    vi.spyOn(mockContentAgent, 'generateContent').mockResolvedValue({
      success: true,
      content: '',
    });
  });

  it('should display loading state in InspirationCard during content generation', async () => {
    // Mock agent behavior with delay
    vi.mocked(mockMoodAgent.getPromptForMood).mockReturnValue(
      'Generate uplifting content'
    );
    vi.mocked(mockContentAgent.generateContent).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () => resolve({ success: true, content: 'You are amazing!' }),
            100
          );
        })
    );

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/how are you feeling today/i)
      ).toBeInTheDocument();
    });

    // Click the happy mood button
    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    happyButton.click();

    // Should show loading state (check for animate-pulse)
    await waitFor(() => {
      const loadingElement = document.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });
  });

  it('should display content from ContentGeneratorAgent after generation', async () => {
    const mockContent = 'Today is a beautiful day!';

    // Mock agent behavior
    vi.mocked(mockMoodAgent.getPromptForMood).mockReturnValue(
      'Generate uplifting content'
    );
    vi.mocked(mockContentAgent.generateContent).mockResolvedValue({
      success: true,
      content: mockContent,
    });

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/how are you feeling today/i)
      ).toBeInTheDocument();
    });

    // Click the happy mood button
    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    happyButton.click();

    // Wait for content to appear
    await waitFor(
      () => {
        expect(screen.getByText(mockContent)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should update content when new mood is selected', async () => {
    const firstContent = 'First inspirational message';
    const secondContent = 'Second inspirational message';

    // Mock agent behavior
    vi.mocked(mockMoodAgent.getPromptForMood).mockReturnValue(
      'Generate content'
    );
    vi.mocked(mockContentAgent.generateContent)
      .mockResolvedValueOnce({
        success: true,
        content: firstContent,
      })
      .mockResolvedValueOnce({
        success: true,
        content: secondContent,
      });

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/how are you feeling today/i)
      ).toBeInTheDocument();
    });

    // Click first mood
    const happyButton = screen.getByRole('button', { name: /😊 happy/i });
    happyButton.click();

    await waitFor(
      () => {
        expect(screen.getByText(firstContent)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click second mood
    const calmButton = screen.getByRole('button', { name: /😌 calm/i });
    calmButton.click();

    await waitFor(
      () => {
        expect(screen.getByText(secondContent)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
