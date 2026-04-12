import type { Metadata } from "next"
import IndicatorsPageClient from "@/components/indicators-page-client"

export const metadata: Metadata = {
  title: "Professional Trading Indicators | Nexural Trading",
  description:
    "Discover our suite of proprietary quantitative trading indicators designed for professional traders. Advanced analytics, AI-powered signals, and institutional-grade tools.",
  keywords: "trading indicators, quantitative analysis, technical indicators, trading signals, algorithmic trading",
}

export default function IndicatorsPage() {
  return <IndicatorsPageClient />
}
