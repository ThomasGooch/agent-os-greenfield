/**
 * Agent Types
 * Type definitions for AI agent operations and state management
 */

/**
 * Result of content generation operation
 */
export interface GenerationResult {
  /** Whether the generation was successful */
  success: boolean;
  /** Generated content (present when success is true) */
  content?: string;
  /** Error message (present when success is false) */
  error?: string;
}

/**
 * Circuit breaker state for fault tolerance
 */
export type CircuitState = 'closed' | 'open' | 'half-open';

/**
 * Error type constants
 */
export const EMPTY_RESPONSE = 'EMPTY_RESPONSE';
export const INTERRUPTED_GENERATION = 'INTERRUPTED_GENERATION';
