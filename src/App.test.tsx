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
    expect(screen.getByText(/checking ollama connection/i)).toBeInTheDocument();
  });

  it('displays connected status when Ollama is available', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('connected');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/ollama connected/i)).toBeInTheDocument();
    });
  });

  it('displays disconnected error when Ollama is unavailable', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('disconnected');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/ollama is not running/i)).toBeInTheDocument();
    });
  });

  it('displays error message when health check fails', async () => {
    vi.mocked(ollamaClient.checkHealth).mockResolvedValue('error');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/failed to connect/i)).toBeInTheDocument();
    });
  });
});
