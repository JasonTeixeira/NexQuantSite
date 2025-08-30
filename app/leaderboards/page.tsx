import type { Metadata } from "next"
import LeaderboardsClient from "@/components/community/LeaderboardsClient"

export const metadata: Metadata = {
  title: "Trading Leaderboards - Nexural Trading",
  description: "Compete with the best traders on Nexural Trading. View rankings by performance, win rate, consistency, and more.",
  keywords: ["trading leaderboards", "trader rankings", "trading competition", "performance rankings", "top traders"],
}

export default function LeaderboardsPage() {
  return <LeaderboardsClient />
}


