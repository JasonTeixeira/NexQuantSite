import type { Metadata } from "next"
import DashboardCustomizationClient from "@/components/admin/dashboard-customization-client"

export const metadata: Metadata = {
  title: "Dashboard Customization - Nexural Trading Admin",
  description: "Customize your dashboard layout and widgets",
}

export default function DashboardCustomizationPage() {
  return <DashboardCustomizationClient />
}
