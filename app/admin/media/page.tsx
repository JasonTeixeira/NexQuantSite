import type { Metadata } from "next"
import AdminMediaClient from "@/components/admin/admin-media-client"

export const metadata: Metadata = {
  title: "Media Library - Admin Dashboard",
  description: "Manage files, images, and media assets",
}

export default function AdminMediaPage() {
  return <AdminMediaClient />
}
