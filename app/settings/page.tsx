import type { Metadata } from "next"
import UserSettingsClient from "@/components/auth/UserSettingsClient"

export const metadata: Metadata = {
  title: "Account Settings - Nexural Trading",
  description: "Manage your account settings, preferences, security, and billing information.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function UserSettingsPage() {
  return <UserSettingsClient />
}