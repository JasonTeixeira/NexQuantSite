import fs from 'fs'
import path from 'path'

export interface ArtifactRecord {
  id: string
  createdAt: number
  configHash: string
  config: any
  results: any
  meta?: {
    dataset?: string
    version?: string
    seed?: number
    git?: string
    user?: string
    tags?: string[]
    notes?: string
    visibility?: 'public' | 'token' | 'private'
    shareToken?: string
    ownerToken?: string
    editorTokens?: string[]
    viewerTokens?: string[]
  }
}

function getStorePath() {
  const dir = path.join(process.cwd(), '.nexus')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return path.join(dir, 'artifacts.json')
}

export function readArtifacts(): ArtifactRecord[] {
  try {
    const p = getStorePath()
    if (!fs.existsSync(p)) return []
    const raw = fs.readFileSync(p, 'utf-8')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function writeArtifacts(list: ArtifactRecord[]) {
  const p = getStorePath()
  fs.writeFileSync(p, JSON.stringify(list, null, 2), 'utf-8')
}

export function upsertArtifactServer(rec: ArtifactRecord) {
  const all = readArtifacts()
  const idx = all.findIndex(a => a.id === rec.id || a.configHash === rec.configHash)
  // Ensure RBAC defaults on first insert
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...rec, meta: { ...all[idx].meta, ...rec.meta } }
  } else {
    const ownerToken = rec.meta?.ownerToken || (Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10))
    const visibility = rec.meta?.visibility || 'token'
    const shareToken = rec.meta?.shareToken || (visibility === 'token' ? Math.random().toString(36).slice(2, 10) : undefined)
    const meta = { ...rec.meta, ownerToken, editorTokens: rec.meta?.editorTokens || [], viewerTokens: rec.meta?.viewerTokens || [], visibility, shareToken }
    all.unshift({ ...rec, meta })
  }
  writeArtifacts(all)
  return idx >= 0 ? all[idx] : all[0]
}

export function findArtifactById(id: string) {
  return readArtifacts().find(a => a.id === id) || null
}


