"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Daily = { date: string; r: number }

function chunkIS_OOS(data: Daily[], split = 0.7) {
  const n = data.length
  const cut = Math.max(1, Math.floor(n * split))
  return { is: data.slice(0, cut), oos: data.slice(cut) }
}

function stats(series: Daily[]) {
  if (series.length === 0) return { sharpe: 0, totalReturn: 0, maxDD: 0 }
  const rs = series.map(d => d.r)
  const mean = rs.reduce((a, b) => a + b, 0) / rs.length
  const variance = rs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, rs.length - 1)
  const stdev = Math.sqrt(variance)
  const sharpe = stdev === 0 ? 0 : (mean * Math.sqrt(252)) / stdev
  let peak = 1
  let equity = 1
  let maxDD = 0
  for (const r of rs) {
    equity *= 1 + r
    peak = Math.max(peak, equity)
    maxDD = Math.min(maxDD, (equity - peak) / peak)
  }
  const totalReturn = equity - 1
  return { sharpe, totalReturn, maxDD }
}

export default function StabilityTiles({ daily }: { daily: Daily[] }) {
  const { is, oos } = chunkIS_OOS(daily)
  const a = stats(is)
  const b = stats(oos)

  const tiles = [
    { label: 'In-Sample', s: a },
    { label: 'Out-of-Sample', s: b },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {tiles.map((t) => (
        <Card key={t.label} className="bg-[#15151f] border-[#2a2a3e]">
          <CardHeader>
            <CardTitle className="text-white text-sm">{t.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-[#a0a0b8]">Sharpe</div>
                <div className="text-white font-mono">{t.s.sharpe.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[#a0a0b8]">Return</div>
                <div className="text-white font-mono">{(t.s.totalReturn * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[#a0a0b8]">Max DD</div>
                <div className="text-white font-mono">{(t.s.maxDD * 100).toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


