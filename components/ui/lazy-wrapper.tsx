import React, { Suspense, type ComponentType } from "react"
import { Skeleton } from "./loading-skeleton"
import { ErrorBoundary } from "./error-boundary"

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <Skeleton className="h-96 w-full" />,
  errorFallback,
}) => (
  <ErrorBoundary fallback={errorFallback}>
    <Suspense fallback={fallback}>{children}</Suspense>
  </ErrorBoundary>
)

export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode,
) {
  const LazyComponent = React.lazy(importFn)

  return (props: P) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  )
}

export const LazyPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LazyWrapper
    fallback={
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-[300px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          ))}
        </div>
      </div>
    }
  >
    {children}
  </LazyWrapper>
)

export const LazyDashboardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LazyWrapper
    fallback={
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    }
  >
    {children}
  </LazyWrapper>
)
