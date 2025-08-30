import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminLayoutClient from '../admin-layout-client'
import AdminDashboardClient from '../admin-dashboard-client'

// Mock next/navigation
const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/admin/dashboard',
}))

// Mock the error boundary and loading components
jest.mock('../../error-boundary-admin', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
  AdminLoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>Loading...</div>
  ),
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

describe('Admin Workflow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('Authentication Flow', () => {
    it('redirects unauthenticated users to login', () => {
      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      expect(mockPush).toHaveBeenCalledWith('/admin/login')
    })

    it('allows authenticated users to access dashboard', async () => {
      // Set up authenticated state
      localStorage.setItem('adminToken', 'test-token')
      localStorage.setItem('adminData', JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin'
      }))

      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalled()
      expect(screen.getByText('NEXURAL')).toBeInTheDocument()
    })
  })

  describe('Dashboard Navigation Flow', () => {
    beforeEach(() => {
      localStorage.setItem('adminToken', 'test-token')
      localStorage.setItem('adminData', JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin'
      }))
    })

    it('displays complete admin navigation structure', async () => {
      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Check navigation sections
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Operations')).toBeInTheDocument()
      expect(screen.getByText('Business Intelligence')).toBeInTheDocument()
      expect(screen.getByText('User Management')).toBeInTheDocument()

      // Check key navigation items
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })

    it('handles mobile navigation toggle', async () => {
      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Find and click mobile menu button
      const menuButton = screen.getByRole('button', { name: /menu/i })
      fireEvent.click(menuButton)

      // Mobile overlay should appear
      const overlay = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
      expect(overlay).toBeInTheDocument()
    })
  })

  describe('Dashboard Content Loading Flow', () => {
    beforeEach(() => {
      localStorage.setItem('adminToken', 'test-token')
      localStorage.setItem('adminData', JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin'
      }))
    })

    it('shows loading skeleton then dashboard content', async () => {
      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      // Wait for layout to load
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Dashboard should initially show skeleton
      expect(screen.getByTestId('skeleton')).toBeInTheDocument()

      // Advance timers to complete dashboard loading
      jest.advanceTimersByTime(1000)

      // Dashboard content should load
      await waitFor(() => {
        expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
      })
    })

    it('handles error boundaries properly throughout the flow', async () => {
      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Error boundaries should be present
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    })
  })

  describe('User Management Flow', () => {
    beforeEach(() => {
      localStorage.setItem('adminToken', 'test-token')
      localStorage.setItem('adminData', JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin'
      }))
    })

    it('displays user information in header', async () => {
      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      expect(screen.getByText('Test Admin')).toBeInTheDocument()
      expect(screen.getByText('admin@test.com')).toBeInTheDocument()
    })

    it('handles complete logout flow', async () => {
      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Open user menu
      const userButton = screen.getByRole('button', { name: /test admin/i })
      fireEvent.click(userButton)

      // Click logout
      const logoutButton = screen.getByText('Logout')
      fireEvent.click(logoutButton)

      // Should clear localStorage and redirect
      expect(localStorage.getItem('adminToken')).toBeNull()
      expect(localStorage.getItem('adminData')).toBeNull()
      expect(mockPush).toHaveBeenCalledWith('/admin/login')
    })
  })

  describe('Search and Interaction Flow', () => {
    beforeEach(() => {
      localStorage.setItem('adminToken', 'test-token')
      localStorage.setItem('adminData', JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin'
      }))
    })

    it('handles search functionality in admin layout', async () => {
      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Find search input
      const searchInput = screen.getByPlaceholderText(/search/i)
      expect(searchInput).toBeInTheDocument()

      // Type in search
      fireEvent.change(searchInput, { target: { value: 'test search query' } })
      expect(searchInput).toHaveValue('test search query')
    })
  })

  describe('Responsive Design Flow', () => {
    beforeEach(() => {
      localStorage.setItem('adminToken', 'test-token')
      localStorage.setItem('adminData', JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin'
      }))
    })

    it('adapts layout for mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Mobile menu button should be present
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
      expect(mobileMenuButton).toBeInTheDocument()
    })
  })

  describe('Error Recovery Flow', () => {
    it('handles malformed authentication data gracefully', () => {
      localStorage.setItem('adminToken', 'test-token')
      localStorage.setItem('adminData', 'invalid-json')

      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      // Should redirect to login and clear bad data
      expect(mockPush).toHaveBeenCalledWith('/admin/login')
      expect(localStorage.getItem('adminToken')).toBeNull()
      expect(localStorage.getItem('adminData')).toBeNull()
    })

    it('handles missing authentication gracefully', () => {
      // No localStorage data set

      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      // Should redirect to login
      expect(mockPush).toHaveBeenCalledWith('/admin/login')
    })
  })

  describe('Performance Optimization Flow', () => {
    beforeEach(() => {
      localStorage.setItem('adminToken', 'test-token')
      localStorage.setItem('adminData', JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin'
      }))
    })

    it('loads optimized chart components properly', async () => {
      render(
        <AdminLayoutClient>
          <AdminDashboardClient />
        </AdminLayoutClient>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      // Fast-forward timers to load dashboard
      jest.advanceTimersByTime(1000)

      // Should eventually show optimized chart components
      await waitFor(() => {
        const chartContainers = screen.queryAllByTestId('chart-container')
        expect(chartContainers.length).toBeGreaterThan(0)
      })
    })
  })
})
