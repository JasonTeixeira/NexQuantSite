import type { Metadata } from "next"
import DisasterRecoveryAdmin from "@/components/admin/DisasterRecoveryAdmin"

export const metadata: Metadata = {
  title: "Disaster Recovery & Backups - Admin Dashboard",
  description: "Comprehensive disaster recovery and backup management system with enterprise-grade reliability",
}

export default function DisasterRecoveryPage() {
  return <DisasterRecoveryAdmin />
}


