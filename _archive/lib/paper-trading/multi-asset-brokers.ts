// 🌟 MULTI-ASSET BROKER INTEGRATIONS - Crypto, Futures, Forex & More
// Comprehensive paper trading across ALL asset classes

import { BrokerConfig, BrokerAPI, PaperTradeOrder } from './broker-integrations'

// 🪙 CRYPTOCURRENCY PAPER TRADING BROKERS
export const CRYPTO_PAPER_BROKERS: BrokerConfig[] = [
  {
    id: 'binance_testnet',
    name: 'Binance Testnet',
    description: 'Binance paper trading with full crypto market access',
    features: ['Spot trading', 'Futures', 'Options', 'Margin', 'Real market data'],
    assetClasses: ['Crypto Spot', 'Crypto Futures', 'Crypto Options', 'Perpetual Swaps'],
    apiEndpoint: 'https://testnet.binance.vision',
    requiresApiKey: true,
    commissionStructure: '0.1% spot / 0.02% futures (simulated)',
    minBalance: 100000, // $100k USDT equivalent
    maxPortfolioValue: 10000000,
    orderTypes: ['market', 'limit', 'stop_market', 'stop_limit', 'take_profit', 'oco'],
    logo: '/logos/binance.png',
    status: 'active'
  },
  {
    id: 'coinbase_sandbox',
    name: 'Coinbase Pro Sandbox',
    description: 'Professional crypto trading sandbox environment',
    features: ['Institutional grade', 'Advanced orders', 'API trading', 'Real-time data'],
    assetClasses: ['Crypto Spot', 'Crypto Staking'],
    apiEndpoint: 'https://api-public.sandbox.pro.coinbase.com',
    requiresApiKey: true,
    commissionStructure: '0.5% taker / 0.0% maker (simulated)',
    minBalance: 50000,
    maxPortfolioValue: 5000000,
    orderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    logo: '/logos/coinbase.png',
    status: 'active'
  },
  {
    id: 'bybit_testnet',
    name: 'Bybit Testnet',
    description: 'Advanced crypto derivatives paper trading',
    features: ['Perpetual futures', 'Options', 'Copy trading', 'Advanced charts'],
    assetClasses: ['Crypto Futures', 'Perpetual Swaps', 'Crypto Options', 'Inverse Futures'],
    apiEndpoint: 'https://api-testnet.bybit.com',
    requiresApiKey: true,
    commissionStructure: '0.01% maker / 0.06% taker futures',
    minBalance: 100000,
    maxPortfolioValue: 10000000,
    orderTypes: ['market', 'limit', 'conditional', 'stop_loss', 'take_profit'],
    logo: '/logos/bybit.png',
    status: 'active'
  },
  {
    id: 'deribit_testnet', 
    name: 'Deribit Testnet',
    description: 'Bitcoin and Ethereum options & futures specialist',
    features: ['Crypto options', 'BTC/ETH futures', 'Advanced greeks', 'Volatility trading'],
    assetClasses: ['BTC Options', 'ETH Options', 'BTC Futures', 'ETH Futures', 'Perpetual Swaps'],
    apiEndpoint: 'https://test.deribit.com/api/v2',
    requiresApiKey: true,
    commissionStructure: '0.03% options / 0.025% futures',
    minBalance: 50000,
    maxPortfolioValue: 5000000,
    orderTypes: ['market', 'limit', 'stop_market', 'stop_limit', 'market_if_touched'],
    logo: '/logos/deribit.png',
    status: 'active'
  }
]

// 📈 FUTURES & DERIVATIVES PAPER TRADING BROKERS  
export const FUTURES_PAPER_BROKERS: BrokerConfig[] = [
  {
    id: 'ninjatrader_sim',
    name: 'NinjaTrader Simulation',
    description: 'Professional futures trading simulation environment',
    features: ['All major futures', 'Advanced charting', 'Strategy automation', 'Market replay'],
    assetClasses: ['Futures', 'Micro Futures', 'Options on Futures', 'Forex'],
    apiEndpoint: 'https://sim.ninjatrader.com/api',
    requiresApiKey: true,
    commissionStructure: '$2.09/contract ES, $1.29 micro futures',
    minBalance: 25000, // Lower for futures
    maxPortfolioValue: 2000000,
    orderTypes: ['market', 'limit', 'stop_market', 'stop_limit', 'market_if_touched', 'one_cancels_other'],
    logo: '/logos/ninjatrader.png',
    status: 'active'
  },
  {
    id: 'tradovate_sim',
    name: 'Tradovate Simulation',
    description: 'Cloud-based futures trading simulation',
    features: ['Commission-free sim', 'All CME products', 'Mobile trading', 'Social features'],
    assetClasses: ['E-mini Futures', 'Micro E-mini', 'Agricultural Futures', 'Energy Futures', 'Metals'],
    apiEndpoint: 'https://demo.tradovateapi.com/v1',
    requiresApiKey: true,
    commissionStructure: '$0.85/contract + exchange fees (simulated)',
    minBalance: 10000, 
    maxPortfolioValue: 1000000,
    orderTypes: ['market', 'limit', 'stop_market', 'stop_limit', 'market_if_touched'],
    logo: '/logos/tradovate.png',
    status: 'active'
  },
  {
    id: 'amp_sim',
    name: 'AMP Futures Sim',
    description: 'Professional futures brokerage simulation',
    features: ['Global futures', 'Low commissions', 'Professional tools', 'Risk management'],
    assetClasses: ['CME Futures', 'EUREX', 'ICE', 'CBOT', 'Micro Futures', 'Currency Futures'],
    apiEndpoint: 'https://sim.ampfutures.com/api',
    requiresApiKey: true,
    commissionStructure: '$0.89/contract + exchange fees',
    minBalance: 15000,
    maxPortfolioValue: 1500000,
    orderTypes: ['market', 'limit', 'stop', 'stop_limit', 'bracket', 'oco'],
    logo: '/logos/amp.png',
    status: 'active'
  }
]

