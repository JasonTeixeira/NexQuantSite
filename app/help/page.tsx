import type { Metadata } from "next"
import HelpCenterClient from "@/components/help-center/HelpCenterClient"

export const metadata: Metadata = {
  title: "Help Center | Nexural Trading Platform",
  description: "Find answers to your questions, browse our knowledge base, and get support for Nexural Trading platform. 24/7 customer support available.",
  keywords: "help center, support, FAQ, knowledge base, customer service, trading help, platform guide, troubleshooting, nexural trading support",
  openGraph: {
    title: "Help Center | Nexural Trading Platform",
    description: "Find answers to your questions and get support for Nexural Trading platform. Comprehensive help center with guides and FAQs.",
    type: "website",
    siteName: "Nexural Trading",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HelpCenterPage() {
  return <HelpCenterClient />
}


