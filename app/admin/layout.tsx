import type { ReactNode } from "react"
import AdminLayoutClient from "@/components/admin/admin-layout-client"

// Server layout that mounts the full admin shell (with left sidebar, header, etc.).
// AdminLayoutClient already skips the shell on /admin/login by returning children early.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
