import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
interface MockMoodInterpreterAgent {
  interpretMood: (mood: string) => {
    primaryMood: string;
    intensity: string;
    context: string;
  };
  getPromptForMood: (mood: string) => string;
}

describe('App - End-to-End Error Recovery Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: Everything working
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

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Priority 1: End-to-End Recovery Flows', () => {
    it('should show error toast on empty response, then succeed on manual retry', async () => {
      let callCount = 0;
      const mockContentAgent = {
        getCircuitOpenUntil: vi.fn(() => 0),
        generateContent: vi.fn(async () => {
          callCount++;
          // First call returns empty, second call succeeds
          if (callCount === 1) {
            return {
              success: false,
              error: 'Unable to generate content. Please try again',
            };
          }
          return {
            success: true,
            content: 'Inspirational content after retry',
          };
        }),
      };

      vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
        mockContentAgent as unknown as ContentGeneratorAgent
      );

      const user = userEvent.setup();
      render(<App />);

      const happyButton = screen.getByRole('button', { name: /happy/i });

      // First click - should show error toast
      await user.click(happyButton);

      await waitFor(() => {
        expect(
          screen.getByText('Unable to generate content. Please try again')
        ).toBeInTheDocument();
      });

      // User clicks again to retry
      await user.click(happyButton);

      // Should now show success content
      await waitFor(() => {
        expect(
          screen.getByText(/Inspirational content after retry/)
        ).toBeInTheDocument();
      });

      // Agent should have been called twice (initial + manual retry)
      expect(mockContentAgent.generateContent).toHaveBeenCalledTimes(2);
    });

    it('should show error toast on interrupted generation, then succeed on manual retry', async () => {
      let callCount = 0;
      const mockContentAgent = {
        getCircuitOpenUntil: vi.fn(() => 0),
        generateContent: vi.fn(async () => {
          callCount++;
          // First call returns very short response, second succeeds
          if (callCount === 1) {
            return {
              success: false,
              error: 'Generation failed. Please try again',
            };
          }
          return {
            success: true,
            content: 'Full inspirational content after fixing interruption',
          };
        }),
      };

      vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
        mockContentAgent as unknown as ContentGeneratorAgent
      );

      const user = userEvent.setup();
      render(<App />);

      const calmButton = screen.getByRole('button', { name: /calm/i });

      // First click - should show error
      await user.click(calmButton);

      await waitFor(() => {
        expect(
          screen.getByText('Generation failed. Please try again')
        ).toBeInTheDocument();
      });

      // User clicks again to retry
      await user.click(calmButton);

      // Should now show success
      await waitFor(() => {
        expect(
          screen.getByText(
            /Full inspirational content after fixing interruption/
          )
        ).toBeInTheDocument();
      });

      expect(mockContentAgent.generateContent).toHaveBeenCalledTimes(2);
    });

    it('should handle network recovery flow: offline → online → retry → success', async () => {
      const mockContentAgent = {
        getCircuitOpenUntil: vi.fn(() => 0),
        generateContent: vi.fn(async () => ({
          success: true,
          content: 'Content generated after network recovery',
        })),
      };

      vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
        mockContentAgent as unknown as ContentGeneratorAgent
      );

      // Start offline
      vi.mocked(useNetworkStatus).mockReturnValue({
        isOnline: false,
      });

      const { rerender } = render(<App />);

      // Verify offline state
      expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });

      // Come back online
      vi.mocked(useNetworkStatus).mockReturnValue({
        isOnline: true,
      });

      rerender(<App />);

      // Now buttons should be enabled
      await waitFor(() => {
        const enabledButtons = screen.getAllByRole('button');
        enabledButtons.forEach((button) => {
          expect(button).not.toBeDisabled();
        });
      });

      // Click and generate
      const user = userEvent.setup();
      const motivatedButton = screen.getByRole('button', {
        name: /motivated/i,
      });
      await user.click(motivatedButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Content generated after network recovery/)
        ).toBeInTheDocument();
      });
    });

    it('should show circuit breaker countdown, then enable buttons when closed', () => {
      const mockContentAgent = {
        getCircuitOpenUntil: vi.fn(() => Date.now() + 5000), // 5 seconds from now
        generateContent: vi.fn(async () => ({
          success: true,
          content: 'Content after circuit breaker closed',
        })),
      };

      vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
        mockContentAgent as unknown as ContentGeneratorAgent
      );

      // Circuit breaker open with 5 seconds remaining
      vi.mocked(useCircuitBreaker).mockReturnValue({
        remainingSeconds: 5,
        isCircuitOpen: true,
      });

      const { rerender } = render(<App />);

      // Verify circuit breaker state
      expect(
        screen.getByText(/Service temporarily unavailable\. Try again in 5s/)
      ).toBeInTheDocument();

      // Buttons should be disabled
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });

      // Circuit closes
      vi.mocked(useCircuitBreaker).mockReturnValue({
        remainingSeconds: 0,
        isCircuitOpen: false,
      });

      mockContentAgent.getCircuitOpenUntil.mockReturnValue(0);

      rerender(<App />);

      // Buttons should now be enabled
      const enabledButtons = screen.getAllByRole('button');
      enabledButtons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Priority 2: Toast Integration', () => {
    it('should deduplicate multiple rapid identical errors', async () => {
      const mockContentAgent = {
        getCircuitOpenUntil: vi.fn(() => 0),
        generateContent: vi.fn(async () => ({
          success: false,
          error: 'Same error message',
        })),
      };

      vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
        mockContentAgent as unknown as ContentGeneratorAgent
      );

      const user = userEvent.setup();
      render(<App />);

      // Click three times rapidly
      const happyButton = screen.getByRole('button', { name: /happy/i });
      await user.click(happyButton);
      await user.click(happyButton);
      await user.click(happyButton);

      await waitFor(() => {
        const errorToasts = screen.getAllByText('Same error message');
        // Should only show one toast due to deduplication
        expect(errorToasts).toHaveLength(1);
      });
    });

    it('should show different toasts for different error types', async () => {
      let callCount = 0;
      const mockContentAgent = {
        getCircuitOpenUntil: vi.fn(() => 0),
        generateContent: vi.fn(async () => {
          callCount++;
          if (callCount === 1) {
            return { success: false, error: 'Empty response error' };
          } else if (callCount === 2) {
            return { success: false, error: 'Network error' };
          } else {
            return { success: false, error: 'Timeout error' };
          }
        }),
      };

      vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
        mockContentAgent as unknown as ContentGeneratorAgent
      );

      const user = userEvent.setup();
      render(<App />);

      const happyButton = screen.getByRole('button', { name: /happy/i });

      // Trigger first error
      await user.click(happyButton);
      await waitFor(() => {
        expect(screen.getByText('Empty response error')).toBeInTheDocument();
      });

      // Trigger second error
      await user.click(happyButton);
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Trigger third error
      await user.click(happyButton);
      await waitFor(() => {
        expect(screen.getByText('Timeout error')).toBeInTheDocument();
      });

      // All three should be visible
      expect(screen.getByText('Empty response error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Timeout error')).toBeInTheDocument();
    });

    it('should handle error toast remaining visible during manual retry', async () => {
      let callCount = 0;
      const mockContentAgent = {
        getCircuitOpenUntil: vi.fn(() => 0),
        generateContent: vi.fn(async () => {
          callCount++;
          if (callCount === 1) {
            return { success: false, error: 'Initial error' };
          }
          return {
            success: true,
            content: 'Success after error',
          };
        }),
      };

      vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
        mockContentAgent as unknown as ContentGeneratorAgent
      );

      const user = userEvent.setup();
      render(<App />);

      const happyButton = screen.getByRole('button', { name: /happy/i });

      // First click - error
      await user.click(happyButton);

      // Wait for error toast
      await waitFor(() => {
        expect(screen.getByText('Initial error')).toBeInTheDocument();
      });

      // User manually retries immediately (within 5s toast duration)
      await user.click(happyButton);

      // Should show success content
      await waitFor(() => {
        expect(screen.getByText(/Success after error/)).toBeInTheDocument();
      });

      // Error toast might still be visible - this is acceptable
      // It will auto-dismiss after 5 seconds
    });
  });

  describe('Priority 3: Multiple Error Conditions', () => {
    it('should prioritize offline message when both offline and circuit breaker open', () => {
      vi.mocked(useNetworkStatus).mockReturnValue({
        isOnline: false,
      });

      vi.mocked(useCircuitBreaker).mockReturnValue({
        remainingSeconds: 30,
        isCircuitOpen: true,
      });

      const mockContentAgent = {
        getCircuitOpenUntil: vi.fn(() => Date.now() + 30000),
        generateContent: vi.fn(),
      };

      vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
        mockContentAgent as unknown as ContentGeneratorAgent
      );

      render(<App />);

      // Offline should take priority
      expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
      expect(
        screen.queryByText(/Service temporarily unavailable/)
      ).not.toBeInTheDocument();

      // Buttons should be disabled
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should show circuit breaker countdown when coming online with circuit still open', () => {
      const mockContentAgent = {
        getCircuitOpenUntil: vi.fn(() => Date.now() + 15000),
        generateContent: vi.fn(),
      };

      vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
        mockContentAgent as unknown as ContentGeneratorAgent
      );

      // Start offline with circuit breaker open
      vi.mocked(useNetworkStatus).mockReturnValue({
        isOnline: false,
      });

      vi.mocked(useCircuitBreaker).mockReturnValue({
        remainingSeconds: 15,
        isCircuitOpen: true,
      });

      const { rerender } = render(<App />);

      expect(screen.getByText('You appear to be offline')).toBeInTheDocument();

      // Come back online
      vi.mocked(useNetworkStatus).mockReturnValue({
        isOnline: true,
      });

      rerender(<App />);

      // Now should show circuit breaker message
      expect(
        screen.getByText(/Service temporarily unavailable\. Try again in 15s/)
      ).toBeInTheDocument();
      expect(
        screen.queryByText('You appear to be offline')
      ).not.toBeInTheDocument();
    });

    it('should keep buttons disabled when circuit breaker closes during offline state', () => {
      const mockContentAgent = {
        getCircuitOpenUntil: vi.fn(() => Date.now() + 5000),
        generateContent: vi.fn(),
      };

      vi.mocked(ContentGeneratorAgent.getInstance).mockReturnValue(
        mockContentAgent as unknown as ContentGeneratorAgent
      );

      // Start offline with circuit breaker open
      vi.mocked(useNetworkStatus).mockReturnValue({
        isOnline: false,
      });

      vi.mocked(useCircuitBreaker).mockReturnValue({
        remainingSeconds: 5,
        isCircuitOpen: true,
      });

      const { rerender } = render(<App />);

      // Circuit breaker closes but still offline
      vi.mocked(useCircuitBreaker).mockReturnValue({
        remainingSeconds: 0,
        isCircuitOpen: false,
      });

      mockContentAgent.getCircuitOpenUntil.mockReturnValue(0);

      rerender(<App />);

      // Buttons should STILL be disabled because offline
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });

      expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
    });
  });
});
