import type { Metadata } from "next"
import { Suspense } from "react"
import RegisterPageClient from "@/components/auth/RegisterPageClient"

export const metadata: Metadata = {
  title: "Create Account | Nexural Trading Platform",
  description: "Create your free Nexural Trading account to access advanced trading tools, educational content, and join our community of professional traders.",
  keywords: "register, sign up, create account, trading account, nexural trading, free account, trader registration",
  openGraph: {
    title: "Create Account | Nexural Trading Platform",
    description: "Create your free Nexural Trading account to access advanced trading tools and educational content.",
    type: "website",
    siteName: "Nexural Trading",
  },
  robots: {
    index: false, // Don't index registration pages
    follow: true,
  },
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <RegisterPageClient />
    </Suspense>
  )
}