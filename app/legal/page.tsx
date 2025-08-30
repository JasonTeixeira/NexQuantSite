import type { Metadata } from "next"
import LegalHubClient from "@/components/legal/LegalHubClient"

export const metadata: Metadata = {
  title: "Legal Information & Documentation | Nexural Trading Platform",
  description: "Comprehensive legal documentation for Nexural Trading Platform including Terms of Service, Privacy Policy, Risk Disclosure, and compliance information.",
  keywords: "legal documentation, terms of service, privacy policy, risk disclosure, compliance, trading platform legal",
  openGraph: {
    title: "Legal Information & Documentation | Nexural Trading Platform",
    description: "Comprehensive legal documentation for Nexural Trading Platform including Terms of Service, Privacy Policy, and Risk Disclosure.",
    type: "website",
    siteName: "Nexural Trading",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LegalPage() {
  return <LegalHubClient />
}
