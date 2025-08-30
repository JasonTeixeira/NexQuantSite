"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface AllocationData {
  name: string
  value: number
  color: string
}

interface PortfolioAllocationProps {
  data: AllocationData[]
  selectedBotName?: string
}

export default function PortfolioAllocation({ data, selectedBotName }: PortfolioAllocationProps) {
  const formatPercent = (value: number) => `${value.toFixed(0)}%`

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-black border border-primary/30 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-primary text-sm">{formatPercent(data.value)}</p>
        </div>
      )
    }
    return null
  }

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card className="bg-black border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
      <CardHeader>
        <CardTitle className="text-white font-bold text-xl">
          PORTFOLIO <span className="text-primary">ALLOCATION</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => {
                  const isSelected = entry.name === `${selectedBotName} Bot`
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={selectedBotName ? (isSelected ? 1 : 0.3) : 1}
                      className="transition-opacity"
                    />
                  )
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300 text-sm font-mono">{item.name}</span>
              </div>
              <span className="text-white font-medium text-sm">{formatPercent(item.value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
