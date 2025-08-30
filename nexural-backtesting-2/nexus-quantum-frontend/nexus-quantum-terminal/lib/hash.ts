// Deterministic config hashing with stable stringify (no external deps)
// Produces a hex string using djb2 hashing over a canonical JSON

export function stableStringify(value: unknown): string {
  const seen = new WeakSet()
  const canonicalize = (v: any): any => {
    if (v === null || typeof v !== 'object') return v
    if (seen.has(v)) return '[Circular]'
    seen.add(v)
    if (Array.isArray(v)) return v.map(canonicalize)
    const keys = Object.keys(v).sort()
    const obj: Record<string, any> = {}
    for (const k of keys) obj[k] = canonicalize(v[k])
    return obj
  }
  return JSON.stringify(canonicalize(value))
}

export function hashDJB2Hex(input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  // Convert to unsigned 32-bit and hex
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function hashConfig(config: unknown): string {
  return hashDJB2Hex(stableStringify(config))
}


