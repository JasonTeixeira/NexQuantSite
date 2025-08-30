"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ExecutionDiagnostics({ exec }: { exec?: { venue?: string; slippageBps: number; impactBps: number; latencyMs: number; partialFillRate: number } }) {
  if (!exec) return null
  const rows = [
    { k: 'Venue', v: exec.venue || '—' },
    { k: 'Slippage (bps)', v: exec.slippageBps.toFixed(2) },
    { k: 'Impact (bps)', v: exec.impactBps.toFixed(2) },
    { k: 'Latency (ms)', v: exec.latencyMs },
    { k: 'Partial Fill Rate', v: `${(exec.partialFillRate*100).toFixed(0)}%` },
  ]
  return (
    <Card className="bg-[#15151f] border-[#2a2a3e]">
      <CardHeader><CardTitle className="text-white text-sm">Execution Diagnostics</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between border-b border-[#2a2a3e]/50 py-1">
              <span className="text-[#a0a0b8]">{r.k}</span>
              <span className="text-white font-mono">{r.v}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


