"use client"

import type React from "react"
import { memo, useMemo, useCallback, useState, type ReactNode } from "react"
import { useComponentPerformance } from "@/lib/performance/performance-monitor"

interface OptimizedComponentProps {
  children: ReactNode
  name: string
  dependencies?: any[]
  className?: string
}

export const OptimizedComponent = memo<OptimizedComponentProps>(({ children, name, dependencies = [], className }) => {
  useComponentPerformance(name)

  const memoizedChildren = useMemo(() => children, dependencies)

  return <div className={className}>{memoizedChildren}</div>
})

OptimizedComponent.displayName = "OptimizedComponent"

export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  dependencies?: (keyof P)[],
) {
  const OptimizedWrapper = memo<P>((props) => {
    useComponentPerformance(componentName)

    const memoizedProps = useMemo(
      () => {
        if (!dependencies) return props

        const relevantProps: Partial<P> = {}
        dependencies.forEach((key) => {
          relevantProps[key] = props[key]
        })
        return relevantProps as P
      },
      dependencies ? dependencies.map((key) => props[key]) : [props],
    )

    return <Component {...(dependencies ? memoizedProps : props)} />
  })

  OptimizedWrapper.displayName = `withPerformanceOptimization(${componentName})`
  return OptimizedWrapper
}

export function useOptimizedCallback<T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): T {
  return useCallback(callback, deps)
}

export function useOptimizedMemo<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps)
}

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight), items.length - 1)

  const startIndex = Math.max(0, visibleStart - overscan)
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan)

  const visibleItems = useMemo(() => items.slice(startIndex, endIndex + 1), [items, startIndex, endIndex])

  const handleScroll = useOptimizedCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div style={{ height: containerHeight, overflow: "auto" }} onScroll={handleScroll}>
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
