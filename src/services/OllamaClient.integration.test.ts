import { describe, it, expect, vi } from 'vitest';
import { ollamaClient } from './OllamaClient';

describe('OllamaClient Integration Tests', () => {
  describe('End-to-end streaming', () => {
    it('should handle complete streaming workflow from prompt to chunks', async () => {
      const mockResponse = [
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:00Z","response":"This ","done":false}',
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:01Z","response":"is ","done":false}',
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:02Z","response":"a ","done":false}',
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:03Z","response":"test","done":false}',
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:04Z","response":"","done":true}',
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
      for await (const chunk of ollamaClient.generateStream(
        'Tell me a short story'
      )) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['This ', 'is ', 'a ', 'test']);
      expect(chunks.join('')).toBe('This is a test');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty prompt by still making request', async () => {
      const mockResponse =
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:00Z","response":"","done":true}';

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
      for await (const chunk of ollamaClient.generateStream('')) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual([]);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({
          body: JSON.stringify({
            model: 'llama3.1:8b',
            prompt: '',
            stream: true,
          }),
        })
      );
    });

    it('should throw error on malformed JSON in stream response', async () => {
      const mockResponse = [
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:00Z","response":"Good","done":false}',
        '{invalid json here}',
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

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of ollamaClient.generateStream('Test')) {
          // Should throw on malformed JSON
        }
      }).rejects.toThrow('Failed to parse streaming response');
    });

    it('should handle stream that completes immediately', async () => {
      const mockResponse =
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:00Z","response":"","done":true}';

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
      for await (const chunk of ollamaClient.generateStream('Test')) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual([]);
    });

    it('should handle chunks with newlines in response text', async () => {
      const mockResponse = [
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:00Z","response":"Line 1\\n","done":false}',
        '{"model":"llama3.1:8b","created_at":"2025-11-18T12:00:01Z","response":"Line 2","done":false}',
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
      for await (const chunk of ollamaClient.generateStream('Test')) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Line 1\n', 'Line 2']);
    });
  });

  describe('Error scenarios', () => {
    it('should throw error when response has no body', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        body: null,
      }) as typeof fetch;

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of ollamaClient.generateStream('Test')) {
          // Should throw
        }
      }).rejects.toThrow('No response body received from Ollama');
    });

    it('should throw error when response is not ok', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }) as typeof fetch;

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of ollamaClient.generateStream('Test')) {
          // Should throw
        }
      }).rejects.toThrow('Ollama API returned status 500');
    });
  });
});
