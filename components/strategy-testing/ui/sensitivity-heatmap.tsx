"use client"

import React, { useMemo, useRef, useState } from 'react'

type Cell = {
  x: string | number
  y: string | number
  value: number
}

export interface SensitivityHeatmapProps {
  data: Cell[]
  xLabel: string
  yLabel: string
  metricLabel?: string
  className?: string
  id?: string
}

function clamp(min: number, v: number, max: number) { return Math.max(min, Math.min(max, v)) }

function colorFor(v: number, vmin: number, vmax: number) {
  if (!Number.isFinite(v)) return '#2a2a3e'
  const t = vmin === vmax ? 0.5 : clamp(0, (v - vmin) / (vmax - vmin), 1)
  // Blue → Cyan → Lime gradient
  const r = Math.round(0 + 80 * t)
  const g = Math.round(80 + 150 * t)
  const b = Math.round(255 - 155 * t)
  return `rgb(${r}, ${g}, ${b})`
}

export default function SensitivityHeatmap({ data, xLabel, yLabel, metricLabel = 'Value', className, id }: SensitivityHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ x: string | number; y: string | number; value: number; cx: number; cy: number } | null>(null)

  const { xs, ys, grid, minV, maxV } = useMemo(() => {
    const xs = Array.from(new Set(data.map(d => String(d.x)))).sort((a,b) => a.localeCompare(b, undefined, { numeric: true }))
    const ys = Array.from(new Set(data.map(d => String(d.y)))).sort((a,b) => a.localeCompare(b, undefined, { numeric: true }))
    const map = new Map<string, number>()
    let minV = Number.POSITIVE_INFINITY
    let maxV = Number.NEGATIVE_INFINITY
    for (const d of data) {
      const key = `${String(d.x)}|${String(d.y)}`
      map.set(key, d.value)
      if (Number.isFinite(d.value)) { minV = Math.min(minV, d.value); maxV = Math.max(maxV, d.value) }
    }
    const grid: (number | undefined)[][] = ys.map(() => xs.map(() => undefined))
    ys.forEach((yy, j) => {
      xs.forEach((xx, i) => {
        grid[j][i] = map.get(`${xx}|${yy}`)
      })
    })
    if (!Number.isFinite(minV)) { minV = 0; maxV = 1 }
    return { xs, ys, grid, minV, maxV }
  }, [data])

  return (
    <div ref={containerRef} id={id} className={className}>
      <div className="text-xs text-[#a0a0b8] mb-2">{metricLabel} heatmap across <span className="text-white">{xLabel}</span> × <span className="text-white">{yLabel}</span></div>
      <div className="overflow-auto">
        <svg width={Math.max(360, xs.length * 56 + 80)} height={Math.max(240, ys.length * 32 + 80)}>
          {/* Axes labels */}
          <text x={60 + (xs.length * 56) / 2} y={20} textAnchor="middle" fontSize="12" fill="#a0a0b8">{xLabel}</text>
          <g transform={`translate(60,40)`}>
            {/* X labels */}
            {xs.map((x, i) => (
              <text key={String(x)} x={i * 56 + 28} y={-8} fontSize="10" fill="#a0a0b8" textAnchor="middle">{String(x)}</text>
            ))}
            {/* Y labels */}
            {ys.map((y, j) => (
              <text key={String(y)} x={-8} y={j * 32 + 20} fontSize="10" fill="#a0a0b8" textAnchor="end">{String(y)}</text>
            ))}
            {/* Cells */}
            {grid.map((row, j) => (
              <g key={`row-${j}`}>
                {row.map((v, i) => {
                  const x = i * 56
                  const y = j * 32
                  const c = colorFor(v as number, minV, maxV)
                  return (
                    <rect
                      key={`cell-${i}-${j}`}
                      x={x}
                      y={y}
                      width={54}
                      height={30}
                      rx={4}
                      fill={c}
                      stroke="#2a2a3e"
                      onMouseMove={(e) => setHover({ x: xs[i], y: ys[j], value: v ?? NaN, cx: e.clientX, cy: e.clientY })}
                      onMouseLeave={() => setHover(null)}
                    />
                  )
                })}
              </g>
            ))}
            {/* Significance badges (top quartile) */}
            {grid.map((row, j) => (
              <g key={`sig-${j}`}>
                {row.map((v, i) => {
                  if (v == null) return null
                  const t = (v - minV) / (maxV - minV || 1)
                  if (t < 0.75) return null
                  return (
                    <circle key={`dot-${i}-${j}`} cx={i * 56 + 46} cy={j * 32 + 10} r={3} fill="#ffffff" fillOpacity={0.8} />
                  )
                })}
              </g>
            ))}
          </g>
          {/* Legend */}
          <g transform={`translate(${60 + xs.length * 56 + 10}, 40)`}>
            <text x={0} y={-8} fontSize="10" fill="#a0a0b8">{metricLabel}</text>
            {Array.from({ length: 40 }, (_, k) => k / 39).map((t, idx) => (
              <rect key={idx} x={0} y={idx * 4} width={14} height={4} fill={colorFor(minV + t * (maxV - minV), minV, maxV)} />
            ))}
            <text x={20} y={8} fontSize="10" fill="#a0a0b8">{minV.toFixed(2)}</text>
            <text x={20} y={160} fontSize="10" fill="#a0a0b8">{maxV.toFixed(2)}</text>
          </g>
        </svg>
      </div>
      {hover && (
        <div
          className="fixed z-50 px-2 py-1 text-xs rounded bg-[#11131a] border border-[#2a2a3e] text-white pointer-events-none"
          style={{ left: hover.cx + 10, top: hover.cy + 10 }}
        >
          <div><span className="text-[#a0a0b8]">{xLabel}:</span> {String(hover.x)}</div>
          <div><span className="text-[#a0a0b8]">{yLabel}:</span> {String(hover.y)}</div>
          <div><span className="text-[#a0a0b8]">{metricLabel}:</span> {Number.isFinite(hover.value) ? (hover.value as number).toFixed(3) : '—'}</div>
        </div>
      )}
    </div>
  )
}


