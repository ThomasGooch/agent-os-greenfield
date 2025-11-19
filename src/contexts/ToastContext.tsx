import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { ToastContainer } from '@/components/ToastContainer';
import type { Toast, ToastType, ToastContextType } from '@/types/toast';

/**
 * Toast Context
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * ToastProvider Props
 */
interface ToastProviderProps {
  /** Child components */
  children: ReactNode;
}

/**
 * ToastProvider Component
 * Provides toast notification functionality to the application
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType, duration?: number) => {
      // Check for duplicate messages
      const isDuplicate = toasts.some((toast) => toast.message === message);

      if (isDuplicate) {
        return; // Don't add duplicate
      }

      // Generate unique ID
      const id = crypto.randomUUID();

      const newToast: Toast = {
        id,
        message,
        type,
        duration,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];

        // Keep only the most recent 3 toasts
        if (updated.length > 3) {
          return updated.slice(-3);
        }

        return updated;
      });
    },
    [toasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 * Access toast notification functionality
 *
 * @example
 * ```tsx
 * const { showToast } = useToast();
 * showToast('Success!', 'success');
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
