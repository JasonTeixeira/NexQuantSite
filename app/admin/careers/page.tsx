import type { Metadata } from "next"
import AdminCareersClient from "@/components/admin/AdminCareersClient"

export const metadata: Metadata = {
  title: "Careers Management | Admin Dashboard - Nexural Trading",
  description: "Manage job postings, applications, and career opportunities through the comprehensive admin interface",
}

export default function AdminCareersPage() {
  return <AdminCareersClient />
}

