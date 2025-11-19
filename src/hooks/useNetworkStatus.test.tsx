import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from './useNetworkStatus';
import { ToastProvider } from '@/contexts/ToastContext';
import type { ReactNode } from 'react';

describe('useNetworkStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ToastProvider>{children}</ToastProvider>
  );

  it('should initialize with navigator.onLine value', () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useNetworkStatus(), { wrapper });

    expect(result.current.isOnline).toBe(true);
  });

  it('should update state when offline event fires', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useNetworkStatus(), { wrapper });

    expect(result.current.isOnline).toBe(true);

    // Simulate offline event
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('should update state when online event fires', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useNetworkStatus(), { wrapper });

    expect(result.current.isOnline).toBe(false);

    // Simulate online event
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useNetworkStatus(), { wrapper });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
  });
});
