import type { Metadata } from "next"
import AdminLoginClient from "@/components/admin/AdminLoginClient"

export const metadata: Metadata = {
  title: "Admin Login - Nexural Trading",
  description: "Secure administrator access to the Nexural Trading platform",
  robots: "noindex, nofollow", // Don't index admin pages
}

export default function AdminLoginPage() {
  return <AdminLoginClient />
}