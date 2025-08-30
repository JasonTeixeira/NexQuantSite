import type { Metadata } from "next"
import { Suspense } from "react"
import VerifyEmailPageClient from "@/components/auth/verify-email-page-client"

export const metadata: Metadata = {
  title: "Verify Email - NEXURAL Trading Platform",
  description: "Verify your email address to complete your NEXURAL account setup",
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <VerifyEmailPageClient />
    </Suspense>
  )
}
