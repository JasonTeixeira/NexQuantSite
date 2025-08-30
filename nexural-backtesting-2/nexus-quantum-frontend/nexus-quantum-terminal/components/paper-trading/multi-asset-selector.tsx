// 🌟 MULTI-ASSET SELECTOR - Choose from ALL asset classes for paper trading
// Comprehensive asset class selection with broker compatibility

"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUpIcon, 
  BitcoinIcon, 
  BarChart3Icon, 
  GlobeIcon,
  CandlestickChartIcon,
  ShieldIcon,
  ZapIcon,
  StarIcon,
  CheckCircleIcon
} from 'lucide-react'
import { 
  CRYPTO_PAPER_BROKERS, 
  FUTURES_PAPER_BROKERS, 
  FOREX_PAPER_BROKERS,
  ALL_ASSET_BROKERS,
  MultiAssetBrokerFactory 
} from '@/lib/paper-trading/multi-asset-brokers'

interface AssetClass {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  examples: string[]
  riskLevel: 'low' | 'medium' | 'high'
  tradingHours: string
  minCapital: string
  features: string[]
}

const ASSET_CLASSES: AssetClass[] = [
  {
    id: 'equities',
    name: 'Stocks & ETFs',
    icon: <TrendingUpIcon className="w-6 h-6" />,
    description: 'Traditional stock market trading with shares and ETFs',
    examples: ['AAPL', 'MSFT', 'SPY', 'QQQ', 'TSLA', 'GOOGL'],
    riskLevel: 'medium',
    tradingHours: '9:30 AM - 4:00 PM ET',
    minCapital: '$1,000',
    features: ['Dividend income', 'Long-term growth', 'Options available', 'Well regulated']
  },
  {
    id: 'cryptocurrency',
    name: 'Cryptocurrency',
    icon: <BitcoinIcon className="w-6 h-6" />,
    description: 'Digital assets including spot, futures, and perpetual swaps',
    examples: ['BTC/USDT', 'ETH/USD', 'BTC-PERP', 'ETH Options', 'DOGE/BTC'],
    riskLevel: 'high',
    tradingHours: '24/7',
    minCapital: '$100',
    features: ['24/7 trading', 'High volatility', 'Futures & options', 'Staking rewards']
  },
  {
    id: 'futures',
    name: 'Futures & Commodities',
    icon: <BarChart3Icon className="w-6 h-6" />,
    description: 'Standardized contracts for commodities, indices, and currencies',
    examples: ['ES (S&P 500)', 'CL (Crude Oil)', 'GC (Gold)', 'ZW (Wheat)', '6E (Euro)'],
    riskLevel: 'high',
    tradingHours: 'Nearly 24 hours',
    minCapital: '$5,000',
    features: ['Leverage up to 20:1', 'Hedging tools', 'Global markets', 'Low commissions']
  },
  {
    id: 'forex',
    name: 'Foreign Exchange',
    icon: <GlobeIcon className="w-6 h-6" />,
    description: 'Currency pair trading with major, minor, and exotic pairs',
    examples: ['EUR/USD', 'GBP/JPY', 'USD/CAD', 'AUD/NZD', 'USD/TRY'],
    riskLevel: 'high',
    tradingHours: '24/5 (Sun 5pm - Fri 4pm ET)',
    minCapital: '$500',
    features: ['High leverage', 'Low spreads', 'Economic events', 'Carry trades']
  },
  {
    id: 'options',
    name: 'Options Trading',
    icon: <CandlestickChartIcon className="w-6 h-6" />,
    description: 'Derivatives trading with calls, puts, and complex strategies',
    examples: ['AAPL Call $200', 'SPY Put $400', 'Iron Condor', 'Covered Call', 'Straddle'],
    riskLevel: 'high',
    tradingHours: '9:30 AM - 4:00 PM ET',
    minCapital: '$2,000',
    features: ['Limited risk strategies', 'Income generation', 'Portfolio hedging', 'Complex strategies']
  },
  {
    id: 'bonds',
    name: 'Bonds & Fixed Income',
    icon: <ShieldIcon className="w-6 h-6" />,
    description: 'Government, corporate, and municipal bonds for steady income',
    examples: ['US 10Y Treasury', 'Corporate AAA', 'Municipal Bonds', 'TIPS', 'High Yield'],
    riskLevel: 'low',
    tradingHours: '8:00 AM - 5:00 PM ET',
    minCapital: '$1,000',
    features: ['Steady income', 'Capital preservation', 'Inflation protection', 'Portfolio diversification']
  }
]

interface MultiAssetSelectorProps {
  onAssetClassSelected?: (assetClass: string, brokers: any[]) => void
  selectedAssetClasses?: string[]
  className?: string
}

