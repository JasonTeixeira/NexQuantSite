import { Metadata } from "next"
import TestingCostMonitor from "@/components/admin/testing-cost-monitor"

export const metadata: Metadata = {
  title: "Testing Cost Monitor - Admin Dashboard",
  description: "Real-time cost monitoring, user profitability tracking, and margin analysis for the testing engine",
}

export default function TestingCostsPage() {
  return <TestingCostMonitor />
}
