import type { Metadata } from "next"
import RiskCalculatorClient from "@/components/risk-calculator-client"

export const metadata: Metadata = {
  title: "Institutional Risk Calculator | Quantitative Analysis - NEXURAL Trading",
  description:
    "Professional-grade risk analysis for quantitative trading strategies. Calculate VaR, Sharpe ratio, drawdown, and other key risk metrics using Monte Carlo simulations.",
  keywords:
    "risk calculator, VaR, quantitative analysis, Monte Carlo simulation, Sharpe ratio, drawdown analysis, portfolio risk",
}

export default function RiskCalculatorPage() {
  return <RiskCalculatorClient />
}
