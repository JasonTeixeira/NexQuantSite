import { 
  transformMarketData,
  normalizeTimeSeriesData,
  aggregateTradeData,
  calculatePortfolioMetrics,
  processOptionChain,
  validateDataIntegrity,
  DataSource,
  TimeSeriesPoint,
  TradeRecord,
  PortfolioPosition,
  OptionContract
} from '@/lib/data-adapters'

// Mock data generators
const generateMarketData = () => ({
  symbol: 'AAPL',
  price: 150.25,
  bid: 150.20,
  ask: 150.30,
  volume: 1000000,
  timestamp: Date.now(),
  change: 2.15,
  changePercent: 1.45
})

const generateTimeSeriesData = (length: number) => 
  Array.from({ length }, (_, i) => ({
    timestamp: Date.now() + i * 86400000, // Daily intervals
    value: 100 + Math.sin(i * 0.1) * 10 + Math.random() * 5,
    volume: Math.floor(1000000 + Math.random() * 500000)
  }))

const generateTradeRecords = (count: number): TradeRecord[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `trade_${i}`,
    symbol: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'][i % 4],
    side: i % 2 === 0 ? 'BUY' : 'SELL',
    quantity: Math.floor(100 + Math.random() * 900),
    price: 100 + Math.random() * 100,
    timestamp: Date.now() + i * 60000, // 1 minute intervals
    commission: 1.0 + Math.random() * 4,
    venue: 'NASDAQ'
  }))

const generatePortfolioPositions = (): PortfolioPosition[] => [
  {
    symbol: 'AAPL',
    quantity: 100,
    averagePrice: 148.50,
    currentPrice: 150.25,
    marketValue: 15025,
    unrealizedPnL: 175,
    sector: 'Technology',
    weight: 0.15
  },
  {
    symbol: 'GOOGL', 
    quantity: 50,
    averagePrice: 2800,
    currentPrice: 2825,
    marketValue: 141250,
    unrealizedPnL: 1250,
    sector: 'Technology',
    weight: 0.85
  }
]

