"use client"

import { memo, Suspense } from "react"
import dynamic from "next/dynamic"
import { AdminLoadingSpinner } from "@/components/error-boundary-admin"

// Dynamically import heavy chart components for better performance
const ResponsiveContainer = dynamic(
  () => import("recharts").then(mod => ({ default: mod.ResponsiveContainer })),
  { 
    ssr: false,
    loading: () => <AdminLoadingSpinner size="sm" />
  }
)

const AreaChart = dynamic(
  () => import("recharts").then(mod => ({ default: mod.AreaChart })),
  { 
    ssr: false,
    loading: () => <AdminLoadingSpinner size="sm" />
  }
)

const Area = dynamic(
  () => import("recharts").then(mod => ({ default: mod.Area })),
  { ssr: false }
)

const BarChart = dynamic(
  () => import("recharts").then(mod => ({ default: mod.BarChart })),
  { ssr: false }
)

const Bar = dynamic(
  () => import("recharts").then(mod => ({ default: mod.Bar })),
  { ssr: false }
)

const XAxis = dynamic(
  () => import("recharts").then(mod => ({ default: mod.XAxis })),
  { ssr: false }
)

const YAxis = dynamic(
  () => import("recharts").then(mod => ({ default: mod.YAxis })),
  { ssr: false }
)

const CartesianGrid = dynamic(
  () => import("recharts").then(mod => ({ default: mod.CartesianGrid })),
  { ssr: false }
)

const Tooltip = dynamic(
  () => import("recharts").then(mod => ({ default: mod.Tooltip })),
  { ssr: false }
)

// Memoized chart components for better performance
interface OptimizedAreaChartProps {
  data: any[]
  height?: number
  dataKey: string
  stroke?: string
  fill?: string
}

export const OptimizedAreaChart = memo(function OptimizedAreaChart({ 
  data, 
  height = 300, 
  dataKey, 
  stroke = "#3b82f6", 
  fill = "#3b82f6" 
}: OptimizedAreaChartProps) {
  return (
    <Suspense fallback={<AdminLoadingSpinner />}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#f3f4f6" }}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={stroke} 
            fill={fill}
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Suspense>
  )
})

interface OptimizedBarChartProps {
  data: any[]
  height?: number
  dataKey: string
  fill?: string
}

export const OptimizedBarChart = memo(function OptimizedBarChart({ 
  data, 
  height = 300, 
  dataKey, 
  fill = "#3b82f6" 
}: OptimizedBarChartProps) {
  return (
    <Suspense fallback={<AdminLoadingSpinner />}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#f3f4f6" }}
          />
          <Bar dataKey={dataKey} fill={fill} />
        </BarChart>
      </ResponsiveContainer>
    </Suspense>
  )
})

// Multi-data area chart for complex metrics
interface OptimizedMultiAreaChartProps {
  data: any[]
  height?: number
  areas: Array<{
    dataKey: string
    stroke: string
    fill: string
  }>
}

export const OptimizedMultiAreaChart = memo(function OptimizedMultiAreaChart({ 
  data, 
  height = 300, 
  areas 
}: OptimizedMultiAreaChartProps) {
  return (
    <Suspense fallback={<AdminLoadingSpinner />}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#f3f4f6" }}
          />
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              stackId="1"
              stroke={area.stroke}
              fill={area.fill}
              fillOpacity={0.8}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Suspense>
  )
})

// Chart container with error boundary
export function ChartContainer({ 
  children, 
  title, 
  description 
}: { 
  children: React.ReactNode
  title?: string
  description?: string 
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
      )}
      <Suspense fallback={<AdminLoadingSpinner />}>
        {children}
      </Suspense>
    </div>
  )
}
