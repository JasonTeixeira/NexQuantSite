import type { Metadata } from "next"
import BillingManagementAdmin from "@/components/admin/BillingManagementAdmin"

export const metadata: Metadata = {
  title: "Billing Management - Admin Dashboard | Nexural Trading",
  description: "Comprehensive billing and subscription management for admin users.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminBillingManagementPage() {
  return <BillingManagementAdmin />
}