describe('Data Adapters Library', () => {
  describe('transformMarketData', () => {
    it('transforms raw market data correctly', () => {
      const rawData = generateMarketData()
      const transformed = transformMarketData(rawData)
      
      expect(transformed).toBeDefined()
      expect(transformed).toHaveProperty('symbol')
      expect(transformed).toHaveProperty('price')
      expect(transformed).toHaveProperty('timestamp')
      
      expect(transformed.symbol).toBe(rawData.symbol)
      expect(transformed.price).toBe(rawData.price)
    })

    it('handles missing fields gracefully', () => {
      const incompleteData = {
        symbol: 'AAPL',
        price: 150.25
        // Missing other fields
      }
      
      expect(() => transformMarketData(incompleteData)).not.toThrow()
    })

    it('validates numeric fields', () => {
      const invalidData = {
        symbol: 'AAPL',
        price: 'invalid', // Should be number
        volume: -1000 // Should be positive
      }
      
      const transformed = transformMarketData(invalidData)
      
      // Should handle invalid data
      expect(transformed).toBeDefined()
    })

    it('normalizes timestamp formats', () => {
      const dataWithStringTimestamp = {
        ...generateMarketData(),
        timestamp: '2024-01-01T12:00:00Z'
      }
      
      const transformed = transformMarketData(dataWithStringTimestamp)
      
      expect(typeof transformed.timestamp).toBe('number')
    })
  })

  describe('normalizeTimeSeriesData', () => {
    it('normalizes time series data', () => {
      const rawTimeSeries = generateTimeSeriesData(100)
      const normalized = normalizeTimeSeriesData(rawTimeSeries)
      
      expect(Array.isArray(normalized)).toBe(true)
      expect(normalized.length).toBe(rawTimeSeries.length)
      
      normalized.forEach(point => {
        expect(point).toHaveProperty('timestamp')
        expect(point).toHaveProperty('value')
        expect(typeof point.timestamp).toBe('number')
        expect(typeof point.value).toBe('number')
      })
    })

    it('handles irregular timestamps', () => {
      const irregularData = [
        { timestamp: Date.now(), value: 100 },
        { timestamp: Date.now() - 1000, value: 101 }, // Out of order
        { timestamp: Date.now() + 5000, value: 102 }
      ]
      
      const normalized = normalizeTimeSeriesData(irregularData)
      
      // Should sort by timestamp
      for (let i = 1; i < normalized.length; i++) {
        expect(normalized[i].timestamp).toBeGreaterThanOrEqual(normalized[i-1].timestamp)
      }
    })

    it('removes invalid data points', () => {
      const dataWithInvalid = [
        { timestamp: Date.now(), value: 100 },
        { timestamp: null, value: 101 }, // Invalid timestamp
        { timestamp: Date.now(), value: null }, // Invalid value
        { timestamp: Date.now(), value: 102 }
      ]
      
      const normalized = normalizeTimeSeriesData(dataWithInvalid)
      
      // Should filter out invalid points
      expect(normalized.length).toBe(2)
      
      normalized.forEach(point => {
        expect(point.timestamp).not.toBeNull()
        expect(point.value).not.toBeNull()
        expect(Number.isFinite(point.timestamp)).toBe(true)
        expect(Number.isFinite(point.value)).toBe(true)
      })
    })

    it('handles empty datasets', () => {
      const normalized = normalizeTimeSeriesData([])
      
      expect(Array.isArray(normalized)).toBe(true)
      expect(normalized.length).toBe(0)
    })
  })

  describe('aggregateTradeData', () => {
    it('aggregates trade records correctly', () => {
      const trades = generateTradeRecords(10)
      const aggregated = aggregateTradeData(trades)
      
      expect(aggregated).toBeDefined()
      expect(aggregated).toHaveProperty('totalVolume')
      expect(aggregated).toHaveProperty('totalValue') 
      expect(aggregated).toHaveProperty('averagePrice')
      expect(aggregated).toHaveProperty('tradeCount')
      
      expect(aggregated.tradeCount).toBe(trades.length)
      expect(aggregated.totalVolume).toBeGreaterThan(0)
      expect(aggregated.totalValue).toBeGreaterThan(0)
    })

    it('calculates volume-weighted average price', () => {
      const trades: TradeRecord[] = [
        { id: '1', symbol: 'AAPL', side: 'BUY', quantity: 100, price: 150, timestamp: Date.now(), commission: 1, venue: 'NASDAQ' },
        { id: '2', symbol: 'AAPL', side: 'BUY', quantity: 200, price: 160, timestamp: Date.now(), commission: 1, venue: 'NASDAQ' }
      ]
      
      const aggregated = aggregateTradeData(trades)
      
      // VWAP should be (100*150 + 200*160) / (100+200) = 156.67
      expect(aggregated.averagePrice).toBeCloseTo(156.67, 1)
    })

    it('separates buy and sell trades', () => {
      const trades = generateTradeRecords(10)
      const aggregated = aggregateTradeData(trades)
      
      expect(aggregated).toHaveProperty('buyTrades')
      expect(aggregated).toHaveProperty('sellTrades')
      
      expect(aggregated.buyTrades + aggregated.sellTrades).toBe(trades.length)
    })

    it('handles empty trade list', () => {
      const aggregated = aggregateTradeData([])
      
      expect(aggregated.tradeCount).toBe(0)
      expect(aggregated.totalVolume).toBe(0)
      expect(aggregated.totalValue).toBe(0)
      expect(aggregated.averagePrice).toBe(0)
    })

    it('groups trades by symbol', () => {
      const trades = generateTradeRecords(20)
      const aggregated = aggregateTradeData(trades)
      
      expect(aggregated).toHaveProperty('bySymbol')
      expect(typeof aggregated.bySymbol).toBe('object')
      
      // Should have entries for each symbol
      Object.keys(aggregated.bySymbol).forEach(symbol => {
        expect(aggregated.bySymbol[symbol]).toHaveProperty('volume')
        expect(aggregated.bySymbol[symbol]).toHaveProperty('value')
        expect(aggregated.bySymbol[symbol]).toHaveProperty('count')
      })
    })
  })

  describe('calculatePortfolioMetrics', () => {
    it('calculates basic portfolio metrics', () => {
      const positions = generatePortfolioPositions()
      const metrics = calculatePortfolioMetrics(positions)
      
      expect(metrics).toHaveProperty('totalValue')
      expect(metrics).toHaveProperty('totalUnrealizedPnL')
      expect(metrics).toHaveProperty('totalRealizedPnL')
      expect(metrics).toHaveProperty('positionCount')
      
      expect(metrics.totalValue).toBeGreaterThan(0)
      expect(metrics.positionCount).toBe(positions.length)
    })

    it('calculates sector exposure', () => {
      const positions = generatePortfolioPositions()
      const metrics = calculatePortfolioMetrics(positions)
      
      expect(metrics).toHaveProperty('sectorExposure')
      expect(typeof metrics.sectorExposure).toBe('object')
      
      // Should have Technology sector from our mock data
      expect(metrics.sectorExposure).toHaveProperty('Technology')
      expect(metrics.sectorExposure.Technology).toBeGreaterThan(0)
    })

    it('calculates risk metrics', () => {
      const positions = generatePortfolioPositions()
      const metrics = calculatePortfolioMetrics(positions)
      
      expect(metrics).toHaveProperty('riskMetrics')
      expect(metrics.riskMetrics).toHaveProperty('concentration')
      expect(metrics.riskMetrics).toHaveProperty('diversification')
      expect(metrics.riskMetrics).toHaveProperty('exposure')
      
      expect(metrics.riskMetrics.concentration).toBeGreaterThanOrEqual(0)
      expect(metrics.riskMetrics.concentration).toBeLessThanOrEqual(1)
    })

    it('handles empty portfolio', () => {
      const metrics = calculatePortfolioMetrics([])
      
      expect(metrics.totalValue).toBe(0)
      expect(metrics.positionCount).toBe(0)
      expect(metrics.totalUnrealizedPnL).toBe(0)
    })

    it('calculates position weights correctly', () => {
      const positions = generatePortfolioPositions()
      const metrics = calculatePortfolioMetrics(positions)
      
      expect(metrics).toHaveProperty('positionWeights')
      
      // Weights should sum to 1 (or close to 1)
      const totalWeight = Object.values(metrics.positionWeights).reduce((sum: number, weight: any) => sum + weight, 0)
      expect(totalWeight).toBeCloseTo(1, 2)
    })
  })

  describe('processOptionChain', () => {
    const mockOptionChain: OptionContract[] = [
      {
        symbol: 'AAPL240315C00150000',
        underlying: 'AAPL',
        strike: 150,
        expiration: '2024-03-15',
        type: 'CALL',
        bid: 5.20,
        ask: 5.30,
        last: 5.25,
        volume: 1000,
        openInterest: 5000,
        impliedVolatility: 0.25
      },
      {
        symbol: 'AAPL240315P00150000',
        underlying: 'AAPL',
        strike: 150,
        expiration: '2024-03-15',
        type: 'PUT',
        bid: 3.10,
        ask: 3.20,
        last: 3.15,
        volume: 500,
        openInterest: 2000,
        impliedVolatility: 0.23
      }
    ]

    it('processes option chain data', () => {
      const processed = processOptionChain(mockOptionChain)
      
      expect(processed).toBeDefined()
      expect(processed).toHaveProperty('calls')
      expect(processed).toHaveProperty('puts')
      expect(processed).toHaveProperty('totalVolume')
      expect(processed).toHaveProperty('totalOpenInterest')
      
      expect(Array.isArray(processed.calls)).toBe(true)
      expect(Array.isArray(processed.puts)).toBe(true)
    })

    it('separates calls and puts correctly', () => {
      const processed = processOptionChain(mockOptionChain)
      
      expect(processed.calls.length).toBe(1)
      expect(processed.puts.length).toBe(1)
      
      expect(processed.calls[0].type).toBe('CALL')
      expect(processed.puts[0].type).toBe('PUT')
    })

    it('calculates Greeks and analytics', () => {
      const processed = processOptionChain(mockOptionChain)
      
      expect(processed).toHaveProperty('analytics')
      expect(processed.analytics).toHaveProperty('avgImpliedVol')
      expect(processed.analytics).toHaveProperty('putCallRatio')
      expect(processed.analytics).toHaveProperty('maxPain')
      
      expect(processed.analytics.avgImpliedVol).toBeGreaterThan(0)
      expect(processed.analytics.putCallRatio).toBeGreaterThan(0)
    })

    it('handles empty option chain', () => {
      const processed = processOptionChain([])
      
      expect(processed.calls).toEqual([])
      expect(processed.puts).toEqual([])
      expect(processed.totalVolume).toBe(0)
      expect(processed.totalOpenInterest).toBe(0)
    })

    it('filters by expiration date', () => {
      const chainWithMultipleExpirations = [
        ...mockOptionChain,
        {
          symbol: 'AAPL240415C00155000',
          underlying: 'AAPL',
          strike: 155,
          expiration: '2024-04-15',
          type: 'CALL',
          bid: 4.20,
          ask: 4.30,
          last: 4.25,
          volume: 800,
          openInterest: 3000,
          impliedVolatility: 0.27
        }
      ]
      
      const processed = processOptionChain(chainWithMultipleExpirations, '2024-03-15')
      
      // Should only include options for specified expiration
      expect(processed.calls.length + processed.puts.length).toBe(2)
      processed.calls.forEach(option => {
        expect(option.expiration).toBe('2024-03-15')
      })
      processed.puts.forEach(option => {
        expect(option.expiration).toBe('2024-03-15')
      })
    })
  })

  describe('validateDataIntegrity', () => {
    it('validates clean data', () => {
      const cleanData = {
        prices: generateTimeSeriesData(10),
        trades: generateTradeRecords(5),
        portfolio: generatePortfolioPositions()
      }
      
      const validation = validateDataIntegrity(cleanData)
      
      expect(validation).toHaveProperty('isValid')
      expect(validation).toHaveProperty('errors')
      expect(validation).toHaveProperty('warnings')
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors.length).toBe(0)
    })

    it('detects data inconsistencies', () => {
      const inconsistentData = {
        prices: [
          { timestamp: Date.now(), value: -100 }, // Negative price
          { timestamp: Date.now(), value: null }, // Null value
        ],
        trades: [
          { id: '1', quantity: -50, price: 150 } // Negative quantity
        ],
        portfolio: [
          { symbol: '', marketValue: 0 } // Empty symbol
        ]
      }
      
      const validation = validateDataIntegrity(inconsistentData)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('provides detailed error messages', () => {
      const invalidData = {
        prices: [{ timestamp: 'invalid', value: 100 }],
        trades: [],
        portfolio: []
      }
      
      const validation = validateDataIntegrity(invalidData)
      
      expect(validation.errors.length).toBeGreaterThan(0)
      expect(validation.errors[0]).toMatch(/timestamp/i)
    })

    it('distinguishes between errors and warnings', () => {
      const dataWithWarnings = {
        prices: generateTimeSeriesData(2), // Very small dataset - warning
        trades: generateTradeRecords(1000), // Large dataset - warning
        portfolio: generatePortfolioPositions()
      }
      
      const validation = validateDataIntegrity(dataWithWarnings)
      
      expect(validation.warnings.length).toBeGreaterThan(0)
      // Should still be valid despite warnings
      expect(validation.isValid).toBe(true)
    })
  })

  describe('DataSource Interface', () => {
    it('validates DataSource structure', () => {
      const validSource: DataSource = {
        id: 'bloomberg',
        name: 'Bloomberg Terminal',
        type: 'real-time',
        endpoint: 'wss://api.bloomberg.com/data',
        apiKey: 'test-key',
        rateLimit: 1000,
        fields: ['price', 'volume', 'bid', 'ask'],
        isActive: true
      }
      
      expect(validSource).toHaveProperty('id')
      expect(validSource).toHaveProperty('name')
      expect(validSource).toHaveProperty('type')
      expect(validSource).toHaveProperty('endpoint')
      expect(Array.isArray(validSource.fields)).toBe(true)
      expect(typeof validSource.isActive).toBe('boolean')
    })
  })

  describe('Data Pipeline Integration', () => {
    it('processes complete data pipeline', () => {
      // 1. Raw market data
      const rawMarket = generateMarketData()
      const transformedMarket = transformMarketData(rawMarket)
      
      // 2. Time series normalization
      const timeSeries = generateTimeSeriesData(50)
      const normalizedSeries = normalizeTimeSeriesData(timeSeries)
      
      // 3. Trade aggregation
      const trades = generateTradeRecords(20)
      const aggregatedTrades = aggregateTradeData(trades)
      
      // 4. Portfolio metrics
      const positions = generatePortfolioPositions()
      const portfolioMetrics = calculatePortfolioMetrics(positions)
      
      // 5. Data validation
      const validation = validateDataIntegrity({
        prices: normalizedSeries,
        trades: trades,
        portfolio: positions
      })
      
      // All steps should complete successfully
      expect(transformedMarket).toBeDefined()
      expect(normalizedSeries.length).toBe(timeSeries.length)
      expect(aggregatedTrades.tradeCount).toBe(trades.length)
      expect(portfolioMetrics.positionCount).toBe(positions.length)
      expect(validation.isValid).toBe(true)
    })

    it('handles real-time data streams', () => {
      const dataStream = Array.from({ length: 1000 }, generateMarketData)
      
      const startTime = performance.now()
      
      const processed = dataStream.map(transformMarketData)
      
      const endTime = performance.now()
      
      // Should process 1000 data points quickly
      expect(endTime - startTime).toBeLessThan(100) // < 100ms
      expect(processed.length).toBe(dataStream.length)
      
      processed.forEach(data => {
        expect(data).toHaveProperty('symbol')
        expect(data).toHaveProperty('price')
      })
    })

    it('maintains data quality throughout pipeline', () => {
      // Start with high-quality data
      const highQualityData = {
        symbol: 'AAPL',
        price: 150.25,
        bid: 150.20,
        ask: 150.30,
        volume: 1000000,
        timestamp: Date.now()
      }
      
      // Transform through pipeline
      const transformed = transformMarketData(highQualityData)
      
      // Quality should be maintained
      expect(transformed.price).toBe(highQualityData.price)
      expect(transformed.symbol).toBe(highQualityData.symbol)
      expect(transformed.volume).toBe(highQualityData.volume)
      
      // Should add validation metadata
      expect(transformed).toHaveProperty('quality')
      expect(transformed.quality).toMatch(/high|medium|low/)
    })
  })

  describe('Performance and Scalability', () => {
    it('handles large datasets efficiently', () => {
      const largeTimeSeries = generateTimeSeriesData(10000)
      
      const startTime = performance.now()
      const normalized = normalizeTimeSeriesData(largeTimeSeries)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(500) // Should complete within 500ms
      expect(normalized.length).toBeLessThanOrEqual(largeTimeSeries.length)
    })

    it('optimizes memory usage', () => {
      const largeTrades = generateTradeRecords(50000)
      
      // Should aggregate without memory issues
      expect(() => aggregateTradeData(largeTrades)).not.toThrow()
    })

    it('handles concurrent data processing', async () => {
      const datasets = Array.from({ length: 10 }, () => generateTimeSeriesData(100))
      
      // Process multiple datasets concurrently
      const promises = datasets.map(data => 
        Promise.resolve(normalizeTimeSeriesData(data))
      )
      
      const results = await Promise.all(promises)
      
      expect(results.length).toBe(datasets.length)
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true)
      })
    })
  })

  describe('Error Recovery', () => {
    it('recovers from corrupt data gracefully', () => {
      const corruptData = [
        { timestamp: 'corrupt', value: undefined },
        { timestamp: Date.now(), value: NaN },
        { timestamp: Date.now(), value: Infinity },
        { timestamp: Date.now(), value: 100 } // Valid point
      ]
      
      const normalized = normalizeTimeSeriesData(corruptData)
      
      // Should recover valid data
      expect(normalized.length).toBe(1)
      expect(normalized[0].value).toBe(100)
    })

    it('handles network timeout scenarios', () => {
      // Simulate incomplete data from network timeout
      const incompleteMarketData = {
        symbol: 'AAPL',
        price: 150.25
        // Missing timestamp and other fields
      }
      
      const transformed = transformMarketData(incompleteMarketData)
      
      // Should provide fallback values
      expect(transformed).toHaveProperty('timestamp')
      expect(Number.isFinite(transformed.timestamp)).toBe(true)
    })

    it('validates data relationships', () => {
      const inconsistentTrade: TradeRecord = {
        id: 'test',
        symbol: 'AAPL',
        side: 'BUY',
        quantity: 100,
        price: -50, // Invalid negative price
        timestamp: Date.now(),
        commission: 1,
        venue: 'NASDAQ'
      }
      
      const aggregated = aggregateTradeData([inconsistentTrade])
      
      // Should handle invalid data appropriately
      expect(aggregated).toBeDefined()
      expect(aggregated.tradeCount).toBe(0) // Should exclude invalid trades
    })
  })
})
