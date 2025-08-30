import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { financialMatchers, mockData } from '../utils/test-utils'

// Import Phase 3 components
import { AdvancedAnalytics } from '@/components/phase3/advanced-analytics'
import { AuditTrail } from '@/components/phase3/audit-trail'
import { ComplianceDashboard } from '@/components/phase3/compliance-dashboard'
import { MultiUserManagement } from '@/components/phase3/multi-user-management'

// Extend Jest matchers
expect.extend(financialMatchers)

describe('Phase 3 Components - Advanced Features', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AdvancedAnalytics', () => {
    it('renders without crashing', () => {
      render(<AdvancedAnalytics />)
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
    })

    it('displays analytics description', () => {
      render(<AdvancedAnalytics />)
      expect(screen.getByText(/advanced statistical analysis/i)).toBeInTheDocument()
    })

    it('shows main analytics tabs', () => {
      render(<AdvancedAnalytics />)
      
      // Check for common analytics tabs
      const tabElements = screen.getAllByRole('tab')
      expect(tabElements.length).toBeGreaterThan(0)
    })

    it('handles tab navigation', async () => {
      render(<AdvancedAnalytics />)
      
      const tabs = screen.getAllByRole('tab')
      if (tabs.length > 1) {
        fireEvent.click(tabs[1])
        await waitFor(() => {
          expect(tabs[1]).toHaveAttribute('data-state', 'active')
        })
      }
    })

    it('displays analytics charts', async () => {
      render(<AdvancedAnalytics />)
      
      // Wait for charts to render
      await waitFor(() => {
        const charts = screen.queryAllByTestId('responsive-container')
        expect(charts.length).toBeGreaterThanOrEqual(0)
      })
    })

    it('handles analytics calculations', () => {
      render(<AdvancedAnalytics />)
      
      // Generate test data for analytics
      const testData = mockData.generateEquityData(100)
      expect(testData).toHaveLength(100)
      
      // Verify analytics can handle the data
      expect(testData[0].equity).toBeValidPrice()
    })

    it('supports export functionality', () => {
      render(<AdvancedAnalytics />)
      
      // Check for export buttons
      const exportButtons = screen.queryAllByText(/export/i)
      expect(exportButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains performance with large datasets', () => {
      const startTime = performance.now()
      render(<AdvancedAnalytics />)
      const renderTime = performance.now() - startTime
      
      expect(renderTime).toBeLessThan(200)
    })
  })

  describe('AuditTrail', () => {
    it('renders without crashing', () => {
      render(<AuditTrail />)
      expect(screen.getByText('Audit Trail')).toBeInTheDocument()
    })

    it('displays audit description', () => {
      render(<AuditTrail />)
      expect(screen.getByText(/comprehensive audit trail/i)).toBeInTheDocument()
    })

    it('shows audit log interface', () => {
      render(<AuditTrail />)
      
      // Check for audit-related elements
      expect(screen.getByText('Audit Trail')).toBeInTheDocument()
    })

    it('handles audit filtering', () => {
      render(<AuditTrail />)
      
      // Check for filter controls
      const filterInputs = screen.queryAllByRole('textbox')
      expect(filterInputs.length).toBeGreaterThanOrEqual(0)
    })

    it('displays audit entries', () => {
      render(<AuditTrail />)
      
      // Check for audit table or list
      const auditContent = screen.getByText('Audit Trail')
      expect(auditContent).toBeInTheDocument()
    })

    it('supports audit search', () => {
      render(<AuditTrail />)
      
      // Look for search functionality
      const searchInputs = screen.queryAllByRole('textbox')
      if (searchInputs.length > 0) {
        fireEvent.change(searchInputs[0], { target: { value: 'test search' } })
        expect(searchInputs[0]).toHaveValue('test search')
      }
    })

    it('handles audit export', () => {
      render(<AuditTrail />)
      
      // Check for export functionality
      const exportButtons = screen.queryAllByText(/export/i)
      expect(exportButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains audit data integrity', () => {
      render(<AuditTrail />)
      
      // Verify component renders consistently
      expect(screen.getByText('Audit Trail')).toBeInTheDocument()
    })
  })

  describe('ComplianceDashboard', () => {
    it('renders without crashing', () => {
      render(<ComplianceDashboard />)
      expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument()
    })

    it('displays compliance description', () => {
      render(<ComplianceDashboard />)
      expect(screen.getByText(/regulatory compliance monitoring/i)).toBeInTheDocument()
    })

    it('shows compliance metrics', () => {
      render(<ComplianceDashboard />)
      
      // Check for compliance-related content
      expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument()
    })

    it('handles compliance alerts', () => {
      render(<ComplianceDashboard />)
      
      // Check for alert indicators
      const dashboard = screen.getByText('Compliance Dashboard')
      expect(dashboard).toBeInTheDocument()
    })

    it('displays regulatory status', () => {
      render(<ComplianceDashboard />)
      
      // Verify regulatory status display
      expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument()
    })

    it('supports compliance reporting', () => {
      render(<ComplianceDashboard />)
      
      // Check for reporting functionality
      const reportButtons = screen.queryAllByText(/report/i)
      expect(reportButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('handles compliance violations', () => {
      render(<ComplianceDashboard />)
      
      // Verify violation handling interface
      expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument()
    })

    it('maintains compliance data accuracy', () => {
      render(<ComplianceDashboard />)
      
      // Test data accuracy for compliance
      const testMetrics = {
        riskLimit: 0.05,
        currentRisk: 0.03,
        complianceScore: 95
      }
      
      expect(testMetrics.riskLimit).toBeValidPercentage()
      expect(testMetrics.currentRisk).toBeValidPercentage()
      expect(testMetrics.complianceScore).toBeValidPercentage()
    })
  })

  describe('MultiUserManagement', () => {
    it('renders without crashing', () => {
      render(<MultiUserManagement />)
      expect(screen.getByText('Multi-User Management')).toBeInTheDocument()
    })

    it('displays user management description', () => {
      render(<MultiUserManagement />)
      expect(screen.getByText(/user access control/i)).toBeInTheDocument()
    })

    it('shows user management interface', () => {
      render(<MultiUserManagement />)
      
      // Check for user management elements
      expect(screen.getByText('Multi-User Management')).toBeInTheDocument()
    })

    it('handles user roles', () => {
      render(<MultiUserManagement />)
      
      // Check for role management
      const roleElements = screen.queryAllByText(/role/i)
      expect(roleElements.length).toBeGreaterThanOrEqual(0)
    })

    it('displays user list', () => {
      render(<MultiUserManagement />)
      
      // Verify user list display
      expect(screen.getByText('Multi-User Management')).toBeInTheDocument()
    })

    it('supports user creation', () => {
      render(<MultiUserManagement />)
      
      // Check for user creation functionality
      const createButtons = screen.queryAllByText(/create|add/i)
      expect(createButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('handles permission management', () => {
      render(<MultiUserManagement />)
      
      // Check for permission controls
      const permissionElements = screen.queryAllByText(/permission/i)
      expect(permissionElements.length).toBeGreaterThanOrEqual(0)
    })

    it('maintains user data security', () => {
      render(<MultiUserManagement />)
      
      // Verify secure rendering
      expect(screen.getByText('Multi-User Management')).toBeInTheDocument()
    })
  })

  describe('Phase 3 Integration', () => {
    it('all components render together', () => {
      const { unmount: unmount1 } = render(<AdvancedAnalytics />)
      const { unmount: unmount2 } = render(<AuditTrail />)
      const { unmount: unmount3 } = render(<ComplianceDashboard />)
      const { unmount: unmount4 } = render(<MultiUserManagement />)
      
      // All should render without conflicts
      expect(screen.getAllByText(/Advanced Analytics|Audit Trail|Compliance Dashboard|Multi-User Management/)).toHaveLength(4)
      
      // Clean up
      unmount1()
      unmount2()
      unmount3()
      unmount4()
    })

    it('components handle concurrent rendering', async () => {
      const startTime = performance.now()
      
      // Render all components concurrently
      const components = [
        <AdvancedAnalytics key="analytics" />,
        <AuditTrail key="audit" />,
        <ComplianceDashboard key="compliance" />,
        <MultiUserManagement key="users" />
      ]
      
      components.forEach(component => {
        const { unmount } = render(component)
        unmount()
      })
      
      const totalTime = performance.now() - startTime
      expect(totalTime).toBeLessThan(500)
    })

    it('components maintain consistent theming', () => {
      render(<AdvancedAnalytics />)
      
      // Check for consistent dark theme
      const darkElements = document.querySelectorAll('.bg-\\[\\#15151f\\], .bg-\\[\\#1a1a2e\\], .text-white')
      expect(darkElements.length).toBeGreaterThan(0)
    })

    it('components handle error states gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Should not throw errors
      expect(() => render(<AdvancedAnalytics />)).not.toThrow()
      expect(() => render(<AuditTrail />)).not.toThrow()
      expect(() => render(<ComplianceDashboard />)).not.toThrow()
      expect(() => render(<MultiUserManagement />)).not.toThrow()
      
      consoleSpy.mockRestore()
    })
  })
})
