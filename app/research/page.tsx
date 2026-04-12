'use client'

import { useState, useEffect } from 'react'

export default function ResearchPage() {
  const [researchUrl, setResearchUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    // Check if research service is available
    const checkResearch = async () => {
      try {
        const res = await fetch('/research/api/health')
        if (res.ok) {
          setStatus('online')
          // Research service runs on its own port — link to it
          setResearchUrl(process.env.NEXT_PUBLIC_RESEARCH_URL || 'http://localhost:3000')
        } else {
          setStatus('offline')
        }
      } catch {
        setStatus('offline')
      }
      setIsLoading(false)
    }
    checkResearch()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white font-bold text-lg">
              N
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nexural Research</h1>
              <p className="text-sm text-muted-foreground">
                Institutional-grade strategy analysis engine — 71+ metrics, AI-powered insights
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                status === 'online' ? 'bg-emerald-500/10 text-emerald-500' :
                status === 'offline' ? 'bg-red-500/10 text-red-500' :
                'bg-yellow-500/10 text-yellow-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  status === 'online' ? 'bg-emerald-500' :
                  status === 'offline' ? 'bg-red-500' :
                  'bg-yellow-500 animate-pulse'
                }`} />
                {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Checking...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : status === 'online' ? (
          <div className="space-y-6">
            {/* Quick access link */}
            <div className="flex items-center gap-4">
              <a
                href={researchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
              >
                Open Research Dashboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="/research/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                API Documentation
              </a>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: '71+ Metrics', desc: 'Sharpe, Sortino, Kelly, VaR, Hurst, DSR and more', icon: '📊' },
                { title: 'AI Analysis', desc: 'Claude, GPT-4o, Perplexity with response validation', icon: '🤖' },
                { title: 'Stress Testing', desc: 'Tail amplification, parameter sensitivity, historical stress', icon: '🔥' },
                { title: 'Monte Carlo', desc: 'Parametric MC, block bootstrap, equity cone projections', icon: '🎲' },
                { title: 'Walk-Forward', desc: 'Rolling IS/OOS with efficiency tracking and overfitting detection', icon: '📈' },
                { title: 'Export', desc: 'PDF reports, Excel workbooks, JSON, CSV with time filters', icon: '📄' },
              ].map((f) => (
                <div key={f.title} className="p-4 rounded-xl border border-border bg-card">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Embedded dashboard */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Research Dashboard</h2>
              <div className="rounded-xl border border-border overflow-hidden" style={{ height: '80vh' }}>
                <iframe
                  src={researchUrl}
                  className="w-full h-full border-0"
                  title="Nexural Research Dashboard"
                  allow="clipboard-write"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔬</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Research Engine Not Running</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              The Nexural Research engine needs to be started separately.
              Run the following commands to get started:
            </p>
            <div className="bg-card border border-border rounded-xl p-4 max-w-lg mx-auto text-left">
              <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
{`# Terminal 1: Start research backend
cd Nexural_Automation/platforms/python/research/nexural-research
pip install -e "."
uvicorn nexural_research.api.app:app --port 8000

# Terminal 2: Start research frontend
cd Nexural_Automation/platforms/python/research/nexural-research/frontend-v0
npm install && npm run dev`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
