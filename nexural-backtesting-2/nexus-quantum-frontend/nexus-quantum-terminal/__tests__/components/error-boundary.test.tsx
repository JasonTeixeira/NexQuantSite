import React from 'react'
import { render, screen, fireEvent } from '../utils/test-utils'
import ErrorBoundary from '@/components/ui/error-boundary'

// Mock component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary')
  }
  return <div>No error</div>
}

// Mock console.error to prevent test output pollution
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    // Should show error boundary UI instead of the child
    expect(screen.queryByText('No error')).not.toBeInTheDocument()
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('displays error details in development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/Test error for error boundary/i)).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('provides copy to clipboard functionality', () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn()
      }
    })
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const copyButton = screen.getByText(/copy.*error/i)
    fireEvent.click(copyButton)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('provides retry functionality', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    // Should show retry button
    const retryButton = screen.getByText(/try again/i)
    expect(retryButton).toBeInTheDocument()
    
    // Retry should attempt to re-render
    fireEvent.click(retryButton)
    
    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('logs errors to console in development', () => {
    const consoleSpy = jest.spyOn(console, 'error')
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('ErrorBoundary caught an error'),
      expect.any(Error),
      expect.any(Object)
    )
    
    consoleSpy.mockRestore()
  })

  it('handles multiple errors gracefully', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    // First error
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    
    // Second error after retry
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    // Should still handle the error gracefully
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('resets error state when children change', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    // Should show error
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    
    // Change children to non-throwing component
    rerender(
      <ErrorBoundary>
        <div>New content</div>
      </ErrorBoundary>
    )
    
    // Should show new content without error
    expect(screen.getByText('New content')).toBeInTheDocument()
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
  })
})
