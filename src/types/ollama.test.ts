import { describe, it, expect } from 'vitest';
import type {
  OllamaRequest,
  OllamaStreamChunk,
  OllamaError,
  ConnectionStatus,
} from './ollama';

describe('Ollama Types', () => {
  describe('OllamaRequest', () => {
    it('should accept valid request structure', () => {
      const request: OllamaRequest = {
        model: 'llama3.1:8b',
        prompt: 'Test prompt',
        stream: true,
      };

      expect(request.model).toBe('llama3.1:8b');
      expect(request.prompt).toBe('Test prompt');
      expect(request.stream).toBe(true);
    });
  });

  describe('OllamaStreamChunk', () => {
    it('should accept valid stream chunk structure', () => {
      const chunk: OllamaStreamChunk = {
        model: 'llama3.1:8b',
        created_at: '2025-11-18T12:00:00Z',
        response: 'Test response',
        done: false,
      };

      expect(chunk.model).toBe('llama3.1:8b');
      expect(chunk.response).toBe('Test response');
      expect(chunk.done).toBe(false);
    });

    it('should accept done chunk with no response', () => {
      const chunk: OllamaStreamChunk = {
        model: 'llama3.1:8b',
        created_at: '2025-11-18T12:00:00Z',
        response: '',
        done: true,
      };

      expect(chunk.done).toBe(true);
    });
  });

  describe('OllamaError', () => {
    it('should accept valid error structure', () => {
      const error: OllamaError = {
        code: 'CONNECTION_FAILED',
        message: 'Failed to connect to Ollama',
        details: 'Could not reach http://localhost:11434',
      };

      expect(error.code).toBe('CONNECTION_FAILED');
      expect(error.message).toBe('Failed to connect to Ollama');
      expect(error.details).toBe('Could not reach http://localhost:11434');
    });

    it('should accept error without details', () => {
      const error: OllamaError = {
        code: 'TIMEOUT',
        message: 'Request timed out after 20 seconds',
      };

      expect(error.code).toBe('TIMEOUT');
      expect(error.message).toBe('Request timed out after 20 seconds');
      expect(error.details).toBeUndefined();
    });
  });

  describe('ConnectionStatus', () => {
    it('should accept connected status', () => {
      const status: ConnectionStatus = 'connected';
      expect(status).toBe('connected');
    });

    it('should accept disconnected status', () => {
      const status: ConnectionStatus = 'disconnected';
      expect(status).toBe('disconnected');
    });

    it('should accept error status', () => {
      const status: ConnectionStatus = 'error';
      expect(status).toBe('error');
    });
  });
});
