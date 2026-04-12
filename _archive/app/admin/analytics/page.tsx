import type { Metadata } from "next"
import AdvancedAnalyticsClient from "@/components/admin/advanced-analytics-client"

export const metadata: Metadata = {
  title: "Advanced Analytics - Nexural Trading Admin Dashboard",
  description: "Business intelligence and advanced analytics dashboard",
  robots: "noindex, nofollow",
}

export default function AdvancedAnalyticsPage() {
  return <AdvancedAnalyticsClient />
}
