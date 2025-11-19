import { useState, useEffect, useRef } from 'react';
import { ollamaClient } from '@/services/OllamaClient';
import { useToast } from '@/contexts/ToastContext';
import type { ConnectionStatus } from '@/types';

/**
 * Custom hook for monitoring Ollama health status
 *
 * Automatically checks Ollama connection on component mount.
 * Returns current connection status and checking state.
 *
 * @returns Object containing status and isChecking flag
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { status, isChecking } = useOllamaHealth();
 *
 *   if (isChecking) return <div>Checking connection...</div>;
 *   if (status !== 'connected') return <div>Ollama unavailable</div>;
 *   return <div>Connected!</div>;
 * }
 * ```
 */
export function useOllamaHealth() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isChecking, setIsChecking] = useState(true);
  const prevStatusRef = useRef<ConnectionStatus | null>(null);
  const hasWarmedUp = useRef(false);
  const { showToast } = useToast();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthStatus = await ollamaClient.checkHealth();
        const prevStatus = prevStatusRef.current;

        // Detect status change from disconnected/error to connected
        if (
          prevStatus &&
          (prevStatus === 'disconnected' || prevStatus === 'error') &&
          healthStatus === 'connected'
        ) {
          showToast('Connection to AI service restored', 'success');
        }

        prevStatusRef.current = healthStatus;
        setStatus(healthStatus);

        // Trigger warmup after first successful health check
        if (healthStatus === 'connected' && !hasWarmedUp.current) {
          hasWarmedUp.current = true;
          ollamaClient.warmupModel().catch((err) => {
            console.warn('[useOllamaHealth] Warmup failed:', err);
          });
        }
      } catch {
        // If health check throws, treat as error status
        prevStatusRef.current = 'error';
        setStatus('error');
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkHealth();

    // Set up periodic polling every 30 seconds
    const intervalId = setInterval(checkHealth, 30000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [showToast]);

  return { status, isChecking };
}
