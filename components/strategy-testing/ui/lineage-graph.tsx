"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LineageProps {
  run: {
    id: string
    configHash: string
    meta?: { dataset?: string; version?: string; user?: string; tags?: string[]; notes?: string }
  }
}

export default function LineageGraph({ run }: LineageProps) {
  const nodes = [
    { id: 'dataset', label: `Dataset ${run.meta?.dataset ?? 'N/A'}`, color: '#334155' },
    { id: 'config', label: `Config ${run.configHash.slice(0,8)}`, color: '#0ea5e9' },
    { id: 'run', label: `Run ${run.id}`, color: '#22c55e' },
    { id: 'results', label: 'Results', color: '#eab308' },
  ]
  return (
    <Card className="bg-[#15151f] border-[#2a2a3e]">
      <CardHeader><CardTitle className="text-white text-sm">Lineage</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {nodes.map((n, i) => (
            <div key={n.id} className="flex items-center gap-2">
              <div className="px-2 py-1 rounded text-xs font-mono" style={{ background: n.color }}>{n.label}</div>
              {i < nodes.length - 1 && <div className="h-px w-8 bg-[#2a2a3e]" />}
            </div>
          ))}
        </div>
        {run.meta?.tags && run.meta.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
            {run.meta.tags.map((t, i) => (
              <span key={i} className="px-1 py-0.5 rounded border border-[#2a2a3e] text-[#a0a0b8]">{t}</span>
            ))}
          </div>
        )}
        {run.meta?.notes && (
          <div className="mt-2 text-xs text-[#a0a0b8]">{run.meta.notes}</div>
        )}
      </CardContent>
    </Card>
  )
}


