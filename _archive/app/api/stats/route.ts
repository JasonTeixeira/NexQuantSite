import { NextResponse } from "next/server"

// Simulate real-time trading stats
export async function GET() {
  try {
    // In a real application, this would fetch from your trading API
    const stats = {
      dailyPnL: Math.random() * 5000 - 1000, // Random P&L between -1000 and 4000
      winRate: 75 + Math.random() * 20, // Win rate between 75-95%
      totalTrades: Math.floor(Math.random() * 200) + 50,
      activePositions: Math.floor(Math.random() * 20) + 5,
      volume24h: Math.random() * 50000000 + 10000000, // Volume between 10M-60M
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
