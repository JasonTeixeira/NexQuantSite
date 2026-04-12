import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminDashboardClient from '../admin-dashboard-client'

// Mock the error boundary and loading components
jest.mock('../../error-boundary-admin', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
  AdminLoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
  AdminComponentSkeleton: () => <div data-testid="skeleton">Skeleton loading...</div>,
}))

// Mock the optimized chart components
jest.mock('../optimized-chart-components', () => ({
  OptimizedAreaChart: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="area-chart" data-key={dataKey}>Area Chart</div>
  ),
  OptimizedBarChart: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="bar-chart" data-key={dataKey}>Bar Chart</div>
  ),
  ChartContainer: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="chart-container" data-title={title}>{children}</div>
  ),
}))

describe('AdminDashboardClient', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear()
    
    // Mock setTimeout to handle async loading
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('shows skeleton loading initially', () => {
    render(<AdminDashboardClient />)
    
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    expect(screen.getByText('Skeleton loading...')).toBeInTheDocument()
  })

  it('loads and displays dashboard content after loading completes', async () => {
    render(<AdminDashboardClient />)
    
    // Initially shows skeleton
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })

    // Dashboard content should be visible
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome back! Here\'s what\'s happening with NEXURAL today.')).toBeInTheDocument()
  })

  it('displays correct system health status', async () => {
    render(<AdminDashboardClient />)
    
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/System healthy/i)).toBeInTheDocument()
    })
    
    // Should show green status indicator
    const healthBadge = screen.getByText(/System healthy/i).closest('[class*="bg-green-500"]')
    expect(healthBadge).toBeInTheDocument()
  })

  it('renders all stat cards with correct data', async () => {
    render(<AdminDashboardClient />)
    
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      // Total Users card
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('2,100')).toBeInTheDocument()
      
      // Active Users card
      expect(screen.getByText('Active Users')).toBeInTheDocument()
      expect(screen.getByText('1,750')).toBeInTheDocument()
      
      // Total Revenue card
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('$67,000')).toBeInTheDocument()
      
      // Active Subscriptions card
      expect(screen.getByText('Active Subscriptions')).toBeInTheDocument()
      expect(screen.getByText('480')).toBeInTheDocument()
    })
  })

  it('renders charts with correct titles and data', async () => {
    render(<AdminDashboardClient />)
    
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      // User Growth chart
      const userGrowthChart = screen.getByTestId('chart-container')
      expect(userGrowthChart).toHaveAttribute('data-title', 'User Growth')
      
      // Should contain area chart
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toHaveAttribute('data-key', 'users')
    })
  })

  it('displays system metrics with proper status indicators', async () => {
    render(<AdminDashboardClient />)
    
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('System Performance')).toBeInTheDocument()
      
      // Should show metric names
      expect(screen.getByText('CPU Usage')).toBeInTheDocument()
      expect(screen.getByText('Memory')).toBeInTheDocument()
      expect(screen.getByText('Disk Space')).toBeInTheDocument()
      expect(screen.getByText('Network')).toBeInTheDocument()
    })
  })

  it('shows recent activity notifications', async () => {
    render(<AdminDashboardClient />)
    
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      
      // Should show some activity items
      expect(screen.getByText(/New user registration/i)).toBeInTheDocument()
      expect(screen.getByText(/System backup completed/i)).toBeInTheDocument()
    })
  })

  it('handles mounted state correctly', async () => {
    render(<AdminDashboardClient />)
    
    // Should not show content before mounting
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument()
    
    // Should show skeleton initially
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('wraps content in error boundary', () => {
    render(<AdminDashboardClient />)
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
  })

  it('has proper quick actions section', async () => {
    render(<AdminDashboardClient />)
    
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      
      // Should have action buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('displays proper loading state management', () => {
    const { rerender } = render(<AdminDashboardClient />)
    
    // Initial state should show skeleton
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    
    // After mounting and loading, should show content
    jest.advanceTimersByTime(1000)
    
    rerender(<AdminDashboardClient />)
    
    // Should eventually show dashboard content
    waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })
  })

  it('handles async data loading simulation correctly', async () => {
    // Mock console.error to avoid error logs during loading simulation
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<AdminDashboardClient />)
    
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })
    
    consoleSpy.mockRestore()
  })
})
