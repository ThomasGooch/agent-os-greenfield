import { ollamaClient } from '@/services/OllamaClient';
import type { GenerationResult, CircuitState } from '@/types';
import { EMPTY_RESPONSE, INTERRUPTED_GENERATION } from '@/types/agent';

/**
 * ContentGeneratorAgent - Handles AI content generation with fault tolerance
 *
 * Wraps OllamaClient to provide retry logic, circuit breaker pattern,
 * and user-friendly error messages. Accumulates streaming responses
 * before returning complete content to caller.
 *
 * @example
 * ```typescript
 * import { ContentGeneratorAgent } from '@/agents/ContentGeneratorAgent';
 *
 * const agent = ContentGeneratorAgent.getInstance();
 * const result = await agent.generateContent('Your prompt here');
 *
 * if (result.success) {
 *   console.log(result.content);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export class ContentGeneratorAgent {
  private static instance: ContentGeneratorAgent;

  private circuitState: CircuitState = 'closed';
  private consecutiveFailures = 0;
  private circuitOpenUntil = 0;

  private readonly MAX_RETRIES = 2;
  private readonly CIRCUIT_FAILURE_THRESHOLD = 3;
  private readonly CIRCUIT_HALF_OPEN_DELAY_MS = 30000;

  /**
   * Private constructor enforces singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance of ContentGeneratorAgent
   */
  public static getInstance(): ContentGeneratorAgent {
    if (!ContentGeneratorAgent.instance) {
      ContentGeneratorAgent.instance = new ContentGeneratorAgent();
    }
    return ContentGeneratorAgent.instance;
  }

  /**
   * Get circuit breaker open until timestamp
   * @returns Timestamp when circuit will transition to half-open
   */
  public getCircuitOpenUntil(): number {
    return this.circuitOpenUntil;
  }

  /**
   * Generate inspirational content from prompt
   *
   * @param prompt - Text prompt to send to AI model
   * @returns GenerationResult with content or error message
   */
  public async generateContent(prompt: string): Promise<GenerationResult> {
    // Check circuit breaker state
    if (this.circuitState === 'open') {
      if (Date.now() < this.circuitOpenUntil) {
        return {
          success: false,
          error:
            'Service temporarily unavailable. Please try again in a moment',
        };
      }
      // Transition to half-open
      this.circuitState = 'half-open';
    }

    // Try with retries
    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const content = await this.accumulateResponse(prompt);

        // Success - reset circuit breaker
        this.consecutiveFailures = 0;
        this.circuitState = 'closed';

        return {
          success: true,
          content,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        const isTransient = this.isTransientError(errorMessage);

        // Don't retry on permanent errors or if max retries reached
        if (!isTransient || attempt === this.MAX_RETRIES) {
          this.handleFailure();
          return {
            success: false,
            error: this.transformError(errorMessage),
          };
        }

        // Wait before retry with exponential backoff
        const backoffMs = 1000 * Math.pow(2, attempt);
        await this.sleep(backoffMs);
      }
    }

    // Fallback (should not reach here)
    this.handleFailure();
    return {
      success: false,
      error: 'Something went wrong. Please try again',
    };
  }

  /**
   * Accumulate streaming response into single string
   */
  private async accumulateResponse(prompt: string): Promise<string> {
    const chunks: string[] = [];

    for await (const chunk of ollamaClient.generateStream(prompt)) {
      chunks.push(chunk);
    }

    const content = chunks.join('');

    // Validate response is not empty
    if (!content || content.trim().length === 0) {
      throw new Error(EMPTY_RESPONSE);
    }

    // Detect interrupted generation (suspiciously short response)
    if (content.trim().length < 10) {
      throw new Error(INTERRUPTED_GENERATION);
    }

    return content;
  }

  /**
   * Check if error is transient (should retry)
   */
  private isTransientError(errorMessage: string): boolean {
    return (
      errorMessage.includes('Failed to connect') ||
      errorMessage.includes('timed out') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('Connection') ||
      errorMessage.includes(EMPTY_RESPONSE) ||
      errorMessage.includes(INTERRUPTED_GENERATION)
    );
  }

  /**
   * Transform technical error to user-friendly message
   */
  private transformError(errorMessage: string): string {
    if (errorMessage.includes(EMPTY_RESPONSE)) {
      return 'Unable to generate content. Please try again';
    }

    if (errorMessage.includes(INTERRUPTED_GENERATION)) {
      return 'Generation failed. Please try again';
    }

    if (
      errorMessage.includes('Failed to connect') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('Connection')
    ) {
      return 'Unable to connect to local AI service';
    }

    if (errorMessage.includes('timed out')) {
      return 'Request timed out. Please try again';
    }

    if (
      errorMessage.includes('API returned status') ||
      errorMessage.includes('REQUEST_FAILED')
    ) {
      return 'AI service encountered an error';
    }

    return 'Something went wrong. Please try again';
  }

  /**
   * Handle failure and update circuit breaker state
   */
  private handleFailure(): void {
    this.consecutiveFailures++;

    if (this.consecutiveFailures >= this.CIRCUIT_FAILURE_THRESHOLD) {
      this.circuitState = 'open';
      this.circuitOpenUntil = Date.now() + this.CIRCUIT_HALF_OPEN_DELAY_MS;
    }
  }

  /**
   * Sleep utility for retry backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
