import type { Metadata } from "next"
import AdminSupportClient from "@/components/admin/admin-support-client"

export const metadata: Metadata = {
  title: "Customer Support - Admin Dashboard",
  description: "Manage customer support tickets, live chat, and knowledge base",
  robots: "noindex, nofollow",
}

export default function AdminSupportPage() {
  return <AdminSupportClient />
}
