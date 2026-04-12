import type { Metadata } from "next"
import LeaderboardManagement from "@/components/admin/leaderboard-management"

export const metadata: Metadata = {
  title: "Leaderboard Management - Admin Dashboard | Nexural Trading",
  description: "Complete leaderboard management system with user rankings, competition control, achievement management, fraud detection, and performance analytics for the trading leaderboard platform.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLeaderboardManagementPage() {
  return <LeaderboardManagement />
}
