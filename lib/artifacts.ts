"use client"

import { hashConfig, stableStringify } from './hash'

export interface BacktestArtifact {
  id: string
  createdAt: number
  configHash: string
  config: any
  results: any
  meta: {
    dataset?: string
    version?: string
    seed?: number
    git?: string
    user?: string
    tags?: string[]
    notes?: string
    visibility?: 'public' | 'token' | 'private'
    shareToken?: string
  }
}

const STORAGE_KEY = 'nexus-artifacts'

function isServerSyncEnabled(): boolean {
  try {
    // Local override wins when present
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('nexus-server-sync')
      if (v != null) return v === 'true'
    }
    // Default from env (client-safe NEXT_PUBLIC var)
    // Off if unset
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const envDefault = process.env.NEXT_PUBLIC_SERVER_SYNC_DEFAULT
    return envDefault === 'true'
  } catch {
    return false
  }
}

function ensureShareMeta(meta: BacktestArtifact['meta'] = {}) {
  const visEnv = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_SHARE_DEFAULT_VISIBILITY) || 'token'
  const visibility = (meta.visibility as any) || (visEnv === 'public' || visEnv === 'private' ? visEnv : 'token')
  const shareToken = meta.shareToken || (visibility === 'token' ? Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10) : undefined)
  return { ...meta, visibility, shareToken }
}

export function loadArtifacts(): BacktestArtifact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveArtifact(artifact: BacktestArtifact) {
  const all = loadArtifacts()
  const next = [artifact, ...all]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function upsertArtifact(config: any, results: any, meta: BacktestArtifact['meta'] = {}) {
  const configHash = hashConfig(config)
  const id = `${Date.now()}-${configHash}`
  const art: BacktestArtifact = { id, createdAt: Date.now(), configHash, config, results, meta: ensureShareMeta(meta) }
  saveArtifact(art)
  // Optional server sync
  try {
    if (isServerSyncEnabled()) {
      fetch('/api/artifacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(art) })
        .catch(() => {})
    }
  } catch {}
  return art
}

export function findByConfig(config: any) {
  const configHash = hashConfig(config)
  return loadArtifacts().find(a => a.configHash === configHash)
}

export function reproduceSnippet(config: any) {
  const serialized = stableStringify(config)
  return `// Reproduce this backtest
import { runBacktest } from '@nexus/sdk'

const config = ${serialized}

await runBacktest(config)`
}

export function updateArtifactMeta(id: string, patch: Partial<BacktestArtifact['meta']>) {
  const all = loadArtifacts()
  const idx = all.findIndex(a => a.id === id)
  if (idx === -1) return
  all[idx] = { ...all[idx], meta: { ...all[idx].meta, ...patch } }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  // Best-effort server sync of meta updates
  try {
    if (isServerSyncEnabled()) {
      fetch(`/api/artifacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaPatch: patch })
      }).catch(() => {})
    }
  } catch {}
}



