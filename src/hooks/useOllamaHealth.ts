import { useState, useEffect } from 'react';
import { ollamaClient } from '@/services/OllamaClient';
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

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthStatus = await ollamaClient.checkHealth();
        setStatus(healthStatus);
      } catch {
        // If health check throws, treat as error status
        setStatus('error');
      } finally {
        setIsChecking(false);
      }
    };

    checkHealth();
  }, []);

  return { status, isChecking };
}
