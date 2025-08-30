import { NextRequest, NextResponse } from 'next/server'
import { findArtifactById, readArtifacts, writeArtifacts } from '@/lib/server/artifactStore'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const art = findArtifactById(id)
  if (!art) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Token/public/private enforcement in the route (node runtime)
  const vis = art.meta?.visibility || 'token'
  if (vis === 'private') {
    // require owner/editor/viewer token
    const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-access-token') || ''
    const ok = token && (
      token === art.meta?.ownerToken ||
      (art.meta?.editorTokens || []).includes(token) ||
      (art.meta?.viewerTokens || []).includes(token)
    )
    if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (vis === 'token') {
    const token = req.nextUrl.searchParams.get('token')
    if (!token || token !== art.meta?.shareToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  return NextResponse.json(art)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { metaPatch } = body || {}
    if (!metaPatch || typeof metaPatch !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    // RBAC: require owner token for sensitive changes (visibility, tokens)
    const token = req.headers.get('x-access-token') || ''
    const all = readArtifacts()
    const idx = all.findIndex(a => a.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const current = all[idx]
    const sensitiveKeys = ['visibility', 'shareToken', 'ownerToken', 'editorTokens', 'viewerTokens']
    const isSensitive = Object.keys(metaPatch).some(k => sensitiveKeys.includes(k))
    if (isSensitive && token !== current.meta?.ownerToken) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const updated = { ...current, meta: { ...(current.meta || {}), ...metaPatch } }
    all[idx] = updated
    writeArtifacts(all)
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}


