import type { Metadata } from "next"
import PerformanceDashboardClient from "@/components/dashboard/performance-dashboard-client"

export const metadata: Metadata = {
  title: "Performance Analytics - NEXURAL Trading Dashboard",
  description: "Detailed performance metrics, charts, and statistics for your trading",
}

export default function PerformanceDashboardPage() {
  return <PerformanceDashboardClient />
}
