import { cn, formatCurrency, formatPercentage, formatNumber, formatDate, calculatePercentChange, clamp, debounce, throttle } from '@/lib/utils'

describe('Utility Functions Library', () => {
  describe('cn (className utility)', () => {
    it('combines class names correctly', () => {
      const result = cn('base-class', 'additional-class')
      
      expect(result).toContain('base-class')
      expect(result).toContain('additional-class')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('base', isActive && 'active', !isActive && 'inactive')
      
      expect(result).toContain('base')
      expect(result).toContain('active')
      expect(result).not.toContain('inactive')
    })

    it('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid')
      
      expect(result).toContain('base')
      expect(result).toContain('valid')
      expect(result).not.toContain('undefined')
      expect(result).not.toContain('null')
    })

    it('merges Tailwind classes correctly', () => {
      // Test that conflicting classes are resolved properly
      const result = cn('bg-red-500', 'bg-blue-500')
      
      expect(typeof result).toBe('string')
      expect(result).toContain('bg-') // Should contain background class
    })
  })

  describe('formatCurrency', () => {
    it('formats positive currency values', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
      expect(formatCurrency(0.01)).toBe('$0.01')
    })

    it('formats negative currency values', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
      expect(formatCurrency(-0.50)).toBe('-$0.50')
    })

    it('handles zero values', () => {
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(-0)).toBe('$0.00')
    })

    it('handles large numbers', () => {
      expect(formatCurrency(1000000000)).toBe('$1,000,000,000.00')
      expect(formatCurrency(1234567890.12)).toBe('$1,234,567,890.12')
    })

    it('supports different currency symbols', () => {
      expect(formatCurrency(100, 'EUR')).toContain('€')
      expect(formatCurrency(100, 'GBP')).toContain('£')
      expect(formatCurrency(100, 'JPY')).toContain('¥')
    })

    it('handles invalid inputs gracefully', () => {
      expect(formatCurrency(NaN)).toBe('$0.00')
      expect(formatCurrency(Infinity)).toBe('$0.00')
      expect(formatCurrency(-Infinity)).toBe('$0.00')
    })
  })

  describe('formatPercentage', () => {
    it('formats percentage values correctly', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%')
      expect(formatPercentage(0.5)).toBe('50.00%')
      expect(formatPercentage(1.0)).toBe('100.00%')
    })

    it('handles negative percentages', () => {
      expect(formatPercentage(-0.05)).toBe('-5.00%')
      expect(formatPercentage(-1.5)).toBe('-150.00%')
    })

    it('supports custom decimal places', () => {
      expect(formatPercentage(0.123456, 1)).toBe('12.3%')
      expect(formatPercentage(0.123456, 3)).toBe('12.346%')
      expect(formatPercentage(0.123456, 0)).toBe('12%')
    })

    it('handles edge cases', () => {
      expect(formatPercentage(0)).toBe('0.00%')
      expect(formatPercentage(NaN)).toBe('0.00%')
      expect(formatPercentage(Infinity)).toBe('0.00%')
    })

    it('handles very small percentages', () => {
      expect(formatPercentage(0.000001)).toBe('0.00%')
      expect(formatPercentage(0.0001, 4)).toBe('0.0100%')
    })
  })

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(1000)).toBe('1,000')
    })

    it('handles decimals', () => {
      expect(formatNumber(1234.56, 2)).toBe('1,234.56')
      expect(formatNumber(1000.123, 1)).toBe('1,000.1')
      expect(formatNumber(1000.999, 0)).toBe('1,001')
    })

    it('handles negative numbers', () => {
      expect(formatNumber(-1234)).toBe('-1,234')
      expect(formatNumber(-1234.56, 2)).toBe('-1,234.56')
    })

    it('handles zero and small numbers', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(0.1, 1)).toBe('0.1')
      expect(formatNumber(0.999, 0)).toBe('1')
    })

    it('supports scientific notation for very large numbers', () => {
      const veryLarge = 1e15
      const formatted = formatNumber(veryLarge)
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })
  })

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      const testDate = new Date('2024-03-15T10:30:00Z')
      const formatted = formatDate(testDate)
      
      expect(formatted).toContain('2024')
      expect(formatted).toContain('03') // Month
      expect(formatted).toContain('15') // Day
    })

    it('supports different date formats', () => {
      const testDate = new Date('2024-03-15T10:30:00Z')
      
      const shortFormat = formatDate(testDate, 'short')
      const longFormat = formatDate(testDate, 'long')
      const timeFormat = formatDate(testDate, 'time')
      
      expect(shortFormat).toBeDefined()
      expect(longFormat).toBeDefined()
      expect(timeFormat).toBeDefined()
      
      expect(shortFormat).not.toBe(longFormat)
      expect(timeFormat).toContain(':') // Should contain time separator
    })

    it('handles invalid dates', () => {
      const invalidDate = new Date('invalid')
      const formatted = formatDate(invalidDate)
      
      expect(formatted).toBe('Invalid Date')
    })

    it('handles timezone considerations', () => {
      const utcDate = new Date('2024-03-15T00:00:00Z')
      const formatted = formatDate(utcDate, 'full')
      
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })
  })

  describe('calculatePercentChange', () => {
    it('calculates percentage change correctly', () => {
      expect(calculatePercentChange(100, 110)).toBeCloseTo(10, 2)
      expect(calculatePercentChange(100, 90)).toBeCloseTo(-10, 2)
      expect(calculatePercentChange(100, 200)).toBeCloseTo(100, 2)
    })

    it('handles zero starting values', () => {
      expect(calculatePercentChange(0, 100)).toBe(Infinity)
      expect(calculatePercentChange(0, 0)).toBe(0)
    })

    it('handles negative values', () => {
      expect(calculatePercentChange(-100, -50)).toBeCloseTo(50, 2)
      expect(calculatePercentChange(100, -100)).toBeCloseTo(-200, 2)
    })

    it('maintains precision', () => {
      expect(calculatePercentChange(100.123, 101.456)).toBeCloseTo(1.33, 2)
    })
  })

  describe('clamp', () => {
    it('clamps values within bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5) // Within bounds
      expect(clamp(-5, 0, 10)).toBe(0) // Below min
      expect(clamp(15, 0, 10)).toBe(10) // Above max
    })

    it('handles equal min and max', () => {
      expect(clamp(5, 3, 3)).toBe(3)
      expect(clamp(1, 3, 3)).toBe(3)
    })

    it('handles floating point values', () => {
      expect(clamp(5.7, 0, 10)).toBeCloseTo(5.7, 1)
      expect(clamp(-0.5, 0, 1)).toBe(0)
      expect(clamp(1.1, 0, 1)).toBe(1)
    })

    it('handles reversed min/max gracefully', () => {
      // If min > max, should still work
      expect(clamp(5, 10, 0)).toBe(5) // Or handle as appropriate
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('delays function execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 300)
      
      debouncedFn('test')
      
      // Should not be called immediately
      expect(mockFn).not.toHaveBeenCalled()
      
      // Fast-forward time
      jest.advanceTimersByTime(300)
      
      // Should be called after delay
      expect(mockFn).toHaveBeenCalledWith('test')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('cancels previous calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 300)
      
      debouncedFn('first')
      jest.advanceTimersByTime(100)
      
      debouncedFn('second')
      jest.advanceTimersByTime(100)
      
      debouncedFn('third')
      jest.advanceTimersByTime(300)
      
      // Only the last call should execute
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('third')
    })

    it('handles multiple parameters', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      debouncedFn('arg1', 'arg2', 123)
      jest.advanceTimersByTime(100)
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)
    })
  })

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('limits function call frequency', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 300)
      
      // Rapid calls
      throttledFn('call1')
      throttledFn('call2')
      throttledFn('call3')
      
      // Should only call once immediately
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('call1')
      
      // Advance time
      jest.advanceTimersByTime(300)
      
      throttledFn('call4')
      
      // Should allow another call after throttle period
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenCalledWith('call4')
    })

    it('preserves function context', () => {
      const mockObj = {
        value: 'test',
        method: jest.fn(function() { return this.value })
      }
      
      const throttledMethod = throttle(mockObj.method.bind(mockObj), 100)
      
      throttledMethod()
      
      expect(mockObj.method).toHaveBeenCalled()
    })
  })

  describe('Utility Integration', () => {
    it('works together in financial calculations', () => {
      // Simulate real financial data processing
      const portfolioValue = 1234567.89
      const previousValue = 1200000
      
      const formattedValue = formatCurrency(portfolioValue)
      const percentChange = calculatePercentChange(previousValue, portfolioValue)
      const formattedChange = formatPercentage(percentChange / 100, 2)
      const clampedChange = clamp(percentChange, -50, 50) // Risk limits
      
      expect(formattedValue).toBe('$1,234,567.89')
      expect(percentChange).toBeCloseTo(2.88, 2)
      expect(formattedChange).toContain('%')
      expect(clampedChange).toBe(percentChange) // Should be within limits
    })

    it('handles real-time data formatting', () => {
      const realTimeData = {
        price: 1523.456789,
        change: 0.0234,
        volume: 5678901,
        timestamp: new Date('2024-03-15T14:30:00Z')
      }
      
      const formatted = {
        price: formatCurrency(realTimeData.price),
        change: formatPercentage(realTimeData.change, 2),
        volume: formatNumber(realTimeData.volume),
        time: formatDate(realTimeData.timestamp, 'time')
      }
      
      expect(formatted.price).toBe('$1,523.46')
      expect(formatted.change).toBe('2.34%')
      expect(formatted.volume).toBe('5,678,901')
      expect(formatted.time).toContain(':')
    })

    it('optimizes performance with debouncing', () => {
      jest.useFakeTimers()
      
      const expensiveCalculation = jest.fn((value) => {
        return formatCurrency(value * 1.05) // 5% markup
      })
      
      const debouncedCalculation = debounce(expensiveCalculation, 100)
      
      // Simulate rapid price updates
      debouncedCalculation(100)
      debouncedCalculation(101)
      debouncedCalculation(102)
      debouncedCalculation(103)
      
      // Should only call once
      expect(expensiveCalculation).not.toHaveBeenCalled()
      
      jest.advanceTimersByTime(100)
      
      // Should call with latest value
      expect(expensiveCalculation).toHaveBeenCalledTimes(1)
      expect(expensiveCalculation).toHaveBeenCalledWith(103)
      
      jest.useRealTimers()
    })

    it('throttles high-frequency updates', () => {
      jest.useFakeTimers()
      
      const updateChart = jest.fn()
      const throttledUpdate = throttle(updateChart, 50) // 20 FPS max
      
      // Simulate 60 FPS updates
      for (let i = 0; i < 10; i++) {
        throttledUpdate(`frame_${i}`)
      }
      
      // Should only call once immediately
      expect(updateChart).toHaveBeenCalledTimes(1)
      
      jest.advanceTimersByTime(50)
      
      // Allow another update
      throttledUpdate('frame_final')
      expect(updateChart).toHaveBeenCalledTimes(2)
      
      jest.useRealTimers()
    })
  })

  describe('Financial Math Utilities', () => {
    it('calculates compound returns', () => {
      const dailyReturns = [0.01, 0.02, -0.01, 0.015]
      
      const compoundReturn = dailyReturns.reduce((acc, ret) => acc * (1 + ret), 1) - 1
      const percentChange = compoundReturn * 100
      
      expect(percentChange).toBeGreaterThan(0) // Should be positive overall
      expect(formatPercentage(compoundReturn, 3)).toContain('%')
    })

    it('handles risk-adjusted calculations', () => {
      const returns = [0.02, -0.01, 0.03, -0.005, 0.015]
      const riskFreeRate = 0.02 / 252 // Daily risk-free rate
      
      const excessReturns = returns.map(r => r - riskFreeRate)
      const avgExcess = excessReturns.reduce((sum, r) => sum + r, 0) / returns.length
      const volatility = Math.sqrt(
        excessReturns.reduce((sum, r) => sum + Math.pow(r - avgExcess, 2), 0) / (returns.length - 1)
      )
      
      const sharpeRatio = avgExcess / volatility * Math.sqrt(252)
      
      expect(Number.isFinite(sharpeRatio)).toBe(true)
      expect(Math.abs(sharpeRatio)).toBeLessThan(10) // Reasonable bounds
    })

    it('calculates drawdown metrics', () => {
      const equityValues = [1000, 1100, 1050, 900, 950, 1200, 1100]
      
      let peak = equityValues[0]
      let maxDrawdown = 0
      
      equityValues.forEach(value => {
        peak = Math.max(peak, value)
        const drawdown = (peak - value) / peak
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      })
      
      expect(maxDrawdown).toBeGreaterThan(0)
      expect(maxDrawdown).toBeLessThan(1)
      expect(formatPercentage(maxDrawdown, 2)).toContain('%')
      
      // Clamp to reasonable risk limits
      const clampedDrawdown = clamp(maxDrawdown, 0, 0.5) // Max 50% drawdown
      expect(clampedDrawdown).toBeLessThanOrEqual(0.5)
    })
  })

  describe('Data Processing Utilities', () => {
    it('processes arrays efficiently', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i * 1.5)
      
      const startTime = performance.now()
      
      const processed = largeArray
        .map(val => clamp(val, 0, 5000))
        .map(val => formatNumber(val, 2))
        .slice(0, 100) // Take first 100
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should be fast
      expect(processed.length).toBe(100)
      expect(processed[0]).toBe('0.00')
    })

    it('handles batch formatting operations', () => {
      const financialData = [
        { value: 1234.56, type: 'currency' },
        { value: 0.0567, type: 'percentage' },
        { value: 9876543, type: 'number' },
        { value: new Date(), type: 'date' }
      ]
      
      const formatted = financialData.map(item => {
        switch (item.type) {
          case 'currency':
            return formatCurrency(item.value as number)
          case 'percentage':
            return formatPercentage(item.value as number)
          case 'number':
            return formatNumber(item.value as number)
          case 'date':
            return formatDate(item.value as Date)
          default:
            return String(item.value)
        }
      })
      
      expect(formatted[0]).toBe('$1,234.56')
      expect(formatted[1]).toBe('5.67%')
      expect(formatted[2]).toBe('9,876,543')
      expect(formatted[3]).toContain('2024')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles null and undefined inputs', () => {
      expect(() => formatCurrency(null as any)).not.toThrow()
      expect(() => formatCurrency(undefined as any)).not.toThrow()
      expect(() => formatPercentage(null as any)).not.toThrow()
      expect(() => formatNumber(undefined as any)).not.toThrow()
    })

    it('handles extreme values', () => {
      const extremelyLarge = Number.MAX_SAFE_INTEGER
      const extremelySmall = Number.MIN_SAFE_INTEGER
      
      expect(() => formatCurrency(extremelyLarge)).not.toThrow()
      expect(() => formatCurrency(extremelySmall)).not.toThrow()
      expect(() => calculatePercentChange(1, extremelyLarge)).not.toThrow()
    })

    it('maintains type safety', () => {
      // All utility functions should return expected types
      expect(typeof formatCurrency(100)).toBe('string')
      expect(typeof formatPercentage(0.1)).toBe('string')
      expect(typeof formatNumber(100)).toBe('string')
      expect(typeof formatDate(new Date())).toBe('string')
      expect(typeof calculatePercentChange(100, 110)).toBe('number')
      expect(typeof clamp(5, 0, 10)).toBe('number')
    })

    it('handles concurrent operations', async () => {
      const operations = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve().then(() => ({
          currency: formatCurrency(i * 100),
          percentage: formatPercentage(i * 0.01),
          number: formatNumber(i * 1000)
        }))
      )
      
      const results = await Promise.all(operations)
      
      expect(results.length).toBe(100)
      results.forEach((result, i) => {
        expect(result.currency).toBe(formatCurrency(i * 100))
        expect(result.percentage).toBe(formatPercentage(i * 0.01))
        expect(result.number).toBe(formatNumber(i * 1000))
      })
    })
  })
})
