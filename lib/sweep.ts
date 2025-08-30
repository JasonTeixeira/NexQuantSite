"use client"

import { upsertArtifact, loadArtifacts } from './artifacts'
import { hashConfig } from './hash'

// Deterministic PRNG based on a seed
function mulberry32(seed: number) {
  return function() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A deterministic mock simulator that produces stable metrics as a function of params
export function simulateBacktest(config: any) {
  const seed = parseInt(hashConfig(config).slice(0, 8), 16)
  const rnd = mulberry32(seed)
  const lb = Number(config.params?.lookback ?? 50)
  const rb = Number(config.params?.rebalanceDays ?? 5)
  const topN = Number(config.params?.topN ?? 50)
  // Shape Sharpe as a smooth function of lb/rb + a small deterministic noise
  const base = 1.2 + 0.8 * Math.sin((lb / 25) * Math.PI) - Math.abs(rb - 8) * 0.05
  const noise = (rnd() - 0.5) * 0.1
  const sharpe = Number((base + noise).toFixed(2))
  let ret = Number((0.25 + 0.4 * Math.sin(lb / 40) - 0.02 * rb + (rnd() - 0.5) * 0.02).toFixed(4))
  const dd = Number((-0.08 - 0.1 * Math.cos(rb / 10) - (rnd() * 0.05)).toFixed(4))
  const trades = Math.max(100, Math.round(200 + 10 * (topN / Math.max(1, rb)) + rnd() * 50))
  const turnover = Number((0.5 + 0.02 * topN / Math.max(1, rb) + (rnd() - 0.5) * 0.1).toFixed(2))
  // Execution realism v1: slippage, impact, latency, partial fills
  const costsBps = Number(config.costsBps ?? 2)
  const venue = String(config.venue || '')
  // Base slippage/impact
  let slippageBps = Math.max(0.5, Number(config.slippageBps ?? 5) * (1 + Math.abs(rb - 8) * 0.05) * (1 + (rnd() - 0.5) * 0.2))
  const impactBps = Math.max(0.5, 2 + (topN / 100) * 4 + (1 - Math.cos(lb / 40)) * 2)
  // Venue effects
  const venueLc = venue.toLowerCase()
  if (venueLc.includes('direct')) slippageBps *= 0.8
  else if (venueLc.includes('nyse') || venueLc.includes('nasdaq')) slippageBps *= 0.9
  // Latency baseline with venue adjustment
  let latencyMs = Math.round(50 + Math.abs(rb - 8) * 10 + rnd() * 80)
  if (venueLc.includes('direct')) latencyMs = Math.max(10, Math.round(latencyMs * 0.6))
  if (venueLc.includes('nyse') || venueLc.includes('nasdaq')) latencyMs = Math.max(15, Math.round(latencyMs * 0.75))
  // Partial fill: allow override from config
  const partialFillRate = Number((config.partialFillRate ?? (0.7 + rnd() * 0.3)).toFixed(2))
  // Apply total cost penalty to return: (commissions + slippage + impact) * turnover
  const totalBps = (costsBps + slippageBps + impactBps)
  ret = Number((ret - (totalBps / 10000) * turnover).toFixed(4))

  // Deterministic daily equity series for calendar returns & stability tiles
  const start = new Date(config.startDate || '2022-01-01')
  const end = new Date(config.endDate || '2024-12-31')
  const totalDays = Math.max(252, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) * 252 / 365))
  const mu = ret / totalDays
  const sigma = 0.02 + 0.01 * Math.abs(rb - 8) / 8 + 0.015 * (1 - Math.cos(lb / 30))
  const dailyReturns: { date: string; r: number }[] = []
  let tDate = new Date(start)
  function gauss() {
    // Box-Muller
    let u = 0, v = 0
    while (u === 0) u = rnd()
    while (v === 0) v = rnd()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }
  for (let i = 0; i < totalDays; i++) {
    const g = gauss()
    const r = mu + sigma * g / Math.sqrt(252)
    dailyReturns.push({ date: tDate.toISOString().slice(0, 10), r })
    tDate.setDate(tDate.getDate() + 1)
  }

  return { totalReturn: ret, sharpe, maxDrawdown: dd, trades, turnover, dailyReturns, execution: { venue, slippageBps: Number(slippageBps.toFixed(2)), impactBps: Number(impactBps.toFixed(2)), latencyMs, partialFillRate } }
}

