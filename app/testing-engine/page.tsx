import { Metadata } from "next"
import NexusQuantTerminal from "@/components/strategy-testing/nexus-quant-terminal"
import ErrorBoundary from "@/components/ui/error-boundary"

export const metadata: Metadata = {
  title: "Nexus Quant Terminal - Institutional Grade Testing Engine | Nexural Trading",
  description: "Complete quantitative trading platform with advanced AI-powered strategy testing, real-time backtesting, and institutional-grade analytics.",
  keywords: "quantitative trading, strategy testing, backtesting, trading algorithms, AI trading, institutional trading, nexus terminal, quant platform"
}

export default function TestingEnginePage() {
  return (
    <div className="min-h-screen bg-black">
      <ErrorBoundary>
        <NexusQuantTerminal />
      </ErrorBoundary>
    </div>
  )
}
