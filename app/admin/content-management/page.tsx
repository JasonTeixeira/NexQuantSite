import type { Metadata } from "next"
import ContentManagementAdmin from "@/components/admin/ContentManagementAdmin"

export const metadata: Metadata = {
  title: "Content Management - Admin Dashboard",
  description: "Manage community guidelines, changelog, system status, and other content pages",
}

export default function ContentManagementPage() {
  return <ContentManagementAdmin />
}


