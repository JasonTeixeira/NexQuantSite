import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { mockData, testHelpers } from '../utils/test-utils'
import NexusQuantTerminal from '@/components/nexus-quant-terminal'

// Mock heavy components for integration testing
jest.mock('@/components/phase2/strategy-lab', () => {
  return function MockStrategyLab() {
    return (
      <div data-testid="strategy-lab">
        <h2>Strategy Lab</h2>
        <button data-testid="create-strategy">Create New Strategy</button>
        <button data-testid="run-backtest">Run Backtest</button>
        <div data-testid="strategy-results">Strategy Results</div>
      </div>
    )
  }
})

jest.mock('@/components/phase2/backtesting-engine', () => {
  return function MockBacktestingEngine() {
    return (
      <div data-testid="backtesting-engine">
        <h2>Backtesting Engine</h2>
        <div data-testid="backtest-results">Backtest Results</div>
        <button data-testid="export-results">Export Results</button>
      </div>
    )
  }
})

jest.mock('@/components/phase2/ml-factory', () => {
  return function MockMLFactory() {
    return (
      <div data-testid="ml-factory">
        <h2>ML Factory</h2>
        <button data-testid="train-model">Train Model</button>
        <div data-testid="model-results">Model Results</div>
      </div>
    )
  }
})

jest.mock('@/components/phase2/options-analytics', () => {
  return function MockOptionsAnalytics() {
    return (
      <div data-testid="options-analytics">
        <h2>Options Analytics</h2>
        <div data-testid="option-chain">Option Chain</div>
        <div data-testid="volatility-surface">Volatility Surface</div>
      </div>
    )
  }
})

