import type { Metadata } from "next"
import { Suspense } from "react"
import LoginPageClient from "@/components/auth/LoginPageClient"

export const metadata: Metadata = {
  title: "Sign In | Nexural Trading Platform",
  description: "Sign in to your Nexural Trading account to access advanced trading tools, educational content, and community features.",
  keywords: "login, sign in, trading account, nexural trading, user authentication, secure login",
  openGraph: {
    title: "Sign In | Nexural Trading Platform",
    description: "Sign in to your Nexural Trading account to access advanced trading tools and educational content.",
    type: "website",
    siteName: "Nexural Trading",
  },
  robots: {
    index: false, // Don't index login pages
    follow: true,
  },
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginPageClient />
    </Suspense>
  )
}