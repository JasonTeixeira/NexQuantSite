import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import Navigation from "@/components/Navigation"
import PremiumFeaturesNav from "@/components/PremiumFeaturesNav"
import GlobalRiskWarning from "@/components/GlobalRiskWarning"
import ScrollToTop from "@/components/ScrollToTop"
import PageTransition from "@/components/PageTransition"
import ErrorBoundary from "@/components/ui/error-boundary"
import Chatbot from "@/components/ui/chatbot"
import ConditionalFooter from "@/components/ConditionalFooter"
import PWAInstallPrompt from "@/components/pwa/install-prompt"
import PWAServiceWorker from "@/components/pwa/service-worker"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nexural Trading - AI-Powered Trading Platform",
  description:
    "Advanced AI trading platform with automated bots, real-time signals, and comprehensive market analysis. Join thousands of successful traders maximizing profits with cutting-edge neural network technology.",
  keywords:
    "AI trading, cryptocurrency, trading bots, market analysis, automated trading, trading signals, neural networks, PWA, mobile trading",
  authors: [{ name: "Nexural Trading Team" }],
  creator: "Nexural Trading",
  publisher: "Nexural Trading",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://nexuraltrading.com"),
  alternates: {
    canonical: "/",
  },
  // 📱 PWA Metadata
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nexural Trading",
    startupImage: [
      {
        url: "/icons/launch-screen-2048x2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
      }
    ]
  },
  applicationName: "Nexural Trading",
  openGraph: {
    title: "Nexural Trading - AI-Powered Trading Platform",
    description:
      "Advanced AI trading platform with automated bots and real-time market analysis powered by neural networks",
    url: "https://nexuraltrading.com",
    siteName: "Nexural Trading",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nexural Trading Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexural Trading - AI-Powered Trading Platform",
    description:
      "Advanced AI trading platform with automated bots and real-time market analysis powered by neural networks",
    images: ["/og-image.jpg"],
    creator: "@nexuraltrading",
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
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="color-scheme" content="dark light" />
        
        {/* 📱 iOS Web App Configuration */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* 📱 PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nexural Trading" />
        <meta name="application-name" content="Nexural Trading" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* 🔗 PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-32x32.svg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#00BCD4" />
        
        {/* ⚡ Performance & CDN Preconnects */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.nexuraltrading.com" />
        <link rel="dns-prefetch" href="https://assets.nexuraltrading.com" />
        
        {/* 🎯 PWA Launch Screen (iOS) */}
        <meta name="apple-mobile-web-app-title" content="Nexural Trading" />
        <link rel="apple-touch-startup-image" href="/icons/launch-screen-2048x2732.png" />
        
        {/* 🔔 Push Notification Support */}
        <meta name="firebase-messaging-sw-version" content="1.0.0" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ErrorBoundary>
            <GlobalRiskWarning />
            <div
              className="min-h-screen bg-black text-white"
              style={{
                background: "radial-gradient(ellipse at top, rgba(6,182,212,0.05) 0%, rgba(0,0,0,1) 50%)",
              }}
            >
              <Navigation />
              <PremiumFeaturesNav />
              <PageTransition>
                <main id="main-content" role="main">
                  {children}
                </main>
              </PageTransition>
              <ConditionalFooter />
              <ScrollToTop />
              <Chatbot />
              
              {/* 📱 PWA Components */}
              <PWAInstallPrompt />
            </div>
          </ErrorBoundary>
          <Toaster />
          <SonnerToaster />
          
          {/* 🚀 PWA Service Worker Registration */}
          <PWAServiceWorker />
        </Providers>
      </body>
    </html>
  )
}
