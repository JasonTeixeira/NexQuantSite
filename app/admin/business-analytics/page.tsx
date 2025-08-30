import type { Metadata } from "next"
import BusinessAnalyticsAdmin from "@/components/admin/BusinessAnalyticsAdmin"

export const metadata: Metadata = {
  title: "Business Analytics - Admin Dashboard | Nexural Trading",
  description: "Comprehensive business analytics dashboard for admin users with user behavior tracking, conversion metrics, revenue analysis, and real-time insights.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminBusinessAnalyticsPage() {
  return <BusinessAnalyticsAdmin />
}


