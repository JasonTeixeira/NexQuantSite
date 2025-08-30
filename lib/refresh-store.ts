// Simple in-memory refresh token store with rotation
// Note: In production, store in a database or KV store.

type Entry = {
  userId: string
  sessionId: string
  exp: number // epoch seconds
  used: boolean
}

const store = new Map<string, Entry>() // jti -> entry

export function allowRefresh(jti: string, userId: string, sessionId: string, exp: number) {
  store.set(jti, { userId, sessionId, exp, used: false })
}

export function consumeRefresh(jti: string) {
  const e = store.get(jti)
  if (!e) return null
  if (e.used) return null
  if (Date.now() / 1000 > e.exp) return null
  e.used = true
  store.set(jti, e)
  return e
}

export function revokeSession(sessionId: string) {
  for (const [k, v] of store) {
    if (v.sessionId === sessionId) {
      store.delete(k)
    }
  }
}
