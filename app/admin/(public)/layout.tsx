import type { ReactNode } from "react"

// Public admin layout: used by /admin/(public)/* like /admin/login
export default function AdminPublicLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
