import type { Metadata } from "next"
import ForgotPasswordPageClient from "@/components/auth/forgot-password-page-client"

export const metadata: Metadata = {
  title: "Reset Password - NEXURAL Trading Platform",
  description: "Reset your password to regain access to your NEXURAL trading account",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />
}
