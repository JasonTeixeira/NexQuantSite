import type { Metadata } from "next"
import BacktestingBusinessHub from "@/components/BacktestingBusinessHub"

export const metadata: Metadata = {
  title: "Testing Engine | Nexural Trading - Professional Backtesting Platform",
  description:
    "Test your trading strategies with our professional-grade backtesting engine. Pay-as-you-go pricing, institutional methodologies, and instant results.",
  keywords:
    "backtesting, testing engine, trading strategies, quantitative analysis, strategy validation, historical testing, trading performance, algorithmic trading, pay as you go",
}

export default function BacktestingPage() {
  return <BacktestingBusinessHub />
}