export function MultiAssetSelector({ 
  onAssetClassSelected, 
  selectedAssetClasses = [],
  className = ""
}: MultiAssetSelectorProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAssets, setSelectedAssets] = useState<string[]>(selectedAssetClasses)

  const handleAssetSelection = (assetId: string) => {
    const newSelection = selectedAssets.includes(assetId)
      ? selectedAssets.filter(id => id !== assetId)
      : [...selectedAssets, assetId]
    
    setSelectedAssets(newSelection)
    
    if (onAssetClassSelected) {
      const brokers = getBrokersForAssetClass(assetId)
      onAssetClassSelected(assetId, brokers)
    }
  }

  const getBrokersForAssetClass = (assetClass: string) => {
    switch (assetClass) {
      case 'cryptocurrency':
        return CRYPTO_PAPER_BROKERS
      case 'futures':
        return FUTURES_PAPER_BROKERS
      case 'forex':
        return FOREX_PAPER_BROKERS
      case 'equities':
      case 'options':
      case 'bonds':
        return ALL_ASSET_BROKERS.filter(broker => 
          broker.assetClasses.some(ac => ac.toLowerCase().includes(assetClass))
        )
      default:
        return []
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTotalBrokers = () => {
    return CRYPTO_PAPER_BROKERS.length + 
           FUTURES_PAPER_BROKERS.length + 
           FOREX_PAPER_BROKERS.length + 
           ALL_ASSET_BROKERS.length
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Complete Multi-Asset Paper Trading</h2>
        <p className="text-gray-400 mb-4">
          Trade across ALL major asset classes with professional paper trading environments
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-400" />
            <span className="text-green-400">{ASSET_CLASSES.length} Asset Classes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400">{getTotalBrokers()}+ Broker Integrations</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400">24/7 Global Markets</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a1a2e] border-[#2a2a3e]">
          <TabsTrigger value="overview">Asset Classes</TabsTrigger>
          <TabsTrigger value="brokers">Broker Integrations</TabsTrigger>
          <TabsTrigger value="features">Platform Features</TabsTrigger>
        </TabsList>

        {/* Asset Classes Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ASSET_CLASSES.map(asset => {
              const isSelected = selectedAssets.includes(asset.id)
              const brokerCount = getBrokersForAssetClass(asset.id).length
              
              return (
                <Card 
                  key={asset.id}
                  className={`bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#3a3a4e] cursor-pointer transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
                  }`}
                  onClick={() => handleAssetSelection(asset.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#00bbff]/20 rounded-lg flex items-center justify-center">
                          {asset.icon}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{asset.name}</CardTitle>
                          <Badge className={getRiskColor(asset.riskLevel)} size="sm">
                            {asset.riskLevel.toUpperCase()} RISK
                          </Badge>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-400">{asset.description}</p>

                    {/* Examples */}
                    <div>
                      <div className="text-sm font-medium text-white mb-2">Examples</div>
                      <div className="flex flex-wrap gap-1">
                        {asset.examples.slice(0, 3).map(example => (
                          <Badge key={example} variant="outline" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                        {asset.examples.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{asset.examples.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Key Info */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-gray-400">Trading Hours</div>
                        <div className="text-white">{asset.tradingHours}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Min Capital</div>
                        <div className="text-white">{asset.minCapital}</div>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <div className="text-sm font-medium text-white mb-2">Key Features</div>
                      <div className="space-y-1">
                        {asset.features.slice(0, 2).map(feature => (
                          <div key={feature} className="text-xs text-gray-400 flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3 text-green-400" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Broker Count */}
                    <div className="pt-2 border-t border-[#2a2a3e]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Available Brokers</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {brokerCount} brokers
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Broker Integrations */}
        <TabsContent value="brokers">
          <div className="space-y-6">
            {/* Crypto Brokers */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BitcoinIcon className="w-5 h-5 text-yellow-400" />
                Cryptocurrency Exchanges ({CRYPTO_PAPER_BROKERS.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {CRYPTO_PAPER_BROKERS.map(broker => (
                  <Card key={broker.id} className="bg-[#1a1a2e] border-[#2a2a3e] p-3">
                    <div className="text-center">
                      <div className="font-medium text-white text-sm mb-1">{broker.name}</div>
                      <div className="text-xs text-gray-400 mb-2">{broker.commissionStructure}</div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {broker.features.slice(0, 2).map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Futures Brokers */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3Icon className="w-5 h-5 text-blue-400" />
                Futures & Commodities ({FUTURES_PAPER_BROKERS.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {FUTURES_PAPER_BROKERS.map(broker => (
                  <Card key={broker.id} className="bg-[#1a1a2e] border-[#2a2a3e] p-3">
                    <div className="text-center">
                      <div className="font-medium text-white text-sm mb-1">{broker.name}</div>
                      <div className="text-xs text-gray-400 mb-2">{broker.commissionStructure}</div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {broker.features.slice(0, 2).map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Forex Brokers */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <GlobeIcon className="w-5 h-5 text-green-400" />
                Forex & Currency ({FOREX_PAPER_BROKERS.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FOREX_PAPER_BROKERS.map(broker => (
                  <Card key={broker.id} className="bg-[#1a1a2e] border-[#2a2a3e] p-3">
                    <div className="text-center">
                      <div className="font-medium text-white text-sm mb-1">{broker.name}</div>
                      <div className="text-xs text-gray-400 mb-2">{broker.commissionStructure}</div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {broker.features.slice(0, 2).map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Platform Features */}
        <TabsContent value="features">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e] p-6">
              <div className="text-center">
                <ZapIcon className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Real-Time Data</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Live market data across all asset classes with millisecond latency
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Stocks & ETFs</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Crypto 24/7</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Futures Global</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Forex 24/5</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e] p-6">
              <div className="text-center">
                <ShieldIcon className="w-12 h-12 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Risk Management</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Advanced risk controls for all asset classes with real-time monitoring
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Position Sizing</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Stop Loss/Take Profit</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Margin Monitoring</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Portfolio Limits</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e] p-6">
              <div className="text-center">
                <StarIcon className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Professional-grade analytics and performance tracking
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Multi-Asset P&L</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Risk Metrics</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Correlation Analysis</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Performance Attribution</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selection Summary */}
      {selectedAssets.length > 0 && (
        <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Selected Asset Classes</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAssets.map(assetId => {
                    const asset = ASSET_CLASSES.find(a => a.id === assetId)
                    return asset ? (
                      <Badge key={assetId} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {asset.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Paper Trading
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MultiAssetSelector
