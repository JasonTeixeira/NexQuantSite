import { Metadata } from 'next'
import MarketplacePageClient from '@/components/marketplace-page-client'

export const metadata: Metadata = {
  title: 'Strategy Marketplace | NEXURAL',
  description: 'Discover, buy, and sell proven trading strategies from top traders worldwide. Browse thousands of backtested strategies with verified performance metrics.',
  keywords: 'trading strategies, algorithmic trading, strategy marketplace, trading bots, quantitative trading',
}

export default function MarketplacePage() {
  return <MarketplacePageClient />
}
