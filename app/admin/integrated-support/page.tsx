import type { Metadata } from "next"
import IntegratedHelpDeskDashboard from "@/components/admin/integrated-helpdesk-dashboard"

export const metadata: Metadata = {
  title: "Integrated Support System - NEXURAL Admin",
  description: "Comprehensive customer support and ticket management system",
  robots: "noindex, nofollow",
}

export default function IntegratedSupportPage() {
  return <IntegratedHelpDeskDashboard />
}
