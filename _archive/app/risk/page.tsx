import type { Metadata } from "next"
import RiskDisclosureClient from "@/components/legal/RiskDisclosureClient"

export const metadata: Metadata = {
  title: "Risk Disclosure | Nexural Trading Platform",
  description: "Comprehensive risk disclosure for trading and educational software. Important warnings about trading risks, platform limitations, and user responsibilities.",
  keywords: "risk disclosure, trading risks, financial risks, software limitations, user responsibility, trading warnings, investment risks, platform risks",
  openGraph: {
    title: "Risk Disclosure | Nexural Trading Platform",
    description: "Comprehensive risk disclosure for trading and educational software. Important warnings about trading risks and platform limitations.",
    type: "article",
    siteName: "Nexural Trading",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RiskDisclosurePage() {
  return <RiskDisclosureClient />
}


