/**
 * 📢 Toaster Component
 * Renders toast notifications using our custom hook implementation
 */

"use client"

import React from "react"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) {
    return null
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
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {toast.action && <div className="mt-2">{toast.action}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
