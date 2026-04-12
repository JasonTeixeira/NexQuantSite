import type { Metadata } from "next"
import QuantPageClient from "@/components/quant-page-client"

export const metadata: Metadata = {
  title: "Quant | Where Math Meets Money - NEXURAL Trading",
  description:
    "Discover how AI-powered quantitative trading is revolutionizing the markets. Join 10,000+ traders using mathematical precision to beat traditional strategies.",
  keywords: "quantitative trading, AI trading bots, algorithmic trading, quant strategies, automated trading",
}

export default function QuantPage() {
  return <QuantPageClient />
}
