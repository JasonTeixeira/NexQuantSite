import type { Metadata } from "next"
import RoleManagementClient from "@/components/admin/RoleManagementClient"

export const metadata: Metadata = {
  title: "Role Management | Admin Dashboard",
  description: "Manage user roles and permissions for the Nexural Trading platform.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RoleManagementPage() {
  return <RoleManagementClient />
}


