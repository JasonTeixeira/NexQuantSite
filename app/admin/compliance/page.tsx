import type { Metadata } from "next"
import ComplianceClient from "@/components/admin/compliance-client"

export const metadata: Metadata = {
  title: "Compliance & Legal - Nexural Trading Admin Dashboard",
  description: "Compliance management and legal documentation system",
  robots: "noindex, nofollow",
}

export default function CompliancePage() {
  return <ComplianceClient />
}
