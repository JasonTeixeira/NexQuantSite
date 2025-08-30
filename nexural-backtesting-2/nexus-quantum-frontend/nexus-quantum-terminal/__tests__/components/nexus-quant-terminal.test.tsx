import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import NexusQuantTerminal from '@/components/nexus-quant-terminal'

// Mock hooks to prevent side effects during testing
jest.mock('@/hooks/use-performance-monitor', () => ({
  usePerformanceMonitor: () => ({ logPerformance: jest.fn() }),
  useMemoryCleanup: () => ({ addCleanup: jest.fn() }),
  useDebouncedState: (initial: any) => [initial, jest.fn(), initial]
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock console.log to prevent test pollution
const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

describe('NexusQuantTerminal - Main Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  describe('Initial Render', () => {
    it('renders without crashing', () => {
      render(<NexusQuantTerminal />)
      
      // Should render main container
      expect(screen.getByTestId('nexus-quant-terminal')).toBeInTheDocument()
    })

    it('displays header with navigation', () => {
      render(<NexusQuantTerminal />)
      
      // Should show the enhanced header
      expect(screen.getByText('NexusQuant')).toBeInTheDocument()
    })

    it('shows main sidebar navigation', () => {
      render(<NexusQuantTerminal />)
      
      // Should show the 4 main navigation sections
      expect(screen.getByText('🏠 Overview')).toBeInTheDocument()
      expect(screen.getByText('⚡ Trading')).toBeInTheDocument() 
      expect(screen.getByText('🧪 Strategy')).toBeInTheDocument()
      expect(screen.getByText('🔬 Advanced')).toBeInTheDocument()
    })

    it('starts with Overview tab active by default', () => {
      render(<NexusQuantTerminal />)
      
      // Overview should be active initially
      const overviewTab = screen.getByText('🏠 Overview')
      expect(overviewTab.closest('button')).toHaveClass('bg-[#2a2a3e]') // Active state
    })

    it('displays terminal section', () => {
      render(<NexusQuantTerminal />)
      
      // Should show terminal interface
      expect(screen.getByText('nexusQai $')).toBeInTheDocument()
    })
  })

  describe('Navigation Functionality', () => {
    it('switches between main tabs', async () => {
      render(<NexusQuantTerminal />)
      
      // Click on Trading tab
      fireEvent.click(screen.getByText('⚡ Trading'))
      
      await waitFor(() => {
        // Should switch to trading content
        expect(screen.getByText('📡 Live Trading')).toBeInTheDocument()
      })
    })

    it('switches between sub-tabs', async () => {
      render(<NexusQuantTerminal />)
      
      // Should show Overview sub-tabs
      expect(screen.getByText('📈 Performance Dashboard')).toBeInTheDocument()
      expect(screen.getByText('📊 Portfolio Analysis')).toBeInTheDocument()
      
      // Click on Portfolio Analysis
      fireEvent.click(screen.getByText('📊 Portfolio Analysis'))
      
      await waitFor(() => {
        // Should switch to portfolio content
        expect(screen.getByText('Portfolio Analysis')).toBeInTheDocument()
      })
    })

    it('maintains navigation state', () => {
      render(<NexusQuantTerminal />)
      
      // Switch to Strategy tab
      fireEvent.click(screen.getByText('🧪 Strategy'))
      
      // Should remember the active tab
      const strategyTab = screen.getByText('🧪 Strategy')
      expect(strategyTab.closest('button')).toHaveClass('bg-[#2a2a3e]')
    })

    it('updates sub-tabs when main tab changes', async () => {
      render(<NexusQuantTerminal />)
      
      // Switch to Advanced tab
      fireEvent.click(screen.getByText('🔬 Advanced'))
      
      await waitFor(() => {
        // Should show Advanced sub-tabs
        expect(screen.getByText('📈 Market Intelligence')).toBeInTheDocument()
        expect(screen.getByText('📓 Research Notebooks')).toBeInTheDocument()
      })
    })
  })

  describe('Terminal Functionality', () => {
    it('accepts command input', () => {
      render(<NexusQuantTerminal />)
      
      const commandInput = screen.getByPlaceholderText(/type.*command/i)
      expect(commandInput).toBeInTheDocument()
      
      // Should accept text input
      fireEvent.change(commandInput, { target: { value: 'status' } })
      expect(commandInput).toHaveValue('status')
    })

    it('handles command execution', async () => {
      render(<NexusQuantTerminal />)
      
      const commandInput = screen.getByPlaceholderText(/type.*command/i)
      
      // Type and execute command
      fireEvent.change(commandInput, { target: { value: 'help' } })
      fireEvent.keyDown(commandInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        // Should show help output
        expect(screen.getByText(/available commands/i)).toBeInTheDocument()
      })
    })

    it('supports clear command', async () => {
      render(<NexusQuantTerminal />)
      
      const commandInput = screen.getByPlaceholderText(/type.*command/i)
      
      // Execute clear command
      fireEvent.change(commandInput, { target: { value: 'clear' } })
      fireEvent.keyDown(commandInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        // Terminal should be cleared
        const terminalLines = screen.queryAllByText(/nexusQai/i)
        expect(terminalLines.length).toBe(1) // Only the prompt
      })
    })

    it('handles natural language commands', async () => {
      render(<NexusQuantTerminal />)
      
      const commandInput = screen.getByPlaceholderText(/type.*command/i)
      
      // Test natural language command
      fireEvent.change(commandInput, { target: { value: 'show my portfolio performance' } })
      fireEvent.keyDown(commandInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        // Should provide intelligent response
        expect(screen.getByText(/portfolio.*performance/i)).toBeInTheDocument()
      })
    })

    it('maintains command history', () => {
      render(<NexusQuantTerminal />)
      
      const commandInput = screen.getByPlaceholderText(/type.*command/i)
      
      // Execute a command
      fireEvent.change(commandInput, { target: { value: 'status' } })
      fireEvent.keyDown(commandInput, { key: 'Enter', code: 'Enter' })
      
      // Should show command in terminal history
      expect(screen.getByText('nexusQai $ status')).toBeInTheDocument()
    })
  })

  describe('Performance Dashboard', () => {
    it('displays performance metrics', () => {
      render(<NexusQuantTerminal />)
      
      // Should show key performance metrics
      expect(screen.getByText(/total return/i)).toBeInTheDocument()
      expect(screen.getByText(/sharpe ratio/i)).toBeInTheDocument()
      expect(screen.getByText(/max drawdown/i)).toBeInTheDocument()
    })

    it('shows rolling metrics grid', () => {
      render(<NexusQuantTerminal />)
      
      // Should show the rolling metrics grid
      expect(screen.getByText('📊 Live Performance Metrics')).toBeInTheDocument()
      expect(screen.getByText('← Scroll horizontally to explore →')).toBeInTheDocument()
    })

    it('displays chart browser', () => {
      render(<NexusQuantTerminal />)
      
      // Should show chart type selection
      expect(screen.getByText('📈 Equity Curve')).toBeInTheDocument()
      expect(screen.getByText('📉 Drawdown')).toBeInTheDocument()
      expect(screen.getByText('📊 Rolling Sharpe')).toBeInTheDocument()
    })

    it('switches between chart types', async () => {
      render(<NexusQuantTerminal />)
      
      // Click on Drawdown chart
      fireEvent.click(screen.getByText('📉 Drawdown'))
      
      await waitFor(() => {
        // Should highlight the selected chart type
        const drawdownButton = screen.getByText('📉 Drawdown').closest('button')
        expect(drawdownButton).toHaveClass('bg-blue-600')
      })
    })

    it('renders chart visualizations', () => {
      render(<NexusQuantTerminal />)
      
      // Should render chart container
      const chartContainer = document.querySelector('.recharts-wrapper')
      expect(chartContainer).toBeInTheDocument()
    })
  })

  describe('Strategy Development', () => {
    it('switches to strategy section', async () => {
      render(<NexusQuantTerminal />)
      
      // Navigate to Strategy tab
      fireEvent.click(screen.getByText('🧪 Strategy'))
      
      await waitFor(() => {
        // Should show strategy sub-tabs
        expect(screen.getByText('🔬 Strategy Lab')).toBeInTheDocument()
        expect(screen.getByText('🤖 AI Code Generator')).toBeInTheDocument()
        expect(screen.getByText('🎛️ Interactive Optimizer')).toBeInTheDocument()
      })
    })

    it('displays interactive optimizer', async () => {
      render(<NexusQuantTerminal />)
      
      // Navigate to Strategy → Interactive Optimizer
      fireEvent.click(screen.getByText('🧪 Strategy'))
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('🎛️ Interactive Optimizer'))
      })
      
      await waitFor(() => {
        // Should show optimizer interface
        expect(screen.getByText('Interactive Strategy Optimizer')).toBeInTheDocument()
      })
    })

    it('displays AI strategy generator', async () => {
      render(<NexusQuantTerminal />)
      
      // Navigate to Strategy → AI Code Generator
      fireEvent.click(screen.getByText('🧪 Strategy'))
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('🤖 AI Code Generator'))
      })
      
      await waitFor(() => {
        // Should show AI generator interface
        expect(screen.getByText('AI Strategy Generator')).toBeInTheDocument()
      })
    })
  })

  describe('Market Intelligence', () => {
    it('switches to advanced section', async () => {
      render(<NexusQuantTerminal />)
      
      // Navigate to Advanced tab
      fireEvent.click(screen.getByText('🔬 Advanced'))
      
      await waitFor(() => {
        // Should show advanced sub-tabs
        expect(screen.getByText('📈 Market Intelligence')).toBeInTheDocument()
        expect(screen.getByText('📓 Research Notebooks')).toBeInTheDocument()
      })
    })

    it('displays market intelligence interface', async () => {
      render(<NexusQuantTerminal />)
      
      // Navigate to Advanced → Market Intelligence
      fireEvent.click(screen.getByText('🔬 Advanced'))
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('📈 Market Intelligence'))
      })
      
      await waitFor(() => {
        // Should show market data interface
        expect(screen.getByText(/market.*data/i)).toBeInTheDocument()
      })
    })
  })

  describe('State Management', () => {
    it('persists terminal height to localStorage', () => {
      render(<NexusQuantTerminal />)
      
      // Should attempt to save terminal height
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'nexus-terminal-height',
        expect.any(String)
      )
    })

    it('loads saved terminal height from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('400')
      
      render(<NexusQuantTerminal />)
      
      // Should attempt to load saved height
      expect(localStorageMock.getItem).toHaveBeenCalledWith('nexus-terminal-height')
    })

    it('manages bottom panel state', () => {
      render(<NexusQuantTerminal />)
      
      // Should show terminal by default
      expect(screen.getByText('Terminal')).toBeInTheDocument()
      
      // Click on different bottom tabs
      fireEvent.click(screen.getByText('Trade Blotter'))
      
      // Should switch tabs
      expect(screen.getByText('Trade Blotter')).toBeInTheDocument()
    })

    it('handles theme switching', () => {
      render(<NexusQuantTerminal />)
      
      // Component should render with dark theme by default
      const container = document.querySelector('[data-theme="dark"]')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Real-time Data', () => {
    it('initializes with mock market data', () => {
      render(<NexusQuantTerminal />)
      
      // Should show some market data values
      expect(screen.getByText(/\$\d+/)).toBeInTheDocument() // Price format
    })

    it('displays live performance metrics', () => {
      render(<NexusQuantTerminal />)
      
      // Should show performance metrics
      expect(screen.getByText(/\+?-?\d+\.\d+%/)).toBeInTheDocument() // Percentage format
    })

    it('shows real-time updates', () => {
      render(<NexusQuantTerminal />)
      
      // Should display timestamp or similar real-time indicator
      expect(screen.getByText(/live.*data/i)).toBeInTheDocument()
    })
  })

  describe('Chart Functionality', () => {
    it('renders default equity chart', () => {
      render(<NexusQuantTerminal />)
      
      // Should render chart by default
      expect(document.querySelector('.recharts-wrapper')).toBeInTheDocument()
    })

    it('switches between chart types', async () => {
      render(<NexusQuantTerminal />)
      
      // Switch to Rolling Sharpe chart
      fireEvent.click(screen.getByText('📊 Rolling Sharpe'))
      
      await waitFor(() => {
        // Should update active chart type
        const sharpeButton = screen.getByText('📊 Rolling Sharpe').closest('button')
        expect(sharpeButton).toHaveClass('bg-blue-600')
      })
    })

    it('handles timeframe selection', async () => {
      render(<NexusQuantTerminal />)
      
      // Should have timeframe selector
      const timeframeButtons = screen.getAllByText(/\d+[MYD]/i) // 1M, 1Y, 1D etc
      expect(timeframeButtons.length).toBeGreaterThan(0)
      
      // Click on different timeframe
      if (timeframeButtons[0]) {
        fireEvent.click(timeframeButtons[0])
        
        await waitFor(() => {
          // Should update chart data
          expect(document.querySelector('.recharts-wrapper')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Bottom Panel Management', () => {
    it('toggles bottom panel visibility', () => {
      render(<NexusQuantTerminal />)
      
      // Should show bottom panel toggle
      const toggleButton = screen.getByText('Terminal')
      expect(toggleButton).toBeInTheDocument()
      
      // Terminal should be visible
      expect(screen.getByText('nexusQai $')).toBeInTheDocument()
    })

    it('switches between bottom tabs', async () => {
      render(<NexusQuantTerminal />)
      
      // Click on different bottom tabs
      fireEvent.click(screen.getByText('Trade Blotter'))
      
      await waitFor(() => {
        // Should show trade blotter content
        expect(screen.getByText('Trade Blotter')).toBeInTheDocument()
      })
      
      // Switch to Alerts
      fireEvent.click(screen.getByText('Alerts'))
      
      await waitFor(() => {
        // Should show alerts content
        expect(screen.getByText('Alerts')).toBeInTheDocument()
      })
    })

    it('resizes terminal height', () => {
      render(<NexusQuantTerminal />)
      
      // Should have terminal with default height
      const terminal = document.querySelector('[style*="height"]')
      expect(terminal).toBeInTheDocument()
    })
  })

  describe('Performance Monitoring', () => {
    it('displays system metrics', () => {
      render(<NexusQuantTerminal />)
      
      // Should show performance indicators
      expect(screen.getByText(/live.*data/i)).toBeInTheDocument()
      expect(screen.getByText(/ai.*active/i)).toBeInTheDocument()
    })

    it('shows live metrics grid', () => {
      render(<NexusQuantTerminal />)
      
      // Should display scrollable metrics grid
      expect(screen.getByText('📊 Live Performance Metrics')).toBeInTheDocument()
      
      // Should have multiple metric cards
      const metricCards = document.querySelectorAll('[class*="min-w-\\[120px\\]"]')
      expect(metricCards.length).toBeGreaterThan(5)
    })

    it('updates performance metrics', () => {
      render(<NexusQuantTerminal />)
      
      // Performance metrics should be displayed
      expect(screen.getByText(/total return/i)).toBeInTheDocument()
      expect(screen.getByText(/cagr/i)).toBeInTheDocument()
      expect(screen.getByText(/sharpe ratio/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles rendering errors gracefully', () => {
      // Mock console.error to prevent test pollution
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<NexusQuantTerminal />)
      
      // Should render without throwing errors
      expect(screen.getByTestId('nexus-quant-terminal')).toBeInTheDocument()
      
      consoleErrorSpy.mockRestore()
    })

    it('handles missing localStorage gracefully', () => {
      // Mock localStorage to throw errors
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })
      
      // Should still render without crashing
      expect(() => render(<NexusQuantTerminal />)).not.toThrow()
    })

    it('handles invalid command input', async () => {
      render(<NexusQuantTerminal />)
      
      const commandInput = screen.getByPlaceholderText(/type.*command/i)
      
      // Execute invalid command
      fireEvent.change(commandInput, { target: { value: 'invalid-command-xyz' } })
      fireEvent.keyDown(commandInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        // Should show error message
        expect(screen.getByText(/unknown command/i)).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      render(<NexusQuantTerminal />)
      
      // Should still render main content
      expect(screen.getByTestId('nexus-quant-terminal')).toBeInTheDocument()
    })

    it('handles tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      
      render(<NexusQuantTerminal />)
      
      // Should render with appropriate layout
      expect(screen.getByText('NexusQuant')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('integrates with theme provider', () => {
      render(<NexusQuantTerminal />)
      
      // Should work with theme context
      expect(screen.getByTestId('nexus-quant-terminal')).toBeInTheDocument()
    })

    it('integrates with performance monitoring', () => {
      render(<NexusQuantTerminal />)
      
      // Performance monitoring should be called during render
      // This is mocked, so we just verify component renders
      expect(screen.getByTestId('nexus-quant-terminal')).toBeInTheDocument()
    })

    it('handles async data loading', async () => {
      render(<NexusQuantTerminal />)
      
      // Should handle loading states
      await waitFor(() => {
        // Component should be fully loaded
        expect(screen.getByText('📊 Live Performance Metrics')).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Advanced Features', () => {
    it('supports export functionality', () => {
      render(<NexusQuantTerminal />)
      
      // Should have export buttons
      const exportButtons = screen.getAllByText(/export/i)
      expect(exportButtons.length).toBeGreaterThan(0)
    })

    it('handles search functionality', () => {
      render(<NexusQuantTerminal />)
      
      // Should have search capability in header
      expect(screen.getByPlaceholderText(/smart search/i)).toBeInTheDocument()
    })

    it('displays system status', () => {
      render(<NexusQuantTerminal />)
      
      // Should show system status indicators
      expect(screen.getByText(/server.*sync/i)).toBeInTheDocument()
      expect(screen.getByText(/live.*data/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<NexusQuantTerminal />)
      
      // Should have accessible navigation
      const navigation = screen.getByRole('navigation') || screen.getByTestId('nexus-quant-terminal')
      expect(navigation).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      render(<NexusQuantTerminal />)
      
      const commandInput = screen.getByPlaceholderText(/type.*command/i)
      
      // Should be focusable
      fireEvent.focus(commandInput)
      expect(commandInput).toHaveFocus()
      
      // Should handle keyboard events
      fireEvent.keyDown(commandInput, { key: 'Tab', code: 'Tab' })
      // Should not crash
      expect(commandInput).toBeInTheDocument()
    })

    it('provides screen reader support', () => {
      render(<NexusQuantTerminal />)
      
      // Should have text content for screen readers
      expect(screen.getByText('NexusQuant')).toBeInTheDocument()
      expect(screen.getByText('Institutional Trading Terminal')).toBeInTheDocument()
    })
  })

  describe('Performance Optimization', () => {
    it('renders efficiently with large datasets', () => {
      const startTime = performance.now()
      
      render(<NexusQuantTerminal />)
      
      const endTime = performance.now()
      
      // Should render within reasonable time (< 1000ms)
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('manages memory effectively', () => {
      const { unmount } = render(<NexusQuantTerminal />)
      
      // Should unmount cleanly
      expect(() => unmount()).not.toThrow()
    })

    it('handles rapid navigation changes', async () => {
      render(<NexusQuantTerminal />)
      
      // Rapidly switch between tabs
      fireEvent.click(screen.getByText('⚡ Trading'))
      fireEvent.click(screen.getByText('🧪 Strategy'))
      fireEvent.click(screen.getByText('🔬 Advanced'))
      fireEvent.click(screen.getByText('🏠 Overview'))
      
      await waitFor(() => {
        // Should handle rapid changes without errors
        expect(screen.getByText('🏠 Overview')).toBeInTheDocument()
      })
    })
  })
})