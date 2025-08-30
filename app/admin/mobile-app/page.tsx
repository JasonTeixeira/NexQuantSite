import type { Metadata } from "next"
import MobileAppManagementClient from "@/components/admin/mobile-app-management-client"

export const metadata: Metadata = {
  title: "Mobile App Management - Nexural Trading Admin",
  description: "Comprehensive mobile app monitoring and management",
}

export default function MobileAppManagementPage() {
  return <MobileAppManagementClient />
}
