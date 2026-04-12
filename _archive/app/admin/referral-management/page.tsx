import type { Metadata } from "next"
import ReferralManagementAdmin from "@/components/admin/ReferralManagementAdmin"

export const metadata: Metadata = {
  title: "Referral Management - Admin Dashboard",
  description: "Manage referral program, track affiliate performance, and oversee commission payouts",
}

export default function ReferralManagementPage() {
  return <ReferralManagementAdmin />
}