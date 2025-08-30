import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Custom matchers for financial data
export const financialMatchers = {
  toBeValidPrice: (received: number) => {
    const pass = typeof received === 'number' && received > 0 && isFinite(received)
    return {
      message: () => `expected ${received} to be a valid price (positive finite number)`,
      pass,
    }
  },
  
  toBeValidPercentage: (received: number) => {
    const pass = typeof received === 'number' && received >= -100 && received <= 100
    return {
      message: () => `expected ${received} to be a valid percentage (-100 to 100)`,
      pass,
    }
  },
  
  toBeValidSharpeRatio: (received: number) => {
    const pass = typeof received === 'number' && received >= -5 && received <= 5
    return {
      message: () => `expected ${received} to be a valid Sharpe ratio (-5 to 5)`,
      pass,
    }
  },
  
  toBeValidVolatility: (received: number) => {
    const pass = typeof received === 'number' && received >= 0 && received <= 200
    return {
      message: () => `expected ${received} to be a valid volatility (0 to 200%)`,
      pass,
    }
  },
}

// Mock data generators for testing
export const mockDataGenerators = {
  generateEquityData: (days = 252) => {
    const data = []
    let value = 100000
    for (let i = 0; i < days; i++) {
      const change = (Math.random() - 0.45) * 1000
      value += change
      data.push({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        equity: Math.round(value),
        benchmark: 100000 + i * 200 + Math.random() * 5000,
        volume: Math.floor(Math.random() * 1000000),
        drawdown: Math.max(0, (Math.random() * 20)),
      })
    }
    return data
  },
  
  generateOptionChain: (currentPrice = 100) => {
    const chain = []
    for (let i = -10; i <= 10; i++) {
      const strike = currentPrice + (i * 5)
      chain.push({
        strike,
        callBid: Math.max(0.01, currentPrice - strike + Math.random()),
        callAsk: Math.max(0.02, currentPrice - strike + 0.5 + Math.random()),
        callVolume: Math.floor(Math.random() * 1000),
        callOI: Math.floor(Math.random() * 5000),
        callIV: Math.max(0.1, 0.25 + Math.abs(i) * 0.01),
        putBid: Math.max(0.01, strike - currentPrice + Math.random()),
        putAsk: Math.max(0.02, strike - currentPrice + 0.5 + Math.random()),
        putVolume: Math.floor(Math.random() * 800),
        putOI: Math.floor(Math.random() * 4000),
        putIV: Math.max(0.1, 0.27 + Math.abs(i) * 0.01),
      })
    }
    return chain
  },
  
  generateMarketData: (symbols = ['AAPL', 'MSFT', 'GOOGL']) => {
    return symbols.map(symbol => ({
      symbol,
      price: 100 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      pe: 10 + Math.random() * 30,
      dividend: Math.random() * 5,
    }))
  },
  
  generatePortfolioData: (positions = 10) => {
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'META', 'AMZN', 'NFLX', 'CRM', 'ADBE']
    return Array.from({ length: positions }, (_, i) => ({
      symbol: symbols[i % symbols.length],
      quantity: Math.floor(Math.random() * 1000) + 100,
      avgPrice: 50 + Math.random() * 200,
      currentPrice: 50 + Math.random() * 200,
      marketValue: 0, // calculated
      unrealizedPnL: 0, // calculated
      weight: Math.random() * 10,
      sector: ['Technology', 'Healthcare', 'Finance', 'Energy'][Math.floor(Math.random() * 4)],
    })).map(position => ({
      ...position,
      marketValue: position.quantity * position.currentPrice,
      unrealizedPnL: position.quantity * (position.currentPrice - position.avgPrice),
    }))
  },
  
  generateRiskMetrics: () => ({
    var95: Math.random() * 100000,
    var99: Math.random() * 150000,
    expectedShortfall: Math.random() * 200000,
    beta: 0.5 + Math.random(),
    alpha: (Math.random() - 0.5) * 0.1,
    sharpeRatio: Math.random() * 3,
    sortinoRatio: Math.random() * 4,
    maxDrawdown: Math.random() * 30,
    volatility: Math.random() * 40,
    correlation: Math.random() * 2 - 1,
  }),
}

// Test helpers for async operations
export const testHelpers = {
  waitForLoadingToFinish: async () => {
    const { waitFor } = await import('@testing-library/react')
    await waitFor(() => {
      expect(document.querySelector('[data-testid="loading"]')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  },
  
  waitForChartToRender: async () => {
    const { waitFor } = await import('@testing-library/react')
    await waitFor(() => {
      expect(document.querySelector('[data-testid="responsive-container"]')).toBeInTheDocument()
    }, { timeout: 3000 })
  },
  
  simulateResize: (width = 1024, height = 768) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    })
    window.dispatchEvent(new Event('resize'))
  },
  
  mockIntersectionObserver: () => {
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver
  },
}

// Performance testing utilities
export const performanceHelpers = {
  measureRenderTime: async (component: ReactElement) => {
    const startTime = performance.now()
    const { unmount } = customRender(component)
    const renderTime = performance.now() - startTime
    unmount()
    return renderTime
  },
  
  measureMemoryUsage: () => {
    if ('memory' in performance) {
      return (performance as any).memory
    }
    return null
  },
  
  expectFastRender: (renderTime: number, maxTime = 100) => {
    expect(renderTime).toBeLessThan(maxTime)
  },
}

// Accessibility testing helpers
export const a11yHelpers = {
  expectKeyboardNavigation: async (element: HTMLElement) => {
    const { fireEvent } = await import('@testing-library/react')
    
    // Test Tab navigation
    fireEvent.keyDown(element, { key: 'Tab', code: 'Tab' })
    expect(document.activeElement).toBe(element)
    
    // Test Enter activation
    fireEvent.keyDown(element, { key: 'Enter', code: 'Enter' })
    
    // Test Escape
    fireEvent.keyDown(element, { key: 'Escape', code: 'Escape' })
  },
  
  expectAriaLabels: (element: HTMLElement) => {
    expect(element).toHaveAttribute('aria-label')
    expect(element.getAttribute('aria-label')).toBeTruthy()
  },
  
  expectScreenReaderText: (element: HTMLElement) => {
    const srText = element.querySelector('.sr-only')
    expect(srText).toBeInTheDocument()
  },
}

// Financial calculation helpers for testing
export const financialHelpers = {
  calculateSharpeRatio: (returns: number[], riskFreeRate = 0.02) => {
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)
    return (avgReturn - riskFreeRate) / stdDev
  },
  
  calculateMaxDrawdown: (values: number[]) => {
    let maxDrawdown = 0
    let peak = values[0]
    
    for (const value of values) {
      if (value > peak) {
        peak = value
      }
      const drawdown = (peak - value) / peak
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }
    
    return maxDrawdown * 100 // Return as percentage
  },
  
  calculateVolatility: (returns: number[]) => {
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length
    return Math.sqrt(variance) * Math.sqrt(252) * 100 // Annualized volatility as percentage
  },
}

// Export all utilities
export {
  mockDataGenerators as mockData,
  testHelpers,
  performanceHelpers,
  a11yHelpers,
  financialHelpers,
}
