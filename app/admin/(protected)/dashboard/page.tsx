"use client"

import dynamic from "next/dynamic"

// Mount the unified admin dashboard with SaaS features integrated
const UnifiedAdminDashboard = dynamic(() => import("@/components/admin/UnifiedAdminDashboard"), { ssr: false })

export default function AdminDashboardPage() {
  return <UnifiedAdminDashboard />
}
