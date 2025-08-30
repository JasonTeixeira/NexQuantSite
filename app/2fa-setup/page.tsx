import type { Metadata } from "next"
import TwoFactorSetupPageClient from "@/components/auth/2fa-setup-page-client"

export const metadata: Metadata = {
  title: "Two-Factor Authentication Setup - NEXURAL Trading",
  description: "Secure your account with two-factor authentication",
}

export default function TwoFactorSetupPage() {
  return <TwoFactorSetupPageClient />
}
