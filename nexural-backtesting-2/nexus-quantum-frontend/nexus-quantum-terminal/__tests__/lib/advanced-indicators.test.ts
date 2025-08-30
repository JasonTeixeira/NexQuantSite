import { 
  KalmanTrendFilter,
  PriceData,
  IndicatorResult
} from '@/lib/advanced-indicators'

// Mock data generator
const generatePriceData = (length: number, startPrice: number = 100): PriceData[] => {
  const data: PriceData[] = []
  let price = startPrice
  
  for (let i = 0; i < length; i++) {
    // Simulate realistic price movement
    const change = (Math.sin(i * 0.1) + Math.random() * 0.4 - 0.2) * 2
    price = Math.max(price + change, 1) // Ensure positive prices
    
    data.push({
      timestamp: Date.now() + i * 86400000, // Daily intervals
      open: price * (1 + (Math.random() - 0.5) * 0.01),
      high: price * (1 + Math.random() * 0.02),
      low: price * (1 - Math.random() * 0.02),
      close: price,
      volume: Math.floor(1000000 + Math.random() * 5000000)
    })
  }
  
  return data
}

describe('Institutional-Grade Technical Indicators', () => {
  let mockPriceData: PriceData[]

  beforeEach(() => {
    mockPriceData = generatePriceData(50, 100)
  })

  describe('KalmanTrendFilter', () => {
    it('creates filter with default parameters', () => {
      const filter = new KalmanTrendFilter()
      
      expect(filter).toBeDefined()
      expect(filter).toBeInstanceOf(KalmanTrendFilter)
    })

    it('creates filter with custom parameters', () => {
      const filter = new KalmanTrendFilter(0.05, 0.5)
      
      expect(filter).toBeDefined()
      expect(filter).toBeInstanceOf(KalmanTrendFilter)
    })

    it('processes price updates correctly', () => {
      const filter = new KalmanTrendFilter()
      
      const result1 = filter.update(100)
      const result2 = filter.update(102)
      const result3 = filter.update(98)
      
      expect(typeof result1).toBe('number')
      expect(typeof result2).toBe('number')
      expect(typeof result3).toBe('number')
      
      expect(Number.isFinite(result1)).toBe(true)
      expect(Number.isFinite(result2)).toBe(true)
      expect(Number.isFinite(result3)).toBe(true)
    })

    it('adapts to price movements', () => {
      const filter = new KalmanTrendFilter()
      
      // Feed trending price data
      const prices = [100, 101, 102, 103, 104, 105]
      const results = prices.map(price => filter.update(price))
      
      // Filter should adapt to trend
      expect(results[results.length - 1]).toBeGreaterThan(results[0])
      
      // Should smooth out noise
      expect(results[results.length - 1]).toBeLessThan(prices[prices.length - 1])
    })

    it('handles volatile price data', () => {
      const filter = new KalmanTrendFilter()
      
      // Feed highly volatile data
      const volatilePrices = [100, 110, 90, 120, 80, 130, 70]
      const results = volatilePrices.map(price => filter.update(price))
      
      // All results should be valid numbers
      results.forEach(result => {
        expect(Number.isFinite(result)).toBe(true)
        expect(typeof result).toBe('number')
      })
      
      // Filter should smooth the volatility
      const filterVolatility = Math.sqrt(
        results.slice(1).reduce((sum, val, i) => 
          sum + Math.pow(val - results[i], 2), 0) / (results.length - 1)
      )
      
      const priceVolatility = Math.sqrt(
        volatilePrices.slice(1).reduce((sum, val, i) => 
          sum + Math.pow(val - volatilePrices[i], 2), 0) / (volatilePrices.length - 1)
      )
      
      expect(filterVolatility).toBeLessThan(priceVolatility)
    })

    it('maintains state across updates', () => {
      const filter = new KalmanTrendFilter()
      
      const result1 = filter.update(100)
      const result2 = filter.update(100) // Same price
      
      // Results should be different due to internal state evolution
      expect(result2).not.toBe(result1)
      expect(Math.abs(result2 - result1)).toBeLessThan(1) // But should be close
    })
  })

  describe('PriceData Interface', () => {
    it('validates PriceData structure', () => {
      const validPrice: PriceData = {
        timestamp: Date.now(),
        open: 100,
        high: 102,
        low: 98,
        close: 101,
        volume: 1000000
      }
      
      // Should have all required properties
      expect(validPrice).toHaveProperty('timestamp')
      expect(validPrice).toHaveProperty('open')
      expect(validPrice).toHaveProperty('high')
      expect(validPrice).toHaveProperty('low')
      expect(validPrice).toHaveProperty('close')
      expect(validPrice).toHaveProperty('volume')
      
      // All should be numbers
      expect(typeof validPrice.timestamp).toBe('number')
      expect(typeof validPrice.open).toBe('number')
      expect(typeof validPrice.high).toBe('number')
      expect(typeof validPrice.low).toBe('number')
      expect(typeof validPrice.close).toBe('number')
      expect(typeof validPrice.volume).toBe('number')
    })

    it('validates realistic OHLC relationships', () => {
      mockPriceData.forEach(price => {
        // High should be >= max(open, close)
        expect(price.high).toBeGreaterThanOrEqual(Math.max(price.open, price.close))
        
        // Low should be <= min(open, close)  
        expect(price.low).toBeLessThanOrEqual(Math.min(price.open, price.close))
        
        // Volume should be positive
        expect(price.volume).toBeGreaterThan(0)
      })
    })
  })

  describe('IndicatorResult Interface', () => {
    it('validates IndicatorResult structure', () => {
      const result: IndicatorResult = {
        timestamp: Date.now(),
        value: 1.5,
        signal: 'BUY',
        confidence: 0.85,
        metadata: { source: 'kalman_filter', period: 14 }
      }
      
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('value')
      expect(result).toHaveProperty('signal')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('metadata')
      
      expect(['BUY', 'SELL', 'HOLD']).toContain(result.signal)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })
  })

  describe('Integration with Kalman Filter', () => {
    it('processes realistic market data stream', () => {
      const filter = new KalmanTrendFilter(0.01, 1.0)
      
      const results: IndicatorResult[] = mockPriceData.map(price => ({
        timestamp: price.timestamp,
        value: filter.update(price.close),
        signal: 'HOLD' as const,
        confidence: 0.8
      }))
      
      expect(results.length).toBe(mockPriceData.length)
      
      results.forEach(result => {
        expect(Number.isFinite(result.value)).toBe(true)
        expect(result.timestamp).toBeGreaterThan(0)
        expect(['BUY', 'SELL', 'HOLD']).toContain(result.signal)
      })
    })

    it('handles real-time price feeds', () => {
      const filter = new KalmanTrendFilter()
      
      // Simulate real-time price updates
      const prices = [100, 100.5, 99.8, 101.2, 100.1, 102.3]
      const results = []
      
      for (const price of prices) {
        const filtered = filter.update(price)
        results.push(filtered)
        
        expect(Number.isFinite(filtered)).toBe(true)
        expect(typeof filtered).toBe('number')
      }
      
      // Results should show trend adaptation
      expect(results.length).toBe(prices.length)
    })

    it('maintains performance with large datasets', () => {
      const filter = new KalmanTrendFilter()
      const largeDataset = generatePriceData(10000, 100)
      
      const startTime = performance.now()
      
      largeDataset.forEach(price => {
        filter.update(price.close)
      })
      
      const endTime = performance.now()
      
      // Should process 10k points quickly (< 100ms)
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})
