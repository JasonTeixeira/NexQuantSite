import { Metadata } from 'next'
import SellStrategyPageClient from '@/components/sell-strategy-page-client'

export const metadata: Metadata = {
  title: 'Sell Your Strategy | NEXURAL Marketplace',
  description: 'Start earning by selling your proven trading strategies. Join thousands of successful strategy creators on NEXURAL.',
  keywords: 'sell trading strategies, strategy marketplace, trading income, algorithmic trading',
}

export default function SellStrategyPage() {
  return <SellStrategyPageClient />
}
