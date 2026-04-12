import type { Metadata } from "next"
import LifecycleManagementDashboard from "@/components/admin/lifecycle-management-dashboard"

export const metadata: Metadata = {
  title: "User Lifecycle Management - NEXURAL Admin",
  description: "Automated user lifecycle management with intelligent journey tracking",
  robots: "noindex, nofollow",
}

export default function LifecycleManagementPage() {
  return <LifecycleManagementDashboard />
}
