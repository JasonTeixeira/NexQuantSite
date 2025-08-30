"use client"

export type DailyReturn = { date: string; r: number }

export function sharpeRatio(daily: DailyReturn[]): number {
  if (!daily.length) return 0
  const rs = daily.map(d => d.r)
  const mean = rs.reduce((a, b) => a + b, 0) / rs.length
  const variance = rs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, rs.length - 1)
  const stdev = Math.sqrt(Math.max(1e-12, variance))
  return (mean * Math.sqrt(252)) / stdev
}

export function bootstrapCI(
  daily: DailyReturn[],
  metric: (x: DailyReturn[]) => number,
  samples: number = 800,
  alpha: number = 0.05
) {
  if (!daily.length) return { lo: 0, hi: 0 }
  const n = daily.length
  const values: number[] = []
  for (let s = 0; s < samples; s++) {
    const draw: DailyReturn[] = []
    for (let i = 0; i < n; i++) {
      draw.push(daily[Math.floor(Math.random() * n)])
    }
    values.push(metric(draw))
  }
  values.sort((a, b) => a - b)
  const lo = values[Math.floor((alpha / 2) * values.length)]
  const hi = values[Math.floor((1 - alpha / 2) * values.length)]
  return { lo, hi }
}

export function deflatedSharpe(rawSharpe: number, trials: number, sampleSize: number) {
  if (trials <= 1 || sampleSize <= 1) return rawSharpe
  const penalty = Math.sqrt((2 * Math.log(trials)) / sampleSize)
  const ds = rawSharpe - penalty
  return Number(Math.max(0, ds).toFixed(2))
}

export function purgedKFolds(daily: DailyReturn[], k: number = 5, embargoDays: number = 5) {
  const n = daily.length
  const foldSize = Math.max(1, Math.floor(n / k))
  const folds: Array<{ train: number[]; test: number[] }> = []
  for (let i = 0; i < k; i++) {
    const start = i * foldSize
    const end = Math.min(n, start + foldSize)
    const test: number[] = []
    for (let t = start; t < end; t++) test.push(t)
    const embargoStart = Math.max(0, start - embargoDays)
    const embargoEnd = Math.min(n, end + embargoDays)
    const train: number[] = []
    for (let t = 0; t < embargoStart; t++) train.push(t)
    for (let t = embargoEnd; t < n; t++) train.push(t)
    folds.push({ train, test })
  }
  return folds
}

export function realityCheckSPA(
  baseDaily: DailyReturn[],
  candidateSharpes: number[],
  bootstrapSamples: number = 500
) {
  // approximate SPA: compare best observed Sharpe against bootstrap max Sharpe under resampling
  if (candidateSharpes.length === 0) return { p: 1 }
  const observed = Math.max(...candidateSharpes)
  const rs = baseDaily.map(d => d.r)
  const n = rs.length
  const maxes: number[] = []
  for (let s = 0; s < bootstrapSamples; s++) {
    const draw: DailyReturn[] = []
    for (let i = 0; i < n; i++) {
      draw.push({ date: baseDaily[i].date, r: rs[Math.floor(Math.random() * n)] })
    }
    // naive: Sharpe of bootstrap draw approximates null; assume same for candidates
    maxes.push(sharpeRatio(draw))
  }
  maxes.sort((a, b) => a - b)
  const greater = maxes.filter(m => m >= observed).length
  const p = Math.max(1 / bootstrapSamples, greater / bootstrapSamples)
  return { p }
}

export function walkForwardWindows(
  daily: DailyReturn[],
  trainDays: number = 252,
  testDays: number = 63
) {
  const n = daily.length
  const windows: Array<{ train: number[]; test: number[] }> = []
  for (let start = 0; start + trainDays + testDays <= n; start += testDays) {
    const train: number[] = []
    for (let i = start; i < start + trainDays; i++) train.push(i)
    const test: number[] = []
    for (let i = start + trainDays; i < start + trainDays + testDays; i++) test.push(i)
    windows.push({ train, test })
  }
  return windows
}

export function metricsFromIndices(daily: DailyReturn[], idxs: number[]) {
  const subset = idxs.map(i => daily[i]).filter(Boolean)
  const s = sharpeRatio(subset)
  let equity = 1
  let peak = 1
  let maxDD = 0
  for (const d of subset) {
    equity *= 1 + d.r
    peak = Math.max(peak, equity)
    maxDD = Math.min(maxDD, (equity - peak) / peak)
  }
  return { sharpe: s, totalReturn: equity - 1, maxDD }
}


