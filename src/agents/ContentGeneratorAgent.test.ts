import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentGeneratorAgent } from './ContentGeneratorAgent';
import { ollamaClient } from '@/services/OllamaClient';

vi.mock('@/services/OllamaClient', () => ({
  ollamaClient: {
    generateStream: vi.fn(),
  },
}));

describe('ContentGeneratorAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ContentGeneratorAgent as any).instance = undefined;
  });

  it('should return GenerationResult with success=true and content on successful generation', async () => {
    const mockStream = (async function* () {
      yield 'Hello ';
      yield 'world';
      yield '!';
    })();

    vi.mocked(ollamaClient.generateStream).mockReturnValue(mockStream);

    const agent = ContentGeneratorAgent.getInstance();
    const result = await agent.generateContent('Test prompt');

    expect(result.success).toBe(true);
    expect(result.content).toBe('Hello world!');
    expect(result.error).toBeUndefined();
  });

  it('should accumulate all chunks into single string', async () => {
    const mockStream = (async function* () {
      yield 'First ';
      yield 'second ';
      yield 'third';
    })();

    vi.mocked(ollamaClient.generateStream).mockReturnValue(mockStream);

    const agent = ContentGeneratorAgent.getInstance();
    const result = await agent.generateContent('Test prompt');

    expect(result.content).toBe('First second third');
  });

  it('should transform CONNECTION_FAILED error to user-friendly message', async () => {
    const mockError = new Error('Failed to connect to Ollama');
    mockError.message = 'Failed to connect to Ollama';
    vi.mocked(ollamaClient.generateStream).mockImplementation(() => {
      throw mockError;
    });

    const agent = ContentGeneratorAgent.getInstance();
    const result = await agent.generateContent('Test prompt');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unable to connect to local AI service');
    expect(result.content).toBeUndefined();
  });

  it('should transform TIMEOUT error to user-friendly message', async () => {
    const mockError = new Error('Request timed out after 20 seconds');
    vi.mocked(ollamaClient.generateStream).mockImplementation(() => {
      throw mockError;
    });

    const agent = ContentGeneratorAgent.getInstance();
    const result = await agent.generateContent('Test prompt');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Request timed out. Please try again');
    expect(result.content).toBeUndefined();
  });

  it('should retry 2 times on CONNECTION_FAILED with exponential backoff', async () => {
    const agent = ContentGeneratorAgent.getInstance();
    let callCount = 0;

    vi.mocked(ollamaClient.generateStream).mockImplementation(() => {
      callCount++;
      throw new Error('Failed to connect to Ollama');
    });

    const startTime = Date.now();
    await agent.generateContent('Test prompt');
    const duration = Date.now() - startTime;

    // Should be called 3 times total (initial + 2 retries)
    expect(callCount).toBe(3);
    // Should wait ~1s + ~2s = ~3s total (with some tolerance)
    expect(duration).toBeGreaterThanOrEqual(2900);
    expect(duration).toBeLessThan(3500);
  });

  it('should NOT retry on permanent REQUEST_FAILED error', async () => {
    const agent = ContentGeneratorAgent.getInstance();
    let callCount = 0;

    vi.mocked(ollamaClient.generateStream).mockImplementation(() => {
      callCount++;
      throw new Error('Ollama API returned status 500');
    });

    await agent.generateContent('Test prompt');

    // Should only be called once (no retries)
    expect(callCount).toBe(1);
  });

  it('should open circuit after 3 consecutive failures', async () => {
    const agent = ContentGeneratorAgent.getInstance();

    // Use permanent error to avoid retries
    vi.mocked(ollamaClient.generateStream).mockImplementation(() => {
      throw new Error('Ollama API returned status 500');
    });

    // Make 3 consecutive failed requests (no retries on permanent errors)
    await agent.generateContent('Test 1');
    await agent.generateContent('Test 2');
    const result3 = await agent.generateContent('Test 3');

    expect(result3.error).toBe('AI service encountered an error');

    // 4th request should fail immediately due to open circuit
    const result4 = await agent.generateContent('Test 4');
    expect(result4.error).toBe(
      'Service temporarily unavailable. Please try again in a moment'
    );
  });

  it.skip(
    'should half-open circuit after 30 seconds',
    { timeout: 10000 },
    async () => {
      vi.useFakeTimers();
      const agent = ContentGeneratorAgent.getInstance();

      // Use permanent error to avoid retries
      vi.mocked(ollamaClient.generateStream).mockImplementation(() => {
        throw new Error('Ollama API returned status 500');
      });

      // Open circuit with 3 failures (no retries on permanent errors)
      await agent.generateContent('Test 1');
      await agent.generateContent('Test 2');
      await agent.generateContent('Test 3');

      // Should be open
      const resultOpen = await agent.generateContent('Test 4');
      expect(resultOpen.error).toBe(
        'Service temporarily unavailable. Please try again in a moment'
      );

      // Fast forward 30 seconds
      await vi.advanceTimersByTimeAsync(30000);

      // Now configure success for next call
      const mockStream = (async function* () {
        yield 'Success';
      })();
      vi.mocked(ollamaClient.generateStream).mockReturnValue(mockStream);

      // Should be half-open and allow request
      const resultHalfOpen = await agent.generateContent('Test 5');
      expect(resultHalfOpen.success).toBe(true);

      vi.useRealTimers();
    }
  );
});
