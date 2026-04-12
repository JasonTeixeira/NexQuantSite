import type { ReactNode } from "react"
import AdminAuthGuard from "@/components/admin/admin-auth-guard"

// Wrap all protected admin pages with the guard.
export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>
}
