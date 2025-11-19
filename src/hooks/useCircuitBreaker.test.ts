import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCircuitBreaker } from './useCircuitBreaker';

describe('useCircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should calculate remaining seconds correctly', () => {
    const futureTime = Date.now() + 25000; // 25 seconds in future

    const { result } = renderHook(() => useCircuitBreaker(futureTime));

    expect(result.current.remainingSeconds).toBe(25);
    expect(result.current.isCircuitOpen).toBe(true);
  });

  it('should update countdown every second', () => {
    const futureTime = Date.now() + 10000; // 10 seconds in future

    const { result } = renderHook(() => useCircuitBreaker(futureTime));

    expect(result.current.remainingSeconds).toBe(10);

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remainingSeconds).toBe(9);

    // Advance another second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remainingSeconds).toBe(8);
  });

  it('should return 0 remaining seconds when countdown reaches 0', () => {
    const futureTime = Date.now() + 2000; // 2 seconds in future

    const { result } = renderHook(() => useCircuitBreaker(futureTime));

    expect(result.current.remainingSeconds).toBe(2);

    // Advance 3 seconds (past the deadline)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isCircuitOpen).toBe(false);
  });

  it('should return 0 when circuitOpenUntil is in the past', () => {
    const pastTime = Date.now() - 5000; // 5 seconds in past

    const { result } = renderHook(() => useCircuitBreaker(pastTime));

    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isCircuitOpen).toBe(false);
  });

  it('should clean up interval on unmount', () => {
    const futureTime = Date.now() + 10000;

    const { unmount } = renderHook(() => useCircuitBreaker(futureTime));

    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
