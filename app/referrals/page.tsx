import type { Metadata } from "next"
import UserReferralDashboard from "@/components/referrals/UserReferralDashboard"

export const metadata: Metadata = {
  title: "Referral Dashboard - Nexural Trading",
  description: "Manage your referrals, track commissions, and earn rewards by inviting friends to Nexural Trading.",
  keywords: ["referrals", "commissions", "rewards", "invite friends", "trading bonuses", "affiliate program"],
}

export default function ReferralDashboardPage() {
  return <UserReferralDashboard />
}