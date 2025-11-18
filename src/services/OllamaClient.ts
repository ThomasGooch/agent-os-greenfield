import type {
  ConnectionStatus,
  OllamaRequest,
  OllamaStreamChunk,
  OllamaError,
} from '@/types';

/**
 * OllamaClient - Singleton service for communicating with local Ollama instance
 *
 * Handles health checks and streaming text generation from llama3.1:8b model.
 * All requests have a 20-second timeout.
 *
 * @example
 * ```typescript
 * import { ollamaClient } from '@/services/OllamaClient';
 *
 * // Check connection
 * const status = await ollamaClient.checkHealth();
 *
 * // Generate streaming response
 * for await (const chunk of ollamaClient.generateStream('Tell me a joke')) {
 *   console.log(chunk);
 * }
 * ```
 */
export class OllamaClient {
  private static instance: OllamaClient;
  private readonly endpoint = 'http://localhost:11434';
  private readonly model = 'llama3.1:8b';
  private readonly timeoutMs = 20000;

  /**
   * Private constructor enforces singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance of OllamaClient
   */
  public static getInstance(): OllamaClient {
    if (!OllamaClient.instance) {
      OllamaClient.instance = new OllamaClient();
    }
    return OllamaClient.instance;
  }

  /**
   * Check if Ollama is running and accessible
   *
   * @returns Connection status: 'connected', 'disconnected', or 'error'
   */
  public async checkHealth(): Promise<ConnectionStatus> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.endpoint}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return 'connected';
      }
      return 'error';
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        // Connection refused or network error
        if (
          error.message.includes('ECONNREFUSED') ||
          error.name === 'TypeError'
        ) {
          return 'disconnected';
        }
        // Timeout or other errors
        return 'error';
      }
      return 'error';
    }
  }

  /**
   * Generate streaming response from Ollama
   *
   * @param prompt - Text prompt to send to the model
   * @yields Text chunks as they arrive from the model
   * @throws {Error} When connection fails, timeout occurs, or model unavailable
   *
   * @example
   * ```typescript
   * for await (const chunk of client.generateStream('Hello')) {
   *   console.log(chunk);
   * }
   * ```
   */
  public async *generateStream(
    prompt: string
  ): AsyncGenerator<string, void, unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const request: OllamaRequest = {
        model: this.model,
        prompt,
        stream: true,
      };

      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: OllamaError = {
          code: 'REQUEST_FAILED',
          message: `Ollama API returned status ${response.status}`,
          details: response.statusText,
        };
        throw new Error(error.message);
      }

      if (!response.body) {
        const error: OllamaError = {
          code: 'NO_RESPONSE_BODY',
          message: 'No response body received from Ollama',
        };
        throw new Error(error.message);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const chunk: OllamaStreamChunk = JSON.parse(line);
                if (chunk.response) {
                  yield chunk.response;
                }
                if (chunk.done) {
                  return;
                }
              } catch (parseError) {
                const error: OllamaError = {
                  code: 'PARSE_ERROR',
                  message: 'Failed to parse streaming response',
                  details:
                    parseError instanceof Error
                      ? parseError.message
                      : 'Unknown error',
                };
                throw new Error(error.message);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        // AbortController timeout
        if (error.name === 'AbortError') {
          const ollamaError: OllamaError = {
            code: 'TIMEOUT',
            message: 'Request timed out after 20 seconds',
          };
          throw new Error(ollamaError.message);
        }

        // Connection refused or network error
        if (
          error.message.includes('ECONNREFUSED') ||
          error.name === 'TypeError'
        ) {
          const ollamaError: OllamaError = {
            code: 'CONNECTION_FAILED',
            message: 'Failed to connect to Ollama',
            details: `Could not reach ${this.endpoint}`,
          };
          throw new Error(ollamaError.message);
        }

        // Re-throw existing error messages
        throw error;
      }

      // Unknown error
      const ollamaError: OllamaError = {
        code: 'UNKNOWN',
        message: 'An unknown error occurred',
      };
      throw new Error(ollamaError.message);
    }
  }
}

/**
 * Singleton instance for app-wide use
 *
 * @example
 * ```typescript
 * import { ollamaClient } from '@/services/OllamaClient';
 * const status = await ollamaClient.checkHealth();
 * ```
 */
export const ollamaClient = OllamaClient.getInstance();
