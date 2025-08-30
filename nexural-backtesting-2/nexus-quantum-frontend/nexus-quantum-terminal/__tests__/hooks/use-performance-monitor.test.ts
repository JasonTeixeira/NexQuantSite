import { renderHook } from '@testing-library/react'
import { usePerformanceMonitor, useMemoryCleanup, useDebouncedState } from '@/hooks/use-performance-monitor'

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => [])
}

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true
})

// Mock console.log to capture performance logs
const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

afterEach(() => {
  jest.clearAllMocks()
  consoleSpy.mockClear()
})

afterAll(() => {
  consoleSpy.mockRestore()
})

describe('usePerformanceMonitor', () => {
  it('provides logPerformance function', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'))
    
    expect(result.current).toHaveProperty('logPerformance')
    expect(typeof result.current.logPerformance).toBe('function')
  })

  it('logs performance with component name', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'))
    
    const startTime = 1000
    const endTime = 1500
    mockPerformance.now.mockReturnValueOnce(endTime)
    
    result.current.logPerformance('render', startTime)
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[TestComponent] render:'),
      expect.stringContaining('ms')
    )
  })

  it('calculates duration correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'))
    
    const startTime = 1000
    const endTime = 1250
    mockPerformance.now.mockReturnValueOnce(endTime)
    
    result.current.logPerformance('test-event', startTime)
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('250.00ms')
    )
  })

  it('handles different component names', () => {
    const { result: result1 } = renderHook(() => usePerformanceMonitor('Component1'))
    const { result: result2 } = renderHook(() => usePerformanceMonitor('Component2'))
    
    result1.current.logPerformance('event', 1000)
    result2.current.logPerformance('event', 1000)
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Component1]'),
      expect.anything()
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Component2]'),
      expect.anything()
    )
  })

  it('memoizes logPerformance function', () => {
    const { result, rerender } = renderHook(
      ({ componentName }) => usePerformanceMonitor(componentName),
      { initialProps: { componentName: 'TestComponent' } }
    )
    
    const firstLogFn = result.current.logPerformance
    
    // Re-render with same component name
    rerender({ componentName: 'TestComponent' })
    
    const secondLogFn = result.current.logPerformance
    
    // Should be the same function reference (memoized)
    expect(firstLogFn).toBe(secondLogFn)
  })

  it('creates new function when component name changes', () => {
    const { result, rerender } = renderHook(
      ({ componentName }) => usePerformanceMonitor(componentName),
      { initialProps: { componentName: 'Component1' } }
    )
    
    const firstLogFn = result.current.logPerformance
    
    // Re-render with different component name
    rerender({ componentName: 'Component2' })
    
    const secondLogFn = result.current.logPerformance
    
    // Should be different function reference
    expect(firstLogFn).not.toBe(secondLogFn)
  })
})

describe('useMemoryCleanup', () => {
  it('provides addCleanup function', () => {
    const { result } = renderHook(() => useMemoryCleanup())
    
    expect(result.current).toHaveProperty('addCleanup')
    expect(typeof result.current.addCleanup).toBe('function')
  })

  it('calls cleanup functions on unmount', () => {
    const cleanup1 = jest.fn()
    const cleanup2 = jest.fn()
    
    const { result, unmount } = renderHook(() => useMemoryCleanup())
    
    // Add cleanup functions
    result.current.addCleanup(cleanup1)
    result.current.addCleanup(cleanup2)
    
    // Unmount component
    unmount()
    
    // Both cleanup functions should be called
    expect(cleanup1).toHaveBeenCalledTimes(1)
    expect(cleanup2).toHaveBeenCalledTimes(1)
  })

  it('handles multiple addCleanup calls', () => {
    const { result } = renderHook(() => useMemoryCleanup())
    
    const cleanupFns = Array.from({ length: 5 }, () => jest.fn())
    
    // Add multiple cleanup functions
    cleanupFns.forEach(fn => result.current.addCleanup(fn))
    
    // Should not throw
    expect(() => result.current.addCleanup(jest.fn())).not.toThrow()
  })

  it('memoizes addCleanup function', () => {
    const { result, rerender } = renderHook(() => useMemoryCleanup())
    
    const firstAddCleanup = result.current.addCleanup
    rerender()
    const secondAddCleanup = result.current.addCleanup
    
    // Should be the same function reference
    expect(firstAddCleanup).toBe(secondAddCleanup)
  })
})

describe('useDebouncedState', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 300))
    
    const [value, setValue, debouncedValue] = result.current
    
    expect(value).toBe('initial')
    expect(debouncedValue).toBe('initial')
  })

  it('updates value immediately but debounces debouncedValue', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 300))
    
    const [, setValue] = result.current
    
    // Update value
    setValue('updated')
    
    // Value should update immediately
    expect(result.current[0]).toBe('updated')
    
    // Debounced value should still be initial
    expect(result.current[2]).toBe('initial')
    
    // Fast-forward time
    jest.advanceTimersByTime(300)
    
    // Now debounced value should update
    expect(result.current[2]).toBe('updated')
  })

  it('cancels previous timeout on rapid updates', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 300))
    
    const [, setValue] = result.current
    
    // Rapid updates
    setValue('update1')
    jest.advanceTimersByTime(100)
    
    setValue('update2')
    jest.advanceTimersByTime(100)
    
    setValue('final')
    
    // Fast-forward to completion
    jest.advanceTimersByTime(300)
    
    // Should only have the final value
    expect(result.current[2]).toBe('final')
  })

  it('handles different delay values', () => {
    const { result: result100 } = renderHook(() => useDebouncedState('test', 100))
    const { result: result500 } = renderHook(() => useDebouncedState('test', 500))
    
    const [, setValue100] = result100.current
    const [, setValue500] = result500.current
    
    setValue100('updated')
    setValue500('updated')
    
    // Advance by 150ms
    jest.advanceTimersByTime(150)
    
    // 100ms debounce should be complete
    expect(result100.current[2]).toBe('updated')
    
    // 500ms debounce should still be pending
    expect(result500.current[2]).toBe('test')
    
    // Advance by another 400ms (total 550ms)
    jest.advanceTimersByTime(400)
    
    // Now 500ms debounce should be complete
    expect(result500.current[2]).toBe('updated')
  })

  it('works with different data types', () => {
    const { result: numberResult } = renderHook(() => useDebouncedState(0, 100))
    const { result: objectResult } = renderHook(() => useDebouncedState({ count: 0 }, 100))
    const { result: arrayResult } = renderHook(() => useDebouncedState([], 100))
    
    expect(numberResult.current[0]).toBe(0)
    expect(objectResult.current[0]).toEqual({ count: 0 })
    expect(arrayResult.current[0]).toEqual([])
    
    // Test updates
    numberResult.current[1](42)
    objectResult.current[1]({ count: 5 })
    arrayResult.current[1]([1, 2, 3])
    
    jest.advanceTimersByTime(100)
    
    expect(numberResult.current[2]).toBe(42)
    expect(objectResult.current[2]).toEqual({ count: 5 })
    expect(arrayResult.current[2]).toEqual([1, 2, 3])
  })
})
