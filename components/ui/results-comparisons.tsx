"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { loadArtifacts } from '@/lib/artifacts'
import SensitivityHeatmap from './sensitivity-heatmap'
import StabilityTiles from './stability-tiles'
import TradeDiagnostics from './trade-diagnostics'
import ExecutionDiagnostics from './execution-diagnostics'
import LineageGraph from './lineage-graph'
import Attribution from './attribution'

interface RunRef { id: string; hash: string; sharpe: number; totalReturn: number; maxDrawdown: number }

export default function ResultsComparisons() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const artifacts = useMemo(() => loadArtifacts(), [])
  const runs = useMemo(() => {
    return artifacts.map(a => ({
      id: a.id,
      hash: a.configHash,
      sharpe: a.results?.sharpe ?? 0,
      totalReturn: a.results?.totalReturn ?? 0,
      maxDrawdown: a.results?.maxDrawdown ?? 0,
    })) as RunRef[]
  }, [artifacts])

  const picked = runs.filter(r => selected.includes(r.id))
  const deltas = useMemo(() => {
    if (picked.length < 2) return null
    const [a, b] = picked
    return {
      sharpe: (b.sharpe - a.sharpe).toFixed(2),
      totalReturn: ((b.totalReturn - a.totalReturn) * 100).toFixed(2) + '%',
      maxDrawdown: ((b.maxDrawdown - a.maxDrawdown) * 100).toFixed(2) + '%',
    }
  }, [picked])

  const summary = useMemo(() => {
    if (runs.length === 0) return null
    const best = [...runs].sort((a,b)=>b.sharpe-a.sharpe)[0]
    const avgSharpe = runs.reduce((a,r)=>a+r.sharpe,0)/runs.length
    return { best, avgSharpe }
  }, [runs])

  // Deep-linking: initialize selection from query param `compare`
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('compare')
    if (!raw) return
    const ids = raw.split(',').filter(Boolean)
    if (ids.length === 0) return
    const valid = ids.filter(id => artifacts.some(a => a.id === id)).slice(0, 8)
    if (valid.length) setSelected(valid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifacts.length])

  // Keep URL in sync when selection changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (selected.length) params.set('compare', selected.join(','))
    else params.delete('compare')
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }, [selected, router])

  // Welch's t-test (approx) for daily return means
  function mean(arr: number[]) { return arr.reduce((a,b)=>a+b,0)/Math.max(1,arr.length) }
  function variance(arr: number[], m: number) { return arr.reduce((a,b)=>a+Math.pow(b-m,2),0)/Math.max(1,arr.length-1) }
  function erf(x: number) {
    // Abramowitz-Stegun approximation
    const sign = x < 0 ? -1 : 1
    x = Math.abs(x)
    const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911
    const t = 1/(1+p*x)
    const y = 1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x)
    return sign*y
  }
  function normal2TailP(z: number) { return 2*(1- (0.5*(1+erf(Math.abs(z)/Math.SQRT2)))) }
  const significance = useMemo(() => {
    if (picked.length < 2) return null
    const [aId, bId] = selected
    const A = artifacts.find(x=>x.id===aId)
    const B = artifacts.find(x=>x.id===bId)
    const aR = (A?.results?.dailyReturns as {r:number}[]|undefined)?.map(d=>d.r) || []
    const bR = (B?.results?.dailyReturns as {r:number}[]|undefined)?.map(d=>d.r) || []
    if (aR.length<10 || bR.length<10) return null
    const ma = mean(aR), mb = mean(bR)
    const va = variance(aR, ma), vb = variance(bR, mb)
    const t = (mb - ma) / Math.sqrt(va/aR.length + vb/bR.length)
    // approx with normal
    const p = normal2TailP(t)
    const stars = p<=0.01?'***':p<=0.05?'**':p<=0.1?'*':'ns'
    return { p, stars }
  }, [selected, picked, artifacts])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Results & Comparisons</h2>
        <div className="text-xs text-[#a0a0b8] flex items-center gap-2">
          <span>Select 2 runs to compare</span>
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(window.location.href) }}>Copy Link</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {runs.map(r => (
          <Card key={r.id} className={`bg-[#15151f] border ${selected.includes(r.id) ? 'border-[#00bbff] bg-[#00bbff]/10' : 'border-[#2a2a3e]'}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#a0a0b8]">Hash</div>
                <Badge variant="outline">{r.hash}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <div>
                  <div className="text-[#a0a0b8]">Sharpe</div>
                  <div className="text-white font-mono">{r.sharpe.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[#a0a0b8]">Return</div>
                  <div className="text-white font-mono">{(r.totalReturn*100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[#a0a0b8]">Max DD</div>
                  <div className="text-white font-mono">{(r.maxDrawdown*100).toFixed(1)}%</div>
                </div>
              </div>
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => setSelected((s) => s.includes(r.id) ? s.filter(x=>x!==r.id) : s.length>=8 ? [...s.slice(1), r.id] : [...s, r.id])}>
                  {selected.includes(r.id) ? 'Unselect' : 'Select'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {summary && (
        <Card className="bg-[#15151f] border-[#2a2a3e]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Compare Summary</CardTitle>
            <div className="text-xs text-[#a0a0b8]">Avg Sharpe {summary.avgSharpe.toFixed(2)}</div>
          </CardHeader>
          <CardContent className="text-xs text-[#a0a0b8] flex items-center justify-between">
            <span>Best run: <span className="text-white font-mono">{summary.best.hash}</span> · Sharpe {summary.best.sharpe.toFixed(2)} · Return {(summary.best.totalReturn*100).toFixed(1)}% · MaxDD {(summary.best.maxDrawdown*100).toFixed(1)}%</span>
            <Button size="sm" variant="outline" onClick={() => {
              const rows = runs.map(r => ({ hash: r.hash, sharpe: r.sharpe, totalReturn: r.totalReturn, maxDrawdown: r.maxDrawdown }))
              const header = 'hash,sharpe,totalReturn,maxDrawdown\n'
              const csv = header + rows.map(r => `${r.hash},${r.sharpe},${r.totalReturn},${r.maxDrawdown}`).join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = 'compare.csv'; a.click(); URL.revokeObjectURL(url)
            }}>Export CSV</Button>
          </CardContent>
        </Card>
      )}

      {deltas && (
        <Card className="bg-[#0f1320] border-[#2a2a3e]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Delta (B - A)</CardTitle>
            <div className="text-xs text-[#a0a0b8]">{selected.slice(0,2).join(' vs ')}</div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-[#a0a0b8]">Sharpe Δ: <span className="text-white font-mono">{deltas.sharpe}</span></div>
              <div className="text-[#a0a0b8]">Return Δ: <span className="text-white font-mono">{deltas.totalReturn}</span></div>
              <div className="text-[#a0a0b8]">Max DD Δ: <span className="text-white font-mono">{deltas.maxDrawdown}</span></div>
            </div>
            {significance && (
              <div className="mt-2 text-xs text-[#a0a0b8]">Significance: <span className="text-white font-mono">{significance.stars}</span> (p={significance.p.toFixed(3)})</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calendar returns (mocked from dailyReturns if present) */}
      <Card className="bg-[#15151f] border-[#2a2a3e]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Calendar Returns</CardTitle>
          <Button size="sm" variant="outline" onClick={() => {
            const el = document.getElementById('calendar')
            if (!el) return
            const w = window.open('about:blank', 'export')
            if (w) { w.document.write(el.outerHTML); w.document.close(); w.print(); w.close() }
          }}>Export</Button>
        </CardHeader>
        <CardContent>
          {(() => {
            const latest = artifacts[0]
            const dr = latest?.results?.dailyReturns as { date: string; r: number }[] | undefined
            if (!dr || dr.length === 0) return <div className="text-xs text-[#a0a0b8]">Run a backtest to populate daily returns.</div>
            const byMonth = new Map<string, number>()
            for (const d of dr) {
              const m = d.date.slice(0,7)
              byMonth.set(m, (byMonth.get(m) || 0) + d.r)
            }
            const months = Array.from(byMonth.entries()).slice(-12)
            return (
              <div id="calendar" className="grid grid-cols-12 gap-1">
                {months.map(([m,v]) => (
                  <div key={m} title={`${m}: ${(v*100).toFixed(2)}%`} className="h-10 rounded" style={{ background: v>=0 ? '#153e2a' : '#3e1a1a', border: '1px solid #2a2a3e' }}></div>
                ))}
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Stability tiles and trade diagnostics for latest run */}
      <Card className="bg-[#15151f] border-[#2a2a3e]">
        <CardHeader>
          <CardTitle className="text-white">Stability & Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const latest = artifacts[0]
            const dr = latest?.results?.dailyReturns as { date: string; r: number }[] | undefined
            if (!dr || dr.length === 0) return <div className="text-xs text-[#a0a0b8]">Run a backtest to populate diagnostics.</div>
            return (
              <div className="space-y-4">
                <LineageGraph run={latest as any} />
                <StabilityTiles daily={dr} />
                <TradeDiagnostics daily={dr} />
                <ExecutionDiagnostics exec={latest?.results?.execution} />
                <Attribution daily={dr as any} />
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Sensitivity heatmap (built from sweep artifacts when available) */}
      <Card className="bg-[#15151f] border-[#2a2a3e]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Parameter Sensitivity</CardTitle>
          <Button size="sm" variant="outline" onClick={() => {
            const el = document.getElementById('heatmap')
            if (!el) return
            const w = window.open('about:blank', 'export')
            if (w) { w.document.write(el.outerHTML); w.document.close(); w.print(); w.close() }
          }}>Export</Button>
        </CardHeader>
        <CardContent>
          {(() => {
            // Infer sweeps by scanning artifacts for lookback/rebalanceDays combos
            const cells: { x: number|string; y: number|string; value: number }[] = []
            for (const a of artifacts) {
              const p = a.config?.params || {}
              if (p.lookback != null && p.rebalanceDays != null && a.results?.sharpe != null) {
                cells.push({ x: p.lookback, y: p.rebalanceDays, value: a.results.sharpe })
              }
            }
            if (cells.length === 0) {
              return <div className="text-xs text-[#a0a0b8]">Run a sweep in Backtest Wizard to populate the heatmap.</div>
            }
            return (
              <SensitivityHeatmap id="heatmap" xLabel="Lookback" yLabel="Rebalance Days" metricLabel="Sharpe" data={cells} />
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}


