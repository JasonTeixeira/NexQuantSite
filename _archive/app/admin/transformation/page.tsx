import type { Metadata } from "next"
import TransformationDashboard from "@/components/transformation-dashboard"

export const metadata: Metadata = {
  title: "Enterprise Transformation - Nexural Trading Platform",
  description: "24-month transformation roadmap to world-class admin dashboard",
  robots: "noindex, nofollow",
}

export default function TransformationPage() {
  return <TransformationDashboard />
}
