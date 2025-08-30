import type { Metadata } from "next"
import PortfolioDashboardClient from "@/components/dashboard/portfolio-dashboard-client"

export const metadata: Metadata = {
  title: "Portfolio Overview - NEXURAL Trading Dashboard",
  description: "Complete portfolio overview with positions, P&L, and allocation charts",
}

export default function PortfolioDashboardPage() {
  return <PortfolioDashboardClient />
}