export type SweepGrid = Record<string, Array<number | string>>

export function enumerateGrid(grid: SweepGrid, order: string[] = Object.keys(grid)) {
  const keys = [...order]
  const values = keys.map(k => grid[k])
  const combos: Record<string, any>[] = []
  const recurse = (idx: number, cur: Record<string, any>) => {
    if (idx === keys.length) { combos.push({ ...cur }); return }
    const k = keys[idx]
    for (const v of values[idx]) recurse(idx + 1, { ...cur, [k]: v })
  }
  recurse(0, {})
  return { keys, combos }
}

export async function runGridSweep(baseConfig: any, grid: SweepGrid, onProgress?: (p: number) => void) {
  const keys = Object.keys(grid)
  if (keys.length === 0) return []
  const values = keys.map(k => grid[k])
  const total = values.reduce((acc, arr) => acc * arr.length, 1)
  let n = 0
  const artifacts: any[] = []

  const recurse = async (idx: number, current: Record<string, any>) => {
    if (idx === keys.length) {
      const config = { ...baseConfig, params: { ...baseConfig.params, ...current } }
      const results = simulateBacktest(config)
      const art = upsertArtifact(config, results, { dataset: baseConfig.universe, seed: 42 })
      artifacts.push(art)
      n++
      onProgress?.(Math.round((n / total) * 100))
      // tiny yield to keep UI responsive
      await new Promise(r => setTimeout(r, 5))
      return
    }
    const k = keys[idx]
    for (const v of values[idx]) {
      await recurse(idx + 1, { ...current, [k]: v })
    }
  }

  await recurse(0, {})
  onProgress?.(100)
  return artifacts
}

export async function resumeGridSweep(baseConfig: any, grid: SweepGrid, onProgress?: (p: number) => void, controlKey?: string) {
  // Enumerate all combinations and skip ones that already exist in artifacts
  const { combos } = enumerateGrid(grid)
  const arts = loadArtifacts()
  const existing = new Set<string>(arts.map(a => a.configHash))
  const pending = combos.filter(params => {
    const cfg = { ...baseConfig, params: { ...baseConfig.params, ...params } }
    const h = hashConfig(cfg)
    return !existing.has(h)
  })
  const total = Math.max(1, pending.length)
  let n = 0
  const artifacts: any[] = []
  for (const params of pending) {
    // pause/stop controls
    if (typeof window !== 'undefined') {
      while (localStorage.getItem('nexus-grid-pause') === 'true') {
        await new Promise(r => setTimeout(r, 100))
      }
      if (localStorage.getItem('nexus-grid-stop') === 'true') break
    }
    const config = { ...baseConfig, params: { ...baseConfig.params, ...params } }
    const results = simulateBacktest(config)
    const art = upsertArtifact(config, results, { dataset: baseConfig.universe, seed: 42, parentHash: hashConfig(baseConfig) })
    artifacts.push(art)
    n++
    onProgress?.(Math.round((n / total) * 100))
    await new Promise(r => setTimeout(r, 5))
  }
  return artifacts
}

export interface BayesianOptions {
  iterations?: number
  exploreRatio?: number // 0..1
  patience?: number // stop after N no-improve steps
  minImprovement?: number // minimum Sharpe improvement to reset patience
}

function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]])
}

