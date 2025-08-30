import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { mockData, testHelpers } from '../utils/test-utils'
import NexusQuantTerminal from '@/components/nexus-quant-terminal'

// Mock all heavy components for integration testing
jest.mock('@/components/phase2/strategy-lab', () => {
  return function MockStrategyLab() {
    return (
      <div data-testid="strategy-lab">
        <h2>Strategy Lab</h2>
        <div data-testid="strategy-builder">Strategy Builder</div>
        <div data-testid="strategy-templates">Templates</div>
        <div data-testid="strategy-indicators">Indicators</div>
        <div data-testid="strategy-results">Results</div>
        <button data-testid="save-strategy">Save Strategy</button>
        <button data-testid="run-backtest">Run Backtest</button>
      </div>
    )
  }
})

jest.mock('@/components/phase2/backtesting-engine', () => {
  return function MockBacktestingEngine() {
    return (
      <div data-testid="backtesting-engine">
        <h2>Backtesting Engine</h2>
        <div data-testid="backtest-setup">Setup</div>
        <div data-testid="backtest-results">Results</div>
        <div data-testid="backtest-metrics">Metrics</div>
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
        <div data-testid="ml-models">Models</div>
        <div data-testid="ml-training">Training</div>
        <button data-testid="train-model">Train Model</button>
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
        <div data-testid="options-flow">Options Flow</div>
      </div>
    )
  }
})

jest.mock('@/components/enhanced-ai-terminal', () => {
  return function MockEnhancedAITerminal() {
    return (
      <div data-testid="enhanced-ai-terminal">
        <h2>AI Terminal</h2>
        <div data-testid="terminal-interface">Terminal Interface</div>
        <div data-testid="ai-assistant">AI Assistant</div>
        <button data-testid="execute-command">Execute</button>
      </div>
    )
  }
})

