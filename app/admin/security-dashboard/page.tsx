import type { Metadata } from "next"
import SecurityDashboardAdmin from "@/components/admin/SecurityDashboardAdmin"

export const metadata: Metadata = {
  title: "Security Dashboard - Admin Dashboard | Nexural Trading",
  description: "Security monitoring dashboard for admin users with threat analytics, system health, and security controls.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminSecurityDashboardPage() {
  return <SecurityDashboardAdmin />
}


