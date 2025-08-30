import type { Metadata } from "next"
import UserBillingDashboard from "@/components/dashboard/UserBillingDashboard"

export const metadata: Metadata = {
  title: "Billing & Subscription - Nexural Trading",
  description: "Manage your subscription, payment methods, and billing information.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function UserBillingPage() {
  return <UserBillingDashboard />
}


