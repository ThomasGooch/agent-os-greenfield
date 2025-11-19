import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';

/**
 * Custom hook for monitoring network connectivity
 *
 * Listens to browser online/offline events and provides current network status.
 * Shows toast notifications when network status changes.
 *
 * @returns Object containing isOnline flag
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline } = useNetworkStatus();
 *
 *   if (!isOnline) {
 *     return <div>You appear to be offline</div>;
 *   }
 *
 *   return <div>Online and ready!</div>;
 * }
 * ```
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { showToast } = useToast();

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      showToast('You appear to be offline', 'error');
    };

    const handleOnline = () => {
      setIsOnline(true);
      showToast("You're back online", 'success');
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [showToast]);

  return { isOnline };
}
