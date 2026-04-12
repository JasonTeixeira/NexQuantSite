import type { Metadata } from "next"
import MobileAppManagementConsole from "@/components/admin/mobile-app-management-console"

export const metadata: Metadata = {
  title: "Mobile App Management Console - NEXURAL Admin",
  description: "Comprehensive mobile application monitoring, analytics, and management",
  robots: "noindex, nofollow",
}

export default function MobileAppConsolePage() {
  return <MobileAppManagementConsole />
}
