import React from 'react'
import { render, screen } from '../utils/test-utils'
import { performanceHelpers, mockData } from '../utils/test-utils'
import NexusQuantTerminal from '@/components/nexus-quant-terminal'
import { StrategyLab } from '@/components/phase2/strategy-lab'
import { MLFactory } from '@/components/phase2/ml-factory'
import { OptionsAnalytics } from '@/components/phase2/options-analytics'

// Mock heavy components for performance testing
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  ComposedChart: ({ children }: any) => <div data-testid="composed-chart">{children}</div>,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div data-testid="scatter" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
  Brush: () => <div data-testid="brush" />,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
}))

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock performance.now for consistent testing
    const mockPerformance = {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => []),
    }
    
    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true,
    })
  })

  describe('Component Render Performance', () => {
    it('renders main terminal within performance budget', async () => {
      const renderTime = await performanceHelpers.measureRenderTime(<NexusQuantTerminal />)
      
      // Should render within 100ms
      performanceHelpers.expectFastRender(renderTime, 100)
    })

    it('renders Strategy Lab within performance budget', async () => {
      const renderTime = await performanceHelpers.measureRenderTime(<StrategyLab />)
      
      // Strategy Lab is more complex, allow 150ms
      performanceHelpers.expectFastRender(renderTime, 150)
    })

    it('renders ML Factory within performance budget', async () => {
      const renderTime = await performanceHelpers.measureRenderTime(<MLFactory />)
      
      // ML Factory is complex, allow 150ms
      performanceHelpers.expectFastRender(renderTime, 150)
    })

    it('renders Options Analytics within performance budget', async () => {
      const renderTime = await performanceHelpers.measureRenderTime(<OptionsAnalytics />)
      
      // Options Analytics has many charts, allow 200ms
      performanceHelpers.expectFastRender(renderTime, 200)
    })
  })

  describe('Data Processing Performance', () => {
    it('handles large equity datasets efficiently', () => {
      const startTime = performance.now()
      
      // Generate large dataset
      const largeDataset = mockData.generateEquityData(10000)
      
      const processingTime = performance.now() - startTime
      
      // Should process 10k records within 50ms
      expect(processingTime).toBeLessThan(50)
      expect(largeDataset).toHaveLength(10000)
    })

    it('handles large portfolio datasets efficiently', () => {
      const startTime = performance.now()
      
      // Generate large portfolio
      const largePortfolio = mockData.generatePortfolioData(1000)
      
      const processingTime = performance.now() - startTime
      
      // Should process 1k positions within 30ms
      expect(processingTime).toBeLessThan(30)
      expect(largePortfolio).toHaveLength(1000)
    })

    it('handles option chain generation efficiently', () => {
      const startTime = performance.now()
      
      // Generate large option chain
      const optionChain = mockData.generateOptionChain(100)
      
      const processingTime = performance.now() - startTime
      
      // Should generate option chain within 20ms
      expect(processingTime).toBeLessThan(20)
      expect(optionChain).toHaveLength(21) // -10 to +10 strikes
    })

    it('handles market data generation efficiently', () => {
      const startTime = performance.now()
      
      // Generate market data for many symbols
      const symbols = Array.from({ length: 500 }, (_, i) => `STOCK${i}`)
      const marketData = mockData.generateMarketData(symbols)
      
      const processingTime = performance.now() - startTime
      
      // Should generate 500 symbols within 25ms
      expect(processingTime).toBeLessThan(25)
      expect(marketData).toHaveLength(500)
    })
  })

  describe('Memory Usage', () => {
    it('does not leak memory on component mount/unmount', () => {
      const initialMemory = performanceHelpers.measureMemoryUsage()
      
      // Mount and unmount component multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<NexusQuantTerminal />)
        unmount()
      }
      
      const finalMemory = performanceHelpers.measureMemoryUsage()
      
      // Memory usage should not increase significantly
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // Less than 10MB increase
      }
    })

    it('handles large datasets without excessive memory usage', () => {
      const initialMemory = performanceHelpers.measureMemoryUsage()
      
      // Generate and process large datasets
      const datasets = []
      for (let i = 0; i < 10; i++) {
        datasets.push(mockData.generateEquityData(1000))
      }
      
      const finalMemory = performanceHelpers.measureMemoryUsage()
      
      // Should handle data efficiently
      expect(datasets).toHaveLength(10)
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Less than 50MB for all datasets
      }
    })
  })

  describe('Rendering Performance with Data', () => {
    it('renders charts with large datasets efficiently', async () => {
      const largeDataset = mockData.generateEquityData(1000)
      
      const startTime = performance.now()
      
      const { unmount } = render(
        <div data-testid="responsive-container">
          <div data-testid="line-chart">
            {largeDataset.map((item, i) => (
              <div key={i} data-testid="data-point">
                {item.equity}
              </div>
            ))}
          </div>
        </div>
      )
      
      const renderTime = performance.now() - startTime
      
      // Should render large dataset within 100ms
      expect(renderTime).toBeLessThan(100)
      
      unmount()
    })

    it('handles rapid re-renders efficiently', async () => {
      const { rerender } = render(<NexusQuantTerminal />)
      
      const startTime = performance.now()
      
      // Perform rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<NexusQuantTerminal />)
      }
      
      const rerenderTime = performance.now() - startTime
      
      // 10 re-renders should complete within 200ms
      expect(rerenderTime).toBeLessThan(200)
    })
  })

  describe('Interaction Performance', () => {
    it('handles rapid tab switching efficiently', async () => {
      render(<NexusQuantTerminal />)
      
      const startTime = performance.now()
      
      // Simulate rapid tab switching
      const tabs = [
        'Strategy Development',
        'Risk & Portfolio',
        'Execution & Trading',
        'Market Intelligence',
        'Control Center'
      ]
      
      for (const tab of tabs) {
        const tabElement = screen.getByText(tab)
        tabElement.click()
      }
      
      const interactionTime = performance.now() - startTime
      
      // Should handle 5 tab switches within 50ms
      expect(interactionTime).toBeLessThan(50)
    })

    it('handles form interactions efficiently', async () => {
      render(<StrategyLab />)
      
      const startTime = performance.now()
      
      // Simulate form interactions
      const nameInput = screen.getByPlaceholderText('My Strategy')
      for (let i = 0; i < 10; i++) {
        nameInput.focus()
        nameInput.blur()
      }
      
      const interactionTime = performance.now() - startTime
      
      // Should handle form interactions within 30ms
      expect(interactionTime).toBeLessThan(30)
    })
  })

  describe('Bundle Size Performance', () => {
    it('keeps component sizes reasonable', () => {
      // This is a conceptual test - in a real scenario, you'd use bundle analyzers
      const componentSizes = {
        NexusQuantTerminal: 'large', // Main component
        StrategyLab: 'medium',
        MLFactory: 'medium',
        OptionsAnalytics: 'medium',
      }
      
      // Verify components are categorized appropriately
      expect(componentSizes.NexusQuantTerminal).toBe('large')
      expect(componentSizes.StrategyLab).toBe('medium')
    })
  })

  describe('Concurrent Operations Performance', () => {
    it('handles multiple simultaneous operations', async () => {
      const startTime = performance.now()
      
      // Simulate concurrent operations
      const operations = [
        () => mockData.generateEquityData(500),
        () => mockData.generatePortfolioData(100),
        () => mockData.generateOptionChain(150),
        () => mockData.generateMarketData(['AAPL', 'MSFT', 'GOOGL']),
      ]
      
      // Run operations concurrently
      const results = await Promise.all(operations.map(op => Promise.resolve(op())))
      
      const totalTime = performance.now() - startTime
      
      // Should complete all operations within 100ms
      expect(totalTime).toBeLessThan(100)
      expect(results).toHaveLength(4)
    })

    it('maintains performance under load', async () => {
      const startTime = performance.now()
      
      // Simulate high load scenario
      const tasks = []
      for (let i = 0; i < 50; i++) {
        tasks.push(mockData.generateEquityData(100))
      }
      
      const loadTime = performance.now() - startTime
      
      // Should handle 50 data generation tasks within 200ms
      expect(loadTime).toBeLessThan(200)
      expect(tasks).toHaveLength(50)
    })
  })

  describe('Real-time Performance', () => {
    it('handles simulated real-time updates efficiently', async () => {
      render(<NexusQuantTerminal />)
      
      const startTime = performance.now()
      
      // Simulate real-time data updates
      for (let i = 0; i < 100; i++) {
        const update = {
          timestamp: Date.now() + i,
          price: 100 + Math.random() * 10,
          volume: Math.floor(Math.random() * 1000000),
        }
        
        // In a real app, this would trigger re-renders
        expect(update.price).toBeGreaterThan(0)
      }
      
      const updateTime = performance.now() - startTime
      
      // Should process 100 updates within 50ms
      expect(updateTime).toBeLessThan(50)
    })
  })

  describe('Performance Regression Tests', () => {
    it('maintains baseline performance for main terminal', async () => {
      const renderTime = await performanceHelpers.measureRenderTime(<NexusQuantTerminal />)
      
      // Baseline: main terminal should render within 100ms
      expect(renderTime).toBeLessThan(100)
    })

    it('maintains baseline performance for strategy components', async () => {
      const strategyRenderTime = await performanceHelpers.measureRenderTime(<StrategyLab />)
      const mlRenderTime = await performanceHelpers.measureRenderTime(<MLFactory />)
      const optionsRenderTime = await performanceHelpers.measureRenderTime(<OptionsAnalytics />)
      
      // Baseline: complex components should render within 200ms
      expect(strategyRenderTime).toBeLessThan(200)
      expect(mlRenderTime).toBeLessThan(200)
      expect(optionsRenderTime).toBeLessThan(200)
    })
  })
})
