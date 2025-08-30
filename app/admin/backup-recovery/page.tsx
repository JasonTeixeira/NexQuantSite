import type { Metadata } from "next"
import BackupRecoveryDashboard from "@/components/admin/backup-recovery-dashboard"

export const metadata: Metadata = {
  title: "Backup & Disaster Recovery - NEXURAL Admin",
  description: "Automated backup systems and disaster recovery management",
  robots: "noindex, nofollow",
}

export default function BackupRecoveryPage() {
  return <BackupRecoveryDashboard />
}
