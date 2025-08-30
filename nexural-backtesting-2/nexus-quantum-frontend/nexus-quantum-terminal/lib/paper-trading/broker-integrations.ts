// 🏦 PAPER TRADING BROKER INTEGRATIONS
// Multiple broker APIs for paper trading - users can choose their preferred platform

interface BrokerConfig {
  id: string
  name: string
  description: string
  features: string[]
  assetClasses: string[]
  apiEndpoint: string
  requiresApiKey: boolean
  commissionStructure: string
  minBalance: number
  maxPortfolioValue: number
  orderTypes: string[]
  logo: string
  status: 'active' | 'maintenance' | 'disabled'
}

interface PaperTradeOrder {
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit'
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok'
  limitPrice?: number
  stopPrice?: number
  clientOrderId?: string
}

interface BrokerPosition {
  symbol: string
  quantity: number
  avgCost: number
  marketValue: number
  unrealizedPL: number
  side: 'long' | 'short'
  entryDate: string
}

interface BrokerAccount {
  accountId: string
  buyingPower: number
  cash: number
  portfolioValue: number
  dayTradeCount: number
  positions: BrokerPosition[]
}

// 🏦 SUPPORTED PAPER TRADING BROKERS
export const PAPER_TRADING_BROKERS: BrokerConfig[] = [
  {
    id: 'alpaca',
    name: 'Alpaca Paper Trading',
    description: 'Commission-free paper trading with real market conditions',
    features: ['Real-time data', 'No commissions', 'Advanced orders', 'API access'],
    assetClasses: ['US Stocks', 'ETFs'],
    apiEndpoint: 'https://paper-api.alpaca.markets',
    requiresApiKey: true,
    commissionStructure: 'Commission-free',
    minBalance: 100000, // $100k paper money
    maxPortfolioValue: 1000000, // $1M max
    orderTypes: ['market', 'limit', 'stop', 'stop_limit', 'trailing_stop'],
    logo: '/logos/alpaca.png',
    status: 'active'
  },
  {
    id: 'interactive_brokers',
    name: 'Interactive Brokers Paper',
    description: 'Professional paper trading with global markets access',
    features: ['Global markets', 'Multiple asset classes', 'Professional tools', 'Advanced analytics'],
    assetClasses: ['Stocks', 'Options', 'Futures', 'Forex', 'Bonds', 'Crypto'],
    apiEndpoint: 'https://localhost:5000/v1/api', // TWS Gateway
    requiresApiKey: false, // Uses TWS login
    commissionStructure: 'Tiered/Fixed (simulated)',
    minBalance: 100000,
    maxPortfolioValue: 10000000, // $10M max
    orderTypes: ['market', 'limit', 'stop', 'stop_limit', 'trailing_stop', 'bracket'],
    logo: '/logos/ib.png',
    status: 'active'
  },
  {
    id: 'td_ameritrade',
    name: 'TD Ameritrade PaperMoney',
    description: 'Thinkorswim paper trading with advanced analysis tools',
    features: ['Thinkorswim platform', 'Advanced charting', 'Options trading', 'Education'],
    assetClasses: ['Stocks', 'Options', 'Futures', 'Forex'],
    apiEndpoint: 'https://api.tdameritrade.com/v1',
    requiresApiKey: true,
    commissionStructure: '$0.65/option contract (simulated)',
    minBalance: 200000, // $200k default
    maxPortfolioValue: 2000000,
    orderTypes: ['market', 'limit', 'stop', 'stop_limit', 'trailing_stop', 'one_cancels_other'],
    logo: '/logos/td.png',
    status: 'active'
  },
  {
    id: 'webull',
    name: 'Webull Paper Trading',
    description: 'Commission-free paper trading with advanced charts',
    features: ['Commission-free', 'Advanced charts', 'Level 2 data', 'Mobile app'],
    assetClasses: ['US Stocks', 'ETFs', 'Options'],
    apiEndpoint: 'https://webull.com/api', // Note: Webull has limited public API
    requiresApiKey: false,
    commissionStructure: 'Commission-free',
    minBalance: 100000,
    maxPortfolioValue: 1000000,
    orderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    logo: '/logos/webull.png',
    status: 'maintenance' // Limited API access
  },
  {
    id: 'tradestation',
    name: 'TradeStation Paper Trading',
    description: 'Advanced paper trading with strategy automation',
    features: ['Strategy automation', 'Advanced analytics', 'Multiple asset classes', 'EasyLanguage'],
    assetClasses: ['Stocks', 'Options', 'Futures', 'Crypto'],
    apiEndpoint: 'https://api.tradestation.com/v3',
    requiresApiKey: true,
    commissionStructure: '$0/trade + regulatory fees (simulated)',
    minBalance: 100000,
    maxPortfolioValue: 5000000,
    orderTypes: ['market', 'limit', 'stop', 'stop_limit', 'trailing_stop'],
    logo: '/logos/tradestation.png',
    status: 'active'
  },
  {
    id: 'paper_invest',
    name: 'PaperInvest Simulator',
    description: 'Multi-broker paper trading simulator with 22+ broker rules',
    features: ['Multi-broker simulation', '22+ broker rules', 'Realistic execution', 'No API required'],
    assetClasses: ['Stocks', 'ETFs', 'Options'],
    apiEndpoint: 'https://api.paperinvest.io/v1',
    requiresApiKey: true,
    commissionStructure: 'Variable by broker simulation',
    minBalance: 100000,
    maxPortfolioValue: 1000000,
    orderTypes: ['market', 'limit', 'stop', 'stop_limit'],
    logo: '/logos/paperinvest.png',
    status: 'active'
  }
]

