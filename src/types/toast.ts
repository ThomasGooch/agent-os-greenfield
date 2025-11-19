/**
 * Toast Types
 * Type definitions for toast notification system
 */

/**
 * Type of toast notification
 */
export type ToastType = 'error' | 'success' | 'info' | 'warning';

/**
 * Toast notification interface
 */
export interface Toast {
  /** Unique identifier for the toast */
  id: string;
  /** Message to display */
  message: string;
  /** Type of notification */
  type: ToastType;
  /** Duration in milliseconds before auto-dismiss (optional, default 5000) */
  duration?: number;
}

/**
 * Toast context interface
 */
export interface ToastContextType {
  /** Show a toast notification */
  showToast: (message: string, type: ToastType, duration?: number) => void;
}
