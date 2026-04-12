import { NextResponse } from "next/server"

// Simulate trading signals
export async function GET() {
  try {
    const pairs = ["ES", "NQ", "YM", "RTY", "GC", "CL", "EUR/USD", "GBP/USD"]
    const directions = ["LONG", "SHORT"]
    const statuses = ["ACTIVE", "CLOSED"]

    const signals = Array.from({ length: 10 }, (_, index) => ({
      id: `signal_${Date.now()}_${index}`,
      time: `${Math.floor(Math.random() * 60)} min ago`,
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      direction: directions[Math.floor(Math.random() * directions.length)],
      profit: `${Math.random() > 0.8 ? "-" : "+"}${(Math.random() * 5).toFixed(1)}%`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      entry: (Math.random() * 1000 + 4000).toFixed(2),
      target: (Math.random() * 1000 + 4000).toFixed(2),
      stopLoss: (Math.random() * 1000 + 4000).toFixed(2),
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json(signals)
  } catch (error) {
    console.error("Error fetching signals:", error)
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 })
  }
}
