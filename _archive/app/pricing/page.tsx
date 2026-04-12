import type { Metadata } from "next"
import PricingPageClient from "@/components/pricing-page-client"
import { generatePricingSchema } from "@/lib/seo/schema-markup"

export const metadata: Metadata = {
  title: "Pricing Plans - Choose Your Trading Edge | Nexural Trading",
  description: "Flexible pricing plans designed for every type of trader. From free community access to professional automation solutions. Start free, upgrade anytime. No hidden fees.",
  keywords: "trading platform pricing, AI trading plans, trading software cost, free trading tools, premium trading features, professional trading subscription, trading platform fees, algorithmic trading pricing",
  openGraph: {
    title: "Nexural Trading Pricing - Plans for Every Trader",
    description: "Flexible pricing plans from free to professional. Start trading with AI-powered tools today.",
    type: "website",
    images: [
      {
        url: "/og-pricing.jpg",
        width: 1200,
        height: 630,
        alt: "Nexural Trading Pricing Plans",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexural Trading Pricing - Plans for Every Trader", 
    description: "Flexible pricing plans from free to professional. Start trading with AI-powered tools today.",
    images: ["/og-pricing.jpg"],
  },
  alternates: {
    canonical: "/pricing",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PricingPage() {
  // Generate structured data for pricing
  const pricingSchemas = generatePricingSchema()

  return (
    <>
      {/* Structured Data for Pricing Products */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pricingSchemas)
        }}
      />
      <PricingPageClient />
    </>
  )
}
