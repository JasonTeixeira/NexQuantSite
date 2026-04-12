import type { Metadata } from "next"
import PrivacyPolicyClient from "@/components/legal/PrivacyPolicyClient"

export const metadata: Metadata = {
  title: "Privacy Policy | Nexural Trading Platform",
  description: "Comprehensive Privacy Policy for Nexural Trading Platform. GDPR and CCPA compliant data protection practices, user rights, and privacy controls.",
  keywords: "privacy policy, data protection, GDPR, CCPA, user privacy, data rights, trading platform privacy, personal information protection",
  openGraph: {
    title: "Privacy Policy | Nexural Trading Platform", 
    description: "Comprehensive Privacy Policy for Nexural Trading Platform. GDPR and CCPA compliant data protection practices.",
    type: "article",
    siteName: "Nexural Trading",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />
}


