"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  errorInfo?: React.ErrorInfo
  resetError: () => void
  errorId?: string
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: crypto.randomUUID(),
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.state.errorId || crypto.randomUUID()

    // Log error details
    console.error("Error Boundary caught an error:", {
      error: error.message,
      stack: error.stack,
      errorInfo,
      errorId,
      timestamp: new Date().toISOString(),
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Send to Sentry, DataDog, etc.
    }

    this.setState({ errorInfo, errorId })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          errorId={this.state.errorId}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError, errorId }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Something went wrong</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            We apologize for the inconvenience. An unexpected error has occurred.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorId && (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Error ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{errorId}</code>
            </div>
          )}

          {isDevelopment && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-700 dark:text-gray-300 font-medium">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto max-h-40">
                <div className="text-red-600 dark:text-red-400 font-semibold">
                  {error.name}: {error.message}
                </div>
                {error.stack && (
                  <pre className="mt-2 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{error.stack}</pre>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={resetError} className="flex-1 bg-transparent" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => (window.location.href = "/")} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            If this problem persists, please contact support with the error ID above.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error("Unhandled error:", error, errorInfo)

    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Send to Sentry, DataDog, etc.
    }
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}
