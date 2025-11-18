import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OllamaClient } from './OllamaClient';
import type { ConnectionStatus } from '@/types';

describe('OllamaClient', () => {
  let client: OllamaClient;

  beforeEach(() => {
    client = OllamaClient.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = OllamaClient.getInstance();
      const instance2 = OllamaClient.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should have checkHealth and generateStream methods', () => {
      const instance = OllamaClient.getInstance();
      expect(instance.checkHealth).toBeInstanceOf(Function);
      expect(instance.generateStream).toBeInstanceOf(Function);
    });
  });

  describe('checkHealth', () => {
    it('should return connected when Ollama is available', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] }),
      }) as typeof fetch;

      const status: ConnectionStatus = await client.checkHealth();
      expect(status).toBe('connected');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/tags',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('should return disconnected when Ollama is unavailable', async () => {
      globalThis.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED')) as typeof fetch;

      const status: ConnectionStatus = await client.checkHealth();
      expect(status).toBe('disconnected');
    });

    it('should return error when network error occurs', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
      }) as typeof fetch;

      const status: ConnectionStatus = await client.checkHealth();
      expect(status).toBe('error');
    });

    it('should respect 20 second timeout', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';

      globalThis.fetch = vi
        .fn()
        .mockRejectedValueOnce(abortError) as typeof fetch;

      const status = await client.checkHealth();
      expect(status).toBe('error');
    }, 25000);
  });

  describe('generateStream', () => {
    it('should yield text chunks from streaming response', async () => {
      const mockResponse = [
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:00Z","response":"Hello","done":false}',
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:01Z","response":" world","done":false}',
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:02Z","response":"","done":true}',
      ].join('\n');

      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(mockResponse));
          controller.close();
        },
      });

      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream,
      }) as typeof fetch;

      const chunks: string[] = [];
      for await (const chunk of client.generateStream('Test prompt')) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' world']);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            model: 'llama3.1:8b',
            prompt: 'Test prompt',
            stream: true,
          }),
        })
      );
    });

    it('should throw timeout error after 20 seconds', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';

      globalThis.fetch = vi
        .fn()
        .mockRejectedValueOnce(abortError) as typeof fetch;

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of client.generateStream('Test prompt')) {
          // Should not reach here
        }
      }).rejects.toThrow('Request timed out after 20 seconds');
    }, 25000);

    it('should throw descriptive error on connection failure', async () => {
      globalThis.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED')) as typeof fetch;

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of client.generateStream('Test prompt')) {
          // Should not reach here
        }
      }).rejects.toThrow('Failed to connect to Ollama');
    });
  });
});
