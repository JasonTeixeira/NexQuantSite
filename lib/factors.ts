"use client"

export type Daily = { date: string; r: number }

// Simple factor model using synthetic factors for demo: Market, Size, Value
export function generateSyntheticFactors(daily: Daily[]) {
  const n = daily.length
  const dates = daily.map(d => d.date)
  const f = (seed: number) => {
    let x = seed
    const arr: number[] = []
    for (let i = 0; i < n; i++) {
      // LCG
      x = (1664525 * x + 1013904223) >>> 0
      const z = ((x / 0xffffffff) - 0.5) / Math.sqrt(252)
      arr.push(z)
    }
    return arr
  }
  return {
    dates,
    MKT: f(1),
    SMB: f(2),
    HML: f(3),
  }
}

export function regressExposures(daily: Daily[]) {
  if (daily.length === 0) return { exposures: {}, contributions: {}, alpha: 0 }
  const y = daily.map(d => d.r)
  const { MKT, SMB, HML } = generateSyntheticFactors(daily)
  const X = [MKT, SMB, HML]
  // OLS beta = (X'X)^-1 X'y ; simple 3-factor
  const xtx = Array.from({ length: 3 }, (_, i) => Array.from({ length: 3 }, (_, j) => dot(X[i], X[j])))
  const xty = [dot(MKT, y), dot(SMB, y), dot(HML, y)]
  const inv = invert3(xtx)
  const beta = multiply3(inv, xty)
  const exposures = { MKT: beta[0], SMB: beta[1], HML: beta[2] }
  const alpha = mean(y) - (exposures.MKT * mean(MKT) + exposures.SMB * mean(SMB) + exposures.HML * mean(HML))
  const contributions = {
    alpha,
    MKT: exposures.MKT * mean(MKT),
    SMB: exposures.SMB * mean(SMB),
    HML: exposures.HML * mean(HML),
  }
  return { exposures, contributions, alpha }
}

function dot(a: number[], b: number[]) { let s = 0; for (let i = 0; i < Math.min(a.length,b.length); i++) s += a[i]*b[i]; return s }
function mean(a: number[]) { return a.reduce((x,y)=>x+y,0)/Math.max(1,a.length) }

function invert3(m: number[][]) {
  const [a,b,c] = m
  const det = a[0]*(b[1]*c[2]-b[2]*c[1]) - a[1]*(b[0]*c[2]-b[2]*c[0]) + a[2]*(b[0]*c[1]-b[1]*c[0])
  if (Math.abs(det) < 1e-12) return [[1,0,0],[0,1,0],[0,0,1]]
  const invDet = 1/det
  const r00 =  (b[1]*c[2]-b[2]*c[1])*invDet
  const r01 = -(a[1]*c[2]-a[2]*c[1])*invDet
  const r02 =  (a[1]*b[2]-a[2]*b[1])*invDet
  const r10 = -(b[0]*c[2]-b[2]*c[0])*invDet
  const r11 =  (a[0]*c[2]-a[2]*c[0])*invDet
  const r12 = -(a[0]*b[2]-a[2]*b[0])*invDet
  const r20 =  (b[0]*c[1]-b[1]*c[0])*invDet
  const r21 = -(a[0]*c[1]-a[1]*c[0])*invDet
  const r22 =  (a[0]*b[1]-a[1]*b[0])*invDet
  return [[r00,r01,r02],[r10,r11,r12],[r20,r21,r22]]
}

function multiply3(inv: number[][], v: number[]) { return [inv[0][0]*v[0]+inv[0][1]*v[1]+inv[0][2]*v[2], inv[1][0]*v[0]+inv[1][1]*v[1]+inv[1][2]*v[2], inv[2][0]*v[0]+inv[2][1]*v[1]+inv[2][2]*v[2]] }


