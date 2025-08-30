import type React from "react"
;("use client")

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DashboardStatsData } from "@/lib/dashboard-data"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
const formatPercentage = (value: number) => `${value.toFixed(2)}%`

const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  valueColor,
}: {
  icon: React.ElementType
  label: string
  value: string
  change?: string
  changeType?: "positive" | "negative"
  valueColor?: string
}) => (
  <Card className="bg-black/40 border border-primary/10 p-4 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">{label}</p>
      <Icon className="text-primary/70" size={20} />
    </div>
    <p className={cn("text-3xl font-bold font-mono tracking-tighter", valueColor)}>{value}</p>
    {change && (
      <div
        className={cn("flex items-center text-xs mt-1", changeType === "positive" ? "text-primary" : "text-red-500")}
      >
        {changeType === "positive" ? (
          <TrendingUp size={14} className="mr-1" />
        ) : (
          <TrendingDown size={14} className="mr-1" />
        )}
        <span>{change} vs prev. period</span>
      </div>
    )}
  </Card>
)

export default function DashboardStats({ data }: { data: DashboardStatsData }) {
  const pnlColor = data.totalPnL.value >= 0 ? "text-primary" : "text-red-500"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={DollarSign}
        label="Total P&L"
        value={formatCurrency(data.totalPnL.value)}
        change={`${data.totalPnL.change >= 0 ? "+" : ""}${formatPercentage(data.totalPnL.change)}`}
        changeType={data.totalPnL.change >= 0 ? "positive" : "negative"}
        valueColor={pnlColor}
      />
      <StatCard
        icon={Percent}
        label="Win Rate"
        value={formatPercentage(data.winRate.value)}
        change={`${data.winRate.change >= 0 ? "+" : ""}${formatPercentage(data.winRate.change)}`}
        changeType={data.winRate.change >= 0 ? "positive" : "negative"}
        valueColor="text-white"
      />
      <StatCard
        icon={BarChart}
        label="Total Trades"
        value={data.totalTrades.value.toString()}
        change={`${data.totalTrades.change >= 0 ? "+" : ""}${data.totalTrades.change.toString()} trades`}
        changeType={data.totalTrades.change >= 0 ? "positive" : "negative"}
        valueColor="text-white"
      />
      <StatCard
        icon={CheckCircle}
        label="Avg. Return / Trade"
        value={formatPercentage(data.avgReturn.value)}
        change={`${data.avgReturn.change >= 0 ? "+" : ""}${formatPercentage(data.avgReturn.change)}`}
        changeType={data.avgReturn.change >= 0 ? "positive" : "negative"}
        valueColor={data.avgReturn.value >= 0 ? "text-primary" : "text-red-500"}
      />
    </div>
  )
}
