"use client"

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { loadArtifacts, updateArtifactMeta } from '@/lib/artifacts'
import { useVirtualization } from '@/hooks/use-performance'
import { AppSkeletonCard } from './skeleton'
import { ExternalLink, GitBranch } from 'lucide-react'

export default function RunHistory() {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const runs = useMemo(() => loadArtifacts(), [])
  const filtered = runs.filter(r =>
    (!q || r.config?.strategy?.toLowerCase().includes(q.toLowerCase()) || r.configHash.includes(q)) &&
    (!tag || (r.meta?.tags || []).includes(tag))
  )

  // Build lineage maps
  const parentToChildren = useMemo(() => {
    const map = new Map<string, string[]>()
    runs.forEach(r => {
      if (r.meta?.parentHash) {
        if (!map.has(r.meta.parentHash)) map.set(r.meta.parentHash, [])
        map.get(r.meta.parentHash)!.push(r.id)
      }
    })
    return map
  }, [runs])

  const hashToRun = useMemo(() => {
    const map = new Map<string, any>()
    runs.forEach(r => map.set(r.configHash, r))
    return map
  }, [runs])

  const shareLink = (id: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('view','results-comparison')
    url.searchParams.set('compare', id)
    return url.toString()
  }

  const v = useVirtualization(filtered, 600, 220, 6)
  const loading = runs.length === 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Run History</h2>
        <input
          placeholder="Search by strategy or hash"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          className="px-2 py-1 text-xs bg-[#15151f] border border-[#2a2a3e] rounded text-white placeholder-[#a0a0b8]"
        />
      </div>

      <div
        className="relative overflow-y-auto rounded border border-[#2a2a3e]"
        style={{ height: 600 }}
        onScroll={(e) => v.setScrollTop((e.currentTarget as HTMLDivElement).scrollTop)}
        aria-label="Run history list"
      >
        <div style={{ position: 'relative', height: v.totalHeight }}>
          {loading && (
            <div className="p-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => <AppSkeletonCard key={i} />)}
            </div>
          )}
          {!loading && v.visibleItems.map((r: any) => (
            <div key={r.id} style={r.style} className="p-2">
              <Card className="bg-[#15151f] border-[#2a2a3e] focus-within:ring-2 focus-within:ring-[#00bbff]">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center justify-between">
                    <span>{r.config?.strategy || 'Strategy'}</span>
                    <Badge variant="outline">{r.configHash}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  {r.meta?.parentHash && (
                    <div className="mb-2 p-2 bg-[#1a1a25] rounded border border-[#2a2a3e]">
                      <div className="flex items-center gap-2 text-[#a0a0b8]">
                        <GitBranch className="w-3 h-3" />
                        <span>Parent:</span>
                        {hashToRun.has(r.meta.parentHash) ? (
                          <button
                            onClick={() => {
                              const parent = hashToRun.get(r.meta.parentHash)
                              window.open(`/share/${parent.id}`, '_blank')
                            }}
                            className="text-[#00bbff] hover:underline font-mono text-xs flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#00bbff]"
                          >
                            {r.meta.parentHash.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-white font-mono text-xs">{r.meta.parentHash.slice(0, 8)}...</span>
                        )}
                      </div>
                    </div>
                  )}

                  {parentToChildren.has(r.configHash) && (
                    <div className="mb-2 p-2 bg-[#1a1a25] rounded border border-[#2a2a3e]">
                      <div className="flex items-center gap-2 text-[#a0a0b8] mb-1">
                        <GitBranch className="w-3 h-3" />
                        <span>Children ({parentToChildren.get(r.configHash)!.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {parentToChildren.get(r.configHash)!.slice(0, 3).map(childId => {
                          const child = runs.find(run => run.id === childId)
                          return child ? (
                            <button
                              key={childId}
                              onClick={() => window.open(`/share/${childId}`, '_blank')}
                              className="text-[#00bbff] hover:underline font-mono text-xs flex items-center gap-1 px-1 py-0.5 bg-[#00bbff]/10 rounded focus:outline-none focus:ring-2 focus:ring-[#00bbff]"
                            >
                              {child.configHash.slice(0, 6)} <ExternalLink className="w-2 h-2" />
                            </button>
                          ) : null
                        })}
                        {parentToChildren.get(r.configHash)!.length > 3 && (
                          <span className="text-[#a0a0b8] text-xs">+{parentToChildren.get(r.configHash)!.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-[#a0a0b8]">Sharpe</div>
                      <div className="text-white font-mono">{r.results?.sharpe?.toFixed?.(2) ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-[#a0a0b8]">Return</div>
                      <div className="text-white font-mono">{((r.results?.totalReturn ?? 0) * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-[#a0a0b8]">Max DD</div>
                      <div className="text-white font-mono">{((r.results?.maxDrawdown ?? 0) * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {(r.meta?.tags || []).map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="focus:outline-none focus:ring-2 focus:ring-[#00bbff]" onClick={() => {
                      const note = prompt('Add a note to this run', r.meta?.notes || '')
                      if (note != null) updateArtifactMeta(r.id, { notes: note })
                    }}>Add Note</Button>
                    <Button size="sm" variant="outline" className="focus:outline-none focus:ring-2 focus:ring-[#00bbff]" onClick={() => {
                      const t = prompt('Add tag')
                      if (t) updateArtifactMeta(r.id, { tags: Array.from(new Set([...(r.meta?.tags || []), t])) })
                    }}>Tag</Button>
                    <Button size="sm" className="focus:outline-none focus:ring-2 focus:ring-[#00bbff]" onClick={() => {
                      const url = shareLink(r.id)
                      window.open(url, '_blank')
                    }}>Compare</Button>
                    <Button size="sm" variant="outline" className="focus:outline-none focus:ring-2 focus:ring-[#00bbff]" onClick={() => {
                      const token = (r.meta as any)?.visibility === 'token' ? (r.meta as any)?.shareToken : undefined
                      const url = `${window.location.origin}/share/${r.id}${token ? `?token=${token}` : ''}`
                      navigator.clipboard.writeText(url)
                    }}>Copy Share Link</Button>
                    <select
                      className="text-xs bg-[#1a1a25] border border-[#2a2a3e] rounded px-2 py-1"
                      value={(r.meta as any)?.visibility || 'token'}
                      onChange={async (e) => {
                        const visibility = e.target.value as 'public'|'token'|'private'
                        const patch: any = { visibility }
                        if (visibility === 'token' && !(r.meta as any)?.shareToken) {
                          patch.shareToken = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
                        }
                        updateArtifactMeta(r.id, patch)
                        try { await fetch(`/api/artifacts/${r.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ metaPatch: patch }) }) } catch {}
                      }}
                      aria-label="Visibility"
                      title="Visibility"
                    >
                      <option value="public">public</option>
                      <option value="token">token</option>
                      <option value="private">private</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


