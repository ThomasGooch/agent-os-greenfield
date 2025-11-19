import { useState, useEffect } from 'react';

/**
 * Custom hook for circuit breaker countdown timer
 *
 * Manages countdown display for when circuit breaker is open.
 * Updates remaining seconds every second and determines if circuit is open.
 *
 * @param circuitOpenUntil - Timestamp when circuit will transition to half-open
 * @returns Object containing remainingSeconds and isCircuitOpen flag
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const agent = ContentGeneratorAgent.getInstance();
 *   const { remainingSeconds, isCircuitOpen } = useCircuitBreaker(
 *     agent.getCircuitOpenUntil()
 *   );
 *
 *   if (isCircuitOpen) {
 *     return <div>Try again in {remainingSeconds}s</div>;
 *   }
 *
 *   return <div>Ready to try!</div>;
 * }
 * ```
 */
export function useCircuitBreaker(circuitOpenUntil: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const remaining = Math.max(
      0,
      Math.ceil((circuitOpenUntil - Date.now()) / 1000)
    );
    return remaining;
  });

  useEffect(() => {
    // Update countdown every second
    const intervalId = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((circuitOpenUntil - Date.now()) / 1000)
      );
      setRemainingSeconds(remaining);

      // Clear interval when countdown reaches 0
      if (remaining === 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [circuitOpenUntil]);

  const isCircuitOpen = remainingSeconds > 0;

  return { remainingSeconds, isCircuitOpen };
}
