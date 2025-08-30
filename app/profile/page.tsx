import type { Metadata } from "next"
import ProfilePageClient from "@/components/auth/ProfilePageClient"

export const metadata: Metadata = {
  title: "User Profile | Nexural Trading Platform",
  description: "Manage your Nexural Trading account settings, preferences, and trading profile.",
  keywords: "user profile, account settings, trading preferences, nexural trading, user dashboard",
  robots: {
    index: false, // Don't index personal profile pages
    follow: false,
  },
}

export default function ProfilePage() {
  return <ProfilePageClient />
}