import { redirect } from "next/navigation"

// Redirect base /admin to the dashboard.
export default function AdminIndexPage() {
  redirect("/admin/dashboard")
}
