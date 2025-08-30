import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminErrorBoundary, { AdminLoadingSpinner, AdminComponentSkeleton } from '../error-boundary-admin'

// Component that throws an error for testing
const ThrowErrorComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('AdminErrorBoundary', () => {
  // Reset console.error to avoid cluttering test output
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <AdminErrorBoundary>
        <div data-testid="child-component">Child content</div>
      </AdminErrorBoundary>
    )

    expect(screen.getByTestId('child-component')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('catches and displays error when child component throws', () => {
    render(
      <AdminErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </AdminErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An error occurred while loading this admin component.')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('displays retry button when error occurs', () => {
    render(
      <AdminErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </AdminErrorBoundary>
    )

    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    // Retry button should be present and clickable
    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()
    
    // Verify button is interactive
    expect(retryButton).not.toBeDisabled()
  })

  it('uses custom fallback component when provided', () => {
    const CustomFallback = ({ error, reset }: { error?: Error; reset: () => void }) => (
      <div>
        <h2>Custom Error</h2>
        <p>{error?.message}</p>
        <button onClick={reset}>Custom Retry</button>
      </div>
    )

    render(
      <AdminErrorBoundary fallback={CustomFallback}>
        <ThrowErrorComponent shouldThrow={true} />
      </AdminErrorBoundary>
    )

    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /custom retry/i })).toBeInTheDocument()
  })
})

describe('AdminLoadingSpinner', () => {
  it('renders loading spinner with default size', () => {
    render(<AdminLoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-8', 'w-8')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders loading spinner with small size', () => {
    render(<AdminLoadingSpinner size="sm" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-4', 'w-4')
  })

  it('renders loading spinner with large size', () => {
    render(<AdminLoadingSpinner size="lg" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-12', 'w-12')
  })

  it('has proper animation classes', () => {
    render(<AdminLoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-b-2', 'border-primary')
  })
})

describe('AdminComponentSkeleton', () => {
  it('renders skeleton loading structure', () => {
    render(<AdminComponentSkeleton />)
    
    // Check for animated skeleton elements
    const animatedElements = document.querySelectorAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
    
    // Check for gray background skeleton elements
    const skeletonElements = document.querySelectorAll('.bg-gray-200')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('has proper structure with header, cards, and charts', () => {
    render(<AdminComponentSkeleton />)
    
    // Should have header skeleton
    const headerSkeleton = document.querySelector('.h-8')
    expect(headerSkeleton).toBeInTheDocument()
    
    // Should have card skeletons
    const cardSkeletons = document.querySelectorAll('.h-32')
    expect(cardSkeletons.length).toBe(4) // 4 metric cards
    
    // Should have chart skeletons
    const chartSkeletons = document.querySelectorAll('.h-64')
    expect(chartSkeletons.length).toBe(2) // 2 chart areas
  })

  it('uses proper styling for skeleton elements', () => {
    render(<AdminComponentSkeleton />)
    
    const skeletonElements = document.querySelectorAll('.bg-gray-200')
    expect(skeletonElements.length).toBeGreaterThan(0)
    
    // Check that skeleton elements have animation
    const animatedElements = document.querySelectorAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
    
    // All skeleton elements should have rounded corners
    const roundedElements = document.querySelectorAll('.rounded')
    expect(roundedElements.length).toBeGreaterThan(0)
  })
})
