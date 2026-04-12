"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { bootstrapCI, deflatedSharpe, purgedKFolds, realityCheckSPA, sharpeRatio, walkForwardWindows, metricsFromIndices, type DailyReturn } from '@/lib/validation'

export default function ValidationReport({ daily }: { daily: DailyReturn[] }) {
  if (!daily?.length) return <div className="text-xs text-[#a0a0b8]">No daily returns available.</div>
  const s = sharpeRatio(daily)
  const ci = bootstrapCI(daily, sharpeRatio)
  const ds = deflatedSharpe(s, 50, daily.length)
  const folds = purgedKFolds(daily, 5, 5)
  const spa = realityCheckSPA(daily, [s])
  const wfa = walkForwardWindows(daily)
  const foldMetrics = wfa.slice(0, 6).map(w => ({
    train: metricsFromIndices(daily, w.train),
    test: metricsFromIndices(daily, w.test),
  }))
  const avgOOSSharpe = foldMetrics.length ? foldMetrics.reduce((a,c)=>a+c.test.sharpe,0)/foldMetrics.length : 0
  const oosPassCount = foldMetrics.filter(f => f.test.sharpe >= 1.0).length
  const wfaPass = oosPassCount >= Math.ceil(foldMetrics.length * 0.6)

  const checks = [
    { name: 'Sharpe ≥ 1.5', pass: s >= 1.5 },
    { name: 'Deflated Sharpe ≥ 1.0', pass: ds >= 1.0 },
    { name: 'SPA p < 0.05', pass: spa.p < 0.05 },
    { name: 'Avg OOS Sharpe ≥ 1.0', pass: avgOOSSharpe >= 1.0 },
    { name: 'WFA: ≥60% OOS windows pass', pass: wfaPass },
  ]

  const tips: Record<string,string> = {
    'Sharpe ≥ 1.5': 'Tune parameters or reduce trading costs; consider longer lookback or better signal quality.',
    'Deflated Sharpe ≥ 1.0': 'Reduce trials or apply stricter selection; validate on unseen data; simplify model.',
    'SPA p < 0.05': 'Avoid data snooping: reduce parameter grid, use WFA/purged CV; prefer robust signals.',
    'Avg OOS Sharpe ≥ 1.0': 'Recalibrate with WFA; target regime‑stable features; regularize/clip and add risk controls.',
  }

  const summaryText = `Sharpe=${s.toFixed(2)} (CI ${ci.lo.toFixed(2)}–${ci.hi.toFixed(2)}), Deflated=${ds.toFixed(2)}, SPA p=${spa.p.toFixed(3)}, Avg OOS Sharpe=${avgOOSSharpe.toFixed(2)}. Pass: ${checks.filter(c=>c.pass).length}/${checks.length}`

  return (
    <>
    <div id="validation-report" className="grid grid-cols-1 gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {checks.map((c, i) => (
            <Badge key={i} variant={c.pass ? 'secondary' : 'outline'} className={c.pass ? 'text-green-400' : 'text-red-400'}>
              {c.pass ? 'PASS' : 'FAIL'} · {c.name}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(summaryText)}>Copy Summary</Button>
          <Button size="sm" onClick={() => {
            const el = document.getElementById('validation-report')
            if (!el) return
            const w = window.open('about:blank','report')
            if (w) {
              w.document.write(`<html><head><title>Validation Report</title><style>body{background:#0e111a;color:#e5e7eb;font-family:ui-monospace,Menlo,monospace;padding:16px}</style></head><body>${el.outerHTML}</body></html>`)
              w.document.close(); w.print(); w.close()
            }
          }}>Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card className="bg-[#15151f] border-[#2a2a3e]">
        <CardHeader><CardTitle className="text-white text-sm">Sharpe & Confidence</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <div className="flex items-center gap-3">
            <div className="text-white font-mono">{s.toFixed(2)}</div>
            <Badge variant="outline">CI: {ci.lo.toFixed(2)} — {ci.hi.toFixed(2)}</Badge>
            <Badge variant="secondary">Deflated: {ds.toFixed(2)}</Badge>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#15151f] border-[#2a2a3e]">
        <CardHeader><CardTitle className="text-white text-sm">Purged K-Folds</CardTitle></CardHeader>
        <CardContent className="text-xs text-[#a0a0b8]">
          {folds.length} folds with embargo applied
        </CardContent>
      </Card>
      <Card className="bg-[#15151f] border-[#2a2a3e]">
        <CardHeader><CardTitle className="text-white text-sm">Reality Check (SPA)</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <div className="text-[#a0a0b8]">p-value: <span className="text-white font-mono">{spa.p.toFixed(3)}</span></div>
        </CardContent>
      </Card>
      </div>
      <div className="mt-4 bg-[#15151f] border border-[#2a2a3e] rounded">
      <div className="p-3 border-b border-[#2a2a3e] text-sm text-white">Walk-Forward Analysis (first 6 windows)</div>
      <div className="p-3 overflow-auto">
        <table className="w-full text-xs">
          <thead className="text-[#a0a0b8]">
            <tr>
              <th className="text-left">Window</th>
              <th className="text-right">Train Sharpe</th>
              <th className="text-right">Test Sharpe</th>
              <th className="text-right">Test Return</th>
              <th className="text-right">Test Max DD</th>
              <th className="text-right">Pass</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {foldMetrics.map((m, i) => (
              <tr key={i} className="border-t border-[#2a2a3e]">
                <td>W{i+1}</td>
                <td className="text-right font-mono">{m.train.sharpe.toFixed(2)}</td>
                <td className="text-right font-mono">{m.test.sharpe.toFixed(2)}</td>
                <td className="text-right font-mono">{(m.test.totalReturn*100).toFixed(1)}%</td>
                <td className="text-right font-mono">{(m.test.maxDD*100).toFixed(1)}%</td>
                <td className="text-right">{m.test.sharpe >= 1.0 ? 'PASS' : 'FAIL'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 text-xs text-[#a0a0b8]">OOS windows passed: <span className="text-white font-mono">{oosPassCount}/{foldMetrics.length}</span></div>
      </div>
      </div>

      {checks.some(c=>!c.pass) && (
        <div className="mt-4 bg-[#15151f] border border-[#2a2a3e] rounded p-3">
          <div className="text-sm text-white mb-2">Remediation Tips</div>
          <ul className="list-disc pl-5 text-xs text-[#a0a0b8]">
            {checks.filter(c=>!c.pass).map((c,i)=> (
              <li key={i}><span className="text-white">{c.name}:</span> {tips[c.name]}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
    </>
  )
}


