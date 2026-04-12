import type { Metadata } from "next"
import TermsOfServiceClient from "@/components/legal/TermsOfServiceClient"

export const metadata: Metadata = {
  title: "Terms of Service | Nexural Trading Platform",
  description: "Comprehensive Terms of Service for Nexural Trading Platform. Educational trading tools and software terms, user obligations, and platform usage guidelines.",
  keywords: "terms of service, trading platform terms, educational software terms, user agreement, platform rules, trading software agreement",
  openGraph: {
    title: "Terms of Service | Nexural Trading Platform",
    description: "Comprehensive Terms of Service for Nexural Trading Platform. Educational trading tools and software terms.",
    type: "article",
    siteName: "Nexural Trading",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  return <TermsOfServiceClient />
}


