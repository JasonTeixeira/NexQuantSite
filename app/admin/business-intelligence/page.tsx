import type { Metadata } from "next"
import BusinessIntelligenceDashboard from "@/components/admin/business-intelligence-dashboard"

export const metadata: Metadata = {
  title: "Business Intelligence - NEXURAL Admin",
  description: "Comprehensive business intelligence engine with predictive analytics and custom reporting",
  robots: "noindex, nofollow",
}

export default function BusinessIntelligencePage() {
  return <BusinessIntelligenceDashboard />
}
