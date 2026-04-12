import type { Metadata } from "next"
import AdminDashboardAudit from "@/components/admin-dashboard-audit"

export const metadata: Metadata = {
  title: "Quality Audit - Nexural Trading Admin Dashboard",
  description: "Comprehensive quality assessment of the admin dashboard",
}

export default function AdminAuditPage() {
  return <AdminDashboardAudit />
}