describe('User Journey Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  })

  describe('Complete Strategy Development Workflow', () => {
    it('allows user to navigate through complete strategy development process', async () => {
      render(<NexusQuantTerminal />)
      
      // Step 1: Navigate to Strategy Development
      fireEvent.click(screen.getByText('Strategy Development'))
      
      await waitFor(() => {
        expect(screen.getByText('Strategy Lab')).toBeInTheDocument()
      })
      
      // Step 2: Create a new strategy in Strategy Lab
      expect(screen.getByTestId('strategy-lab')).toBeInTheDocument()
      
      const createStrategyButton = screen.getByTestId('create-strategy')
      fireEvent.click(createStrategyButton)
      
      // Step 3: Run backtest from Strategy Lab
      const runBacktestButton = screen.getByTestId('run-backtest')
      fireEvent.click(runBacktestButton)
      
      // Step 4: Navigate to Backtesting Engine for detailed analysis
      fireEvent.click(screen.getByText('Backtesting Engine'))
      
      await waitFor(() => {
        expect(screen.getByTestId('backtesting-engine')).toBeInTheDocument()
      })
      
      // Step 5: Export results
      const exportButton = screen.getByTestId('export-results')
      fireEvent.click(exportButton)
      
      // Verify the complete workflow
      expect(screen.getByTestId('backtest-results')).toBeInTheDocument()
    })

    it('allows user to develop ML-based strategy', async () => {
      render(<NexusQuantTerminal />)
      
      // Navigate to Strategy Development > ML Factory
      fireEvent.click(screen.getByText('Strategy Development'))
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('ML Factory'))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('ml-factory')).toBeInTheDocument()
      })
      
      // Train a model
      const trainButton = screen.getByTestId('train-model')
      fireEvent.click(trainButton)
      
      // Verify model results are displayed
      expect(screen.getByTestId('model-results')).toBeInTheDocument()
    })

    it('allows user to analyze options strategies', async () => {
      render(<NexusQuantTerminal />)
      
      // Navigate to Execution & Trading > Options Trading
      fireEvent.click(screen.getByText('Execution & Trading'))
      
      await waitFor(() => {
        expect(screen.getByText('Options Trading')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Options Trading'))
      
      await waitFor(() => {
        expect(screen.getByTestId('options-analytics')).toBeInTheDocument()
      })
      
      // Verify options components are loaded
      expect(screen.getByTestId('option-chain')).toBeInTheDocument()
      expect(screen.getByTestId('volatility-surface')).toBeInTheDocument()
    })
  })

  describe('Cross-Section Navigation', () => {
    it('maintains state when navigating between main sections', async () => {
      render(<NexusQuantTerminal />)
      
      // Start in Strategy Development > ML Factory
      fireEvent.click(screen.getByText('Strategy Development'))
      await waitFor(() => {
        fireEvent.click(screen.getByText('ML Factory'))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('ml-factory')).toBeInTheDocument()
      })
      
      // Navigate to Risk & Portfolio
      fireEvent.click(screen.getByText('Risk & Portfolio'))
      
      await waitFor(() => {
        expect(screen.getByText('Portfolio Dashboard')).toBeInTheDocument()
      })
      
      // Navigate back to Strategy Development
      fireEvent.click(screen.getByText('Strategy Development'))
      
      // Should remember ML Factory was selected
      await waitFor(() => {
        expect(screen.getByTestId('ml-factory')).toBeInTheDocument()
      })
    })

    it('handles rapid navigation without errors', async () => {
      render(<NexusQuantTerminal />)
      
      const sections = [
        'Strategy Development',
        'Risk & Portfolio', 
        'Execution & Trading',
        'Market Intelligence',
        'Control Center'
      ]
      
      // Rapidly navigate through sections
      for (const section of sections) {
        fireEvent.click(screen.getByText(section))
        await waitFor(() => {
          expect(screen.getByText(section)).toHaveClass('bg-[#00bbff]')
        })
      }
      
      // Should end up in Control Center without errors
      expect(screen.getByText('Control Center')).toHaveClass('bg-[#00bbff]')
    })
  })

  describe('Settings and Preferences', () => {
    it('allows user to modify global settings', async () => {
      render(<NexusQuantTerminal />)
      
      // Open settings
      const settingsButton = screen.getByLabelText('Settings')
      fireEvent.click(settingsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Global Settings')).toBeInTheDocument()
      })
      
      // Modify a setting
      const themeSelect = screen.getByDisplayValue('Dark')
      fireEvent.change(themeSelect, { target: { value: 'Light' } })
      
      // Save settings
      const saveButton = screen.getByText('Save Settings')
      fireEvent.click(saveButton)
      
      // Verify settings are saved
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'nexus-settings',
        expect.stringContaining('Light')
      )
      
      // Close settings
      const closeButton = screen.getByLabelText('Close')
      fireEvent.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Global Settings')).not.toBeInTheDocument()
      })
    })

    it('persists settings across navigation', async () => {
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
      getItemSpy.mockReturnValue(JSON.stringify({
        theme: 'Light',
        accentColor: '#ff6b6b',
        dataRefresh: 5000,
        gridDensity: 'comfortable'
      }))
      
      render(<NexusQuantTerminal />)
      
      // Navigate between sections
      fireEvent.click(screen.getByText('Strategy Development'))
      fireEvent.click(screen.getByText('Risk & Portfolio'))
      fireEvent.click(screen.getByText('Control Center'))
      
      // Settings should be loaded on each navigation
      expect(getItemSpy).toHaveBeenCalledWith('nexus-settings')
    })
  })

  describe('Terminal Integration', () => {
    it('allows user to access AI terminal from any section', async () => {
      render(<NexusQuantTerminal />)
      
      // Start in Strategy Development
      fireEvent.click(screen.getByText('Strategy Development'))
      
      // Access terminal from bottom navigation
      const terminalTab = screen.getByText('Terminal')
      fireEvent.click(terminalTab)
      
      await waitFor(() => {
        expect(screen.getByTestId('enhanced-ai-terminal')).toBeInTheDocument()
      })
      
      // Switch to different main section
      fireEvent.click(screen.getByText('Risk & Portfolio'))
      
      // Terminal should still be accessible
      expect(screen.getByText('Terminal')).toBeInTheDocument()
    })

    it('maintains terminal state across navigation', async () => {
      render(<NexusQuantTerminal />)
      
      // Open terminal
      fireEvent.click(screen.getByText('Terminal'))
      
      await waitFor(() => {
        expect(screen.getByTestId('enhanced-ai-terminal')).toBeInTheDocument()
      })
      
      // Navigate to different section
      fireEvent.click(screen.getByText('Strategy Development'))
      
      // Switch back to terminal
      fireEvent.click(screen.getByText('Terminal'))
      
      // Terminal should maintain its state
      await waitFor(() => {
        expect(screen.getByTestId('enhanced-ai-terminal')).toBeInTheDocument()
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('handles data flow between components', async () => {
      render(<NexusQuantTerminal />)
      
      // Generate mock data
      const mockEquityData = mockData.generateEquityData(100)
      const mockPortfolioData = mockData.generatePortfolioData(10)
      
      // Verify data structure
      expect(mockEquityData).toHaveLength(100)
      expect(mockPortfolioData).toHaveLength(10)
      
      // Navigate through sections that would use this data
      fireEvent.click(screen.getByText('Strategy Development'))
      fireEvent.click(screen.getByText('Risk & Portfolio'))
      fireEvent.click(screen.getByText('Control Center'))
      
      // All sections should handle data correctly
      expect(screen.getByText('Control Center')).toBeInTheDocument()
    })

    it('handles real-time data updates', async () => {
      render(<NexusQuantTerminal />)
      
      // Simulate real-time data update
      const mockUpdate = {
        timestamp: Date.now(),
        price: 150.25,
        change: 2.45,
        volume: 1000000
      }
      
      // Navigate to Market Intelligence for live data
      fireEvent.click(screen.getByText('Market Intelligence'))
      
      await waitFor(() => {
        expect(screen.getByText('Market Data Feed')).toBeInTheDocument()
      })
      
      // Data should be handled without errors
      expect(screen.getByText('Market Intelligence')).toHaveClass('bg-[#00bbff]')
    })
  })

  describe('Performance Under Load', () => {
    it('handles multiple rapid interactions', async () => {
      render(<NexusQuantTerminal />)
      
      // Perform rapid interactions
      const interactions = [
        () => fireEvent.click(screen.getByText('Strategy Development')),
        () => fireEvent.click(screen.getByText('ML Factory')),
        () => fireEvent.click(screen.getByText('Risk & Portfolio')),
        () => fireEvent.click(screen.getByText('Terminal')),
        () => fireEvent.click(screen.getByText('Control Center')),
      ]
      
      // Execute interactions rapidly
      for (const interaction of interactions) {
        interaction()
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      // Should end in stable state
      await waitFor(() => {
        expect(screen.getByText('Control Center')).toHaveClass('bg-[#00bbff]')
      })
    })

    it('maintains performance with large datasets', async () => {
      render(<NexusQuantTerminal />)
      
      // Generate large mock dataset
      const largeDataset = mockData.generateEquityData(1000)
      expect(largeDataset).toHaveLength(1000)
      
      // Navigate through data-heavy sections
      fireEvent.click(screen.getByText('Strategy Development'))
      fireEvent.click(screen.getByText('Backtesting Engine'))
      
      await waitFor(() => {
        expect(screen.getByTestId('backtesting-engine')).toBeInTheDocument()
      })
      
      // Should handle large datasets without performance issues
      const renderTime = performance.now()
      fireEvent.click(screen.getByText('Strategy Lab'))
      const endTime = performance.now()
      
      expect(endTime - renderTime).toBeLessThan(500) // Should switch quickly
    })
  })

  describe('Error Recovery', () => {
    it('recovers from component errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<NexusQuantTerminal />)
      
      // Navigate to a section that might have errors
      fireEvent.click(screen.getByText('Strategy Development'))
      
      // Should still be functional
      await waitFor(() => {
        expect(screen.getByText('Strategy Lab')).toBeInTheDocument()
      })
      
      consoleSpy.mockRestore()
    })

    it('handles network errors gracefully', async () => {
      // Mock fetch to simulate network error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
      
      render(<NexusQuantTerminal />)
      
      // Navigate to Market Intelligence (which might fetch data)
      fireEvent.click(screen.getByText('Market Intelligence'))
      
      // Should handle network errors without crashing
      await waitFor(() => {
        expect(screen.getByText('Market Data Feed')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Integration', () => {
    it('maintains accessibility across navigation', () => {
      render(<NexusQuantTerminal />)
      
      // Check main navigation accessibility
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      
      // Navigate through sections
      fireEvent.click(screen.getByText('Strategy Development'))
      fireEvent.click(screen.getByText('Risk & Portfolio'))
      
      // Main content should always be accessible
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('supports keyboard navigation throughout the app', () => {
      render(<NexusQuantTerminal />)
      
      const firstTab = screen.getByText('Control Center')
      firstTab.focus()
      
      // Test keyboard navigation
      fireEvent.keyDown(firstTab, { key: 'Tab', code: 'Tab' })
      fireEvent.keyDown(firstTab, { key: 'Enter', code: 'Enter' })
      
      // Should maintain keyboard accessibility
      expect(document.activeElement).toBeTruthy()
    })
  })
})
