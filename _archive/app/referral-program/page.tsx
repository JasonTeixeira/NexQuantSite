import type { Metadata } from "next"
import ReferralProgramClient from "@/components/referrals/ReferralProgramClient"

export const metadata: Metadata = {
  title: "Referral Program - Nexural Trading",
  description: "Earn up to 50% commissions by referring traders to Nexural Trading. Join our affiliate program and start earning passive income today.",
  keywords: ["referral program", "affiliate marketing", "trading commissions", "passive income", "refer friends", "earn money"],
  openGraph: {
    title: "Nexural Trading Referral Program - Earn Up to 50% Commissions",
    description: "Join our referral program and earn generous commissions for every trader you refer. Multiple tiers, instant payouts, and professional support.",
    images: [
      {
        url: '/referral-program-og.png',
        width: 1200,
        height: 630,
        alt: 'Nexural Trading Referral Program'
      }
    ]
  }
}

export default function ReferralProgramPage() {
  return <ReferralProgramClient />
}


