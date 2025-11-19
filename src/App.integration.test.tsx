import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock hooks
vi.mock('@/hooks/useOllamaHealth');
vi.mock('@/hooks/useNetworkStatus');
vi.mock('@/hooks/useCircuitBreaker');
vi.mock('@/agents/ContentGeneratorAgent');
vi.mock('@/agents/MoodInterpreterAgent');

import { useOllamaHealth } from '@/hooks/useOllamaHealth';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useCircuitBreaker } from '@/hooks/useCircuitBreaker';
import { ContentGeneratorAgent } from '@/agents/ContentGeneratorAgent';
import { MoodInterpreterAgent } from '@/agents/MoodInterpreterAgent';

// Mock agent types
type MockContentGeneratorAgent = Pick<
  ContentGeneratorAgent,
  'getCircuitOpenUntil' | 'generateContent'
>;
type MockMoodInterpreterAgent = Pick<
  MoodInterpreterAgent,
  'interpretMood' | 'getPromptForMood'
>;

describe('App - Error Handling Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(useOllamaHealth).mockReturnValue({
      status: 'connected',
      isChecking: false,
    });

    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: true,
    });

    vi.mocked(useCircuitBreaker).mockReturnValue({
      remainingSeconds: 0,
      isCircuitOpen: false,
    });

    // Mock agent instances
    const mockContentAgent: MockContentGeneratorAgent = {
      getCircuitOpenUntil: vi.fn(() => 0),
      generateContent: vi.fn(async () => ({
        success: true,
        content: 'Test inspirational content',
      })),
    };

    vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
      mockContentAgent as unknown as ContentGeneratorAgent
    );

    const mockMoodAgent: MockMoodInterpreterAgent = {
      interpretMood: vi.fn(() => ({
        primaryMood: 'happy',
        intensity: 'moderate',
        context: 'positive',
      })),
      getPromptForMood: vi.fn(() => 'Test prompt'),
    };

    vi.mocked(MoodInterpreterAgent.getInstance).mockReturnValue(
      mockMoodAgent as unknown as MoodInterpreterAgent
    );
  });

  it('should disable mood selection when offline', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: false,
    });

    render(<App />);

    expect(screen.getByText('You appear to be offline')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should show circuit breaker countdown when circuit is open', () => {
    vi.mocked(useCircuitBreaker).mockReturnValue({
      remainingSeconds: 42,
      isCircuitOpen: true,
    });

    render(<App />);

    expect(
      screen.getByText(/Service temporarily unavailable\. Try again in 42s/)
    ).toBeInTheDocument();
  });

  it('should disable mood selection when circuit breaker is open', () => {
    vi.mocked(useCircuitBreaker).mockReturnValue({
      remainingSeconds: 30,
      isCircuitOpen: true,
    });

    render(<App />);

    expect(
      screen.getByText(/Service temporarily unavailable/)
    ).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should show error toast when content generation fails', async () => {
    const mockContentAgent: MockContentGeneratorAgent = {
      getCircuitOpenUntil: vi.fn(() => 0),
      generateContent: vi.fn(async () => ({
        success: false,
        error: 'Generation failed',
      })),
    };

    vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
      mockContentAgent as unknown as ContentGeneratorAgent
    );

    const user = userEvent.setup();
    render(<App />);

    const happyButton = screen.getByRole('button', { name: /happy/i });
    await user.click(happyButton);

    await waitFor(() => {
      expect(screen.getByText('Generation failed')).toBeInTheDocument();
    });
  });

  it('should enable mood selection when online, not loading, and Ollama connected', () => {
    vi.mocked(useOllamaHealth).mockReturnValue({
      status: 'connected',
      isChecking: false,
    });

    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: true,
    });

    vi.mocked(useCircuitBreaker).mockReturnValue({
      remainingSeconds: 0,
      isCircuitOpen: false,
    });

    render(<App />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should prioritize offline message over other status messages', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: false,
    });

    vi.mocked(useOllamaHealth).mockReturnValue({
      status: 'disconnected',
      isChecking: false,
    });

    render(<App />);

    expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
    expect(screen.queryByText('Ollama not running')).not.toBeInTheDocument();
  });

  it('should show Ollama disconnected message when online but Ollama not running', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({
      isOnline: true,
    });

    vi.mocked(useOllamaHealth).mockReturnValue({
      status: 'disconnected',
      isChecking: false,
    });

    vi.mocked(useCircuitBreaker).mockReturnValue({
      remainingSeconds: 0,
      isCircuitOpen: false,
    });

    render(<App />);

    expect(screen.getByText('Ollama not running')).toBeInTheDocument();
  });
});
