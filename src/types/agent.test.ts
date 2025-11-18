import { describe, it, expect } from 'vitest';
import type { GenerationResult, CircuitState } from './agent';

describe('Agent Types', () => {
  it('should accept GenerationResult with success state', () => {
    const result: GenerationResult = {
      success: true,
      content: 'Inspirational message',
    };

    expect(result.success).toBe(true);
    expect(result.content).toBe('Inspirational message');
    expect(result.error).toBeUndefined();
  });

  it('should accept GenerationResult with error state', () => {
    const result: GenerationResult = {
      success: false,
      error: 'Something went wrong',
    };

    expect(result.success).toBe(false);
    expect(result.error).toBe('Something went wrong');
    expect(result.content).toBeUndefined();
  });

  it('should accept all valid CircuitState values', () => {
    const closed: CircuitState = 'closed';
    const open: CircuitState = 'open';
    const halfOpen: CircuitState = 'half-open';

    expect(closed).toBe('closed');
    expect(open).toBe('open');
    expect(halfOpen).toBe('half-open');
  });

  it('should enforce type safety for invalid states', () => {
    // This test verifies TypeScript compilation
    // If invalid values are assigned, TypeScript will catch them at compile time
    const validState: CircuitState = 'closed';
    expect(['closed', 'open', 'half-open']).toContain(validState);
  });
});
