import type { Metadata } from "next"
import SocialManagementAdmin from "@/components/admin/SocialManagementAdmin"

export const metadata: Metadata = {
  title: "Social Management - Admin Dashboard",
  description: "Manage social features, community posts, member interactions, and leaderboards",
}

export default function SocialManagementPage() {
  return <SocialManagementAdmin />
}


