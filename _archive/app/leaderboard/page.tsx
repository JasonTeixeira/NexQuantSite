import { Metadata } from 'next'
import LeaderboardPageClient from '@/components/leaderboard-page-client'

export const metadata: Metadata = {
  title: 'Leaderboard - NEXURAL Trading Platform',
  description: 'Compete with top traders and climb the leaderboard rankings',
}

export default function LeaderboardPage() {
  return <LeaderboardPageClient />
}
