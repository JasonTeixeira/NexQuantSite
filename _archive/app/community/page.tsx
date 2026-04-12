import type { Metadata } from "next"
import EnhancedCommunityHub from "@/components/community/enhanced-community-hub"

export const metadata: Metadata = {
  title: "Trading Community Hub - Nexural Trading",
  description: "Share charts, code, strategies & compete with traders worldwide. Upload trading charts, Pine Script code, and educational content in our interactive community.",
  keywords: [
    "trading community", "chart sharing", "pine script", "trading code", 
    "technical analysis", "strategy sharing", "trading education", "live trading room",
    "trading competition", "social trading", "trading leaderboard", "market analysis"
  ],
}

export default function CommunityPage() {
  return <EnhancedCommunityHub />
}

