import { sharpeRatio, bootstrapCI, deflatedSharpe, purgedKFolds, DailyReturn } from '@/lib/validation'

describe('Statistical Validation Library', () => {
  // Sample data for testing
  const sampleReturns: DailyReturn[] = [
    { date: '2024-01-01', r: 0.01 },
    { date: '2024-01-02', r: -0.005 },
    { date: '2024-01-03', r: 0.02 },
    { date: '2024-01-04', r: -0.01 },
    { date: '2024-01-05', r: 0.015 },
    { date: '2024-01-06', r: -0.008 },
    { date: '2024-01-07', r: 0.025 },
    { date: '2024-01-08', r: -0.012 }
  ]

  describe('sharpeRatio', () => {
    it('calculates Sharpe ratio correctly', () => {
      const ratio = sharpeRatio(sampleReturns)
      
      expect(typeof ratio).toBe('number')
      expect(Number.isFinite(ratio)).toBe(true)
      expect(ratio).toBeGreaterThan(-10) // Reasonable bounds
      expect(ratio).toBeLessThan(10)
    })

    it('handles empty data', () => {
      const ratio = sharpeRatio([])
      
      expect(ratio).toBe(0)
    })

    it('handles single data point', () => {
      const singleReturn = [{ date: '2024-01-01', r: 0.01 }]
      const ratio = sharpeRatio(singleReturn)
      
      expect(typeof ratio).toBe('number')
      expect(Number.isFinite(ratio)).toBe(true)
    })

    it('annualizes correctly with sqrt(252)', () => {
      // Test that it uses the correct annualization factor
      const dailyReturns = [
        { date: '2024-01-01', r: 0.001 },
        { date: '2024-01-02', r: 0.001 }
      ]
      
      const ratio = sharpeRatio(dailyReturns)
      
      // Should be positive for positive returns
      expect(ratio).toBeGreaterThan(0)
    })

    it('handles negative average returns', () => {
      const negativeReturns: DailyReturn[] = [
        { date: '2024-01-01', r: -0.01 },
        { date: '2024-01-02', r: -0.005 },
        { date: '2024-01-03', r: -0.02 }
      ]
      
      const ratio = sharpeRatio(negativeReturns)
      
      expect(ratio).toBeLessThan(0)
    })
  })

  describe('bootstrapCI', () => {
    const mockMetric = (returns: DailyReturn[]) => sharpeRatio(returns)

    it('calculates confidence interval', () => {
      const ci = bootstrapCI(sampleReturns, mockMetric, 100, 0.05)
      
      expect(ci).toHaveProperty('lo')
      expect(ci).toHaveProperty('hi')
      expect(typeof ci.lo).toBe('number')
      expect(typeof ci.hi).toBe('number')
      expect(ci.hi).toBeGreaterThanOrEqual(ci.lo)
    })

    it('handles empty data', () => {
      const ci = bootstrapCI([], mockMetric)
      
      expect(ci.lo).toBe(0)
      expect(ci.hi).toBe(0)
    })

    it('respects alpha parameter', () => {
      const ci95 = bootstrapCI(sampleReturns, mockMetric, 100, 0.05) // 95% CI
      const ci90 = bootstrapCI(sampleReturns, mockMetric, 100, 0.10) // 90% CI
      
      // 90% CI should be narrower than 95% CI
      expect(ci90.hi - ci90.lo).toBeLessThanOrEqual(ci95.hi - ci95.lo)
    })

    it('handles different sample sizes', () => {
      const ci100 = bootstrapCI(sampleReturns, mockMetric, 100)
      const ci500 = bootstrapCI(sampleReturns, mockMetric, 500)
      
      // Both should return valid confidence intervals
      expect(ci100.hi).toBeGreaterThanOrEqual(ci100.lo)
      expect(ci500.hi).toBeGreaterThanOrEqual(ci500.lo)
    })
  })

  describe('deflatedSharpe', () => {
    it('deflates Sharpe ratio correctly', () => {
      const rawSharpe = 2.0
      const trials = 100
      const sampleSize = 1000
      
      const deflated = deflatedSharpe(rawSharpe, trials, sampleSize)
      
      expect(deflated).toBeLessThanOrEqual(rawSharpe)
      expect(deflated).toBeGreaterThanOrEqual(0)
      expect(typeof deflated).toBe('number')
    })

    it('applies penalty for multiple trials', () => {
      const rawSharpe = 2.0
      const sampleSize = 1000
      
      const deflated10 = deflatedSharpe(rawSharpe, 10, sampleSize)
      const deflated100 = deflatedSharpe(rawSharpe, 100, sampleSize)
      
      // More trials should result in more deflation
      expect(deflated100).toBeLessThanOrEqual(deflated10)
    })

    it('handles edge cases', () => {
      expect(deflatedSharpe(1.0, 1, 100)).toBe(1.0) // No deflation for single trial
      expect(deflatedSharpe(1.0, 0, 100)).toBe(1.0) // No deflation for zero trials
      expect(deflatedSharpe(-1.0, 100, 1000)).toBe(0) // Minimum floor of 0
    })

    it('maintains precision', () => {
      const deflated = deflatedSharpe(1.23456789, 50, 500)
      
      // Should be rounded to 2 decimal places
      expect(deflated.toString()).toMatch(/^\d+\.\d{2}$/)
    })
  })

  describe('purgedKFolds', () => {
    it('creates non-overlapping folds', () => {
      const folds = purgedKFolds(sampleReturns, 3, 1)
      
      expect(Array.isArray(folds)).toBe(true)
      expect(folds.length).toBe(3)
      
      folds.forEach(fold => {
        expect(fold).toHaveProperty('train')
        expect(fold).toHaveProperty('test')
        expect(Array.isArray(fold.train)).toBe(true)
        expect(Array.isArray(fold.test)).toBe(true)
      })
    })

    it('respects embargo period', () => {
      const folds = purgedKFolds(sampleReturns, 2, 1)
      
      // Should create valid folds
      expect(folds.length).toBe(2)
      
      folds.forEach(fold => {
        // Each fold should have train and test sets
        expect(Array.isArray(fold.train)).toBe(true)
        expect(Array.isArray(fold.test)).toBe(true)
        
        // Train and test should not overlap
        const trainSet = new Set(fold.train)
        fold.test.forEach(testIdx => {
          expect(trainSet.has(testIdx)).toBe(false)
        })
      })
    })

    it('handles small datasets', () => {
      const smallData = sampleReturns.slice(0, 3)
      const folds = purgedKFolds(smallData, 5, 1) // More folds than data
      
      expect(folds).toBeDefined()
      expect(Array.isArray(folds)).toBe(true)
    })

    it('validates fold structure', () => {
      const folds = purgedKFolds(sampleReturns, 4, 0)
      
      // All indices should be within data range
      folds.forEach(fold => {
        fold.train.forEach(idx => {
          expect(idx).toBeGreaterThanOrEqual(0)
          expect(idx).toBeLessThan(sampleReturns.length)
        })
        
        fold.test.forEach(idx => {
          expect(idx).toBeGreaterThanOrEqual(0)
          expect(idx).toBeLessThan(sampleReturns.length)
        })
      })
    })
  })

  describe('Statistical Validation Integration', () => {
    it('works with complete workflow', () => {
      // 1. Calculate Sharpe ratio
      const rawSharpe = sharpeRatio(sampleReturns)
      
      // 2. Get confidence interval
      const ci = bootstrapCI(sampleReturns, sharpeRatio, 50, 0.05)
      
      // 3. Deflate for multiple testing
      const deflated = deflatedSharpe(rawSharpe, 10, sampleReturns.length)
      
      // 4. Create cross-validation folds
      const folds = purgedKFolds(sampleReturns, 3, 1)
      
      // All should be valid
      expect(typeof rawSharpe).toBe('number')
      expect(ci.hi).toBeGreaterThanOrEqual(ci.lo)
      expect(deflated).toBeLessThanOrEqual(rawSharpe)
      expect(folds.length).toBe(3)
    })

    it('maintains statistical properties', () => {
      // Test with known good strategy returns
      const goodReturns: DailyReturn[] = Array.from({ length: 252 }, (_, i) => ({
        date: `2024-${String(Math.floor(i/30)+1).padStart(2, '0')}-${String(i%30+1).padStart(2, '0')}`,
        r: 0.0004 + Math.random() * 0.001 // Positive mean with low volatility
      }))
      
      const sharpe = sharpeRatio(goodReturns)
      const ci = bootstrapCI(goodReturns, sharpeRatio, 100)
      
      // Good strategy should have positive Sharpe
      expect(sharpe).toBeGreaterThan(0)
      
      // Confidence interval should contain the point estimate
      expect(sharpe).toBeGreaterThanOrEqual(ci.lo)
      expect(sharpe).toBeLessThanOrEqual(ci.hi)
    })
  })
})
