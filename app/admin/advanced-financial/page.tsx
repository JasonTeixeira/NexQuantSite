import type { Metadata } from "next"
import AdvancedFinancialDashboard from "@/components/admin/advanced-financial-dashboard"

export const metadata: Metadata = {
  title: "Advanced Financial Dashboard - NEXURAL Admin",
  description: "Comprehensive P&L analysis and financial intelligence dashboard",
  robots: "noindex, nofollow",
}

export default function AdvancedFinancialPage() {
  return <AdvancedFinancialDashboard />
}
