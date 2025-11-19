import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentGeneratorAgent } from './ContentGeneratorAgent';
import { ollamaClient } from '@/services/OllamaClient';

vi.mock('@/services/OllamaClient', () => ({
  ollamaClient: {
    generateStream: vi.fn(),
    warmupModel: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('ContentGeneratorAgent - Enhanced Error Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ContentGeneratorAgent as any).instance = null;
  });

  it('should detect empty response and mark as retryable', async () => {
    const agent = ContentGeneratorAgent.getInstance();

    // Mock generateStream to return empty string
    vi.mocked(ollamaClient.generateStream).mockImplementation(
      async function* () {
        yield '';
      }
    );

    const result = await agent.generateContent('Test prompt');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unable to generate content');
  });

  it('should detect whitespace-only response as empty', async () => {
    const agent = ContentGeneratorAgent.getInstance();

    // Mock generateStream to return only whitespace
    vi.mocked(ollamaClient.generateStream).mockImplementation(
      async function* () {
        yield '   \n\t  ';
      }
    );

    const result = await agent.generateContent('Test prompt');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unable to generate content');
  });

  it('should detect interrupted generation (< 10 characters)', async () => {
    const agent = ContentGeneratorAgent.getInstance();

    // Mock generateStream to return very short response
    vi.mocked(ollamaClient.generateStream).mockImplementation(
      async function* () {
        yield 'Hi'; // Only 2 characters
      }
    );

    const result = await agent.generateContent('Test prompt');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Generation failed');
  });

  it('should treat empty response as transient error and retry', async () => {
    const agent = ContentGeneratorAgent.getInstance();
    let callCount = 0;

    vi.mocked(ollamaClient.generateStream).mockImplementation(
      async function* () {
        callCount++;
        if (callCount < 3) {
          yield ''; // Empty on first 2 attempts
        } else {
          yield 'Success on third attempt';
        }
      }
    );

    const result = await agent.generateContent('Test prompt');

    // Should retry and eventually succeed
    expect(callCount).toBe(3); // Initial + 2 retries
    expect(result.success).toBe(true);
    expect(result.content).toBe('Success on third attempt');
  });

  it('should treat interrupted generation as transient error and retry', async () => {
    const agent = ContentGeneratorAgent.getInstance();
    let callCount = 0;

    vi.mocked(ollamaClient.generateStream).mockImplementation(
      async function* () {
        callCount++;
        if (callCount < 3) {
          yield 'Hi'; // Too short on first 2 attempts
        } else {
          yield 'This is a successful response with enough characters.';
        }
      }
    );

    const result = await agent.generateContent('Test prompt');

    // Should retry and eventually succeed
    expect(callCount).toBe(3); // Initial + 2 retries
    expect(result.success).toBe(true);
  });

  it('should return final error after max retries on empty response', async () => {
    const agent = ContentGeneratorAgent.getInstance();

    // Mock generateStream to always return empty
    vi.mocked(ollamaClient.generateStream).mockImplementation(
      async function* () {
        yield '';
      }
    );

    const result = await agent.generateContent('Test prompt');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unable to generate content. Please try again');
  });

  it('should accept valid responses (>= 10 characters)', async () => {
    const agent = ContentGeneratorAgent.getInstance();

    // Mock generateStream to return valid content
    vi.mocked(ollamaClient.generateStream).mockImplementation(
      async function* () {
        yield 'This is a valid inspirational message.';
      }
    );

    const result = await agent.generateContent('Test prompt');

    expect(result.success).toBe(true);
    expect(result.content).toBe('This is a valid inspirational message.');
  });
});
