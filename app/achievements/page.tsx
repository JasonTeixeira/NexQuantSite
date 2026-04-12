import type { Metadata } from "next"
import AchievementsClient from "@/components/gamification/AchievementsClient"

export const metadata: Metadata = {
  title: "Achievements - Nexural Trading",
  description: "Track your trading achievements, badges, and progress. Unlock rewards and climb the ranks in our gamified trading community.",
  keywords: ["achievements", "badges", "gamification", "rewards", "trading progress", "leaderboard"],
}

export default function AchievementsPage() {
  return <AchievementsClient />
}


