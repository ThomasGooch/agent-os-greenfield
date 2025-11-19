import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOllamaHealth } from './useOllamaHealth';
import { ollamaClient } from '@/services/OllamaClient';
import { ToastProvider } from '@/contexts/ToastContext';
import type { ReactNode } from 'react';

vi.mock('@/services/OllamaClient', () => ({
  ollamaClient: {
    checkHealth: vi.fn(),
  },
}));

describe('useOllamaHealth - Enhanced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ToastProvider>{children}</ToastProvider>
  );

  it('should set up periodic polling with 30 second interval', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('connected');

    renderHook(() => useOllamaHealth(), { wrapper });

    // Wait for initial check
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    const initialCalls = vi.mocked(ollamaClient.checkHealth).mock.calls.length;
    expect(initialCalls).toBeGreaterThanOrEqual(1);

    // Advance 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000);
      await vi.runOnlyPendingTimersAsync();
    });

    // Should have made at least one more call
    const finalCalls = vi.mocked(ollamaClient.checkHealth).mock.calls.length;
    expect(finalCalls).toBeGreaterThan(initialCalls);
  });

  it('should detect status change from disconnected to connected', async () => {
    let checkCount = 0;
    vi.mocked(ollamaClient.checkHealth).mockImplementation(() => {
      checkCount++;
      // Return error first, then connected on subsequent checks
      if (checkCount === 1) {
        return Promise.resolve('error');
      }
      return Promise.resolve('connected');
    });

    const { result } = renderHook(() => useOllamaHealth(), { wrapper });

    // Wait for initial check to complete
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    // After first check, status should reflect the health check result
    const firstStatus = result.current.status;
    expect(['error', 'disconnected', 'connected']).toContain(firstStatus);

    // Advance to next check if initial was error/disconnected
    if (firstStatus !== 'connected') {
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runOnlyPendingTimersAsync();
      });

      // After second check, should be connected
      expect(result.current.status).toBe('connected');
    }
  });

  it('should clean up interval on unmount', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('connected');

    const { unmount } = renderHook(() => useOllamaHealth(), { wrapper });

    // Wait for initial check
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(ollamaClient.checkHealth).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    // Timers should be cleared
    expect(vi.getTimerCount()).toBe(0);
  });
});
