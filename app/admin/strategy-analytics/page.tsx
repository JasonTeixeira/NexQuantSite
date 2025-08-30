import { Metadata } from "next"
import StrategyTestingAnalytics from "@/components/admin/strategy-testing-analytics"

export const metadata: Metadata = {
  title: "Strategy Analytics - Nexural Trading Admin Dashboard",
  description: "Revenue and usage analytics for pay-per-use strategy testing platform",
}

export default function StrategyAnalyticsPage() {
  return <StrategyTestingAnalytics />
}