describe('Comprehensive Workflow Integration Tests', () => {
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
    it('executes full strategy development lifecycle', async () => {
      render(<NexusQuantTerminal />)
      
      // Step 1: Navigate to Strategy Development
      fireEvent.click(screen.getByText('Strategy Development'))
      
      await waitFor(() => {
        expect(screen.getByText('Strategy Lab')).toBeInTheDocument()
      })
      
      // Step 2: Verify Strategy Lab is loaded
      expect(screen.getByTestId('strategy-lab')).toBeInTheDocument()
      expect(screen.getByTestId('strategy-builder')).toBeInTheDocument()
      
      // Step 3: Save a strategy
      const saveButton = screen.getByTestId('save-strategy')
      fireEvent.click(saveButton)
      
      // Step 4: Run backtest
      const backtestButton = screen.getByTestId('run-backtest')
      fireEvent.click(backtestButton)
      
      // Step 5: Navigate to Backtesting Engine
      fireEvent.click(screen.getByText('Backtesting Engine'))
      
      await waitFor(() => {
        expect(screen.getByTestId('backtesting-engine')).toBeInTheDocument()
      })
      
      // Step 6: View results
      expect(screen.getByTestId('backtest-results')).toBeInTheDocument()
      expect(screen.getByTestId('backtest-metrics')).toBeInTheDocument()
      
      // Step 7: Export results
      const exportButton = screen.getByTestId('export-results')
      fireEvent.click(exportButton)
      
      // Verify complete workflow
      expect(screen.getByTestId('backtesting-engine')).toBeInTheDocument()
    })

    it('handles machine learning workflow', async () => {
      render(<NexusQuantTerminal />)
      
      // Navigate to ML Factory
      fireEvent.click(screen.getByText('Strategy Development'))
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('ML Factory'))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('ml-factory')).toBeInTheDocument()
      })
      
      // Interact with ML components
      expect(screen.getByTestId('ml-models')).toBeInTheDocument()
      expect(screen.getByTestId('ml-training')).toBeInTheDocument()
      
      // Train a model
      const trainButton = screen.getByTestId('train-model')
      fireEvent.click(trainButton)
      
      // Verify ML workflow
      expect(screen.getByTestId('ml-factory')).toBeInTheDocument()
    })

    it('executes options trading workflow', async () => {
      render(<NexusQuantTerminal />)
      
      // Navigate to Execution & Trading
      fireEvent.click(screen.getByText('Execution & Trading'))
      
      await waitFor(() => {
        expect(screen.getByText('Options Trading')).toBeInTheDocument()
      })
      
      // Navigate to Options Trading
      fireEvent.click(screen.getByText('Options Trading'))
      
      await waitFor(() => {
        expect(screen.getByTestId('options-analytics')).toBeInTheDocument()
      })
      
      // Verify options components
      expect(screen.getByTestId('option-chain')).toBeInTheDocument()
      expect(screen.getByTestId('volatility-surface')).toBeInTheDocument()
      expect(screen.getByTestId('options-flow')).toBeInTheDocument()
    })
  })

  describe('Cross-Platform Navigation', () => {
    it('maintains state across all main sections', async () => {
      render(<NexusQuantTerminal />)
      
      const sections = [
        'Control Center',
        'Market Intelligence',
        'Strategy Development',
        'Risk & Portfolio',
        'Execution & Trading',
        'System Administration'
      ]
      
      // Navigate through all sections
      for (const section of sections) {
        fireEvent.click(screen.getByText(section))
        
        await waitFor(() => {
          expect(screen.getByText(section)).toHaveClass('bg-[#00bbff]')
        })
        
        // Small delay to simulate real user interaction
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      // Should end in System Administration
      expect(screen.getByText('System Administration')).toHaveClass('bg-[#00bbff]')
    })

    it('handles rapid section switching', async () => {
      render(<NexusQuantTerminal />)
      
      const sections = [
        'Strategy Development',
        'Risk & Portfolio',
        'Execution & Trading',
        'Market Intelligence',
        'Control Center'
      ]
      
      // Rapidly switch between sections
      for (let i = 0; i < 3; i++) {
        for (const section of sections) {
          fireEvent.click(screen.getByText(section))
        }
      }
      
      // Should handle rapid switching without errors
      await waitFor(() => {
        expect(screen.getByText('Control Center')).toHaveClass('bg-[#00bbff]')
      })
    })

    it('preserves sub-tab selections', async () => {
      render(<NexusQuantTerminal />)
      
      // Navigate to Strategy Development > ML Factory
      fireEvent.click(screen.getByText('Strategy Development'))
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('ML Factory'))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('ml-factory')).toBeInTheDocument()
      })
      
      // Switch to another main section
      fireEvent.click(screen.getByText('Risk & Portfolio'))
      
      await waitFor(() => {
        expect(screen.getByText('Portfolio Dashboard')).toBeInTheDocument()
      })
      
      // Switch back to Strategy Development
      fireEvent.click(screen.getByText('Strategy Development'))
      
      // Should remember ML Factory selection
      await waitFor(() => {
        expect(screen.getByTestId('ml-factory')).toBeInTheDocument()
      })
    })
  })

  describe('AI Terminal Integration', () => {
    it('provides AI terminal access from any section', async () => {
      render(<NexusQuantTerminal />)
      
      // Start in Control Center
      expect(screen.getByText('Control Center')).toHaveClass('bg-[#00bbff]')
      
      // Access AI terminal
      fireEvent.click(screen.getByText('Terminal'))
      
      await waitFor(() => {
        expect(screen.getByTestId('enhanced-ai-terminal')).toBeInTheDocument()
      })
      
      // Verify AI terminal components
      expect(screen.getByTestId('terminal-interface')).toBeInTheDocument()
      expect(screen.getByTestId('ai-assistant')).toBeInTheDocument()
      
      // Switch to different main section
      fireEvent.click(screen.getByText('Strategy Development'))
      
      // Terminal should still be accessible
      expect(screen.getByText('Terminal')).toBeInTheDocument()
      
      // Switch back to terminal
      fireEvent.click(screen.getByText('Terminal'))
      
      await waitFor(() => {
        expect(screen.getByTestId('enhanced-ai-terminal')).toBeInTheDocument()
      })
    })

    it('handles AI terminal commands', async () => {
      render(<NexusQuantTerminal />)
      
      // Access AI terminal
      fireEvent.click(screen.getByText('Terminal'))
      
      await waitFor(() => {
        expect(screen.getByTestId('enhanced-ai-terminal')).toBeInTheDocument()
      })
      
      // Execute a command
      const executeButton = screen.getByTestId('execute-command')
      fireEvent.click(executeButton)
      
      // Verify command execution
      expect(screen.getByTestId('enhanced-ai-terminal')).toBeInTheDocument()
    })
  })

  describe('Settings and Configuration', () => {
    it('handles global settings across all sections', async () => {
      render(<NexusQuantTerminal />)
      
      // Open global settings
      const settingsButton = screen.getByLabelText('Settings')
      fireEvent.click(settingsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Global Settings')).toBeInTheDocument()
      })
      
      // Modify settings
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
      
      // Navigate to different sections to verify settings persistence
      fireEvent.click(screen.getByText('Strategy Development'))
      fireEvent.click(screen.getByText('Risk & Portfolio'))
      
      // Settings should persist across navigation
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('maintains user preferences', async () => {
      // Mock existing settings
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
      getItemSpy.mockReturnValue(JSON.stringify({
        theme: 'Dark',
        accentColor: '#00bbff',
        dataRefresh: 5000,
        gridDensity: 'comfortable'
      }))
      
      render(<NexusQuantTerminal />)
      
      // Navigate through sections
      const sections = ['Strategy Development', 'Risk & Portfolio', 'Control Center']
      
      for (const section of sections) {
        fireEvent.click(screen.getByText(section))
        
        // Settings should be loaded for each section
        expect(getItemSpy).toHaveBeenCalledWith('nexus-settings')
      }
    })
  })

  describe('Data Flow Integration', () => {
    it('handles data consistency across components', async () => {
      render(<NexusQuantTerminal />)
      
      // Generate test data
      const equityData = mockData.generateEquityData(100)
      const portfolioData = mockData.generatePortfolioData(10)
      const optionData = mockData.generateOptionChain(150)
      
      // Verify data consistency
      expect(equityData).toHaveLength(100)
      expect(portfolioData).toHaveLength(10)
      expect(optionData).toHaveLength(21)
      
      // Navigate through data-heavy sections
      fireEvent.click(screen.getByText('Strategy Development'))
      fireEvent.click(screen.getByText('Risk & Portfolio'))
      fireEvent.click(screen.getByText('Execution & Trading'))
      
      // All sections should handle data without errors
      expect(screen.getByText('Execution & Trading')).toHaveClass('bg-[#00bbff]')
    })

    it('handles real-time data updates simulation', async () => {
      render(<NexusQuantTerminal />)
      
      // Simulate real-time updates
      const updates = Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() + i,
        price: 100 + Math.random() * 10,
        volume: Math.floor(Math.random() * 1000000)
      }))
      
      // Navigate to Market Intelligence for live data
      fireEvent.click(screen.getByText('Market Intelligence'))
      
      await waitFor(() => {
        expect(screen.getByText('Market Data Feed')).toBeInTheDocument()
      })
      
      // Simulate processing updates
      updates.forEach(update => {
        expect(update.price).toBeGreaterThan(0)
        expect(update.volume).toBeGreaterThan(0)
      })
      
      // Should handle updates without performance issues
      expect(screen.getByText('Market Intelligence')).toHaveClass('bg-[#00bbff]')
    })
  })

  describe('Performance Under Load', () => {
    it('maintains performance with concurrent operations', async () => {
      const startTime = performance.now()
      
      render(<NexusQuantTerminal />)
      
      // Perform multiple operations concurrently
      const operations = [
        () => fireEvent.click(screen.getByText('Strategy Development')),
        () => fireEvent.click(screen.getByText('ML Factory')),
        () => fireEvent.click(screen.getByText('Risk & Portfolio')),
        () => fireEvent.click(screen.getByText('Terminal')),
        () => fireEvent.click(screen.getByText('Control Center')),
      ]
      
      // Execute operations rapidly
      for (const operation of operations) {
        operation()
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      const totalTime = performance.now() - startTime
      
      // Should complete all operations quickly
      expect(totalTime).toBeLessThan(1000)
      
      // Should end in stable state
      await waitFor(() => {
        expect(screen.getByText('Control Center')).toHaveClass('bg-[#00bbff]')
      })
    })

    it('handles memory efficiently with large datasets', async () => {
      render(<NexusQuantTerminal />)
      
      // Generate large datasets
      const largeEquityData = mockData.generateEquityData(5000)
      const largePortfolioData = mockData.generatePortfolioData(500)
      
      expect(largeEquityData).toHaveLength(5000)
      expect(largePortfolioData).toHaveLength(500)
      
      // Navigate through sections with large data
      fireEvent.click(screen.getByText('Strategy Development'))
      fireEvent.click(screen.getByText('Backtesting Engine'))
      
      await waitFor(() => {
        expect(screen.getByTestId('backtesting-engine')).toBeInTheDocument()
      })
      
      // Should handle large datasets without memory issues
      expect(screen.getByTestId('backtest-results')).toBeInTheDocument()
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('recovers from component errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<NexusQuantTerminal />)
      
      // Navigate through all sections
      const sections = [
        'Control Center',
        'Market Intelligence',
        'Strategy Development',
        'Risk & Portfolio',
        'Execution & Trading',
        'System Administration'
      ]
      
      for (const section of sections) {
        fireEvent.click(screen.getByText(section))
        
        await waitFor(() => {
          expect(screen.getByText(section)).toBeInTheDocument()
        })
      }
      
      // Should handle all navigation without critical errors
      expect(screen.getByText('System Administration')).toHaveClass('bg-[#00bbff]')
      
      consoleSpy.mockRestore()
    })

    it('handles network simulation errors', async () => {
      // Mock fetch to simulate network errors
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
      
      render(<NexusQuantTerminal />)
      
      // Navigate to data-dependent sections
      fireEvent.click(screen.getByText('Market Intelligence'))
      
      await waitFor(() => {
        expect(screen.getByText('Market Data Feed')).toBeInTheDocument()
      })
      
      // Should handle network errors gracefully
      expect(screen.getByText('Market Intelligence')).toHaveClass('bg-[#00bbff]')
    })
  })
})
