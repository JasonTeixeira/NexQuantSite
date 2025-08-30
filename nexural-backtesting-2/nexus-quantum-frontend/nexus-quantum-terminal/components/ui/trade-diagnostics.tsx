"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Daily = { date: string; r: number }

function computeHoldingTimes(daily: Daily[]) {
  // naive model: treat positive sequences as "trades"
  const times: number[] = []
  let len = 0
  for (const d of daily) {
    if (d.r > 0) len++
    else { if (len > 0) times.push(len); len = 0 }
  }
  if (len > 0) times.push(len)
  return times
}

export default function TradeDiagnostics({ daily }: { daily: Daily[] }) {
  const times = computeHoldingTimes(daily)
  const maxT = Math.max(1, ...times)
  const buckets = Array.from({ length: Math.min(20, maxT) }, (_, i) => i + 1)
  const hist = buckets.map(b => times.filter(t => t === b).length)

  // Return vs volatility scatter (windowed)
  const window = 10
  const points: { x: number; y: number }[] = []
  for (let i = 0; i + window < daily.length; i += window) {
    const slice = daily.slice(i, i + window).map(d => d.r)
    const mean = slice.reduce((a,b)=>a+b,0)/slice.length
    const variance = slice.reduce((a,b)=>a+Math.pow(b-mean,2),0)/(slice.length-1)
    const stdev = Math.sqrt(Math.max(1e-12, variance))
    points.push({ x: stdev, y: mean })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card className="bg-[#15151f] border-[#2a2a3e]">
        <CardHeader><CardTitle className="text-white text-sm">Holding Time Distribution</CardTitle></CardHeader>
        <CardContent>
          <svg width={360} height={160}>
            {hist.map((h, i) => (
              <rect key={i} x={i * 16 + 30} y={150 - h * 6} width={12} height={h * 6} fill="#00bbff" />
            ))}
            <text x={10} y={155} fontSize="10" fill="#a0a0b8">Days</text>
          </svg>
        </CardContent>
      </Card>
      <Card className="bg-[#15151f] border-[#2a2a3e]">
        <CardHeader><CardTitle className="text-white text-sm">Return vs Volatility</CardTitle></CardHeader>
        <CardContent>
          <svg width={360} height={160}>
            {points.map((p, i) => (
              <circle key={i} cx={40 + p.x * 200} cy={120 - p.y * 400} r={3} fill="#22d3ee" />
            ))}
            <text x={10} y={155} fontSize="10" fill="#a0a0b8">Vol</text>
          </svg>
        </CardContent>
      </Card>
    </div>
  )
}


