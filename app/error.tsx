'use client';

/**
 * Global Error Component for Next.js App Router
 * Serves as the default error UI when errors occur during rendering
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorComponentProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Default error UI component for Next.js App Router
 * This is required by Next.js and will be automatically used when an error occurs
 * during rendering of a route segment
 */
export default function Error({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
          Something went wrong
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="p-4 mb-6 text-sm bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300">
          <p className="font-mono">
            {error.message || 'Unknown error occurred'}
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-gray-500 dark:text-gray-400">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Go to Home
          </Button>
          <Button 
            onClick={reset}
            variant="default"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
