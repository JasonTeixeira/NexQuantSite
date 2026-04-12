"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type GuardState = "checking" | "denied" | "ok"

// Minimal, resilient guard for protected admin routes.
// - Calls /api/admin/verify-session
// - Never throws; shows a visible progress state
export default function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<GuardState>("checking")

  useEffect(() => {
    let cancelled = false
    
    // Always require proper authentication (no development bypass)
    // This ensures proper login flow in all environments

    async function verify() {      
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null
        if (!token) {
          if (!cancelled) setState("denied")
          return
        }
        const res = await fetch("/api/admin/verify-session", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!cancelled) setState(res.ok ? "ok" : "denied")
      } catch {
        if (!cancelled) setState("denied")
      }
    }
    verify()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (state === "denied") {
      try {
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminUser")
      } catch {}
      router.replace("/admin/login")
    }
  }, [state, router])

  if (state !== "ok") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span>{state === "checking" ? "Verifying session…" : "Redirecting to login…"}</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