// 🏦 BROKER API INTERFACE
export abstract class BrokerAPI {
  protected config: BrokerConfig
  protected apiKey?: string
  protected isConnected: boolean = false

  constructor(brokerId: string, apiKey?: string) {
    const broker = PAPER_TRADING_BROKERS.find(b => b.id === brokerId)
    if (!broker) throw new Error(`Broker ${brokerId} not found`)
    
    this.config = broker
    this.apiKey = apiKey
  }

  abstract connect(): Promise<boolean>
  abstract disconnect(): Promise<void>
  abstract getAccount(): Promise<BrokerAccount>
  abstract getPositions(): Promise<BrokerPosition[]>
  abstract placeOrder(order: PaperTradeOrder): Promise<{ orderId: string; status: string }>
  abstract cancelOrder(orderId: string): Promise<boolean>
  abstract getOrderHistory(days: number): Promise<any[]>
  abstract getPerformanceMetrics(period: string): Promise<any>

  // Common functionality
  getBrokerInfo(): BrokerConfig {
    return this.config
  }

  isActive(): boolean {
    return this.config.status === 'active' && this.isConnected
  }
}

// 🏦 ALPACA PAPER TRADING IMPLEMENTATION
export class AlpacaPaperAPI extends BrokerAPI {
  private baseUrl = 'https://paper-api.alpaca.markets'

