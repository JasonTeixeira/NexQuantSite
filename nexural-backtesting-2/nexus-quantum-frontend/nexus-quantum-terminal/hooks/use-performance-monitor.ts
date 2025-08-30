import { useCallback, useState, useEffect } from 'react'

export function usePerformanceMonitor(componentName: string) {
  const logPerformance = useCallback((event: string, startTime: number) => {
    const duration = performance.now() - startTime
    console.log(`[${componentName}] ${event}: ${duration.toFixed(2)}ms`)
  }, [componentName])

  return { logPerformance }
}

export function useMemoryCleanup() {
  const cleanupFunctions = new Set<() => void>()

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.add(cleanup)
  }, [])

  const cleanup = useCallback(() => {
    cleanupFunctions.forEach(fn => fn())
    cleanupFunctions.clear()
  }, [])

  return { addCleanup, cleanup }
}

export function useDebouncedState<T>(initialValue: T, delay: number): [T, (value: T) => void, T] {
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return [value, setValue, debouncedValue]
}
