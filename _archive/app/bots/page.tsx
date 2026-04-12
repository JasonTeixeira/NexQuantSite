import type { Metadata } from "next"
import BotsPageClient from "@/components/bots-page-client"

export const metadata: Metadata = {
  title: "AI Trading Bots | Nexural Trading",
  description:
    "Discover our suite of AI-powered trading bots designed for quantitative trading. Advanced algorithms, real-time execution, and institutional-grade performance.",
  keywords: "AI trading bots, quantitative trading, algorithmic trading, automated trading, trading algorithms",
}

export default function BotsPage() {
  return <BotsPageClient />
}