// 🌍 FOREX PAPER TRADING BROKERS
export const FOREX_PAPER_BROKERS: BrokerConfig[] = [
  {
    id: 'oanda_demo',
    name: 'OANDA Demo',
    description: 'Professional forex paper trading with real spreads',
    features: ['Real spreads', 'All major pairs', 'Advanced orders', 'TradingView charts'],
    assetClasses: ['Forex Majors', 'Forex Minors', 'Exotic Pairs', 'CFDs', 'Metals'],
    apiEndpoint: 'https://api-fxpractice.oanda.com',
    requiresApiKey: true,
    commissionStructure: 'Spread-based (realistic)',
    minBalance: 100000,
    maxPortfolioValue: 5000000,
    orderTypes: ['market', 'limit', 'stop', 'market_if_touched', 'take_profit', 'stop_loss'],
    logo: '/logos/oanda.png',
    status: 'active'
  },
  {
    id: 'fxcm_demo',
    name: 'FXCM Demo',
    description: 'Institutional-grade forex paper trading',
    features: ['Institutional pricing', 'Advanced analytics', 'Risk management', 'Social trading'],
    assetClasses: ['Forex', 'Indices CFDs', 'Commodities CFDs', 'Crypto CFDs'],
    apiEndpoint: 'https://api-demo.fxcm.com',
    requiresApiKey: true,
    commissionStructure: 'Spread + commission model',
    minBalance: 50000,
    maxPortfolioValue: 3000000,
    orderTypes: ['market', 'entry_limit', 'entry_stop', 'limit', 'stop'],
    logo: '/logos/fxcm.png',
    status: 'active'
  }
]

// 🏛️ COMPREHENSIVE MULTI-ASSET BROKER CONFIGURATIONS
export const ALL_ASSET_BROKERS: BrokerConfig[] = [
  // Traditional brokers with multi-asset support
  {
    id: 'interactive_brokers_extended',
    name: 'Interactive Brokers Pro',
    description: 'Global multi-asset trading with crypto, futures, forex, and stocks',
    features: ['Global markets', '150+ countries', 'All asset classes', 'Professional tools', 'Crypto trading'],
    assetClasses: [
      'US Stocks', 'International Stocks', 'ETFs', 'Mutual Funds',
      'Options', 'Futures', 'Forex', 'Bonds', 'Warrants', 'Structured Products',
      'Bitcoin Futures', 'Crypto CFDs', 'Commodities'
    ],
    apiEndpoint: 'https://localhost:5000/v1/api',
    requiresApiKey: false,
    commissionStructure: 'Tiered: $0.005/share stocks, $0.65/option, $0.85/futures contract',
    minBalance: 100000,
    maxPortfolioValue: 50000000, // $50M for institutional
    orderTypes: ['market', 'limit', 'stop', 'stop_limit', 'trailing_stop', 'bracket', 'oca', 'conditional'],
    logo: '/logos/ib_pro.png',
    status: 'active'
  },
  {
    id: 'tradestation_crypto',
    name: 'TradeStation Crypto Plus',
    description: 'Unified platform for stocks, options, futures, and cryptocurrency',
    features: ['Crypto spot & futures', 'EasyLanguage automation', 'Advanced analytics', 'Multi-asset strategies'],
    assetClasses: [
      'US Stocks', 'ETFs', 'Options', 'Futures', 'Micro Futures',
      'Bitcoin', 'Ethereum', 'Crypto Spot', 'Crypto Futures'
    ],
    apiEndpoint: 'https://api.tradestation.com/v3',
    requiresApiKey: true,
    commissionStructure: 'Stocks: $0, Options: $0.60, Futures: $1.50, Crypto: 0.99%',
    minBalance: 100000,
    maxPortfolioValue: 10000000,
    orderTypes: ['market', 'limit', 'stop', 'stop_limit', 'trailing_stop', 'bracket'],
    logo: '/logos/tradestation_crypto.png',
    status: 'active'
  }
]

