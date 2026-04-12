import type { Metadata } from "next"
import ComprehensiveBacktestingEducation from "@/components/ComprehensiveBacktestingEducation"

export const metadata: Metadata = {
  title: "Complete Testing Education | Nexural Trading - Master Every Testing Method",
  description:
    "Comprehensive educational guide covering ALL testing types used in trading, automation, and quantitative finance. From foundational backtesting to advanced machine learning validation.",
  keywords:
    "backtesting education, trading strategies, testing methods, quantitative analysis, strategy validation, algorithmic trading, machine learning testing, statistical arbitrage, options testing, portfolio testing, execution testing",
}

export default function BacktestingLearnPage() {
  return <ComprehensiveBacktestingEducation />
}
