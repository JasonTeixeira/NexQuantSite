import type { Metadata } from "next"
import EnhancedCommunityManagement from "@/components/admin/enhanced-community-management"

export const metadata: Metadata = {
  title: "Enhanced Community Management - Admin Dashboard | Nexural Trading",
  description: "Advanced community management dashboard with chart moderation, code review, live stream controls, competition management, and user verification for enhanced trading community features.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminCommunityManagementPage() {
  return <EnhancedCommunityManagement />
}


