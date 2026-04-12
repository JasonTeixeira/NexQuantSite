import type { Metadata } from "next"
import InvestorsPageClient from "@/components/InvestorsPageClient"

export const metadata: Metadata = {
  title: "Investors - Nexural Trading | Investment Opportunity in AI Trading",
  description: "Join the future of quantitative trading. Investment opportunities in our AI-powered trading platform revolutionizing retail algorithmic trading with institutional-grade technology.",
  keywords: "investors, investment opportunity, AI trading, fintech investment, quantitative trading, algorithmic trading, venture capital, growth equity",
}

export default function InvestorsPage() {
  return <InvestorsPageClient />
}

