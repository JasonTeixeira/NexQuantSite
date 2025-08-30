import type { Metadata } from "next"
import OnboardingClient from "@/components/auth/OnboardingClient"

export const metadata: Metadata = {
  title: "Welcome to Nexural Trading",
  description: "Complete your account setup and get started with AI-powered trading.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function OnboardingPage() {
  return <OnboardingClient />
}


