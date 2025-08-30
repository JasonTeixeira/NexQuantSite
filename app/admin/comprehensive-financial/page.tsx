import type { Metadata } from "next"
import AdvancedFinancialDashboard from "@/components/admin/advanced-financial-dashboard"

export const metadata: Metadata = {
  title: "Comprehensive Financial Intelligence - NEXURAL Admin",
  description: "Advanced P&L analysis, tax reporting, and predictive financial forecasting",
  robots: "noindex, nofollow",
}

export default function ComprehensiveFinancialPage() {
  return <AdvancedFinancialDashboard />
}
