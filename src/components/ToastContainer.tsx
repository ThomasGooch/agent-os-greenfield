import { useEffect, useMemo } from 'react';
import { Toast } from './Toast';
import type { Toast as ToastType } from '@/types/toast';

/**
 * ToastContainer Props
 */
export interface ToastContainerProps {
  /** Array of toasts to display */
  toasts: ToastType[];
  /** Callback to remove a toast */
  onRemove: (id: string) => void;
}

/**
 * ToastContainer Component
 * Manages the display and positioning of multiple toast notifications
 *
 * @example
 * ```tsx
 * <ToastContainer toasts={toasts} onRemove={handleRemove} />
 * ```
 */
export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  // Limit to max 3 visible toasts
  const visibleToasts = useMemo(() => {
    const maxToasts = 3;
    return toasts.slice(-maxToasts);
  }, [toasts]);

  useEffect(() => {
    // Set up auto-dismiss timers for each toast
    const timers = visibleToasts.map((toast) => {
      const duration = toast.duration ?? 5000;
      return setTimeout(() => {
        onRemove(toast.id);
      }, duration);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [visibleToasts, onRemove]);

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-4">
      {visibleToasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ transform: `translateY(${index * 80}px)` }}
          className="transition-transform duration-300"
        >
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={onRemove}
          />
        </div>
      ))}
    </div>
  );
}