// 🔧 ENHANCED MULTI-ASSET ORDER INTERFACE
interface MultiAssetOrder extends PaperTradeOrder {
  assetClass: 'equity' | 'crypto' | 'futures' | 'forex' | 'option' | 'bond'
  
  // Crypto-specific
  baseAsset?: string    // BTC in BTC/USDT
  quoteAsset?: string   // USDT in BTC/USDT
  
  // Futures-specific
  contractMonth?: string // '202412' for Dec 2024
  contractSize?: number  // Contract multiplier
  tickSize?: number      // Minimum price increment
  
  // Forex-specific
  baseCurrency?: string  // EUR in EUR/USD
  quoteCurrency?: string // USD in EUR/USD
  
  // Options-specific
  strikePrice?: number
  expirationDate?: Date
  optionType?: 'call' | 'put'
}

// 📊 ASSET-SPECIFIC POSITION DATA
interface MultiAssetPosition {
  symbol: string
  assetClass: 'equity' | 'crypto' | 'futures' | 'forex' | 'option' | 'bond'
  quantity: number
  avgCost: number
  currentPrice: number
  marketValue: number
  unrealizedPL: number
  side: 'long' | 'short'
  
  // Crypto-specific data
  cryptoData?: {
    baseAsset: string
    quoteAsset: string
    volume24h: number
    priceChange24h: number
    stakingRewards?: number
  }
  
  // Futures-specific data
  futuresData?: {
    contractMonth: string
    contractSize: number
    maintenanceMargin: number
    initialMargin: number
    expirationDate: Date
    rolloverDate?: Date
  }
  
  // Forex-specific data
  forexData?: {
    baseCurrency: string
    quoteCurrency: string
    spread: number
    swapRateLong: number
    swapRateShort: number
  }
  
  // Options-specific data
  optionsData?: {
    strikePrice: number
    expirationDate: Date
    optionType: 'call' | 'put'
    impliedVolatility: number
    delta: number
    gamma: number
    theta: number
    vega: number
    timeDecay: number
  }
}

// 🏭 MULTI-ASSET BROKER FACTORY
export class MultiAssetBrokerFactory {
  static getAllBrokers(): BrokerConfig[] {
    return [
      ...CRYPTO_PAPER_BROKERS,
      ...FUTURES_PAPER_BROKERS, 
      ...FOREX_PAPER_BROKERS,
      ...ALL_ASSET_BROKERS
    ]
  }
  
  static getBrokersByAssetClass(assetClass: string): BrokerConfig[] {
    return this.getAllBrokers().filter(broker => 
      broker.assetClasses.some(ac => 
        ac.toLowerCase().includes(assetClass.toLowerCase())
      )
    )
  }
  
  static getCryptoBrokers(): BrokerConfig[] {
    return this.getBrokersByAssetClass('crypto')
  }
  
  static getFuturesBrokers(): BrokerConfig[] {
    return this.getBrokersByAssetClass('futures')
  }
  
  static getForexBrokers(): BrokerConfig[] {
    return this.getBrokersByAssetClass('forex')
  }
  
  static getMultiAssetBrokers(): BrokerConfig[] {
    return this.getAllBrokers().filter(broker => broker.assetClasses.length >= 3)
  }
}

// 🌟 CRYPTO-SPECIFIC BROKER API
export abstract class CryptoBrokerAPI extends BrokerAPI {
  abstract getMarketDepth(symbol: string): Promise<{ bids: any[], asks: any[] }>
  abstract get24hrStats(symbol: string): Promise<{ volume: number, priceChange: number }>
  abstract getKlines(symbol: string, interval: string): Promise<any[]>
  abstract placeFuturesOrder(order: MultiAssetOrder): Promise<{ orderId: string; status: string }>
  abstract getFundingRates(): Promise<{ [symbol: string]: number }>
}

// 📈 FUTURES-SPECIFIC BROKER API  
export abstract class FuturesBrokerAPI extends BrokerAPI {
  abstract getContractDetails(symbol: string): Promise<any>
  abstract getMarginRequirements(symbol: string): Promise<{ initial: number, maintenance: number }>
  abstract getRolloverDates(symbol: string): Promise<Date[]>
  abstract getSettlementPrice(symbol: string): Promise<number>
  abstract placeConditionalOrder(order: MultiAssetOrder): Promise<{ orderId: string; status: string }>
}

// 🌍 FOREX-SPECIFIC BROKER API
export abstract class ForexBrokerAPI extends BrokerAPI {
  abstract getCurrentSpreads(): Promise<{ [pair: string]: number }>
  abstract getSwapRates(): Promise<{ [pair: string]: { long: number, short: number } }>
  abstract getEconomicCalendar(): Promise<any[]>
  abstract getCurrencyStrength(): Promise<{ [currency: string]: number }>
  abstract placeForexOrder(order: MultiAssetOrder): Promise<{ orderId: string; status: string }>
}

export {
  MultiAssetOrder,
  MultiAssetPosition,
  CryptoBrokerAPI,
  FuturesBrokerAPI,
  ForexBrokerAPI
}
