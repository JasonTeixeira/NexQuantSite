"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DailyReturn } from '@/lib/validation'
import { regressExposures } from '@/lib/factors'

export default function Attribution({ daily }: { daily: DailyReturn[] }) {
  const { exposures, contributions, alpha } = regressExposures(daily)
  const bars = [
    { name: 'Alpha', v: contributions.alpha },
    { name: 'MKT', v: contributions.MKT },
    { name: 'SMB', v: contributions.SMB },
    { name: 'HML', v: contributions.HML },
  ]
  const maxAbs = Math.max(...bars.map(b => Math.abs(b.v)), 1e-6)
  return (
    <Card className="bg-[#15151f] border-[#2a2a3e]">
      <CardHeader><CardTitle className="text-white text-sm">Factor Exposures & Attribution</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-xs text-[#a0a0b8]">
            <div>Exposures</div>
            <div className="mt-1">MKT: <span className="text-white font-mono">{exposures.MKT.toFixed(2)}</span></div>
            <div>SMB: <span className="text-white font-mono">{exposures.SMB.toFixed(2)}</span></div>
            <div>HML: <span className="text-white font-mono">{exposures.HML.toFixed(2)}</span></div>
          </div>
          <div>
            {bars.map((b,i)=> (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-10 text-[#a0a0b8]">{b.name}</div>
                <div className="flex-1 h-2 bg-[#1f2937] rounded relative">
                  <div className="h-2 rounded" style={{ width: `${Math.abs(b.v)/maxAbs*100}%`, background: b.v>=0?'#22c55e':'#ef4444', transform: b.v<0? 'translateX(100%) scaleX(-1)':'none' }} />
                </div>
                <div className="w-16 text-right text-white font-mono">{(b.v*100).toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