  async connect(): Promise<boolean> {
    if (!this.apiKey) throw new Error('Alpaca API key required')
    
    try {
      const response = await fetch(`${this.baseUrl}/v2/account`, {
        headers: {
          'APCA-API-KEY-ID': this.apiKey.split(':')[0],
          'APCA-API-SECRET-KEY': this.apiKey.split(':')[1]
        }
      })
      
      this.isConnected = response.ok
      return this.isConnected
    } catch (error) {
      console.error('Alpaca connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
  }

  async getAccount(): Promise<BrokerAccount> {
    const [accountResponse, positionsResponse] = await Promise.all([
      fetch(`${this.baseUrl}/v2/account`, {
        headers: this.getHeaders()
      }),
      fetch(`${this.baseUrl}/v2/positions`, {
        headers: this.getHeaders()
      })
    ])

    const account = await accountResponse.json()
    const positions = await positionsResponse.json()

    return {
      accountId: account.account_number,
      buyingPower: parseFloat(account.buying_power),
      cash: parseFloat(account.cash),
      portfolioValue: parseFloat(account.portfolio_value),
      dayTradeCount: account.daytrade_count,
      positions: positions.map((pos: any) => ({
        symbol: pos.symbol,
        quantity: parseFloat(pos.qty),
        avgCost: parseFloat(pos.avg_entry_price),
        marketValue: parseFloat(pos.market_value),
        unrealizedPL: parseFloat(pos.unrealized_pl),
        side: pos.side,
        entryDate: pos.created_at
      }))
    }
  }

  async getPositions(): Promise<BrokerPosition[]> {
    const account = await this.getAccount()
    return account.positions
  }

  async placeOrder(order: PaperTradeOrder): Promise<{ orderId: string; status: string }> {
    const response = await fetch(`${this.baseUrl}/v2/orders`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        symbol: order.symbol,
        qty: order.quantity,
        side: order.side,
        type: order.orderType,
        time_in_force: order.timeInForce,
        limit_price: order.limitPrice,
        stop_price: order.stopPrice,
        client_order_id: order.clientOrderId
      })
    })

    const result = await response.json()
    return {
      orderId: result.id,
      status: result.status
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/v2/orders/${orderId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    return response.ok
  }

  async getOrderHistory(days: number): Promise<any[]> {
    const until = new Date()
    const after = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const response = await fetch(
      `${this.baseUrl}/v2/orders?status=all&after=${after.toISOString()}&until=${until.toISOString()}`,
      { headers: this.getHeaders() }
    )
    
    return await response.json()
  }

  async getPerformanceMetrics(period: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v2/account/portfolio/history?period=${period}`, {
      headers: this.getHeaders()
    })
    return await response.json()
  }

  private getHeaders() {
    return {
      'APCA-API-KEY-ID': this.apiKey!.split(':')[0],
      'APCA-API-SECRET-KEY': this.apiKey!.split(':')[1]
    }
  }
}

// 🏦 PAPER INVEST SIMULATOR IMPLEMENTATION
export class PaperInvestAPI extends BrokerAPI {
  private baseUrl = 'https://api.paperinvest.io/v1'

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      })
      
      this.isConnected = response.ok
      return this.isConnected
    } catch (error) {
      console.error('PaperInvest connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
  }

  async getAccount(): Promise<BrokerAccount> {
    const response = await fetch(`${this.baseUrl}/account`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    })
    const data = await response.json()
    
    return {
      accountId: data.account_id,
      buyingPower: data.buying_power,
      cash: data.cash,
      portfolioValue: data.total_value,
      dayTradeCount: data.day_trades,
      positions: data.positions || []
    }
  }

  async getPositions(): Promise<BrokerPosition[]> {
    const account = await this.getAccount()
    return account.positions
  }

  async placeOrder(order: PaperTradeOrder): Promise<{ orderId: string; status: string }> {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    })

    const result = await response.json()
    return {
      orderId: result.order_id,
      status: result.status
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    })
    return response.ok
  }

  async getOrderHistory(days: number): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/orders/history?days=${days}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    })
    return await response.json()
  }

  async getPerformanceMetrics(period: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/performance?period=${period}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    })
    return await response.json()
  }
}

// 🏦 BROKER FACTORY
export class BrokerFactory {
  static createBroker(brokerId: string, apiKey?: string): BrokerAPI {
    switch (brokerId) {
      case 'alpaca':
        return new AlpacaPaperAPI(brokerId, apiKey)
      case 'paper_invest':
        return new PaperInvestAPI(brokerId, apiKey)
      // Add more brokers as implemented
      default:
        throw new Error(`Broker ${brokerId} not implemented yet`)
    }
  }

  static getAvailableBrokers(): BrokerConfig[] {
    return PAPER_TRADING_BROKERS.filter(broker => broker.status === 'active')
  }
}

export { PAPER_TRADING_BROKERS, BrokerAPI, AlpacaPaperAPI, PaperInvestAPI }
