"use client"
import React from 'react'
import { captureError } from '@/lib/debug'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary'
    })
    this.setState({ error, errorInfo })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

        return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6" data-testid="error-boundary">
          <div className="max-w-2xl w-full bg-[#15151f] border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-red-400">Application Error</h1>
            </div>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-[#a0a0b8] mb-2">Error Details</h2>
                <div className="bg-[#0f1320] border border-[#2a2a3e] rounded p-3 font-mono text-sm">
                  <div className="text-red-400 mb-2">{this.state.error?.message}</div>
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-[#a0a0b8] hover:text-white">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-[#808090] whitespace-pre-wrap overflow-auto max-h-40">
                        {this.state.error?.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={this.resetError}
                  className="px-4 py-2 bg-[#00bbff] hover:bg-[#0099cc] text-white rounded-md transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#2a2a3e] hover:bg-[#3a3a4e] text-white rounded-md transition-colors"
                >
                  Reload Page
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => {
                      const errorData = {
                        message: this.state.error?.message,
                        stack: this.state.error?.stack,
                        componentStack: this.state.errorInfo?.componentStack,
                        timestamp: new Date().toISOString(),
                        url: window.location.href
                      }
                      navigator.clipboard.writeText(JSON.stringify(errorData, null, 2))
                      alert('Error data copied to clipboard for debugging')
                    }}
                    className="px-4 py-2 bg-[#2a2a3e] hover:bg-[#3a3a4e] text-white rounded-md transition-colors"
                  >
                    Copy for Debug
                  </button>
                )}
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-[#808090]">
                  <p>💡 Development Mode: Full error details shown</p>
                  <p>🔧 Use Cursor AI: "Debug this error: [paste error data]"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary


