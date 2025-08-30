"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useOptimizedChartData } from '@/hooks/use-performance'
import StabilityTiles from '@/components/ui/stability-tiles'
import TradeDiagnostics from '@/components/ui/trade-diagnostics'
import ExecutionDiagnostics from '@/components/ui/execution-diagnostics'
import LineageGraph from '@/components/ui/lineage-graph'
import Attribution from '@/components/ui/attribution'
import ValidationReport from '@/components/ui/validation-report'
import { toPng } from 'html-to-image'
import { Download, ExternalLink, Copy, FileText, Image, FileSpreadsheet } from 'lucide-react'
import { Artifact } from '@/lib/artifacts'

async function fetchRun(id: string, token?: string): Promise<Artifact | null> {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/artifacts/${id}`, window.location.origin)
    if (token) url.searchParams.set('token', token)
    const res = await fetch(url.toString())
    if (!res.ok) {
      console.error(`Failed to fetch artifact ${id}:`, res.status, res.statusText)
      return null
    }
    return res.json()
  } catch (error) {
    console.error(`Error fetching artifact ${id}:`, error)
    return null
  }
}

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const [run, setRun] = useState<Artifact | null>(null)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    params.then(resolved => {
      setResolvedParams(resolved)
      const t = new URLSearchParams(window.location.search).get('token') || undefined
      // Audit view event
      try {
        fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evt: 'share_view', id: resolved.id, tokenPresent: !!t }) })
      } catch {}
      fetchRun(resolved.id, t).then(r => {
        setRun(r)
        setLoading(false)
      })
    })
  }, [params])

  if (loading) return (
    <div className="p-6 bg-[#0a0a0f] text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#15151f] rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-[#15151f] rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-[#15151f] rounded"></div>
        </div>
      </div>
    </div>
  )

  if (!run) return (
    <div className="p-6 bg-[#0a0a0f] text-white min-h-screen">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Run Not Found</h1>
        <p className="text-[#a0a0b8]">The requested backtest run could not be found.</p>
      </div>
    </div>
  )

  const exportToPng = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId)
    if (!element) return
    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#0a0a0f',
        pixelRatio: 2
      })
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to export PNG:', error)
    }
  }

  const exportToCsv = (data: any[], filename: string) => {
    if (!data.length) return
    const header = Object.keys(data[0]).join(',') + '\n'
    const csv = header + data.map(row => Object.values(row).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToPdf = () => {
    window.print()
  }

  const copyShareLink = async () => {
    const token = run.meta?.visibility === 'token' ? run.meta.shareToken : undefined
    const url = `${window.location.origin}/share/${run.id}${token ? `?token=${token}` : ''}`
    await navigator.clipboard.writeText(url)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const dailyReturnsRaw = run.results?.dailyReturns as { date: string; r: number }[] | undefined
  const equityCurveRaw = run.results?.equityCurve as { date: string; equity: number }[] | undefined
  const drawdownCurveRaw = run.results?.drawdownCurve as { date: string; drawdown: number }[] | undefined

  const dailyReturns = dailyReturnsRaw ? useOptimizedChartData(dailyReturnsRaw, 1000, (d:any)=> new Date(d.date).getTime()) : undefined
  const equityCurve = equityCurveRaw ? useOptimizedChartData(equityCurveRaw, 1500, (d:any)=> new Date(d.date).getTime()) : undefined
  const drawdownCurve = drawdownCurveRaw ? useOptimizedChartData(drawdownCurveRaw, 1500, (d:any)=> new Date(d.date).getTime()) : undefined

  // Generate calendar returns heatmap data
  const calendarData = dailyReturns ? (() => {
    const monthlyReturns = new Map<string, number>()
    for (const d of dailyReturns) {
      const month = d.date.slice(0, 7) // YYYY-MM
      monthlyReturns.set(month, (monthlyReturns.get(month) || 0) + d.r)
    }
    return Array.from(monthlyReturns.entries()).slice(-12).map(([month, ret]) => ({
      month,
      return: ret * 100,
      color: ret >= 0 ? `rgba(34, 197, 94, ${Math.min(Math.abs(ret) * 10, 1)})` : `rgba(239, 68, 68, ${Math.min(Math.abs(ret) * 10, 1)})`
    }))
  })() : []

  return (
    <div className="bg-[#0a0a0f] text-white font-mono min-h-screen">
      <div id="share-report-container" className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00bbff] to-[#4a4aff] bg-clip-text text-transparent">
              NexusQuant Strategy Report
            </h1>
            <p className="text-[#a0a0b8] mt-2">Professional Backtest Analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={copyShareLink} variant="outline" size="sm">
              {copySuccess ? <span className="text-green-400">Copied!</span> : <><Copy className="w-4 h-4 mr-2" />Copy Link</>}
            </Button>
            <Button onClick={() => { fetch('/api/audit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({evt:'export_png',id:run.id,part:'full'})}).catch(()=>{}); exportToPng('share-report-container', `nexus-report-${run.id}.png`) }} variant="outline" size="sm">
              <Image className="w-4 h-4 mr-2" />PNG
            </Button>
            <Button onClick={() => { fetch('/api/audit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({evt:'export_csv',id:run.id,part:'dailyReturns'})}).catch(()=>{}); exportToCsv(dailyReturns || [], `nexus-data-${run.id}.csv`) }} variant="outline" size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-2" />CSV
            </Button>
            <Button onClick={() => { fetch('/api/audit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({evt:'export_pdf',id:run.id})}).catch(()=>{}); exportToPdf() }} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />PDF
            </Button>
          </div>
        </div>

        {/* Run Details */}
        <Card className="bg-[#15151f] border-[#2a2a3e]">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Strategy Details</span>
              <Badge variant="outline" className="font-mono">{run.configHash}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-[#a0a0b8]">Strategy</div>
                <div className="text-white font-semibold">{run.config?.strategy || 'Custom Strategy'}</div>
              </div>
              <div>
                <div className="text-[#a0a0b8]">Universe</div>
                <div className="text-white">{run.config?.universe || 'Multi-Asset'}</div>
              </div>
              <div>
                <div className="text-[#a0a0b8]">Period</div>
                <div className="text-white">{run.config?.startDate} to {run.config?.endDate}</div>
              </div>
              <div>
                <div className="text-[#a0a0b8]">Run ID</div>
                <div className="text-white font-mono text-xs">{run.id}</div>
              </div>
            </div>
            {run.meta?.parentHash && (
              <div className="pt-2 border-t border-[#2a2a3e]">
                <span className="text-[#a0a0b8] text-sm">Parent Run: </span>
                <a 
                  href={`/share/${run.meta.parentHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#00bbff] hover:underline font-mono text-sm"
                >
                  {run.meta.parentHash} <ExternalLink className="w-3 h-3 inline ml-1" />
                </a>
              </div>
            )}
            {run.meta?.notes && (
              <div className="pt-2 border-t border-[#2a2a3e]">
                <div className="text-[#a0a0b8] text-sm">Notes</div>
                <div className="text-white text-sm mt-1">{run.meta.notes}</div>
              </div>
            )}
            {run.meta?.tags && run.meta.tags.length > 0 && (
              <div className="pt-2 border-t border-[#2a2a3e]">
                <div className="text-[#a0a0b8] text-sm mb-2">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {run.meta.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Performance Indicators */}
        <Card className="bg-[#15151f] border-[#2a2a3e]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Key Performance Indicators</CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => exportToCsv([{
                totalReturn: (run.results?.totalReturn || 0) * 100,
                sharpeRatio: run.results?.sharpe || 0,
                maxDrawdown: (run.results?.maxDrawdown || 0) * 100,
                trades: run.results?.trades || 0,
                turnover: run.results?.turnover || 0
              }], `kpis-${run.id}.csv`)}
            >
              <Download className="w-4 h-4 mr-2" />Export KPIs
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-[#a0a0b8] text-sm mb-1">Total Return</div>
                <div className="text-3xl font-bold text-green-400">
                  {((run.results?.totalReturn || 0) * 100).toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-[#a0a0b8] text-sm mb-1">Sharpe Ratio</div>
                <div className="text-3xl font-bold text-[#00bbff]">
                  {(run.results?.sharpe || 0).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[#a0a0b8] text-sm mb-1">Max Drawdown</div>
                <div className="text-3xl font-bold text-red-400">
                  {((run.results?.maxDrawdown || 0) * 100).toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-[#a0a0b8] text-sm mb-1">Total Trades</div>
                <div className="text-3xl font-bold text-white">
                  {run.results?.trades || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[#a0a0b8] text-sm mb-1">Turnover</div>
                <div className="text-3xl font-bold text-white">
                  {(run.results?.turnover || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equity Curve */}
        {equityCurve && equityCurve.length > 0 && (
          <Card className="bg-[#15151f] border-[#2a2a3e]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Equity Curve</CardTitle>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => exportToPng('equity-chart', `equity-curve-${run.id}.png`)}
              >
                <Download className="w-4 h-4 mr-2" />Export Chart
              </Button>
            </CardHeader>
            <CardContent>
              <div id="equity-chart" style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#a0a0b8" 
                      tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString()}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#a0a0b8" 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a25', 
                        border: '1px solid #2a2a3e', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      labelFormatter={(dateStr) => new Date(dateStr).toLocaleDateString()}
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Equity']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="equity" 
                      stroke="#00bbff" 
                      strokeWidth={3} 
                      dot={false}
                      strokeLinecap="round"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Drawdown Curve */}
        {drawdownCurve && drawdownCurve.length > 0 && (
          <Card className="bg-[#15151f] border-[#2a2a3e]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Drawdown Analysis</CardTitle>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => exportToPng('drawdown-chart', `drawdown-${run.id}.png`)}
              >
                <Download className="w-4 h-4 mr-2" />Export Chart
              </Button>
            </CardHeader>
            <CardContent>
              <div id="drawdown-chart" style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={drawdownCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#a0a0b8" 
                      tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString()}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#a0a0b8" 
                      tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a25', 
                        border: '1px solid #2a2a3e', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      labelFormatter={(dateStr) => new Date(dateStr).toLocaleDateString()}
                      formatter={(value: any) => [`${(value * 100).toFixed(2)}%`, 'Drawdown']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="drawdown" 
                      stroke="#ff4a4a" 
                      fill="rgba(255, 74, 74, 0.2)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar Returns Heatmap */}
        {calendarData.length > 0 && (
          <Card className="bg-[#15151f] border-[#2a2a3e]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Calendar Returns (Last 12 Months)</CardTitle>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => exportToPng('calendar-heatmap', `calendar-returns-${run.id}.png`)}
              >
                <Download className="w-4 h-4 mr-2" />Export Heatmap
              </Button>
            </CardHeader>
            <CardContent>
              <div id="calendar-heatmap" className="grid grid-cols-12 gap-2">
                {calendarData.map(({ month, return: ret, color }) => (
                  <div
                    key={month}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-mono border border-[#2a2a3e] transition-all hover:scale-105"
                    style={{ backgroundColor: color }}
                    title={`${month}: ${ret.toFixed(2)}%`}
                  >
                    <div className="text-white font-semibold">{month.slice(5)}</div>
                    <div className="text-white text-xs">{ret.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistical Validation */}
        {dailyReturns && dailyReturns.length > 0 && (
          <Card className="bg-[#15151f] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Statistical Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <ValidationReport daily={dailyReturns} />
            </CardContent>
          </Card>
        )}

        {/* Stability & Diagnostics */}
        {dailyReturns && dailyReturns.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#15151f] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Stability Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <StabilityTiles daily={dailyReturns} />
              </CardContent>
            </Card>

            <Card className="bg-[#15151f] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Trade Diagnostics</CardTitle>
              </CardHeader>
              <CardContent>
                <TradeDiagnostics daily={dailyReturns} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Execution & Attribution */}
        {dailyReturns && dailyReturns.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#15151f] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Execution Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ExecutionDiagnostics exec={run?.results?.execution} />
              </CardContent>
            </Card>

            <Card className="bg-[#15151f] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Performance Attribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Attribution daily={dailyReturns} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lineage Graph */}
        <Card className="bg-[#15151f] border-[#2a2a3e]">
          <CardHeader>
            <CardTitle className="text-white">Strategy Lineage</CardTitle>
          </CardHeader>
          <CardContent>
            <LineageGraph currentArtifact={run} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-[#2a2a3e] no-print">
          <div className="text-[#a0a0b8] text-sm">
            Generated by NexusQuant • {new Date().toLocaleDateString()} • 
            <a href="/" className="text-[#00bbff] hover:underline ml-2">
              Create Your Own Strategy
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-\\[\\#0a0a0f\\] { background: white !important; }
          .bg-\\[\\#15151f\\] { background: #f8f9fa !important; }
          .text-white { color: black !important; }
          .text-\\[\\#a0a0b8\\] { color: #666 !important; }
          .border-\\[\\#2a2a3e\\] { border-color: #ddd !important; }
        }
      `}</style>
    </div>
  )
}
