/**
 * 🔔 Toast Hook and Provider
 * System for displaying temporary notifications
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CloseIcon } from '../components/ui/icons';

// Create a client-only implementation to avoid hydration issues
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  
  return <>{children}</>;
};

// Unique ID generator for toasts
const generateId = () => Math.random().toString(36).substring(2, 9);

// Toast types
export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

// Toast variant with info needed to display and manage a toast
export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number; // Duration in milliseconds
  action?: React.ReactNode;
}

// Input for creating a toast (omitting the ID which is auto-generated)
export type ToastOptions = Omit<Toast, 'id'>;

// Context type definition
interface ToastContextType {
  toasts: Toast[];
  toast: (options: ToastOptions) => string; // Returns the toast ID
  update: (id: string, options: Partial<ToastOptions>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// Create the context with undefined default value
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider Component
 * Wrap your application with this to enable toast functionality
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add a new toast
  const toast = useCallback((options: ToastOptions) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      type: options.type || 'default',
      duration: options.duration || 5000, // Default 5 seconds
      action: options.action,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-dismiss after duration (unless duration is 0)
    if (newToast.duration !== 0) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  // Update an existing toast
  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, ...options } : toast
      )
    );
  }, []);

  // Remove a specific toast
  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Remove all toasts
  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, update, dismiss, dismissAll }}>
      {children}
      <ClientOnly>
        <ToastContainer />
      </ClientOnly>
    </ToastContext.Provider>
  );
};

/**
 * Toast Container Component
 * Renders the toasts in the bottom-right corner of the screen
 */
const ToastContainer: React.FC = () => {
  const context = useContext(ToastContext);

  if (!context) {
    return null;
  }

  const { toasts, dismiss } = context;

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-h-screen overflow-hidden pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex w-full max-w-md overflow-hidden rounded-lg shadow-lg 
            transition-all duration-300 ease-in-out transform translate-y-0 opacity-100
            ${toast.type === 'success' ? 'bg-green-800 text-green-100' :
              toast.type === 'error' ? 'bg-red-800 text-red-100' :
              toast.type === 'warning' ? 'bg-yellow-800 text-yellow-100' :
              toast.type === 'info' ? 'bg-blue-800 text-blue-100' :
              'bg-gray-800 text-gray-100'
            }
          `}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="ml-4 inline-flex shrink-0 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
              >
                <span className="sr-only">Close</span>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            {toast.action && <div className="mt-2">{toast.action}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Hook to use toast functionality
 * 
 * @example
 * // Basic usage
 * const { toast } = useToast();
 * toast({ title: 'Success!', description: 'Operation completed successfully', type: 'success' });
 * 
 * @example
 * // With action button
 * const { toast } = useToast();
 * toast({
 *   title: 'Error',
 *   description: 'Failed to save changes',
 *   type: 'error',
 *   action: <Button onClick={retry}>Retry</Button>
 * });
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};
