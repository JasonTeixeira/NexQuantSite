"use client"

import React, { memo, useMemo, Suspense } from 'react'
import { ResponsiveContainer } from 'recharts'
import { useIntersectionObserver, useOptimizedChartData } from '@/hooks/use-performance'

interface OptimizedChartProps {
  children: React.ReactNode
  data?: any[]
  maxDataPoints?: number
  height?: number | string
  width?: number | string
  className?: string
  loading?: boolean
}

// Lazy loading wrapper for charts
const LazyChartContainer = memo(({ 
  children, 
  height = 300, 
  width = "100%",
  className = ""
}: {
  children: React.ReactNode
  height?: number | string
  width?: number | string
  className?: string
}) => {
  return (
    <div className={`relative ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        {children as any}
      </ResponsiveContainer>
    </div>
  )
})

LazyChartContainer.displayName = 'LazyChartContainer'

// Chart loading skeleton
const ChartSkeleton = memo(({ height }: { height: number | string }) => (
  <div 
    className="animate-pulse bg-[#1a1a25] rounded-lg flex items-center justify-center"
    style={{ height: typeof height === 'number' ? `${height}px` : height }}
  >
    <div className="text-[#a0a0b8] text-sm">Loading chart...</div>
  </div>
))

ChartSkeleton.displayName = 'ChartSkeleton'

// Main optimized chart component
export const OptimizedChart = memo<OptimizedChartProps>(({
  children,
  data,
  maxDataPoints = 1000,
  height = 300,
  width = "100%",
  className = "",
  loading = false
}) => {
  const { targetRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  })

  // Optimize data for large datasets
  const optimizedData = useOptimizedChartData(data || [], maxDataPoints)

  // Clone children with optimized data
  const optimizedChildren = useMemo(() => {
    if (!data || !React.isValidElement(children)) return children

    return React.cloneElement(children as React.ReactElement, {
      data: optimizedData
    } as any)
  }, [children, optimizedData, data])

  if (loading) {
    return <ChartSkeleton height={height} />
  }

  return (
    <div ref={targetRef as any} className={`w-full ${className}`}>
      {hasIntersected ? (
        <Suspense fallback={<ChartSkeleton height={height} />}>
          <LazyChartContainer height={height} width={width} className={className}>
            {optimizedChildren}
          </LazyChartContainer>
        </Suspense>
      ) : (
        <ChartSkeleton height={height} />
      )}
    </div>
  )
})

OptimizedChart.displayName = 'OptimizedChart'

// HOC for chart optimization
export function withChartOptimization<P extends object>(
  Component: React.ComponentType<P>,
  defaultMaxPoints: number = 1000
) {
  const OptimizedComponent = memo((props: P & { 
    data?: any[]
    maxDataPoints?: number 
  }) => {
    const { data, maxDataPoints = defaultMaxPoints, ...rest } = props
    const optimizedData = useOptimizedChartData(data || [], maxDataPoints)

    return <Component {...(rest as P)} data={optimizedData} />
  })

  OptimizedComponent.displayName = `withChartOptimization(${Component.displayName || Component.name})`
  
  return OptimizedComponent
}

// Virtualized table component for large datasets
interface VirtualizedTableProps {
  data: any[]
  columns: Array<{
    key: string
    header: string
    render?: (value: any, row: any) => React.ReactNode
  }>
  rowHeight?: number
  containerHeight?: number
  className?: string
}

export const VirtualizedTable = memo<VirtualizedTableProps>(({
  data,
  columns,
  rowHeight = 40,
  containerHeight = 400,
  className = ""
}) => {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / rowHeight)
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / rowHeight),
      data.length - 1
    )

    const start = Math.max(0, visibleStart - 5) // 5 item overscan
    const end = Math.min(data.length - 1, visibleEnd + 5)

    return { start, end }
  }, [scrollTop, rowHeight, containerHeight, data.length])

  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end + 1)
  }, [data, visibleRange])

  const totalHeight = data.length * rowHeight

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex bg-[#1a1a25] border-b border-[#2a2a3e] sticky top-0 z-10">
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex-1 px-4 py-2 text-sm font-medium text-[#a0a0b8]"
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Scrollable content */}
      <div
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((row, index) => (
            <div
              key={visibleRange.start + index}
              className="flex border-b border-[#2a2a3e]/50 hover:bg-[#1f1f2a] transition-colors absolute w-full"
              style={{
                top: (visibleRange.start + index) * rowHeight,
                height: rowHeight,
              }}
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="flex-1 px-4 py-2 text-sm text-white flex items-center"
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

VirtualizedTable.displayName = 'VirtualizedTable'
