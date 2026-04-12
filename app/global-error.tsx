'use client';

/**
 * Global Error Component for Next.js App Router
 * This component handles errors in the root layout
 * Different from error.tsx as it replaces the entire UI including the root layout
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error component that replaces the entire UI when an error occurs in the root layout
 * This is more severe than the regular error.tsx component
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <h1 className="mb-4 text-3xl font-bold text-red-600 dark:text-red-400">
              Critical Error
            </h1>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              A critical error has occurred in the application. We're working to resolve this issue.
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
      </body>
    </html>
  );
}