export async function runBayesianSweep(
  baseConfig: any,
  grid: Record<string, number[]>,
  opts: BayesianOptions = {},
  onProgress?: (p: number) => void,
  checkpointKey?: string
) {
  const keys = Object.keys(grid)
  if (keys.length === 0) return []
  const domainArrays = keys.map(k => grid[k])
  const domain = cartesianProduct(domainArrays).map(vals => {
    const p: Record<string, number> = {}
    vals.forEach((v, i) => (p[keys[i]] = v))
    return p
  })

  const totalCandidates = domain.length
  const iterations = Math.min(opts.iterations ?? Math.max(16, Math.floor(totalCandidates * 0.4)), totalCandidates)
  const explore = Math.max(1, Math.floor(iterations * (opts.exploreRatio ?? 0.3)))
  const patienceMax = Math.max(3, opts.patience ?? 8)
  const minImprovement = opts.minImprovement ?? 0.02

  // Checkpoint helpers
  const ck = checkpointKey ? `nexus-bayes-${checkpointKey}` : null
  const loadCk = () => {
    if (!ck || typeof window === 'undefined') return null
    try { const raw = localStorage.getItem(ck); return raw ? JSON.parse(raw) : null } catch { return null }
  }
  const saveCk = (state: any) => { if (ck && typeof window !== 'undefined') try { localStorage.setItem(ck, JSON.stringify(state)) } catch {} }
  const shouldStop = () => ck && typeof window !== 'undefined' && localStorage.getItem(`${ck}-stop`) === 'true'

  const sampled = new Set<string>(loadCk()?.sampled ?? [])
  const artifacts: any[] = []

  let bestParams: Record<string, number> | null = loadCk()?.bestParams ?? null
  let bestSharpe = loadCk()?.bestSharpe ?? -Infinity

  const keyOf = (p: Record<string, number>) => keys.map(k => p[k]).join('|')

  const distance = (a: Record<string, number>, b: Record<string, number>) => {
    let s = 0
    for (const k of keys) {
      const arr = grid[k]
      const span = Math.max(1, Math.max(...arr) - Math.min(...arr))
      s += Math.pow((a[k] - b[k]) / span, 2)
    }
    return Math.sqrt(s)
  }

  const pickRandom = () => {
    for (let tries = 0; tries < 1000; tries++) {
      const idx = Math.floor(Math.random() * domain.length)
      const cand = domain[idx]
      const key = keyOf(cand)
      if (!sampled.has(key)) return cand
    }
    return domain.find(c => !sampled.has(keyOf(c))) as Record<string, number>
  }

  const pickNeighborOfBest = () => {
    if (!bestParams) return pickRandom()
    // choose unsampled candidate nearest to best
    let bestCand: Record<string, number> | null = null
    let bestDist = Infinity
    for (const cand of domain) {
      const key = keyOf(cand)
      if (sampled.has(key)) continue
      const d = distance(cand, bestParams)
      if (d < bestDist) {
        bestDist = d
        bestCand = cand
      }
    }
    return bestCand || pickRandom()
  }

  let patience = patienceMax
  let startIter = loadCk()?.iter ?? 0
  patience = loadCk()?.patience ?? patience
  for (let i = startIter; i < iterations; i++) {
    const cand = i < explore ? pickRandom() : pickNeighborOfBest()
    const key = keyOf(cand)
    if (sampled.has(key)) {
      // skip duplicates
      // do not decrement i in resume flow; just continue
      continue
    }
    sampled.add(key)

    const config = { ...baseConfig, params: { ...baseConfig.params, ...cand } }
    const results = simulateBacktest(config)
    const art = upsertArtifact(config, results, { dataset: baseConfig.universe, seed: 42, parentHash: hashConfig(baseConfig) })
    artifacts.push(art)
    if (results.sharpe > bestSharpe) {
      const improvement = results.sharpe - bestSharpe
      bestSharpe = results.sharpe
      bestParams = cand
      patience = improvement < minImprovement ? patience - 1 : patienceMax
    } else {
      patience--
    }
    onProgress?.(Math.round(((i + 1) / iterations) * 100))
    await new Promise(r => setTimeout(r, 5))

    saveCk({ iter: i + 1, sampled: Array.from(sampled), bestSharpe, bestParams, patience })
    if (shouldStop() || (i >= explore && patience <= 0)) {
      break
    }
  }

  return artifacts
}


