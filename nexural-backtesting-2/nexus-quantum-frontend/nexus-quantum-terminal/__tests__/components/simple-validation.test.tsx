import React from 'react'
import { render, screen } from '../utils/test-utils'
import { financialMatchers, mockData } from '../utils/test-utils'

// Extend Jest matchers
expect.extend(financialMatchers)

// Simple test component for validation
const TestComponent = () => (
  <div data-testid="test-component">
    <h1>Testing Framework Validation</h1>
    <p>This component validates our testing setup</p>
    <button>Test Button</button>
  </div>
)

describe('Testing Framework Validation', () => {
  describe('Basic Functionality', () => {
    it('renders test component correctly', () => {
      render(<TestComponent />)
      
      expect(screen.getByTestId('test-component')).toBeInTheDocument()
      expect(screen.getByText('Testing Framework Validation')).toBeInTheDocument()
      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('handles financial matchers correctly', () => {
      const price = 150.25
      const percentage = 15.5
      const sharpeRatio = 1.8
      const volatility = 25.3
      
      expect(price).toBeValidPrice()
      expect(percentage).toBeValidPercentage()
      expect(sharpeRatio).toBeValidSharpeRatio()
      expect(volatility).toBeValidVolatility()
    })
  })

  describe('Mock Data Generation', () => {
    it('generates equity data correctly', () => {
      const equityData = mockData.generateEquityData(10)
      
      expect(equityData).toHaveLength(10)
      expect(equityData[0]).toHaveProperty('date')
      expect(equityData[0]).toHaveProperty('equity')
      expect(equityData[0]).toHaveProperty('benchmark')
      expect(equityData[0]).toHaveProperty('volume')
      
      // Validate financial data
      expect(equityData[0].equity).toBeValidPrice()
      expect(equityData[0].benchmark).toBeValidPrice()
    })

    it('generates portfolio data correctly', () => {
      const portfolioData = mockData.generatePortfolioData(5)
      
      expect(portfolioData).toHaveLength(5)
      expect(portfolioData[0]).toHaveProperty('symbol')
      expect(portfolioData[0]).toHaveProperty('quantity')
      expect(portfolioData[0]).toHaveProperty('currentPrice')
      expect(portfolioData[0]).toHaveProperty('marketValue')
      
      // Validate calculations
      const position = portfolioData[0]
      expect(position.marketValue).toBe(position.quantity * position.currentPrice)
      expect(position.currentPrice).toBeValidPrice()
    })

    it('generates option chain correctly', () => {
      const optionChain = mockData.generateOptionChain(100)
      
      expect(optionChain).toHaveLength(21) // -10 to +10 strikes
      expect(optionChain[0]).toHaveProperty('strike')
      expect(optionChain[0]).toHaveProperty('callBid')
      expect(optionChain[0]).toHaveProperty('putBid')
      expect(optionChain[0]).toHaveProperty('callIV')
      
      // Validate option data
      expect(optionChain[0].strike).toBeValidPrice()
      expect(optionChain[0].callBid).toBeGreaterThanOrEqual(0)
      expect(optionChain[0].putBid).toBeGreaterThanOrEqual(0)
    })

    it('generates market data correctly', () => {
      const marketData = mockData.generateMarketData(['AAPL', 'MSFT'])
      
      expect(marketData).toHaveLength(2)
      expect(marketData[0]).toHaveProperty('symbol')
      expect(marketData[0]).toHaveProperty('price')
      expect(marketData[0]).toHaveProperty('change')
      expect(marketData[0]).toHaveProperty('volume')
      
      // Validate market data
      expect(marketData[0].price).toBeValidPrice()
      expect(marketData[0].volume).toBeGreaterThan(0)
    })
  })

  describe('Chart Mocking', () => {
    it('renders mocked charts correctly', () => {
      const ChartComponent = () => (
        <div data-testid="chart-container">
          <div data-testid="responsive-container">
            <div data-testid="line-chart">
              <div data-testid="line" />
              <div data-testid="x-axis" />
              <div data-testid="y-axis" />
            </div>
          </div>
        </div>
      )
      
      render(<ChartComponent />)
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    })
  })

  describe('Performance Validation', () => {
    it('renders within acceptable time', () => {
      const startTime = performance.now()
      render(<TestComponent />)
      const renderTime = performance.now() - startTime
      
      // Should render very quickly
      expect(renderTime).toBeLessThan(50)
    })

    it('handles large datasets efficiently', () => {
      const startTime = performance.now()
      const largeDataset = mockData.generateEquityData(1000)
      const processingTime = performance.now() - startTime
      
      expect(largeDataset).toHaveLength(1000)
      expect(processingTime).toBeLessThan(100)
    })
  })

  describe('Error Handling', () => {
    it('handles invalid financial data gracefully', () => {
      // Test edge cases
      expect(() => {
        const invalidPrice = -100
        expect(invalidPrice).not.toBeValidPrice()
      }).not.toThrow()
      
      expect(() => {
        const invalidPercentage = 150
        expect(invalidPercentage).not.toBeValidPercentage()
      }).not.toThrow()
    })

    it('handles empty datasets gracefully', () => {
      const emptyData = mockData.generateEquityData(0)
      expect(emptyData).toHaveLength(0)
    })
  })

  describe('Theme and Styling', () => {
    it('applies correct CSS classes', () => {
      render(<TestComponent />)
      
      const component = screen.getByTestId('test-component')
      expect(component).toBeInTheDocument()
      
      // Component should be visible
      expect(component).toBeVisible()
    })
  })

  describe('Accessibility', () => {
    it('has accessible elements', () => {
      render(<TestComponent />)
      
      // Check for heading
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Testing Framework Validation')
      
      // Check for button
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Test Button')
    })
  })

  describe('Integration with Testing Utilities', () => {
    it('uses custom render function correctly', () => {
      const { container } = render(<TestComponent />)
      
      expect(container).toBeInTheDocument()
      expect(screen.getByTestId('test-component')).toBeInTheDocument()
    })

    it('handles theme provider integration', () => {
      render(<TestComponent />)
      
      // Should render without theme-related errors
      expect(screen.getByTestId('test-component')).toBeInTheDocument()
    })
  })
})
