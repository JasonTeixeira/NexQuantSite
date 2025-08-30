"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export type UsageEventType =
  | "ai_generate"
  | "backtest_run"
  | "optimization_run"
  | "export"
  | "data_request"

export interface UsageEvent {
  id: string
  type: UsageEventType
  units: number
  cost: number
  description?: string
  createdAt: number
}

export interface UsageTotals {
  totalUnits: number
  totalCost: number
  byType: Record<UsageEventType, { units: number; cost: number }>
}

const STORAGE_KEY = "nexus-usage-events"

export function useUsageMeter() {
  const [events, setEvents] = useState<UsageEvent[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setEvents(JSON.parse(raw))
    } catch (err) {
      console.error("Failed to load usage events", err)
    }
  }, [])

  const persist = useCallback((next: UsageEvent[]) => {
    setEvents(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (err) {
      console.error("Failed to save usage events", err)
    }
  }, [])

  const addEvent = useCallback(
    (type: UsageEventType, units: number, costPerUnit: number, description?: string) => {
      const ev: UsageEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        units,
        cost: Number((units * costPerUnit).toFixed(6)),
        description,
        createdAt: Date.now(),
      }
      persist([...(events || []), ev])
      return ev
    },
    [events, persist]
  )

  const clear = useCallback(() => persist([]), [persist])

  const totals: UsageTotals = useMemo(() => {
    const byType: UsageTotals["byType"] = {
      ai_generate: { units: 0, cost: 0 },
      backtest_run: { units: 0, cost: 0 },
      optimization_run: { units: 0, cost: 0 },
      export: { units: 0, cost: 0 },
      data_request: { units: 0, cost: 0 },
    }
    let totalUnits = 0
    let totalCost = 0
    for (const ev of events) {
      totalUnits += ev.units
      totalCost += ev.cost
      const bucket = byType[ev.type]
      bucket.units += ev.units
      bucket.cost += ev.cost
    }
    return {
      totalUnits,
      totalCost: Number(totalCost.toFixed(6)),
      byType,
    }
  }, [events])

  return { events, totals, addEvent, clear }
}


