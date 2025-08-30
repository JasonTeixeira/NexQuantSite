import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ReferralLandingClient from "@/components/referrals/ReferralLandingClient"

interface ReferralLandingPageProps {
  params: Promise<{
    code: string
  }>
  searchParams: Promise<{
    source?: string
    campaign?: string
  }>
}

// Mock referral data - in real app, this would come from your database
const mockReferralData = {
  'ALEX2024': {
    referrerName: 'Alex Thompson',
    referrerUsername: 'alex_trader',
    referrerLevel: 'Expert',
    referrerStats: {
      totalTrades: 1247,
      winRate: 73.2,
      totalPnL: 125670.50,
      followers: 2847
    },
    isValid: true,
    bonusAmount: 50,
    referrerBonus: 25,
    expiresAt: '2024-12-31',
    campaignName: 'Winter Bonus Campaign'
  },
  'SARAH2024': {
    referrerName: 'Sarah Chen',
    referrerUsername: 'sarah_crypto',
    referrerLevel: 'Advanced', 
    referrerStats: {
      totalTrades: 892,
      winRate: 68.9,
      totalPnL: 89340.75,
      followers: 1893
    },
    isValid: true,
    bonusAmount: 75,
    referrerBonus: 35,
    expiresAt: '2024-12-31',
    campaignName: 'Crypto Specialist Referral'
  }
}

export async function generateMetadata({ params, searchParams }: ReferralLandingPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const referralData = mockReferralData[resolvedParams.code as keyof typeof mockReferralData]
  
  if (!referralData || !referralData.isValid) {
    return {
      title: 'Invalid Referral Link - Nexural Trading',
      description: 'This referral link is invalid or has expired.',
    }
  }

  return {
    title: `Join Nexural Trading - Invited by ${referralData.referrerName}`,
    description: `${referralData.referrerName} invited you to join Nexural Trading. Get a $${referralData.bonusAmount} welcome bonus and start trading with institutional-grade tools.`,
    keywords: ['referral', 'trading bonus', 'algorithmic trading', 'invitation', referralData.referrerName],
    openGraph: {
      title: `${referralData.referrerName} invited you to Nexural Trading`,
      description: `Get a $${referralData.bonusAmount} welcome bonus when you join through this exclusive invitation.`,
      images: [
        {
          url: '/referral-og-image.png',
          width: 1200,
          height: 630,
          alt: 'Nexural Trading Referral Bonus'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${referralData.referrerName} invited you to Nexural Trading`,
      description: `Get a $${referralData.bonusAmount} welcome bonus when you join!`,
      images: ['/referral-og-image.png']
    }
  }
}

export default async function ReferralLandingPage({ params, searchParams }: ReferralLandingPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const referralData = mockReferralData[resolvedParams.code as keyof typeof mockReferralData]
  
  if (!referralData || !referralData.isValid) {
    notFound()
  }

  return (
    <ReferralLandingClient 
      referralCode={resolvedParams.code}
      referralData={referralData}
      source={resolvedSearchParams.source}
      campaign={resolvedSearchParams.campaign}
    />
  )
}
