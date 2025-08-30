import type { Metadata } from "next"
import FinancialReportsClient from "@/components/admin/financial-reports-client"

export const metadata: Metadata = {
  title: "Financial Reports - Nexural Trading Admin Dashboard",
  description: "Comprehensive financial reporting and analytics dashboard",
  robots: "noindex, nofollow",
}

export default function FinancialReportsPage() {
  return <FinancialReportsClient />
}
