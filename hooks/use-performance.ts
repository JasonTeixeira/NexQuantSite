"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    renderStartTime.current = performance.now()
    renderCount.current += 1

    return () => {
      const renderTime = performance.now() - renderStartTime.current
      if (renderTime > 16) { // Warn if render takes longer than 16ms (60fps)
        console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`)
      }
    }
  })

  return {
    renderCount: renderCount.current,
    logPerformance: useCallback((operation: string, startTime: number) => {
      const duration = performance.now() - startTime
      if (duration > 10) {
        console.warn(`${componentName} ${operation} took ${duration.toFixed(2)}ms`)
      }
    }, [componentName])
  }
}

// Debounced state hook for expensive operations
export function useDebouncedState<T>(initialValue: T, delay: number = 300): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return [value, setValue, debouncedValue]
}

// Virtualization hook for large lists
export function useVirtualization(
  items: any[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight)
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )

    const start = Math.max(0, visibleStart - overscan)
    const end = Math.min(items.length - 1, visibleEnd + overscan)

    return { start, end }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      ...item,
      index: visibleRange.start + index,
      style: {
        position: 'absolute' as const,
        top: (visibleRange.start + index) * itemHeight,
        height: itemHeight,
        width: '100%',
      }
    }))
  }, [items, visibleRange, itemHeight])

  const totalHeight = items.length * itemHeight

  return {
    visibleItems,
    totalHeight,
    setScrollTop,
    visibleRange,
  }
}

// Memory cleanup hook
export function useMemoryCleanup(dependencies: any[] = []) {
  const cleanupFunctions = useRef<(() => void)[]>([])

  const addCleanup = useCallback((fn: () => void) => {
    cleanupFunctions.current.push(fn)
  }, [])

  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(fn => {
        try {
          fn()
        } catch (error) {
          console.warn('Cleanup function failed:', error)
        }
      })
      cleanupFunctions.current = []
    }
  }, dependencies)

  return { addCleanup }
}

// Optimized chart data hook
export function useOptimizedChartData<T>(
  data: T[],
  maxPoints: number = 1000,
  keyExtractor: (item: T) => number = (item: any) => item.timestamp || item.date
) {
  return useMemo(() => {
    if (data.length <= maxPoints) return data

    // Use sampling for large datasets
    const step = Math.ceil(data.length / maxPoints)
    const sampled = []
    
    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i])
    }

    // Always include the last point
    if (sampled[sampled.length - 1] !== data[data.length - 1]) {
      sampled.push(data[data.length - 1])
    }

    return sampled
  }, [data, maxPoints, keyExtractor])
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    })

    observer.observe(target)

    return () => observer.disconnect()
  }, [hasIntersected, options])

  return { targetRef, isIntersecting, hasIntersected }
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const now = Date.now()
    const timeSinceLastRan = now - lastRan.current

    if (timeSinceLastRan >= delay) {
      callback(...args)
      lastRan.current = now
    } else {
      timeoutRef.current = setTimeout(() => {
        callback(...args)
        lastRan.current = Date.now()
      }, delay - timeSinceLastRan)
    }
  }, [callback, delay]) as T
}
