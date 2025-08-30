// World-Class Conversion Flow - Ordered by Psychology
import type { Metadata } from "next"
import HeroSection from "@/components/HeroSection"
import AIStrategySection from "@/components/AIStrategySection"
import PartnersSection from "@/components/PartnersSection"
import TradingBotsSection from "@/components/TradingBotsSection"
import PricingSection from "@/components/PricingSection"
import WhatIsNexural from "@/components/WhatIsNexural"
import FeaturesGrid from "@/components/FeaturesGrid"
import IndicatorsSection from "@/components/IndicatorsSection"
import IntegrationsSection from "@/components/IntegrationsSection"
import RoadmapSection from "@/components/RoadmapSection"
import NewsletterSection from "@/components/newsletter/NewsletterSection"
import StickyNewsletterBanner from "@/components/newsletter/StickyNewsletterBanner"
import ExitIntentCapture from "@/components/newsletter/ExitIntentCapture"
import { generateHomepageSchema } from "@/lib/seo/schema-markup"

export const metadata: Metadata = {
  title: "Nexural Trading - AI-Powered Trading Platform",
  description: "Advanced AI trading platform with automated bots, real-time signals, and comprehensive market analysis. Join thousands of successful traders maximizing profits with cutting-edge neural network technology.",
  keywords: "AI trading, automated trading, trading bots, market analysis, trading signals, algorithmic trading, neural networks, cryptocurrency trading, forex trading, stock trading, machine learning trading, quantitative trading, robo trading, trading algorithms, financial technology",
  authors: [{ name: "Nexural Trading Team" }],
  creator: "Nexural Trading",
  publisher: "Nexural Trading",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://nexuraltrading.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nexural Trading - AI-Powered Trading Platform",
    description: "Advanced AI trading platform with automated bots, real-time signals, and comprehensive market analysis. Join thousands of successful traders.",
    url: "/",
    siteName: "Nexural Trading",
    images: [
      {
        url: "/og-homepage.jpg",
        width: 1200,
        height: 630,
        alt: "Nexural Trading Platform Dashboard",
      },
      {
        url: "/og-trading-bots.jpg", 
        width: 1200,
        height: 630,
        alt: "AI Trading Bots Performance",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexural Trading - AI-Powered Trading Platform",
    description: "Advanced AI trading platform with automated bots, real-time signals, and comprehensive market analysis. Join thousands of successful traders.",
    images: ["/og-homepage.jpg"],
    creator: "@nexuraltrading",
    site: "@nexuraltrading"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION || "your-google-verification-code",
    yandex: process.env.YANDEX_VERIFICATION || "your-yandex-verification-code",
  },
  category: "Finance",
}

export default function HomePage() {
  // Generate structured data for homepage
  const homepageSchemas = generateHomepageSchema()

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageSchemas)
        }}
      />
      
      <div className="min-h-screen bg-black text-white">
        {/* Act 1: HOOK & CREDIBILITY (0-15 seconds) */}
        <HeroSection />
        <AIStrategySection />
        
        {/* Act 2: SOCIAL PROOF & VALUE (15-45 seconds) */}  
        <PartnersSection />
        <TradingBotsSection />
        <PricingSection />
        
        {/* Act 3: TRUST & DEPTH (45-90 seconds) */}
        <WhatIsNexural />
        <FeaturesGrid />
        
        {/* Act 4: TECHNICAL & FUTURE (90+ seconds - Committed users) */}
        <IndicatorsSection />
        <IntegrationsSection />
        <RoadmapSection />
        <NewsletterSection 
          variant="feature-rich" 
          source="homepage"
          className="border-t border-gray-800"
        />
      </div>

      {/* Email Capture Enhancements */}
      <StickyNewsletterBanner 
        position="bottom"
        source="homepage"
        enabled={true}
      />
      
      <ExitIntentCapture 
        source="homepage"
        enabled={true}
        delay={20000}
      />
    </>
  )
}
