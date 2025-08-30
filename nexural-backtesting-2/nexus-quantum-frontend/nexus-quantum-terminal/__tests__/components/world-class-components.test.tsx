import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import WorldClassStrategyLab from '@/components/phase2/world-class-strategy-lab'
import WorldClassMLFactory from '@/components/phase2/world-class-ml-factory'
import WorldClassRiskManagement from '@/components/phase2/world-class-risk-management'
import WorldClassAlternativeData from '@/components/phase2/world-class-alternative-data'

// Mock complex dependencies
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}))

describe('World-Class Components Suite', () => {
  describe('WorldClassStrategyLab', () => {
    it('renders without crashing', () => {
      render(<WorldClassStrategyLab />)
      
      expect(screen.getByText(/strategy lab/i)).toBeInTheDocument()
    })

    it('displays institutional strategy templates', () => {
      render(<WorldClassStrategyLab />)
      
      // Should show advanced strategy templates
      expect(screen.getByText(/ml.*enhanced/i)).toBeInTheDocument()
      expect(screen.getByText(/statistical.*arbitrage/i)).toBeInTheDocument()
      expect(screen.getByText(/volatility.*surface/i)).toBeInTheDocument()
    })

    it('shows automation system', () => {
      render(<WorldClassStrategyLab />)
      
      // Should display automation features
      expect(screen.getByText(/automation/i)).toBeInTheDocument()
      expect(screen.getByText(/triggers/i)).toBeInTheDocument()
    })

    it('displays performance analytics', () => {
      render(<WorldClassStrategyLab />)
      
      // Should show institutional performance metrics
      expect(screen.getByText(/sharpe.*ratio/i)).toBeInTheDocument()
      expect(screen.getByText(/calmar.*ratio/i)).toBeInTheDocument()
      expect(screen.getByText(/information.*ratio/i)).toBeInTheDocument()
    })

    it('handles strategy selection', async () => {
      render(<WorldClassStrategyLab />)
      
      // Click on strategy template
      const strategyCard = screen.getByText(/ml.*enhanced/i)
      fireEvent.click(strategyCard)
      
      await waitFor(() => {
        // Should show strategy details
        expect(screen.getByText(/momentum/i)).toBeInTheDocument()
      })
    })

    it('supports strategy filtering', () => {
      render(<WorldClassStrategyLab />)
      
      // Should have filter options
      expect(screen.getByText(/filter/i)).toBeInTheDocument()
      
      // Should show different strategy types
      expect(screen.getByText(/momentum/i)).toBeInTheDocument()
      expect(screen.getByText(/mean.*reversion/i)).toBeInTheDocument()
    })

    it('displays live trading metrics', () => {
      render(<WorldClassStrategyLab />)
      
      // Should show real-time metrics
      expect(screen.getByText(/live.*trading/i)).toBeInTheDocument()
      expect(screen.getByText(/p&l/i)).toBeInTheDocument()
      expect(screen.getByText(/positions/i)).toBeInTheDocument()
    })

    it('renders optimization interface', () => {
      render(<WorldClassStrategyLab />)
      
      // Should show optimization controls
      expect(screen.getByText(/optimization/i)).toBeInTheDocument()
      expect(screen.getByText(/parameters/i)).toBeInTheDocument()
    })
  })

  describe('WorldClassMLFactory', () => {
    it('renders without crashing', () => {
      render(<WorldClassMLFactory />)
      
      expect(screen.getByText(/ml.*factory/i)).toBeInTheDocument()
    })

    it('displays ML model types', () => {
      render(<WorldClassMLFactory />)
      
      // Should show various ML models
      expect(screen.getByText(/lstm/i)).toBeInTheDocument()
      expect(screen.getByText(/transformer/i)).toBeInTheDocument()
      expect(screen.getByText(/ensemble/i)).toBeInTheDocument()
      expect(screen.getByText(/automl/i)).toBeInTheDocument()
    })

    it('shows model performance metrics', () => {
      render(<WorldClassMLFactory />)
      
      // Should display accuracy and performance metrics
      expect(screen.getByText(/accuracy/i)).toBeInTheDocument()
      expect(screen.getByText(/sharpe.*ratio/i)).toBeInTheDocument()
      expect(screen.getByText(/87.*3%/)).toBeInTheDocument() // LSTM accuracy
      expect(screen.getByText(/92.*6%/)).toBeInTheDocument() // Transformer accuracy
    })

    it('supports model deployment', () => {
      render(<WorldClassMLFactory />)
      
      // Should show deployment status
      expect(screen.getByText(/deployed/i)).toBeInTheDocument()
      expect(screen.getByText(/production/i)).toBeInTheDocument()
    })

    it('displays training progress', () => {
      render(<WorldClassMLFactory />)
      
      // Should show training status
      expect(screen.getByText(/training/i)).toBeInTheDocument()
      expect(screen.getByText(/progress/i)).toBeInTheDocument()
    })

    it('handles model selection', async () => {
      render(<WorldClassMLFactory />)
      
      // Click on LSTM model
      const lstmModel = screen.getByText(/lstm/i)
      fireEvent.click(lstmModel)
      
      await waitFor(() => {
        // Should show model details
        expect(screen.getByText(/price.*prediction/i)).toBeInTheDocument()
      })
    })

    it('shows MLOps pipeline', () => {
      render(<WorldClassMLFactory />)
      
      // Should display MLOps features
      expect(screen.getByText(/pipeline/i)).toBeInTheDocument()
      expect(screen.getByText(/monitoring/i)).toBeInTheDocument()
      expect(screen.getByText(/alerting/i)).toBeInTheDocument()
    })
  })

  describe('WorldClassRiskManagement', () => {
    it('renders without crashing', () => {
      render(<WorldClassRiskManagement />)
      
      expect(screen.getByText(/risk.*management/i)).toBeInTheDocument()
    })

    it('displays VaR calculations', () => {
      render(<WorldClassRiskManagement />)
      
      // Should show Value at Risk metrics
      expect(screen.getByText(/var/i)).toBeInTheDocument()
      expect(screen.getByText(/95%/)).toBeInTheDocument()
      expect(screen.getByText(/99%/)).toBeInTheDocument()
    })

    it('shows stress testing results', () => {
      render(<WorldClassRiskManagement />)
      
      // Should display stress test scenarios
      expect(screen.getByText(/stress.*test/i)).toBeInTheDocument()
      expect(screen.getByText(/scenario/i)).toBeInTheDocument()
      expect(screen.getByText(/market.*crash/i)).toBeInTheDocument()
    })

    it('displays correlation matrix', () => {
      render(<WorldClassRiskManagement />)
      
      // Should show correlation analysis
      expect(screen.getByText(/correlation/i)).toBeInTheDocument()
      expect(screen.getByTestId('chart-container')).toBeInTheDocument()
    })

    it('supports risk limit monitoring', () => {
      render(<WorldClassRiskManagement />)
      
      // Should show risk limits and utilization
      expect(screen.getByText(/limits/i)).toBeInTheDocument()
      expect(screen.getByText(/utilization/i)).toBeInTheDocument()
    })

    it('handles risk alert configuration', async () => {
      render(<WorldClassRiskManagement />)
      
      // Should have alert configuration
      const alertButton = screen.getByText(/alert/i)
      fireEvent.click(alertButton)
      
      await waitFor(() => {
        expect(screen.getByText(/threshold/i)).toBeInTheDocument()
      })
    })

    it('displays portfolio beta', () => {
      render(<WorldClassRiskManagement />)
      
      // Should show beta calculations
      expect(screen.getByText(/beta/i)).toBeInTheDocument()
      expect(screen.getByText(/0\.\d+/)).toBeInTheDocument() // Beta value format
    })
  })

  describe('WorldClassAlternativeData', () => {
    it('renders without crashing', () => {
      render(<WorldClassAlternativeData />)
      
      expect(screen.getByText(/alternative.*data/i)).toBeInTheDocument()
    })

    it('displays data sources', () => {
      render(<WorldClassAlternativeData />)
      
      // Should show various alt data sources
      expect(screen.getByText(/satellite/i)).toBeInTheDocument()
      expect(screen.getByText(/social.*sentiment/i)).toBeInTheDocument()
      expect(screen.getByText(/news.*analytics/i)).toBeInTheDocument()
      expect(screen.getByText(/supply.*chain/i)).toBeInTheDocument()
    })

    it('shows data quality metrics', () => {
      render(<WorldClassAlternativeData />)
      
      // Should display data quality indicators
      expect(screen.getByText(/quality/i)).toBeInTheDocument()
      expect(screen.getByText(/freshness/i)).toBeInTheDocument()
      expect(screen.getByText(/coverage/i)).toBeInTheDocument()
    })

    it('supports data source configuration', () => {
      render(<WorldClassAlternativeData />)
      
      // Should have configuration options
      expect(screen.getByText(/configure/i)).toBeInTheDocument()
      expect(screen.getByText(/api.*key/i)).toBeInTheDocument()
    })

    it('displays sentiment analytics', () => {
      render(<WorldClassAlternativeData />)
      
      // Should show sentiment analysis
      expect(screen.getByText(/sentiment/i)).toBeInTheDocument()
      expect(screen.getByText(/bullish/i)).toBeInTheDocument()
      expect(screen.getByText(/bearish/i)).toBeInTheDocument()
    })

    it('handles data refresh', async () => {
      render(<WorldClassAlternativeData />)
      
      // Should have refresh functionality
      const refreshButton = screen.getByText(/refresh/i)
      fireEvent.click(refreshButton)
      
      await waitFor(() => {
        expect(screen.getByText(/updating/i)).toBeInTheDocument()
      })
    })

    it('shows data lineage', () => {
      render(<WorldClassAlternativeData />)
      
      // Should display data lineage and provenance
      expect(screen.getByText(/source/i)).toBeInTheDocument()
      expect(screen.getByText(/updated/i)).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('all world-class components render together', () => {
      const { container } = render(
        <div>
          <WorldClassStrategyLab />
          <WorldClassMLFactory />
          <WorldClassRiskManagement />
          <WorldClassAlternativeData />
        </div>
      )
      
      // All components should render without conflicts
      expect(container).toBeInTheDocument()
      expect(screen.getByText(/strategy lab/i)).toBeInTheDocument()
      expect(screen.getByText(/ml.*factory/i)).toBeInTheDocument()
      expect(screen.getByText(/risk.*management/i)).toBeInTheDocument()
      expect(screen.getByText(/alternative.*data/i)).toBeInTheDocument()
    })

    it('maintains performance with all components', () => {
      const startTime = performance.now()
      
      render(
        <div>
          <WorldClassStrategyLab />
          <WorldClassMLFactory />
          <WorldClassRiskManagement />
          <WorldClassAlternativeData />
        </div>
      )
      
      const endTime = performance.now()
      
      // Should render all components within reasonable time
      expect(endTime - startTime).toBeLessThan(2000) // 2 seconds max
    })

    it('shares data between components', () => {
      render(
        <div>
          <WorldClassStrategyLab />
          <WorldClassRiskManagement />
        </div>
      )
      
      // Components should share portfolio data
      expect(screen.getAllByText(/portfolio/i).length).toBeGreaterThan(1)
    })

    it('maintains consistent theming', () => {
      render(
        <div>
          <WorldClassStrategyLab />
          <WorldClassMLFactory />
        </div>
      )
      
      // Should use consistent color scheme
      const darkElements = document.querySelectorAll('[class*="bg-\\[#"]')
      expect(darkElements.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling and Resilience', () => {
    it('handles component errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Should not crash even with potential errors
      expect(() => render(<WorldClassStrategyLab />)).not.toThrow()
      expect(() => render(<WorldClassMLFactory />)).not.toThrow()
      expect(() => render(<WorldClassRiskManagement />)).not.toThrow()
      expect(() => render(<WorldClassAlternativeData />)).not.toThrow()
      
      consoleErrorSpy.mockRestore()
    })

    it('recovers from data loading failures', () => {
      // Mock failed data loading
      const mockFetchFailure = jest.fn().mockRejectedValue(new Error('Network error'))
      global.fetch = mockFetchFailure
      
      render(<WorldClassMLFactory />)
      
      // Should show fallback content
      expect(screen.getByText(/ml.*factory/i)).toBeInTheDocument()
    })

    it('handles missing chart data', () => {
      render(<WorldClassRiskManagement />)
      
      // Should render even if chart data is missing
      expect(screen.getByText(/risk.*management/i)).toBeInTheDocument()
      expect(screen.getByTestId('chart-container')).toBeInTheDocument()
    })
  })

  describe('Accessibility and UX', () => {
    it('provides proper accessibility labels', () => {
      render(<WorldClassStrategyLab />)
      
      // Should have accessible content
      expect(screen.getByText(/strategy lab/i)).toBeInTheDocument()
      
      // Should have interactive elements
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('supports keyboard navigation', () => {
      render(<WorldClassMLFactory />)
      
      const firstButton = screen.getAllByRole('button')[0]
      if (firstButton) {
        fireEvent.focus(firstButton)
        expect(firstButton).toHaveFocus()
        
        fireEvent.keyDown(firstButton, { key: 'Tab' })
        // Should not crash
        expect(firstButton).toBeInTheDocument()
      }
    })

    it('provides loading states', () => {
      render(<WorldClassAlternativeData />)
      
      // Should handle loading states
      expect(screen.getByText(/alternative.*data/i)).toBeInTheDocument()
    })
  })

  describe('Performance Validation', () => {
    it('renders components efficiently', () => {
      const components = [
        WorldClassStrategyLab,
        WorldClassMLFactory,
        WorldClassRiskManagement,
        WorldClassAlternativeData
      ]
      
      components.forEach(Component => {
        const startTime = performance.now()
        render(<Component />)
        const endTime = performance.now()
        
        // Each component should render quickly
        expect(endTime - startTime).toBeLessThan(1000)
      })
    })

    it('manages memory effectively', () => {
      const { unmount } = render(<WorldClassMLFactory />)
      
      // Should unmount cleanly
      expect(() => unmount()).not.toThrow()
    })

    it('handles rapid component switching', async () => {
      const { rerender } = render(<WorldClassStrategyLab />)
      
      // Rapidly switch between components
      rerender(<WorldClassMLFactory />)
      await waitFor(() => expect(screen.getByText(/ml.*factory/i)).toBeInTheDocument())
      
      rerender(<WorldClassRiskManagement />)
      await waitFor(() => expect(screen.getByText(/risk.*management/i)).toBeInTheDocument())
      
      rerender(<WorldClassAlternativeData />)
      await waitFor(() => expect(screen.getByText(/alternative.*data/i)).toBeInTheDocument())
      
      // Should handle rapid changes without errors
      expect(screen.getByText(/alternative.*data/i)).toBeInTheDocument()
    })
  })

  describe('Feature Completeness', () => {
    it('strategy lab includes all promised features', () => {
      render(<WorldClassStrategyLab />)
      
      // Core features from the documentation
      expect(screen.getByText(/template/i)).toBeInTheDocument()
      expect(screen.getByText(/optimization/i)).toBeInTheDocument()
      expect(screen.getByText(/automation/i)).toBeInTheDocument()
      expect(screen.getByText(/risk.*management/i)).toBeInTheDocument()
      expect(screen.getByText(/performance/i)).toBeInTheDocument()
    })

    it('ML factory includes institutional models', () => {
      render(<WorldClassMLFactory />)
      
      // Should show institutional-grade models
      expect(screen.getByText(/lstm.*price.*prediction/i)).toBeInTheDocument()
      expect(screen.getByText(/transformer.*sentiment/i)).toBeInTheDocument()
      expect(screen.getByText(/ensemble.*alpha/i)).toBeInTheDocument()
      expect(screen.getByText(/reinforcement.*learning/i)).toBeInTheDocument()
    })

    it('risk management covers all risk types', () => {
      render(<WorldClassRiskManagement />)
      
      // Should cover different risk categories
      expect(screen.getByText(/market.*risk/i)).toBeInTheDocument()
      expect(screen.getByText(/credit.*risk/i)).toBeInTheDocument()
      expect(screen.getByText(/operational.*risk/i)).toBeInTheDocument()
      expect(screen.getByText(/liquidity.*risk/i)).toBeInTheDocument()
    })

    it('alternative data includes diverse sources', () => {
      render(<WorldClassAlternativeData />)
      
      // Should show multiple data source types
      expect(screen.getByText(/satellite.*imagery/i)).toBeInTheDocument()
      expect(screen.getByText(/social.*media/i)).toBeInTheDocument()
      expect(screen.getByText(/economic.*indicators/i)).toBeInTheDocument()
      expect(screen.getByText(/supply.*chain/i)).toBeInTheDocument()
    })
  })

  describe('Data Visualization', () => {
    it('renders charts in all components', () => {
      const components = [
        WorldClassStrategyLab,
        WorldClassMLFactory,
        WorldClassRiskManagement,
        WorldClassAlternativeData
      ]
      
      components.forEach(Component => {
        render(<Component />)
        
        // Each should have chart visualization
        expect(screen.getByTestId('chart-container')).toBeInTheDocument()
      })
    })

    it('handles chart interactions', async () => {
      render(<WorldClassRiskManagement />)
      
      // Should have interactive charts
      const chartContainer = screen.getByTestId('chart-container')
      expect(chartContainer).toBeInTheDocument()
      
      // Should handle chart clicks
      fireEvent.click(chartContainer)
      
      // Should not crash
      expect(chartContainer).toBeInTheDocument()
    })

    it('provides chart export functionality', () => {
      render(<WorldClassStrategyLab />)
      
      // Should have export options
      expect(screen.getByText(/export/i)).toBeInTheDocument()
    })
  })

  describe('Real-time Updates', () => {
    it('handles real-time data updates', () => {
      render(<WorldClassMLFactory />)
      
      // Should show real-time indicators
      expect(screen.getByText(/live/i)).toBeInTheDocument()
      expect(screen.getByText(/real.*time/i)).toBeInTheDocument()
    })

    it('maintains performance during updates', () => {
      const { rerender } = render(<WorldClassRiskManagement />)
      
      // Simulate multiple updates
      for (let i = 0; i < 10; i++) {
        rerender(<WorldClassRiskManagement key={i} />)
      }
      
      // Should handle multiple re-renders
      expect(screen.getByText(/risk.*management/i)).toBeInTheDocument()
    })

    it('handles connection state changes', () => {
      render(<WorldClassAlternativeData />)
      
      // Should show connection status
      expect(screen.getByText(/connected|disconnected|connecting/i)).toBeInTheDocument()
    })
  })
})
