import type { ToastType } from '@/types/toast';

/**
 * Toast Component Props
 */
export interface ToastProps {
  /** Unique identifier */
  id: string;
  /** Message to display */
  message: string;
  /** Type of toast notification */
  type: ToastType;
  /** Callback when toast is closed */
  onClose: (id: string) => void;
}

/**
 * Toast notification component
 * Displays a dismissible message with type-specific styling
 *
 * @example
 * ```tsx
 * <Toast
 *   id="1"
 *   message="Operation successful"
 *   type="success"
 *   onClose={handleClose}
 * />
 * ```
 */
export function Toast({ id, message, type, onClose }: ToastProps) {
  // Type-specific styling
  const typeStyles = {
    error: 'bg-red-100 border-red-400 text-red-800',
    success: 'bg-green-100 border-green-400 text-green-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`${typeStyles[type]} fixed right-4 top-4 min-w-80 max-w-md border-l-4 p-4 shadow-lg transition-all duration-300 ease-in-out animate-slide-in animate-gentle-pulse motion-reduce:animate-slide-in`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={() => onClose(id)}
          aria-label="Close notification"
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
