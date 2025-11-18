/**
 * Ollama API Types
 * Type definitions for interacting with local Ollama instance
 */

/**
 * Request structure for Ollama API generate endpoint
 */
export interface OllamaRequest {
  /** Model name (e.g., 'llama3.1:8b') */
  model: string;
  /** Prompt text to send to the model */
  prompt: string;
  /** Whether to stream the response */
  stream: boolean;
}

/**
 * Single chunk from Ollama streaming response
 */
export interface OllamaStreamChunk {
  /** Model name that generated this chunk */
  model: string;
  /** ISO timestamp when chunk was created */
  created_at: string;
  /** Text content of this chunk */
  response: string;
  /** Whether this is the final chunk */
  done: boolean;
}

/**
 * Structured error from Ollama operations
 */
export interface OllamaError {
  /** Error code (e.g., 'CONNECTION_FAILED', 'TIMEOUT', 'MODEL_UNAVAILABLE') */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Optional additional error details */
  details?: string;
}

/**
 * Connection status for Ollama health checks
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';
