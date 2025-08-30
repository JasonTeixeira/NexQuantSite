import type { Metadata } from "next"
import UserOnboardingAdmin from "@/components/admin/UserOnboardingAdmin"

export const metadata: Metadata = {
  title: "User Onboarding Management - Admin Dashboard | Nexural Trading",
  description: "Manage user onboarding flows, completion rates, and analytics for admin users.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminUserOnboardingPage() {
  return <UserOnboardingAdmin />
}


