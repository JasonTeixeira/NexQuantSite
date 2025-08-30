/**
 * Dynamic imports for heavy components to reduce initial bundle size
 */

import React from 'react'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Create loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

// Heavy chart components - load dynamically
export const DynamicLineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  { 
    ssr: false,
    loading: LoadingSpinner
  }
)

export const DynamicResponsiveContainer = dynamic(
  () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
  { 
    ssr: false,
    loading: LoadingSpinner
  }
)

// Heavy motion components
export const DynamicMotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { 
    ssr: false,
    loading: () => <div />
  }
)

// Admin components - only load when needed
export const DynamicAdminDashboard = dynamic(
  () => import('@/components/admin/admin-dashboard-client'),
  { 
    ssr: false,
    loading: LoadingSpinner
  }
)

// Trading components - load dynamically for better performance
export const DynamicTradingInterface = dynamic(
  () => import('@/components/trading/live-trading-interface'),
  { 
    ssr: false,
    loading: LoadingSpinner
  }
)

// Export utility function to create dynamic imports
export const createDynamicImport = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean
  }
) => {
  return dynamic(importFn, {
    ssr: options?.ssr ?? false,
    loading: () => <LoadingSpinner />
  })
}
