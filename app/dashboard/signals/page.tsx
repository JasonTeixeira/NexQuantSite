import type { Metadata } from "next"
import SignalsDashboardClient from "@/components/dashboard/signals-dashboard-client"

export const metadata: Metadata = {
  title: "Live Signals - NEXURAL Trading Dashboard",
  description: "Real-time trading signals with execution capabilities",
}

export default function SignalsDashboardPage() {
  return <SignalsDashboardClient />
}
