import type { Metadata } from "next"
import AdvancedAnalyticsDashboard from "@/components/admin/advanced-analytics-dashboard"

export const metadata: Metadata = {
  title: "Advanced Analytics - NEXURAL Admin",
  description: "AI-powered analytics dashboard with predictive insights and deep user behavior analysis",
  robots: "noindex, nofollow",
}

export default function AdvancedAnalyticsPage() {
  return <AdvancedAnalyticsDashboard />
}
