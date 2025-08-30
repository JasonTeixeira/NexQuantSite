import type { Metadata } from "next"
import BotManagement from "@/components/admin/bot-management-fixed"

export const metadata: Metadata = {
  title: "Bot Management - Admin Dashboard | Nexural Trading",
  description: "Comprehensive trading bot management dashboard with real-time analytics, configuration controls, user subscriptions, and performance monitoring for algorithmic trading systems.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminBotManagementPage() {
  return <BotManagement />
}
