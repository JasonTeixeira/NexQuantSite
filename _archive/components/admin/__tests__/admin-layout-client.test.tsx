import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminLayoutClient from '../admin-layout-client'

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

// Mock the error boundary
jest.mock('../../error-boundary-admin', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
  AdminLoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>Loading...</div>
  ),
}))

describe('AdminLayoutClient', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
  })

  it('redirects to login when no admin token exists', () => {
    render(
      <AdminLayoutClient>
        <div>Test Content</div>
      </AdminLayoutClient>
    )

    expect(mockPush).toHaveBeenCalledWith('/admin/login')
  })

  it('shows loading state initially', () => {
    render(
      <AdminLayoutClient>
        <div>Test Content</div>
      </AdminLayoutClient>
    )

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-size', 'lg')
  })

  it('renders admin layout when authenticated', async () => {
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
        <div data-testid="test-content">Test Content</div>
      </AdminLayoutClient>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    // Should render the layout
    expect(screen.getByText('NEXURAL')).toBeInTheDocument()
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    
    // Should render the children in error boundary
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('displays correct navigation items', async () => {
    localStorage.setItem('adminToken', 'test-token')
    localStorage.setItem('adminData', JSON.stringify({
      id: '1',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin'
    }))

    render(
      <AdminLayoutClient>
        <div>Test Content</div>
      </AdminLayoutClient>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    // Check for main navigation sections
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(screen.getByText('Business Intelligence')).toBeInTheDocument()
    expect(screen.getByText('User Management')).toBeInTheDocument()

    // Check for specific navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('handles mobile sidebar toggle', async () => {
    localStorage.setItem('adminToken', 'test-token')
    localStorage.setItem('adminData', JSON.stringify({
      id: '1',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin'
    }))

    render(
      <AdminLayoutClient>
        <div>Test Content</div>
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

  it('displays admin user information in header', async () => {
    const adminData = {
      id: '1',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin'
    }

    localStorage.setItem('adminToken', 'test-token')
    localStorage.setItem('adminData', JSON.stringify(adminData))

    render(
      <AdminLayoutClient>
        <div>Test Content</div>
      </AdminLayoutClient>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Test Admin')).toBeInTheDocument()
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })

  it('handles logout functionality', async () => {
    localStorage.setItem('adminToken', 'test-token')
    localStorage.setItem('adminData', JSON.stringify({
      id: '1',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin'
    }))

    render(
      <AdminLayoutClient>
        <div>Test Content</div>
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

  it('handles malformed admin data gracefully', () => {
    localStorage.setItem('adminToken', 'test-token')
    localStorage.setItem('adminData', 'invalid-json')

    render(
      <AdminLayoutClient>
        <div>Test Content</div>
      </AdminLayoutClient>
    )

    // Should redirect to login due to invalid data
    expect(mockPush).toHaveBeenCalledWith('/admin/login')
    expect(localStorage.getItem('adminToken')).toBeNull()
    expect(localStorage.getItem('adminData')).toBeNull()
  })

  it('allows navigation when already on login page', () => {
    // Mock being on login page
    jest.mocked(require('next/navigation').usePathname).mockReturnValue('/admin/login')

    render(
      <AdminLayoutClient>
        <div>Login Content</div>
      </AdminLayoutClient>
    )

    // Should not redirect when already on login page
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles search functionality', async () => {
    localStorage.setItem('adminToken', 'test-token')
    localStorage.setItem('adminData', JSON.stringify({
      id: '1',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin'
    }))

    render(
      <AdminLayoutClient>
        <div>Test Content</div>
      </AdminLayoutClient>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toBeInTheDocument()

    // Type in search
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    expect(searchInput).toHaveValue('test search')
  })

  it('wraps children in error boundary', async () => {
    localStorage.setItem('adminToken', 'test-token')
    localStorage.setItem('adminData', JSON.stringify({
      id: '1',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin'
    }))

    render(
      <AdminLayoutClient>
        <div data-testid="child-content">Test Content</div>
      </AdminLayoutClient>
    )

    await waitFor(() => {
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })
  })
})
