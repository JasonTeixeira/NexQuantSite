import type { Metadata } from "next"
import ReferralLeaderboardClient from "@/components/referrals/ReferralLeaderboardClient"

export const metadata: Metadata = {
  title: "Referral Leaderboard - Nexural Trading",
  description: "See the top performing affiliates and referral champions. Track rankings by referrals, commissions, and growth.",
  keywords: ["referral leaderboard", "top affiliates", "referral champions", "affiliate rankings", "commission leaders"],
}

export default function ReferralLeaderboardPage() {
  return <ReferralLeaderboardClient />
}


