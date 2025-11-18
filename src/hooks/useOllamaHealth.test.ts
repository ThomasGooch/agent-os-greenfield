import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOllamaHealth } from './useOllamaHealth';
import { ollamaClient } from '@/services/OllamaClient';

vi.mock('@/services/OllamaClient', () => ({
  ollamaClient: {
    checkHealth: vi.fn(),
  },
}));

describe('useOllamaHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with disconnected status', () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('connected');

    const { result } = renderHook(() => useOllamaHealth());

    expect(result.current.status).toBe('disconnected');
    expect(result.current.isChecking).toBe(true);
  });

  it('should call checkHealth on mount', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('connected');

    renderHook(() => useOllamaHealth());

    await waitFor(() => {
      expect(ollamaClient.checkHealth).toHaveBeenCalledTimes(1);
    });
  });

  it('should update status to connected when health check succeeds', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('connected');

    const { result } = renderHook(() => useOllamaHealth());

    await waitFor(() => {
      expect(result.current.status).toBe('connected');
      expect(result.current.isChecking).toBe(false);
    });
  });

  it('should update status to disconnected when Ollama unavailable', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('disconnected');

    const { result } = renderHook(() => useOllamaHealth());

    await waitFor(() => {
      expect(result.current.status).toBe('disconnected');
      expect(result.current.isChecking).toBe(false);
    });
  });

  it('should update status to error when health check fails', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('error');

    const { result } = renderHook(() => useOllamaHealth());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.isChecking).toBe(false);
    });
  });

  it('should handle health check rejection gracefully', async () => {
    vi.mocked(ollamaClient.checkHealth).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useOllamaHealth());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.isChecking).toBe(false);
    });
  });
});
